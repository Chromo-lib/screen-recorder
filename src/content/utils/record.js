export default async function record(request) {
  const { videoMediaSource, mimeType, enableMicrophone, isMicrophoneConnected, resolution } = request;

  const isVideoMediaSourceWebcam = videoMediaSource === 'webcam';
  let stream = null;

  const constraints = {
    video: { width: { ideal: resolution.width }, height: { ideal: resolution.height } },
    audio: isVideoMediaSourceWebcam
  };

  if (isVideoMediaSourceWebcam) stream = await navigator.mediaDevices.getUserMedia(constraints);
  else stream = await navigator.mediaDevices.getDisplayMedia(constraints);

  const mediaRecorder = new MediaRecorder(stream, { mimeType });

  if (!isVideoMediaSourceWebcam && enableMicrophone && isMicrophoneConnected) {
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
  });
}