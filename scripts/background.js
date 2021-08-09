let streamId;
let mediaRecorder;
let recordedChunks = [];

function downloadVid (filename, blobUrl) {
  window.prompt(filename)

  let downloadLink = document.createElement('a');
  downloadLink.href = URL.createObjectURL(blobUrl);
  downloadLink.download = `${filename}.webm`;

  document.body.appendChild(downloadLink);
  downloadLink.click();
  URL.revokeObjectURL(blobUrl);
  document.body.removeChild(downloadLink);
}

async function receiver (request, sender, response) {

  let requestId;
  const screenOptions = ['screen', 'window', 'tab'];
  const options = { canRequestAudioTrack: true };

  let mediaRecorder;
  let mimeType = 'video/webm';

  if (request.message === 'start-recording') {

    chrome.runtime.sendMessage({ startRecording: 'start-recording' });

    let stream = await recordScreen();
    mediaRecorder = createRecorder(stream, mimeType);

    async function recordScreen () {
      return await navigator.mediaDevices.getDisplayMedia({
        audio: false,
        video: { mediaSource: "screen" }
      });
    }

    function createRecorder (stream, mimeType) {
      // the stream data is stored in this array
      let recordedChunks = [];

      const mediaRecorder = new MediaRecorder(stream, { mimeType: "video/webm; codecs=vp9" });

      mediaRecorder.ondataavailable = function (e) {
        if (e.data.size > 0) {
          recordedChunks.push(e.data);
        }
      };

      mediaRecorder.onstop = function () {
        saveFile(recordedChunks);
        recordedChunks = [];
      };

      mediaRecorder.start(200);
      return mediaRecorder;
    }

    function saveFile (recordedChunks) {
      const blob = new Blob(recordedChunks, { type: 'video/webm' });
      //downloadVid(blobUrl)
      let blobUrl = window.URL.createObjectURL(blob);

      chrome.tabs.create({ url: 'download.html?blob=' + blobUrl });

      //chrome.runtime.sendMessage({ blobUrl });
    }
  }

  if (request.message === 'stop-recording') {
    mediaRecorder.stop();
  }
}

chrome.runtime.onMessage.addListener(receiver);