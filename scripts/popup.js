const btnRecord = document.getElementById('btn-record');
const btnCancel = document.getElementById('btn-cancel');

const video = document.getElementById('video');
const audio = document.getElementById('audio');

const screenOptions = ['screen', 'window', 'tab'];
const options = { canRequestAudioTrack: true };

let streamId;
let mediaRecorder;
let recordedChunks = [];

let requestId;

function startRecord () {
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
      video.srcObject = stream;
      video.play();
      console.log(stream);

      var options = { mimeType: "video/webm; codecs=vp9" };
      mediaRecorder = new MediaRecorder(stream, options);

      mediaRecorder.onstart = function () {
        // do something in response to
        // recording being started
        console.log('started', requestId);
        console.log(mediaRecorder.requestData());

      }

      mediaRecorder.ondataavailable = (event) => {
        console.log("data-available");
        if (event.data.size > 0) {
          recordedChunks.push(event.data);
          console.log(recordedChunks);
        } else {
          // ...
          console.log('not working');
          console.log(event);
        }
      }

      mediaRecorder.onerror = function (event) {
        let error = event.error;
        console.log(error);
      };

      mediaRecorder.start(100);
    }

    function getUserMediaError (e) {
      console.log(e);
    }
  });
}


document.getElementById('btn-start-record').addEventListener('click', () => {

}, false);

document.getElementById('btn-cancel-record').addEventListener('click', () => {

  mediaRecorder.stop();

  mediaRecorder.onstop = function (e) {
    
    chrome.desktopCapture.cancelChooseDesktopMedia(requestId);

    console.log('stopped');
    

    let vidTwo = document.createElement('video');

    var blob = new Blob(recordedChunks, { 'type': 'video/mp4' });
    var blobUrl = window.URL.createObjectURL(blob);

    vidTwo.src = blobUrl;
    vidTwo.controls = true;

    document.body.appendChild(vidTwo);

    // var url = URL.createObjectURL(blob);
    // var a = document.createElement("a");
    // document.body.appendChild(a);
    // a.style = "display: none";
    // a.href = url;
    // a.download = "test.mp4";
    // a.click();
    // window.URL.revokeObjectURL(url);
  }

  chrome.desktopCapture.cancelChooseDesktopMedia(requestId)

}, false);




btnRecord.addEventListener('click', startRecord, false);
