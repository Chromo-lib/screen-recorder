import { h, Fragment } from 'preact';
import { useCallback, useState } from 'preact/hooks';

import Draggable from './components/Draggable';
import Timer from './components/Timer';
import downloadVideo from './utils/downloadVideo';
import record from './utils/record';

import ButtonMove from './components/button/ButtonMove';
import ButtonPause from './components/button/ButtonPause';
import ButtonPlay from './components/button/ButtonPlay';
import ButtonResume from './components/button/ButtonResume';
import ButtonStop from './components/button/ButtonStop';
import ButtonDownload from './components/button/ButtonDownload';

import ButtonMicOn from './components/button/ButtonMicOn';
import ButtonMicOff from './components/button/ButtonMicOff';

import PreBug from './components/PreBug';
import createLink from './utils/createLink';
import ButtonOpenEditor from './components/button/ButtonOpenEditor';
import ButtonTash from './components/button/ButtonTash';

function App({ request }) {
  const { tabTitle, autoDownload, enableTimer, enableCamera, isMicrophoneConnected } = request;

  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [isRecordingPlay, setIsRecordingPlay] = useState(false);
  const [isRecordingPaused, setIsRecordingPaused] = useState(false);
  const [isRecordingFinished, setIsRecordingFinished] = useState(false);

  const [audioStream, setAudioStream] = useState(null);
  const [isMicOn, setIsMicOn] = useState(enableCamera);

  const [errorMessage, setErrorMessage] = useState(false);

  const [isAppClosed, setIsAppClosed] = useState(false);

  const chunks = [];

  const onMediaControl = async (actionType) => {
    try {
      if (actionType === 'play' && mediaRecorder === null) {
        const { mediaRecorder, stream, audioStream } = await record(request);

        setMediaRecorder(mediaRecorder);
        setAudioStream(audioStream);
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
      setIsMicOn(false);
      setErrorMessage('Max Timeout 5s, Please refresh the page');
    }
  }

  const onMicControl = () => {
    if (audioStream && audioStream.getTracks().length > 0) {
      const state = !isMicOn;
      audioStream.getTracks().forEach((track) => { track.enabled = state });
      setIsMicOn(state);
    }
  }

  const onDownload = useCallback(() => {
    downloadVideo(chunks, tabTitle || 'reco', 'video/webm');
  }, []);

  const onOpenEditor = useCallback(async () => {
    const videoURL = createLink(chunks);
    const videoLen = +localStorage.getItem('reco-timer');
    await chrome.runtime.sendMessage({ from: 'content', videoURL, videoLen, tabTitle });
  }, []);

  const onDeleteRecording = () => {
    setIsAppClosed(true)
  }

  if (errorMessage) {
    return <Draggable className="drag-reco" style={{ left: '20px' }}><PreBug text={errorMessage} /></Draggable>
  }
  if ((autoDownload && isRecordingFinished) || isAppClosed) {
    return <Fragment></Fragment>
  }
  if (isRecordingFinished) {
    return <Draggable className="drag-reco" style={{ left: '20px' }}>
      <ButtonMove />
      {!autoDownload && <ButtonTash onClick={onDeleteRecording} />}
      {!autoDownload && <ButtonOpenEditor onClick={onOpenEditor} />}
      {!autoDownload && <ButtonDownload onClick={onDownload} />}
    </Draggable>
  }
  else {
    return <Fragment>
      <Draggable className="drag-reco" style={{ left: '20px' }}>

        <ButtonMove />

        {isMicrophoneConnected && <Fragment>
          {isMicOn
            ? <ButtonMicOn onClick={onMicControl} />
            : <ButtonMicOff onClick={onMicControl} />}
        </Fragment>}

        {enableTimer && <Timer isRecordingPlay={isRecordingPlay} isRecordingPaused={isRecordingPaused} />}

        {isRecordingPlay
          ? <Fragment>
            <ButtonStop onClick={() => { onMediaControl('stop') }} title='Stop Recording' />
            {isRecordingPaused
              ? <ButtonResume onClick={() => { onMediaControl('resume') }} />
              : <ButtonPause onClick={() => { onMediaControl('pause') }} />}
          </Fragment>

          : <ButtonPlay onClick={() => { onMediaControl('play') }} />}
      </Draggable>
    </Fragment>
  }
}

export default App;