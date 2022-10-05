import { h } from 'preact';
import { useEffect, useRef } from 'preact/hooks';
import { signal } from "@preact/signals";
import Draggable from './Draggable';
import { videoContainer, videoStyle } from '../styles';

export default function Camera({ request, isCameraOn }) {
  const { videoMediaSource, enableAudioCamera, enableCamera, cameraID, isMicrophoneConnected, isCameraConnected, resolution } = request;
  const videoEl = useRef();
  const localStream = signal(null);

  useEffect(() => {
    if (localStream.value) {
      localStream.value.getTracks().forEach((track) => { track.stop(); });
    }

    if (!enableCamera || !isCameraConnected) return;

    const constraints = {
      audio: isMicrophoneConnected,
      video: {
        deviceId: cameraID,
        facingMode: 'user',
        height: { exact: videoMediaSource === 'webcam' ? resolution.height : videoEl.current.clientHeight },
        width: { exact: videoMediaSource === 'webcam' ? resolution.width : videoEl.current.clientWidth }
      }
    }

    navigator.mediaDevices.getUserMedia(constraints)
      .then(stream => {
        if (!enableAudioCamera && isMicrophoneConnected) stream.getAudioTracks().forEach((track) => { track.stop(); });
        videoEl.current.autoplay = true;
        videoEl.current.srcObject = stream;
        localStream.value = stream;
      })
      .catch(e => {
        console.log('Local video: ',e.message);
      });

    return () => {
      if (localStream.value) {
        localStream.value.getTracks().forEach((track) => { track.stop(); });
      }
    }
  }, [isCameraOn]);

  return <Draggable style={videoContainer}>
    <video src="" ref={videoEl} style={videoStyle}></video>
  </Draggable>
}
