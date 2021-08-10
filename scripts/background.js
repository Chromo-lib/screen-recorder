let recordedChunks = [];
let mediaRecorder;
let stream;

async function receiver (request) {
  if (request.message === 'start-record') {

    stream = await navigator.mediaDevices.getDisplayMedia({ audio: true, video: true });
    mediaRecorder = new MediaRecorder(stream, { mimeType: getSupportedMimeTypes() });

    const mediaStream = new MediaStream();
    const videoTrack = stream.getVideoTracks()[0];
    mediaStream.addTrack(videoTrack);

    mediaRecorder.ondataavailable = function (e) {
      if (e.data.size > 0) {
        recordedChunks.push(e.data);
      }
    };

    mediaRecorder.onstop = function () {      
      openDownloadTab(recordedChunks)
      recordedChunks = []
    }

    mediaRecorder.oninactive = function () {
      mediaRecorder.stop();
      openDownloadTab(recordedChunks)
      recordedChunks = []
    }

    mediaRecorder.start(100);
  }

  if (request.message === 'stop-record') {
    mediaRecorder.stop();
  }
}

function openDownloadTab (recordedChunks) {
  const blob = new Blob(recordedChunks, { type: getSupportedMimeTypes() });
  let blobUrl = window.URL.createObjectURL(blob);
  chrome.tabs.create({ url: 'download.html?blob=' + blobUrl });
}

function getSupportedMimeTypes () {
  const possibleTypes = [
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm;codecs=h264,opus',
    'video/mp4;codecs=h264,aac',
  ];
  return possibleTypes.filter(mimeType => MediaRecorder.isTypeSupported(mimeType))[0]
}

chrome.runtime.onMessage.addListener(receiver);