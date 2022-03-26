var chunks = [];
var requestId;
var stream;
var mediaRecorder;

var winTabId;

function delay(ms) { return new Promise(function (resolve) { setTimeout(resolve, ms); }); }

async function chooseDesktopMedia(videoMediaSource) {
  return new Promise(resolve => {
    chrome.desktopCapture.chooseDesktopMedia([videoMediaSource || 'window', 'screen', 'tab'],
      async (id) => { resolve(id) })
  })
}

function onOpenEditorTab(recordedChunks, mimeType) {
  let newwindow = window.open('../../editor.html');
  newwindow.recordedChunks = recordedChunks;
  newwindow.mimeType = mimeType;
  chunks = [];
  requestId = 0;
  stream = null;
  mediaRecorder = null;
}