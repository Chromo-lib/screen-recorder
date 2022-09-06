import { h, Fragment } from 'preact';
import { useCallback, useState, useEffect, useRef } from 'preact/hooks';
import ButtonPause from './components/ButtonPause';
import ButtonPlay from './components/ButtonPlay';
import ButtonResume from './components/ButtonResume';
import ButtonStop from './components/ButtonStop';
import Draggable from './components/Draggable';
import Timer from './components/Timer';
import { btnStyle, containerStyle, videoContainer, videoStyle } from './styles';
import download from './utils/download';
import record from './utils/record';

function App({ request }) {

  const videoEl = useRef();
  const [localStream, setLocalStream] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);

  const [isRecordingPlay, setIsRecordingPlay] = useState(false);
  const [isRecordingPaused, setIsRecordingPaused] = useState(false);

  const chunks = [];

  const onPlay = useCallback(async () => {
    if (mediaRecorder === null) {
      const { mediaRecorder, stream } = await record(request);

      setMediaRecorder(mediaRecorder);
      setIsRecordingPlay(true);

      mediaRecorder.onstop = async () => {
    
        if (localStream) {
          localStream.getTracks().forEach((track) => { track.stop(); });
          setLocalStream(null);
        }

        stream.getTracks().forEach(track => { track.stop(); });
        download(chunks, 'reco', 'video/webm');

        setMediaRecorder(null);
        setIsRecordingPlay(false);

        console.log('mediaRecorder.onstop: recording is stopped');
      }

      mediaRecorder.ondataavailable = (e) => {
        chunks.push(e.data);
      }
    }
  }, []);

  const onStop = useCallback(() => {
    if (localStream) {
      localStream.getTracks().forEach((track) => { track.stop(); });
      setLocalStream(null);
    }
    
    if (mediaRecorder) {
      mediaRecorder.stop();
    }
  }, []);

  const onPause = () => {
    if (mediaRecorder) {
      mediaRecorder.pause();
      setIsRecordingPaused(true);
    }
  }

  const onResume = () => {
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
      if (localStream) {
        localStream.getTracks().forEach((track) => { track.stop(); });
      }
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