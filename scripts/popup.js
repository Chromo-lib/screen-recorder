const btnRecord = document.getElementById('btn-record');

async function startRecord () {
  await sendMsg("start-record");
}

function listenToBackgroundMessages (message, sender, sendResponse) {}

// send message to content js
async function sendMsg (message) {
  chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
    let activeTab = tabs[0];
    chrome.tabs.sendMessage(activeTab.id, { message });
  });
}

btnRecord.addEventListener('click', startRecord, false);
chrome.runtime.onMessage.addListener(listenToBackgroundMessages);