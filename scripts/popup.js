const btnRecord = document.getElementById('btn-record');
const btnStop = document.getElementById('btn-stop');

async function startRecord () {
  await sendMsg("start-record");
}

async function stopRecord () {
  await sendMsg("stop-record");
}

function listenToBackgroundMessages (message, sender, sendResponse) { }

// send message to content js
async function sendMsg (msg) {
  chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
    let activeTab = tabs[0];
    chrome.tabs.sendMessage(activeTab.id, { message: msg });
  });
}

btnRecord.addEventListener('click', startRecord, false);
btnStop.addEventListener('click', stopRecord, false);
chrome.runtime.onMessage.addListener(listenToBackgroundMessages);