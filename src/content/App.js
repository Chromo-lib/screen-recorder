import { h, Fragment } from 'preact';
import { useCallback, useState, useEffect, useRef } from 'preact/hooks';
import { signal } from "@preact/signals";
import ButtonPause from './components/ButtonPause';
import ButtonPlay from './components/ButtonPlay';
import ButtonResume from './components/ButtonResume';
import ButtonStop from './components/ButtonStop';
import Draggable from './components/Draggable';
import Timer from './components/Timer';
import { btnStyle, containerStyle, videoContainer, videoStyle } from './styles';
import downloadVideo from './utils/downloadVideo';
import record from './utils/record';
import ButtonMove from './components/ButtonMove';
import ButtonDownload from './components/ButtonDownload';

function App({ request }) {
  const videoEl = useRef();
  const localStream = signal(null);

  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [isRecordingPlay, setIsRecordingPlay] = useState(false);
  const [isRecordingPaused, setIsRecordingPaused] = useState(false);

  const [isRecordingFinished, setIsRecordingFinished] = useState(false);

  const chunks = [];

  const onPlay = useCallback(async () => {
    if (mediaRecorder === null) {
      const { mediaRecorder, stream } = await record(request);

      setMediaRecorder(mediaRecorder);
      setIsRecordingPlay(true);

      mediaRecorder.onstop = async () => {
        if (localStream.value) {
          localStream.value.getTracks().forEach((track) => { track.stop(); });
          localStream.value = null;
        }

        stream.getTracks().forEach(track => { track.stop(); });

        setMediaRecorder(null);
        setIsRecordingPlay(false);
        setIsRecordingFinished(true);

        if (request.autoDownload) onDownload();
        console.log('mediaRecorder.onstop: recording is stopped');
      }

      mediaRecorder.ondataavailable = (e) => {
        chunks.push(e.data);
      }
    }
  }, []);

  const onStop = () => {
    if (!isRecordingPlay && localStream.value) {
      localStream.value.getTracks().forEach((track) => { track.stop(); });
      localStream.value = null;
    }

    if (mediaRecorder) {
      mediaRecorder.stop();
    }
  }

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

    const constraints = {
      audio: true,
      video: { deviceId: request.cameraID, facingMode: 'user' }
    }

    navigator.mediaDevices.getUserMedia(constraints)
      .then(stream => {
        if (!request.enableAudioCamera) stream.getAudioTracks().forEach((track) => { track.stop(); });
        videoEl.current.autoplay = true;
        videoEl.current.srcObject = stream;
        localStream.value = stream;
      });

    return () => {
      if (localStream.value) {
        localStream.value.getTracks().forEach((track) => { track.stop(); });
      }
    }
  }, []);

  const onDownload = useCallback(() => {
    downloadVideo(chunks, request.tabTitle || 'reco', 'video/webm');
  }, []);

  if (isRecordingFinished) {
    return <Draggable style={containerStyle}>
      {!request.autoDownload && <ButtonDownload style={btnStyle} onClick={onDownload} />}
    </Draggable>
  }
  else {
    return <Fragment>
      <Draggable style={containerStyle}>

        <ButtonMove style={btnStyle} />

        {request.enableTimer && <Timer isRecordingPlay={isRecordingPlay} isRecordingPaused={isRecordingPaused} />}

        <ButtonStop style={btnStyle} onClick={onStop} />

        {isRecordingPlay
          ? <Fragment>
            {isRecordingPaused
              ? <ButtonResume style={btnStyle} onClick={onResume} />
              : <ButtonPause style={btnStyle} onClick={onPause} />}
          </Fragment>

          : <ButtonPlay style={btnStyle} onClick={onPlay} />}
      </Draggable>

      <Draggable style={videoContainer}>
        <video src="" ref={videoEl} style={videoStyle}></video>
      </Draggable>
    </Fragment>
  }
}

export default App;