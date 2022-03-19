let chunks = [];
let requestId;
let stream;
let mediaRecorder;

async function chooseDesktopMedia(videoMediaSource) {
  return new Promise(resolve => {
    chrome.desktopCapture.chooseDesktopMedia([videoMediaSource || 'window', 'screen', 'tab'],
      async (id) => { resolve(id) })
  })
}

function onOpenEditorTab(recordedChunks, vidMimeType) {
  let newwindow = window.open('../editor.html');
  newwindow.recordedChunks = recordedChunks;
  newwindow.vidMimeType = vidMimeType;
  chunks = [];
  requestId = 0;
  stream = null;
  mediaRecorder = null;
}

const grantMicrophonePermission = async () => {
  const permission = await navigator.permissions.query({ name: 'microphone' });
  if (permission.state !== 'granted') {
    chrome.windows.create({
      url: chrome.extension.getURL('../permission/index.html?' + `video=${request.video}&audio=${request.audio}`),
      width: 350,
      height: 350,
      type: 'popup'
    });
    return;
  }
}

const onMessage = async (request) => {
  // screen sharing recording
  if (request.message === 'start-record' && request.videoMediaSource) {

    await grantMicrophonePermission();

    requestId = await chooseDesktopMedia(request.videoMediaSource);

    const constraints = {
      video: {
        mandatory: {
          chromeMediaSource: 'desktop',
          chromeMediaSourceId: requestId,
        },
        // width: { min: 640, ideal: 1920, max: 3840, },
        // height: { min: 480, ideal: 1080, max: 2160, },
        // aspectRatio: 1.777,
        // frameRate: { min: 5, ideal: 15, max: 30, }
      }, audio: false
    };

    stream = await navigator.mediaDevices.getUserMedia(constraints);
    mediaRecorder = new MediaRecorder(stream, { mimeType: request.mimeType });

    if (request.enableAudio) {
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: { deviceId: request.audioDeviceID } });
      audioStream.getAudioTracks()[0].enabled = request.enableAudio;
      stream.addTrack(audioStream.getAudioTracks()[0]);
    }

    mediaRecorder.start();
    await sendMessageToContent({ ...request, message: 'background-start-record' });

    mediaRecorder.ondataavailable = (e) => {
      chunks.push(e.data);
    }

    mediaRecorder.onstop = () => {
      onOpenEditorTab(chunks, request.mimeType);
    }

    mediaRecorder.onerror = async event => {
      await sendMessageToContent({ message: 'background-stop-record' });
      console.error(`Error recording stream: ${event.error.name}`);
    }

    stream.getVideoTracks()[0].onended = async () => {
      //if(requestId) chrome.desktopCapture.cancelChooseDesktopMedia(requestId);
      mediaRecorder.stop();
      if (request.enableCamera) await sendMessageToContent({ message: 'background-stop-record' });
    };
  }

  // only audio recording
  if (request.message === 'start-record' && request.enableAudio && !request.enableCamera) {
    await grantMicrophonePermission();

    stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    stream.getVideoTracks()[0].enabled = false;

    mediaRecorder = new MediaRecorder(stream, { mimeType: request.mimeType });

    mediaRecorder.start();
    await sendMessageToContent({ ...request, message: 'background-start-record' });

    mediaRecorder.ondataavailable = (e) => {
      chunks.push(e.data);
    }

    mediaRecorder.onstop = () => {
      onOpenEditorTab(chunks, request.mimeType);
    }

    mediaRecorder.onerror = async event => {
      console.error(`Error recording stream: ${event.error.name}`);
    }

    stream.getVideoTracks()[0].onended = async () => {
      mediaRecorder.stop();
    };
  }

  // stop audio recording
  if (request.message === 'stop-record') {
    mediaRecorder.stop();
  }

  if (request.message === 'content-microphone' && stream && stream.getAudioTracks().length > 0) {
    stream.getAudioTracks()[0].enabled = request.muted;
  }
};

function sendMessageToContent(message) {
  return new Promise(resolve => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, message); resolve();
    })
  })
}

chrome.runtime.onMessage.addListener(onMessage);
