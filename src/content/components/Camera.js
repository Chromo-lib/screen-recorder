import { h } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import { signal } from "@preact/signals";
import Draggable from './Draggable';
import { alertStyle, videoContainer, videoStyle } from '../styles';

export default function Camera({ request, isCameraOn }) {
  const { videoMediaSource, enableAudioCamera, enableCamera, cameraID, isMicrophoneConnected, isCameraConnected, resolution } = request;
  const videoEl = useRef();
  const localStream = signal(null);

  const [error, setError] = useState(null)

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
        setError(e.message + ' video/or microphone for this Website, please check yours settings.');
      });

    return () => {
      if (localStream.value) {
        localStream.value.getTracks().forEach((track) => { track.stop(); });
      }
    }
  }, [isCameraOn]);

  if (error) {
    return <Draggable style={{ ...videoContainer, width: '400px' }}>
      <div style={alertStyle}>{error}</div>
    </Draggable>
  }
  else {
    return <Draggable style={videoContainer}>
      <video ref={videoEl} style={videoStyle}></video>
    </Draggable>
  }
}
