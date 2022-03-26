const btnStopRecord = document.getElementById('btn-stop-record');
const formConfigEL = document.getElementById('form-config');

const enableAudioCameraEL = document.querySelector('.enableAudioCamera');

const audioinputEL = document.getElementById('microphoneID');
const videoinputEL = document.getElementById('cameraID');

const videoMediaSourceEL = document.getElementById('video-media-source');

btnStopRecord.style.display = 'none';

// permission for audio and video
const authorize = { audio: false, camera: false }

let config = {
  videoMediaSource: 'tab',
  microphoneID: 'default',
  cameraID: 'default',
  microphone: false,
  enableCamera: false,
  enableAudioCamera: false,
  mimeType: 'video/webm;codecs=vp8,opus',
}

setMimeTypes();
setAudioInputs();

function onStartRecord(e) {
  e.preventDefault();

  for (const element of e.target.elements) {
    if (element.type === 'checkbox') config[element.name] = JSON.parse(element.checked);
    else config[element.name] = element.value;
  }

  //send to content
  chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
    //chrome.tabs.sendMessage(tabs[0].id, { message: 'start-record', ...config });
    const { videoMediaSource, enableCamera, microphone } = config;

    // only share screen
    if (videoMediaSource && !microphone && !enableCamera) {
      message = 'start-record'
    }

    // share screen + audio
    if (videoMediaSource && microphone && !enableCamera) {
      message = 'share-screen-audio-permission'
    }

    // // share screen + audio + camera
    if (videoMediaSource && microphone && enableCamera) {
      message = 'share-screen-audio-camera-permission'
    }

    if (videoMediaSource && !microphone && enableCamera) {
      message = 'share-screen-camera-permission';
    }

    if (!videoMediaSource && microphone) {
      message = 'audio-camera-permission';
      config.microphone = true;
    }

    chrome.runtime.sendMessage({ message, from: 'popup', tabId: tabs[0].id, ...config, authorize });
  });
}

function onStopRecord() {
  chrome.runtime.sendMessage({ ...config, authorize, message: 'stop-record' });
}

function onVideMediaSource(e) {
  let value = e.target.dataset.value || e.target.parentNode.dataset.value

  let liTarget = e.target.nodeName === 'LI'
    ? e.target : e.target.parentNode.nodeName === 'LI'
      ? e.target.parentNode : null;

  if (liTarget && value) {
    value = value === 'off' ? false : value;
    config = { ...config, videoMediaSource: value };

    Array.from(videoMediaSourceEL.children).forEach(li => {
      li.classList.remove('active-tab')
    });

    liTarget.classList.add('active-tab');

    if (!config.videoMediaSource) document.getElementById('microphone').checked = true;
    btnStopRecord.style.display = !value && config.microphone ? 'flex' : 'none';
  }
}

function setMimeTypes() {
  const selectMimeTypeEL = document.getElementById('mimeType')
  const mimeTypes = [
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8',
    'video/webm;codecs=h264',
    'video/webm;codecs=avc1',
    'video/webm;codecs=daala',
    'video/mp4;codecs=h264,aac',
    'video/mpeg',
    'audio/webm',
    'audio/wav'
  ];

  mimeTypes.filter(mimeType => {
    if (MediaRecorder.isTypeSupported(mimeType)) {
      const option = document.createElement('option');
      option.textContent = mimeType;
      option.value = mimeType;
      selectMimeTypeEL.appendChild(option);
    }
  })
}

function setAudioInputs() {
  const audioinputEL = document.getElementById('microphoneID');

  navigator.mediaDevices.enumerateDevices()
    .then(enumerator => {
      enumerator.forEach(input => {
        if (input.kind === "audioinput") {
          const option = document.createElement('option')
          option.textContent = input.label || 'default';
          option.value = input.deviceId || 'default';
          audioinputEL.appendChild(option)
        }

        if (input.kind === "videoinput" && input.label) {
          const option = document.createElement('option')
          option.textContent = input.label || 'default';
          option.value = input.deviceId || 'default';
          videoinputEL.appendChild(option)
        }
      });
    });
}

function onMessage(request) {
  const { message } = request;

  if (message === 'start-record') {
    btnStopRecord.style.display = 'flex';
    chrome.runtime.sendMessage(request);
  }

  if (message && message.includes('stop-record')) {
    chrome.runtime.sendMessage(request);
  }
}

btnStopRecord.addEventListener('click', onStopRecord, false)
videoMediaSourceEL.addEventListener('click', onVideMediaSource, false)
formConfigEL.addEventListener('submit', onStartRecord, false)
chrome.runtime.onMessage.addListener(onMessage);