import { h, Fragment } from 'preact';
import { useCallback, useState } from 'preact/hooks';

import Draggable from './components/Draggable';
import Timer from './components/Timer';
import { btnStyle, containerStyle } from './styles';
import downloadVideo from './utils/downloadVideo';
import record from './utils/record';

import ButtonMove from './components/button/ButtonMove';
import ButtonPause from './components/button/ButtonPause';
import ButtonPlay from './components/button/ButtonPlay';
import ButtonResume from './components/button/ButtonResume';
import ButtonStop from './components/button/ButtonStop';
import ButtonDownload from './components/button/ButtonDownload';
import ButtonCameraOn from './components/button/ButtonCameraOn';
import ButtonCameraOff from './components/button/ButtonCameraOff';

import Camera from './components/Camera';
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

          console.log('mediaRecorder.onstop: recording is stopped');
          if (autoDownload) onDownload();
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

        {enableCamera && <Fragment>
          {isCameraOn
            ? <ButtonCameraOff style={btnStyle} onClick={onCameraControl} />
            : <ButtonCameraOn style={btnStyle} onClick={onCameraControl} />}
        </Fragment>}

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