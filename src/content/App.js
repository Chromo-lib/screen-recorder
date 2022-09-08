import { h, Fragment } from 'preact';
import { useCallback, useState, useEffect, useRef } from 'preact/hooks';
import { signal } from "@preact/signals";
import ButtonPause from './components/ButtonPause';
import ButtonPlay from './components/ButtonPlay';
import ButtonResume from './components/ButtonResume';
import ButtonStop from './components/ButtonStop';
import Draggable from './components/Draggable';
import Timer from './components/Timer';
import { btnStyle, containerStyle, btnDownload, videoContainer, videoStyle } from './styles';

import record from './utils/record';
import createLink from './utils/createLink';

function App({ request }) {

  const videoEl = useRef();
  const localStream = signal(null);

  const [videoLink, setVideoLink] = useState(null)

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
        if (localStream.value) {
          localStream.value.getTracks().forEach((track) => { track.stop(); });
          localStream.value = null;
        }

        stream.getTracks().forEach(track => { track.stop(); });

        setMediaRecorder(null);
        setIsRecordingPlay(false);

        setVideoLink(createLink(chunks));
        console.log('mediaRecorder.onstop: recording is stopped');
      }

      mediaRecorder.ondataavailable = (e) => {
        chunks.push(e.data);
      }
    }
  }, []);

  const onStop = () => {
    if (localStream.value) {
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

    navigator.mediaDevices.getUserMedia({ video: true, audio: request.enableAudioCamera })
      .then(stream => {
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

  const onDownload = () => {
    const link = document.createElement('a');
    link.href = videoLink;
    link.download = `reco.webm`;

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    window.URL.revokeObjectURL(videoLink);
    setVideoLink(null);
  }

  return <Fragment>
    <div style={containerStyle}>

      <Timer isRecordingPlay={isRecordingPlay} isRecordingPaused={isRecordingPaused} />

      {isRecordingPlay && <Fragment>
        <ButtonStop style={btnStyle} onClick={onStop} />

        {isRecordingPaused
          ? <ButtonResume style={btnStyle} onClick={onResume} />
          : <ButtonPause style={btnStyle} onClick={onPause} />}
      </Fragment>}

      {!isRecordingPlay && !videoLink && <ButtonPlay style={btnStyle} onClick={onPlay} />}

      {videoLink && <button onClick={onDownload} style={btnDownload}>Download</button>}
    </div>

    <Draggable style={videoLink ? { ...videoContainer, width: '50vw', height: '50vh' } : videoContainer}>
      <video src={videoLink}
        ref={videoEl}
        style={videoLink ? { ...videoStyle, borderRadius: 0 } : videoStyle}
        controls={videoLink !== null}>
      </video>
    </Draggable>
  </Fragment>
}

export default App;