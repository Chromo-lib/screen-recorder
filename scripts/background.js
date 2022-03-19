'use strict';

async function chooseDesktopMedia(videoMediaSource) {
  return new Promise(resolve => {
    chrome.desktopCapture.chooseDesktopMedia([videoMediaSource || 'window', 'screen', 'tab'],
      async (id) => { resolve(id) })
  })
}

function openDownloadTab(recordedChunks, vidMimeType) {
  let newwindow = window.open('../editor.html');
  newwindow.recordedChunks = recordedChunks;
  newwindow.vidMimeType = vidMimeType
}

const onMessage = async (request) => {
  if (request.message === 'start-record' && request.videoMediaSource) {

    const permission = await navigator.permissions.query({ name: 'microphone' });
    if (permission.state !== 'granted') {
      chrome.windows.create({
        url: chrome.extension.getURL('../permission/index.html?' + `video=${request.video}&audio=${request.audio}`),
        width: 350,
        height: 350,
        type: 'popup'
      });
      return;
    }    

    const requestId = await chooseDesktopMedia(request.videoMediaSource);
    let chunks = [];

    const constraints = {
      video: {
        mandatory: {
          chromeMediaSource: 'desktop',
          chromeMediaSourceId: requestId,
        },
        // width: { min: 640, ideal: 1920, max: 3840, },
        // height: { min: 480, ideal: 1080, max: 2160, },
        // aspectRatio: 1.777,
        // frameRate: { min: 5, ideal: 15, max: 30, }
      }, audio: false
    };

    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    const mediaRecorder = new MediaRecorder(stream, { mimeType: request.mimeType });    

    if (request.enableAudio) {
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: { deviceId: request.audioDeviceID } });
      audioStream.getAudioTracks()[0].enabled = request.enableAudio;
      stream.addTrack(audioStream.getAudioTracks()[0]);
    }

    mediaRecorder.start();

    mediaRecorder.ondataavailable = (e) => {
      chunks.push(e.data);
    }

    mediaRecorder.onstop = () => {
      console.log('Stop recording...');
      openDownloadTab(chunks, request.mimeType);
      chunks = [];
    }

    mediaRecorder.onerror = (event) => {
      console.error(`Error recording stream: ${event.error.name}`)
    }

    stream.getVideoTracks()[0].onended = async () => {
      //if(requestId) chrome.desktopCapture.cancelChooseDesktopMedia(requestId);
      mediaRecorder.stop();
      if (request.enableCamera) await sendMessageToContent({ message: 'stop-record' });
      console.log('End streaming');
    };
  }
};

function sendMessageToContent(message) {
  return new Promise(resolve => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, message); resolve();
    })
  })
}

chrome.runtime.onMessage.addListener(onMessage);
