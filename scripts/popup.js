const btnRecord = document.getElementById('btn-record');
const btnDownload = document.getElementById('btn-download');

let blobUrl = null;

chrome.storage.sync.get(['blobUrl'], function (result) {
  if (result.blobUrl && result.blobUrl.length > 15) {
    createVidElement(result.blobUrl);
    blobUrl = result.blobUrl;
  }
  else {
    btnDownload.style.display = 'none';
  }
});

function listenToBackgroundMessages (message, sender, sendResponse) {

  if (message.startRecording) {
    //chrome.storage.sync.clear();
  }

  // when user stop recording
  if (message.blobUrl) {
    // create video recording
    createVidElement(message.blobUrl);
    blobUrl = message.blobUrl;
    btnDownload.style.display = 'flex';
  }
}

function downloadRecord () {
  downloadVid(blobUrl);
}

// when user click on button record
async function startRecord () {
  await sendMsg("start-record");
}

btnDownload.addEventListener('click', downloadRecord, false);
btnRecord.addEventListener('click', startRecord, false);

// send message to content js
async function sendMsg (message) {
  chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
    let activeTab = tabs[0];
    chrome.tabs.sendMessage(activeTab.id, { message });
  });
}

chrome.runtime.onMessage.addListener(listenToBackgroundMessages);