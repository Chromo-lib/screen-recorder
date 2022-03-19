const btnRecord = document.getElementById('btn-record');
const formConfigEL = document.getElementById('form-config')

const selectAudioDeviceIDEL = document.getElementById('audioDeviceID');
const videoMediaSourceEL = document.getElementById('video-media-source')
const enableAudioEl = document.getElementById('enableAudio')

let config = {
  videoMediaSource: 'tab',
  audioDeviceID: 'default',
  enableAudio: false,
  mimeType: 'video/webm;codecs=vp8,opus'
}

setMimeTypes();
setAudioInputs();

async function onStartRecord(e) {
  e.preventDefault();
  const target = e.target.elements,
    audioDeviceID = target[0].value,
    mimeType = target[1].value;

  chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { message: 'start-record', ...config, audioDeviceID, mimeType });
  });
}

function onVideMediaSource(e) {
  let value = e.target.dataset.value || e.target.parentNode.dataset.value

  let liTarget = e.target.nodeName === 'LI'
    ? e.target : e.target.parentNode.nodeName === 'LI'
      ? e.target.parentNode : null;

  if (liTarget && value) {
    config = { ...config, videoMediaSource: value };

    Array.from(videoMediaSourceEL.children).forEach(li => {
      li.classList.remove('active-tab')
    });

    liTarget.classList.add('active-tab')
  }
}

function onToggleMicrophone(e) {
  const val = e.target.checked
  config.enableAudio = val;
  selectAudioDeviceIDEL.parentElement.style.display = val ? 'block' : 'none'
}

function setMimeTypes() {
  const selectMimeTypeEL = document.getElementById('mimeType')
  const mimeTypes = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm;codecs=h264,opus', 'video/mp4;codecs=h264,aac',];

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
  const selectAudioDeviceIDEL = document.getElementById('audioDeviceID');
  selectAudioDeviceIDEL.parentElement.style.display = config.enableAudio ? 'block' : 'none';

  navigator.mediaDevices.enumerateDevices()
    .then(enumerator => {
      enumerator.forEach(input => {
        if (input.kind === "audioinput" && input.label) {
          const option = document.createElement('option')
          option.textContent = input.label
          option.value = input.deviceId
          selectAudioDeviceIDEL.appendChild(option)
        }
      });
    });
}

function listenToBackgroundMessages(message, sender, sendResponse) { }

enableAudioEl.addEventListener('change', onToggleMicrophone)
videoMediaSourceEL.addEventListener('click', onVideMediaSource)
formConfigEL.addEventListener('submit', onStartRecord)
chrome.runtime.onMessage.addListener(listenToBackgroundMessages);