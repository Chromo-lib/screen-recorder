const onMessage = async (request) => {
  const { message, videoMediaSource, enableCamera, microphone, enableAudioCamera } = request;
  // recording
  if (message === 'start-record') {
    // only share screen
    if (videoMediaSource && !microphone && !enableCamera) {
      videoRecord(request);
    }

    // share screen + audio
    if (videoMediaSource && microphone && !enableCamera) {
      videoRecord(request);
    }

    // share screen + (audio || camera)
    if (videoMediaSource && (enableCamera || microphone)) {
      sendMessage({ ...request, to: 'content', message: 'background-start-record' });
    }
  }

  // permissions
  if (message === 'share-screen-audio-permission') {
    grantMicPermission(request);
  }

  if (message && message.includes('camera-permission')) {
    sendMessage({ ...request, to: 'content', message: 'audio-or-camera-permission' });
  }

  if (message === 'content-granted') {
    const isGranted = await grantMicPermission(request);
    if(!isGranted) return;
    if (!videoMediaSource && microphone) {
      audioRecord(request);
      sendMessage({ ...request, to: 'content', message: 'background-start-record' });
    }
    else {
      videoRecord(request);
    }
  }
  // end permissions

  if (message && message.includes('stop-record')) {
    try {
      if (stream) stream.getTracks().forEach((track) => { track.stop(); });
      if (mediaRecorder && mediaRecorder !== 'inactive') mediaRecorder.stop();
    } catch (error) {
      console.log('Background stop-record', error);
    }
  }

  if (message === 'pause-record') {
    if (mediaRecorder) mediaRecorder.pause();
  }

  if (message === 'resume-record') {
    if (mediaRecorder) mediaRecorder.resume();
  }

  if (message === 'mute-microphone' && stream && stream.getAudioTracks().length > 0) {
    stream.getAudioTracks().forEach(track => { track.enabled = request.muted; });
  }

  if (message === 'permission-fail') {
    if (stream && stream.getTracks().length > 0) stream.getTracks().forEach(track => { track.stop(); });
    if (mediaRecorder) mediaRecorder.stop();
  }
};

chrome.runtime.onMessage.addListener(onMessage);
