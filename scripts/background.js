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

let mediaRecorder = null;
let requestId;
let chunks = [];

const onMessage = async (request) => {
  if (request.message === 'start-record') {
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

    try {
      requestId = await chooseDesktopMedia(request.videoMediaSource);

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

      const audioStream = await navigator.mediaDevices.getUserMedia({
        audio: { deviceId: request.audioDeviceID }
      });

      audioStream.getAudioTracks()[0].enabled = request.enableAudio;
      stream.addTrack(audioStream.getAudioTracks()[0]);

      if (!mediaRecorder) mediaRecorder = new MediaRecorder(stream, { mimeType: request.mimeType });

      mediaRecorder.start();

      mediaRecorder.ondataavailable = function (e) {
        chunks.push(e.data);
      }

      mediaRecorder.onstop = () => {
        console.log('Recording is stoped');
        openDownloadTab(chunks, request.mimeType)
      }

      mediaRecorder.onerror = (event) => {
        console.error(`error recording stream: ${event.error.name}`)
      }

      stream.getVideoTracks()[0].onended = function () {
        //if(requestId) chrome.desktopCapture.cancelChooseDesktopMedia(requestId);
        mediaRecorder.stop()
        console.log('Stream end');
      };
    } catch (error) {
      console.log(error);
    }
  }

  if (request.message === 'stop-record' && mediaRecorder) {
    mediaRecorder.stop();
  }
};

chrome.runtime.onMessage.addListener(onMessage);
