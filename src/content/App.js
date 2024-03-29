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

import createLink from './utils/createLink';
import ButtonOpenEditor from './components/button/ButtonOpenEditor';
import ButtonClose from './components/button/ButtonClose';

const isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;

function App({ request }) {
  const { tabTitle, autoDownload, enableTimer, enableCamera, isMicrophoneConnected } = request;

  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [isRecordingPlay, setIsRecordingPlay] = useState(false);
  const [isRecordingPaused, setIsRecordingPaused] = useState(false);
  const [isRecordingFinished, setIsRecordingFinished] = useState(false);

  const [audioStream, setAudioStream] = useState(null);
  const [isMicOn, setIsMicOn] = useState(enableCamera);

  const [isAppClosed, setIsAppClosed] = useState(false);

  const chunks = [];

  const onMediaControl = async (actionType) => {
    try {
      if (actionType === 'play' && mediaRecorder === null) {
        const { mediaRecorder, stream, audioStream } = await record(request);

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

        setMediaRecorder(mediaRecorder);
        setAudioStream(audioStream);
        setIsRecordingPlay(true);
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
    if(window.confirm('Do you really want to delete this?')) {
      setIsAppClosed(true)
    }
  }

  if ((autoDownload && isRecordingFinished) || isAppClosed) {
    return <Fragment></Fragment>
  }
  if (isRecordingFinished) {
    return <Draggable className="drag-reco" style={{ left: '20px' }}>
      <ButtonMove />
      {!autoDownload && <ButtonClose onClick={onDeleteRecording} className="red" title="Delete Record" />}
      {!autoDownload && !isFirefox && <ButtonOpenEditor onClick={onOpenEditor} />}
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