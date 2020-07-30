let streamId;
let mediaRecorder;
let recordedChunks = [];

let requestId;

const screenOptions = ['screen', 'window', 'tab'];
const options = { canRequestAudioTrack: true };

function receiver (request, sender, response) {
  if (request.message === 'start-recording') {

    chrome.runtime.sendMessage({ startRecording: 'start-recording' });

    requestId = chrome.desktopCapture.chooseDesktopMedia(screenOptions, (idStream) => {
      streamId = idStream;

      const displayMediaOptions = {
        audio: false,
        video: {
          mandatory: {
            chromeMediaSource: "desktop",
            chromeMediaSourceId: idStream
          }
        }
      };

      navigator.getUserMedia(displayMediaOptions, onMediaSuccess, getUserMediaError);

      function onMediaSuccess (stream) {

        let options = { mimeType: "video/webm; codecs=vp9" };
        mediaRecorder = new MediaRecorder(stream, options);

        mediaRecorder.onstart = function () {
          mediaRecorder.requestData();
        }

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            recordedChunks.push(event.data);
          }
        }

        mediaRecorder.onerror = function (event) {
          let error = event.error;
          console.log(error);
        };

        stream.getVideoTracks()[0].onended = function () {
          // stop recording
          chrome.desktopCapture.cancelChooseDesktopMedia(requestId);

          let blob = new Blob(recordedChunks, { 'type': 'video/mp4' });
          let blobUrl = window.URL.createObjectURL(blob);

          chrome.runtime.sendMessage({ blobUrl });
          chrome.storage.sync.set({ blobUrl });
        };

        mediaRecorder.start(100);
      }

      function getUserMediaError (e) {
        console.log(e);
      }
    });
  }
}

chrome.runtime.onMessage.addListener(receiver);