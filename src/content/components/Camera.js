import { h } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import { signal } from "@preact/signals";
import Draggable from './Draggable';
import { alertStyle, videoContainer, videoStyle } from '../styles';

export default function Camera({ request, isCameraOn }) {
  const {
    videoMediaSource,
    enableAudioCamera,
    enableCamera,
    cameraID,
    isMicrophoneConnected,
    isCameraConnected,
    resolution,
    cameraForm
  } = request;

  const borderRadius = cameraForm === 'cirle' ? '50%' : '7px';
  const width = cameraForm === 'rectangle' ? '250px' : '180px';
  const height = cameraForm === 'rectangle' ? '150px' : '180px';

  const videoEl = useRef();
  const localStream = signal(null);
  const [error, setError] = useState(null);

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
    return <Draggable style={{ ...videoContainer, display: 'flex', width: '400px' }}>
      <button onClick={() => { setError(null) }} style={{ marginRight: '10px', cursor: 'pointer' }}>X</button>
      <div style={alertStyle}>{error}</div>
    </Draggable>
  }
  else {
    return <Draggable style={{ ...videoContainer, width, height }}>
      <video ref={videoEl} style={{ ...videoStyle, borderRadius }}></video>
    </Draggable>
  }
}
