let chunks = [];
let requestId;
let stream;
let mediaRecorder;

let winTabId;

function delay(ms) { return new Promise(function (resolve) { setTimeout(resolve, ms); }); }

async function grantMicPermission(request) {
  const { authorize } = request;
  const permission = await navigator.permissions.query({ name: 'microphone' });

  permission.onchange = function () {
    if (this.state) sendMessage({ ...request, message: 'start-record' });
    else sendMessage({ ...request, message: 'permission-fail' });
  }

  if (permission.state !== 'granted') {
    let params = '';
    let len = Object.keys(request).length - 1;

    for (const [key, value] of Object.entries(request)) {
      if (key) params += `${key}=${value}${len > 1 ? '&' : ''}`;
      len--;
    }

    params += '&audio=' + authorize.audio + '&video=' + authorize.video;

    chrome.windows.create({
      url: chrome.extension.getURL('../permission/index.html?' + params), width: 400, height: 400, type: 'popup'
    });
  }
  else {
    sendMessage({ ...request, message: 'start-record' });
  }
}

async function chooseDesktopMedia(videoMediaSource) {
  return new Promise(resolve => {
    chrome.desktopCapture.chooseDesktopMedia([videoMediaSource || 'window', 'screen', 'tab'],
      async (id) => { resolve(id) })
  })
}

function onOpenEditorTab(recordedChunks, mimeType) {
  let newwindow = window.open('../editor.html');
  newwindow.recordedChunks = recordedChunks;
  newwindow.mimeType = mimeType;
  chunks = [];
  requestId = 0;
  stream = null;
  mediaRecorder = null;
}

const onMessage = async (request) => {
  const { tabId, message, videoMediaSource, enableCamera, microphone, mimeType, microphoneID, authorize } = request;
  winTabId = tabId;

  // const isOnlySharinScreen = videoMediaSource && !microphone && !enableCamera;
  const isSharinScreenAndAudio = videoMediaSource && microphone && !enableCamera;
  const isSharingScreenAndCamera = videoMediaSource && (enableCamera || microphone);
  const isOnlyAudio = microphone && !videoMediaSource;

  // screen sharing recording + audio (optional)
  if (message === 'start-record' && videoMediaSource) {
    try {
      await delay(100);
      requestId = await chooseDesktopMedia(videoMediaSource);

      if ((isOnlyAudio || isSharingScreenAndCamera) && !isSharinScreenAndAudio) {
        sendMessage({ ...request, message: 'background-start-record' });
      }

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

      stream = await navigator.mediaDevices.getUserMedia(constraints);
      mediaRecorder = new MediaRecorder(stream, { mimeType: mimeType });

      if (microphone) {
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: { deviceId: microphoneID } });
        audioStream.getAudioTracks()[0].enabled = microphone;
        stream.addTrack(audioStream.getAudioTracks()[0]);
      }

      mediaRecorder.start();

      mediaRecorder.ondataavailable = (e) => {
        chunks.push(e.data);
      }

      mediaRecorder.onstop = async () => {
        sendMessage({ ...request, message: 'background-stop-record' });
        onOpenEditorTab(chunks, request.mimeType);
      }

      mediaRecorder.onerror = async event => {
        sendMessage({ ...request, message: 'background-stop-record' });
        console.error(`Error recording stream: ${event.error.name}`);
      }

      stream.getVideoTracks()[0].onended = async () => {
        mediaRecorder.stop();
      };
    } catch (error) {
      if (mediaRecorder && mediaRecorder.state !== 'inactive') mediaRecorder.stop();
      console.log('Probaly cancel share screen...', error);
    }
  }

  // // only audio recording
  if (message === 'start-record' && isOnlyAudio && microphone) {
    try {
      await delay(100);

      stream = await navigator.mediaDevices.getUserMedia({ video: false, audio: microphone });
      mediaRecorder = new MediaRecorder(stream, { mimeType: mimeType });

      mediaRecorder.start();
      sendMessage({ ...request, message: 'background-start-record' });

      mediaRecorder.ondataavailable = (e) => {
        chunks.push(e.data);
      }

      mediaRecorder.onstop = async () => {
        onOpenEditorTab(chunks, mimeType);
        sendMessage({ ...request, message: 'background-stop-record' });
      }

      mediaRecorder.onerror = event => {
        console.error(`Error recording stream: ${event.error.name}`);
      }

      stream.getAudioTracks()[0].onended = async () => {
        mediaRecorder.stop();
      };
    } catch (error) {
      console.log('start-record audio', error);
    }
  }

  if (message.includes('stop-record')) {
    try {
      if (stream) stream.getTracks().forEach((track) => { track.stop(); });
      if (mediaRecorder && mediaRecorder !== 'inactive') mediaRecorder.stop();
      sendMessage({ ...request, message: 'background-stop-record' })
    } catch (error) {
      console.log('Background stop-record', error);
    }
  }

  if (message === 'pause-record') {
    if (mediaRecorder) mediaRecorder.pause();
  }

  if (message === 'resume-record') {
    if (mediaRecorder) mediaRecorder.resume();
  }

  if (message === 'mute-microphone' && stream && stream.getAudioTracks().length > 0) {
    stream.getAudioTracks().forEach(track => { track.enabled = request.muted; });
  }

  // permission: share screen + audio
  if (message === 'share-screen-audio-permission') {
    grantMicPermission(request);
  }

  // permission: current open page camera and mic
  if (message === 'audio-or-camera-permission') {
    sendMessage({ ...request, message: 'background-ask-audio-or-camera-permission' });
  }

  if (message === 'permission-fail') {
    if (stream && stream.getTracks().length > 0) stream.getTracks().forEach(track => { track.stop(); });
    if(mediaRecorder) mediaRecorder.stop();
  }
};

function sendMessage(message) {
  try {
    if (winTabId) {
      chrome.tabs.sendMessage(+winTabId, message);
    }
    else {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, message);
      });
    }
    //chrome.runtime.sendMessage(message);
  } catch (error) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, message);
    });
  }
}

chrome.runtime.onMessage.addListener(onMessage);
