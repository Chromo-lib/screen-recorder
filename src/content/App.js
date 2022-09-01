import { h, Fragment } from 'preact';
import { useState, useEffect, useRef } from 'preact/hooks';
import ButtonPause from './components/ButtonPause';
import ButtonPlay from './components/ButtonPlay';
import ButtonResume from './components/ButtonResume';
import ButtonStop from './components/ButtonStop';
import Draggable from './components/Draggable';
import Timer from './components/Timer';
import { btnStyle, containerStyle, videoContainer, videoStyle } from './styles';
import record from './utils/record';

function App({ request }) {
  const videoEl = useRef();
  const [localStream, setLocalStream] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);

  const [isRecordingPlay, setIsRecordingPlay] = useState(false);
  const [isRecordingPaused, setIsRecordingPaused] = useState(false);

  const onPlay = async () => {
    if (!request || !request.chromeMediaSourceId) return;

    if (mediaRecorder === null) {
      const mdr = await record(request);
      setMediaRecorder(mdr);
      setIsRecordingPlay(true);
    }
  }

  const onStop = () => {
    if (localStream) {
      localStream.getTracks().forEach((track) => { track.stop(); });
      setLocalStream(null);
    }
    
    if (mediaRecorder) {
      mediaRecorder.stop();
      setMediaRecorder(null);
    }

    setIsRecordingPlay(false);
  }

  const onPause = async () => {
    if (mediaRecorder) {
      mediaRecorder.pause();
      setIsRecordingPaused(true);
    }
  }

  const onResume = async () => {
    if (mediaRecorder) {
      mediaRecorder.resume();
      setIsRecordingPaused(false);
    }
  }

  useEffect(() => {
    if (!request.enableCamera) return;

    navigator.mediaDevices.getUserMedia({ video: true, audio: request.enableAudioCamera })
      .then(stream => {
        videoEl.current.autoplay = true;
        videoEl.current.srcObject = stream;
        setLocalStream(stream);
      });

    return () => {
    }
  }, []);

  return <Fragment>
    <div style={containerStyle}>

      <Timer isRecordingPlay={isRecordingPlay} isRecordingPaused={isRecordingPaused} />

      {isRecordingPlay
        ? <Fragment>
          <ButtonStop style={btnStyle} onClick={onStop} />

          {isRecordingPaused
            ? <ButtonResume style={btnStyle} onClick={onResume} />
            : <ButtonPause style={btnStyle} onClick={onPause} />}
        </Fragment>

        : <ButtonPlay style={btnStyle} onClick={onPlay} />}
    </div>

    <Draggable style={videoContainer}>
      <video src="" ref={videoEl} style={videoStyle}></video>
    </Draggable>
  </Fragment>
}

export default App;