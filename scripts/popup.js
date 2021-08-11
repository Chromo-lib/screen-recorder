const btnRecord = document.getElementById('btn-record');
const formConfig = document.getElementById('form-config')
const selectAudioDeviceID = document.getElementById('audioDeviceID')
const videoMediaSource = document.getElementById('video-media-source')

let config = {
  video: 'tab',
  audio: 'mixed',
  audioDeviceID: 'default',
  quality: 'high',
  notification: false
}

navigator.mediaDevices.enumerateDevices()
  .then(enumerator => {

    enumerator.push({
      label: 'Disabled',
      kind: 'audioinput',
      deviceId: null
    });

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

function onConfig (e) {
  e.preventDefault();

  let name = e.target.name;
  let value = e.target.value;

  if (name === 'notification') value = JSON.parse(value);

  config = { ...config, [name]: value };
}

async function startRecord () {
  await sendMsg({ message: 'start-record', ...config });
}

function listenToBackgroundMessages (message, sender, sendResponse) { }

async function sendMsg (msg) {
  chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
    let activeTab = tabs[0];
    chrome.tabs.sendMessage(activeTab.id, msg);
  });
}

btnRecord.addEventListener('click', startRecord, false);
videoMediaSource.addEventListener('click', onVideMediaSource)
formConfig.addEventListener('change', onConfig)
chrome.runtime.onMessage.addListener(listenToBackgroundMessages);