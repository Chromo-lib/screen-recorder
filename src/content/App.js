import { h, Fragment } from 'preact';
import { useCallback, useState } from 'preact/hooks';

import ButtonPause from './components/ButtonPause';
import ButtonPlay from './components/ButtonPlay';
import ButtonResume from './components/ButtonResume';
import ButtonStop from './components/ButtonStop';
import Draggable from './components/Draggable';
import Timer from './components/Timer';
import { btnStyle, containerStyle } from './styles';
import downloadVideo from './utils/downloadVideo';
import record from './utils/record';
import ButtonMove from './components/ButtonMove';
import ButtonDownload from './components/ButtonDownload';
import Camera from './components/Camera';
import ButtonCameraOn from './components/ButtonCameraOn';
import ButtonCameraOff from './components/ButtonCameraOff';
import PreBug from './components/PreBug';

function App({ request }) {
  const { tabTitle, autoDownload, enableTimer, enableCamera } = request;

  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [isRecordingPlay, setIsRecordingPlay] = useState(false);
  const [isRecordingPaused, setIsRecordingPaused] = useState(false);
  const [isRecordingFinished, setIsRecordingFinished] = useState(false);

  const [isCameraOn, setIsCameraOn] = useState(enableCamera);

  const [errorMessage, setErrorMessage] = useState(false);

  const chunks = [];

  const onMediaControl = async (actionType) => {
    try {
      if (actionType === 'play' && mediaRecorder === null) {
        const { mediaRecorder, stream } = await record(request);

        setMediaRecorder(mediaRecorder);
        setIsRecordingPlay(true);

        mediaRecorder.onstop = async () => {
          stream.getTracks().forEach(track => { track.stop(); });

          setMediaRecorder(null);
          setIsRecordingPlay(false);
          setIsRecordingFinished(true);

          if (autoDownload) onDownload();
          console.log('mediaRecorder.onstop: recording is stopped');
        }

        mediaRecorder.ondataavailable = (e) => {
          chunks.push(e.data);
        }
      }

      if (actionType === 'stop' && mediaRecorder) { mediaRecorder.stop(); }

      if (actionType === 'pause' && mediaRecorder) {
        mediaRecorder.pause();
        setIsRecordingPaused(true);
      }

      if (actionType === 'resume' && mediaRecorder) {
        mediaRecorder.resume();
        setIsRecordingPaused(false);
      }
    } catch (error) {
      console.log('Recording: ', error);
      setIsCameraOn(false);
      setErrorMessage('Max Timeout 5s, Please refresh the page');
    }
  }

  const onCameraControl = () => {
    setIsCameraOn(!isCameraOn);
  }

  const onDownload = useCallback(() => {
    downloadVideo(chunks, tabTitle || 'reco', 'video/webm');
  }, []);

  if (errorMessage) {
    return <Draggable style={containerStyle}><PreBug text={errorMessage} /></Draggable>
  }
  if (autoDownload && isRecordingFinished) {
    return <Fragment></Fragment>
  }
  if (isRecordingFinished) {
    return <Draggable style={containerStyle}>
      <ButtonMove style={btnStyle} />
      {!autoDownload && <ButtonDownload style={btnStyle} onClick={onDownload} />}
    </Draggable>
  }
  else {
    return <Fragment>
      <Draggable style={containerStyle}>

        <ButtonMove style={btnStyle} />

        {isCameraOn
          ? <ButtonCameraOff style={btnStyle} onClick={onCameraControl} />
          : <ButtonCameraOn style={btnStyle} onClick={onCameraControl} />}

        {enableTimer && <Timer isRecordingPlay={isRecordingPlay} isRecordingPaused={isRecordingPaused} />}


        {isRecordingPlay
          ? <Fragment>
            <ButtonStop style={btnStyle} onClick={() => { onMediaControl('stop') }} title={isRecordingFinished ? 'Stop Recording' : 'Cancel Recording'} />
            {isRecordingPaused
              ? <ButtonResume style={btnStyle} onClick={() => { onMediaControl('resume') }} />
              : <ButtonPause style={btnStyle} onClick={() => { onMediaControl('pause') }} />}
          </Fragment>

          : <ButtonPlay style={btnStyle} onClick={() => { onMediaControl('play') }} />}
      </Draggable>

      {isCameraOn && <Camera request={request} isCameraOn={isCameraOn} />}
    </Fragment>
  }
}

export default App;