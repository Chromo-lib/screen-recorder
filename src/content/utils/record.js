async function record(request) {
  const { chromeMediaSourceId, videoMediaSource, mimeType, enableMicrophone } = request;

  const constraints = videoMediaSource !== 'webcam'
    ? {
      video: {
        mandatory: {
          chromeMediaSource: 'desktop',
          chromeMediaSourceId: chromeMediaSourceId,
        },
        // width: { min: 640, ideal: 1920, max: 3840, },
        // height: { min: 480, ideal: 1080, max: 2160, },
        // aspectRatio: 1.777,
        // frameRate: { min: 5, ideal: 15, max: 30, }
      }, audio: false
    }
    : { video: true, audio: true };

  const stream = await navigator.mediaDevices.getUserMedia(constraints);
  const mediaRecorder = new MediaRecorder(stream, { mimeType });

  if (enableMicrophone) {
    const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioStream.getAudioTracks()[0].enabled = true;
    stream.addTrack(audioStream.getAudioTracks()[0]);
  }

  return new Promise((resolve, reject) => {
    mediaRecorder.start();

    mediaRecorder.onstart = () => {
      resolve({ mediaRecorder, stream });
    };
    
    mediaRecorder.onerror = async event => {
      console.error(`Error recording stream: ${event.error.name}`);
      reject(event.error.name)
    }

    stream.getVideoTracks()[0].onended = async () => {
      mediaRecorder.stop();
    };
  })
}

export default record;