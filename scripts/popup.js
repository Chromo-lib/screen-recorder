const btnRecord = document.getElementById('btn-record');
const formConfig = document.getElementById('form-config')

const selectAudioDeviceID = document.getElementById('audioDeviceID')
const videoMediaSource = document.getElementById('video-media-source')
const withMicrophoneEl = document.getElementById('withMicrophone')

let config = {
  video: 'tab',
  audio: 'mixed',
  audioDeviceID: 'default',
  quality: 'high',
  notification: false,
  withMicrophone: false
}

selectAudioDeviceID.parentElement.style.display = config.withMicrophone ? 'block' : 'none';

navigator.mediaDevices.enumerateDevices()
  .then(enumerator => {
    enumerator.forEach(input => {
      if (input.kind === "audioinput" && input.label) {
        const option = document.createElement('option')
        option.textContent = input.label
        option.value = input.deviceId
        selectAudioDeviceID.appendChild(option)
      }
    });
  });

function onVideMediaSource (e) {

  let value = e.target.dataset.value || e.target.parentNode.dataset.value

  let liTarget = e.target.nodeName === 'LI'
    ? e.target : e.target.parentNode.nodeName === 'LI'
      ? e.target.parentNode : null;

  if (liTarget && value) {
    config = { ...config, video: value };

    Array.from(videoMediaSource.children).forEach(li => {
      li.classList.remove('active-tab')
    });

    liTarget.classList.add('active-tab')
  }
}

function toggleMicrophone (e) {
  const val = e.target.checked
  config.withMicrophone = val;
  selectAudioDeviceID.parentElement.style.display = val ? 'block' : 'none'
}

async function onStartRecord (e) {
  e.preventDefault();

  const target = e.target.elements;

  let audioDeviceID = target[0].value;
  let notification = JSON.parse(target[1].checked);

  await sendMsg({
    message: 'start-record',
    ...config,
    audioDeviceID,
    notification
  });
}

function listenToBackgroundMessages (message, sender, sendResponse) { }

async function sendMsg (msg) {
  chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
    let activeTab = tabs[0];
    chrome.tabs.sendMessage(activeTab.id, msg);
  });
}

withMicrophoneEl.addEventListener('change', toggleMicrophone)
videoMediaSource.addEventListener('click', onVideMediaSource)
formConfig.addEventListener('submit', onStartRecord)

chrome.runtime.onMessage.addListener(listenToBackgroundMessages);