const btnRecord = document.getElementById('btn-record');
const formConfig = document.getElementById('form-config')

let config = {
  video: 'screen',
  audio: 'mixed',
  quality: 'high'
}

function onConfig (e) {
  e.preventDefault()
  config = { ...config, [e.target.name]: e.target.value };
}

async function startRecord () {
  await sendMsg({ message: 'start-record', ...config });
}

function listenToBackgroundMessages (message, sender, sendResponse) { }

// send message to content js
async function sendMsg (msg) {
  chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
    let activeTab = tabs[0];
    chrome.tabs.sendMessage(activeTab.id, msg);
  });
}

btnRecord.addEventListener('click', startRecord, false);
formConfig.addEventListener('change', onConfig)
chrome.runtime.onMessage.addListener(listenToBackgroundMessages);