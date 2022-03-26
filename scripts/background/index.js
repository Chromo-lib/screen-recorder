const onMessage = async (request) => {
  const { message, videoMediaSource, enableCamera, microphone } = request;
  // recording
  if (message === 'start-record' && videoMediaSource) {
    // only share screen
    if (!microphone && !enableCamera) {
      videoRecord(request);
    }    
    else {
      // share screen + audio
      const isGranted = await grantMicPermission(request);
      if(isGranted) videoRecord(request);
    }
  }

  // permissions
  if (message && message === 'camera-permission') {
    sendMessage({ ...request, to: 'content', message: 'audio-or-camera-permission' });
  }

  if (message === 'content-granted') {
    const isGranted = await grantMicPermission(request);
        
    if (isGranted && !videoMediaSource && microphone) {
      audioRecord(request);
      sendMessage({ ...request, to: 'content', message: 'background-start-record' });
    }

    if (isGranted && videoMediaSource) {
      videoRecord(request);
      sendMessage({ ...request, to: 'content', message: 'background-start-record' });
    }
  }
  // end permissions

  if (message && message.includes('stop-record')) {
    try {
      if (stream) stream.getTracks().forEach((track) => { track.enabled = false; track.stop(); });
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
