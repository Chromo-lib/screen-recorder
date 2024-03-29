import { Fragment, h } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import Draggable from './components/Draggable';
import ButtonCameraOff from './components/button/ButtonCameraOff';
import ButtonCameraOn from './components/button/ButtonCameraOn';
import ButtonClose from './components/button/ButtonClose';
import ButtonMicOn from './components/button/ButtonMicOn';
import ButtonMicOff from './components/button/ButtonMicOff';

export default function Camera({ request }) {
  const {
    enableAudioCamera,
    enableCamera,
    videoInput,
    isMicrophoneConnected,
    isCameraConnected,
    resolution,
    placeholder
  } = request;

  const videoEl = useRef();
  const [cameraStream, setCameraStream] = useState(null);
  const [isCameraOn, setIsCameraOn] = useState(enableCamera);
  const [isMicOn, setIsMicOn] = useState(enableAudioCamera);
  const [isClosed, setIsClosed] = useState(false);
  const [error, setError] = useState(null);

  const isCircle = placeholder.radius === 50;
  const borderRadius = isCircle ? '50%' : placeholder.radius + '%';

  const containerStyle = {
    width: isCircle ? placeholder.width + 'px' : 'auto',
    height: isCircle ? placeholder.height + 'px' : 'auto',
    background: 'transparent',
    borderRadius
  };

  const videoStyle = {
    width: isCircle ? '80%' : placeholder.width + 'px',
    height: isCircle ? '80%' : placeholder.height + 'px',
    borderRadius
  }

  useEffect(() => {
    if (!enableCamera || !isCameraConnected) return;

    const constraints = {
      audio: isMicrophoneConnected,
      video: {
        deviceId: videoInput,
        facingMode: 'user',
        // height: { exact: videoMediaSource === 'webcam' ? resolution.height : videoEl.current.clientHeight },
        // width: { exact: videoMediaSource === 'webcam' ? resolution.width : videoEl.current.clientWidth }
      }
    }

    navigator.mediaDevices.getUserMedia(constraints)
      .then(stream => {
        if (!enableAudioCamera && isMicrophoneConnected) stream.getAudioTracks().forEach((track) => { track.stop(); });

        videoEl.current.autoplay = true;
        videoEl.current.srcObject = stream;
        setCameraStream(stream);
      })
      .catch(e => {
        setError(e.message + ' video/or microphone for this Website, please check yours settings.');
      });

    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => { track.stop(); });
      }
    }
  }, []);

  const onToggleVideo = () => {
    if (cameraStream) {
      const state = !isCameraOn;
      cameraStream.getVideoTracks().forEach((track) => { track.enabled = state; });
      setIsCameraOn(state)
    }
  }

  const onToggleMic = () => {
    if (cameraStream && cameraStream.getAudioTracks().length > 0) {
      const state = !isMicOn;
      cameraStream.getAudioTracks().forEach((track) => { track.enabled = state; });
      setIsMicOn(state)
    }
  }

  const onClose = () => {
    if (cameraStream) cameraStream.getTracks().forEach((track) => { track.stop(); });
    setIsClosed(!isClosed)
  }

  if (isClosed) {
    return <Fragment></Fragment>
  }
  if (error) {
    return <Draggable className="drag-reco video-container-reco" style={{ display: 'flex', width: '400px' }}>
      <button onClick={() => { setError(null) }} style={{ marginRight: '10px', cursor: 'pointer' }}>X</button>
      <div class="alert-reco">{error}</div>
    </Draggable>
  }
  else {
    return <Draggable className="drag-reco video-container-reco shadow-reco-0"
      style={containerStyle}>

      <div class="controls d-flex align-center justify-center shadow-reco">
        {isMicrophoneConnected && <Fragment>
          {isMicOn
            ? <ButtonMicOn className="ml-0" onClick={onToggleMic} />
            : <ButtonMicOff className="ml-0" onClick={onToggleMic} />}
        </Fragment>}

        {isCameraOn
          ? <ButtonCameraOn onClick={onToggleVideo} />
          : <ButtonCameraOff onClick={onToggleVideo} />}

        <ButtonClose className="red" onClick={onClose} />
      </div>

      <video class="video-reco shadow-reco" ref={videoEl} style={videoStyle}></video>
    </Draggable>
  }
}