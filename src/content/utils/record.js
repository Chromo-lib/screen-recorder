export default async function record(request) {
  const { videoMediaSource, mimeType, enableMicrophone, isMicrophoneConnected, resolution, audioInput } = request;

  const isVideoMediaSourceWebcam = videoMediaSource === 'webcam';
  let stream = null;
  let audioStream = null;

  const constraints = {
    video: { width: { ideal: resolution.width }, height: { ideal: resolution.height } },
    audio: isVideoMediaSourceWebcam
  };

  if (isVideoMediaSourceWebcam) stream = await navigator.mediaDevices.getUserMedia(constraints);
  else stream = await navigator.mediaDevices.getDisplayMedia(constraints);

  const mediaRecorder = new MediaRecorder(stream, { mimeType });

  if (!isVideoMediaSourceWebcam && enableMicrophone && isMicrophoneConnected) {
    audioStream = await navigator.mediaDevices.getUserMedia({ audio: { deviceid: audioInput } });
    audioStream.getAudioTracks()[0].enabled = true;
    stream.addTrack(audioStream.getAudioTracks()[0]);
  }

  setTimeout(() => { mediaRecorder.start(); }, 100);

  mediaRecorder.onerror = async event => {
    console.error(`Error recording stream: ${event.error.name}`);
    reject(event.error.name)
  }

  stream.getVideoTracks()[0].onended = async () => {
    mediaRecorder.stop();
  };

  return { mediaRecorder, stream, audioStream }
}