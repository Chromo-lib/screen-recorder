async function videoRecord(request) {
  const { videoMediaSource, microphone, mimeType, microphoneID } = request;

  try {
    await delay(100);
    requestId = await chooseDesktopMedia(videoMediaSource);

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
    mediaRecorder = new MediaRecorder(stream, { mimeType: mimeType });

    if (microphone) {
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: { deviceId: microphoneID } });
      audioStream.getAudioTracks()[0].enabled = microphone;
      stream.addTrack(audioStream.getAudioTracks()[0]);
    }

    mediaRecorder.start();

    mediaRecorder.ondataavailable = (e) => {
      chunks.push(e.data);
    }

    mediaRecorder.onstop = async () => {
      sendMessage({ ...request, to: 'content', message: 'stop-record' });
      onOpenEditorTab(chunks, request.mimeType);
    }

    mediaRecorder.onerror = async event => {
      sendMessage({ ...request, to: 'content', message: 'stop-record' });
      console.error(`Error recording stream: ${event.error.name}`);
    }

    stream.getVideoTracks()[0].onended = async () => {
      mediaRecorder.stop();
    };
  } catch (error) {
    sendMessage({ ...request, to: 'content', message: 'stop-record' });
    if (mediaRecorder && mediaRecorder.state !== 'inactive') mediaRecorder.stop();
    console.log('Probaly cancel share screen...', error);
  }
}

async function audioRecord(request) {
  const { microphone, mimeType } = request;
  try {
    await delay(100);

    stream = await navigator.mediaDevices.getUserMedia({ video: false, audio: microphone });
    mediaRecorder = new MediaRecorder(stream, { mimeType: mimeType });

    mediaRecorder.start();

    mediaRecorder.ondataavailable = (e) => {
      chunks.push(e.data);
    }

    mediaRecorder.onstop = async () => {
      onOpenEditorTab(chunks, mimeType);
    }

    mediaRecorder.onerror = event => {
      console.error(`Error recording stream: ${event.error.name}`);
    }

    stream.getAudioTracks()[0].onended = async () => {
      mediaRecorder.stop();
    };
  } catch (error) {
    sendMessage({ ...request, to: 'content', message: 'stop-record' });
    console.log('start-record audio', error);
  }
}