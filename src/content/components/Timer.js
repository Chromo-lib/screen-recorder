import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import convertTime from '../utils/convertTime';

export default function Timer({ isRecordingPlay, isRecordingPaused }) {
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    let timerId;

    if (isRecordingPlay) {
      timerId = setInterval(() => {
        if (!isRecordingPaused) {
          setTimer(prev => {
            const counter = prev + 1;
            localStorage.setItem('reco-timer', '' + counter)
            return counter
          });
        }
      }, 1000);
    }

    return () => {
      clearInterval(timerId)
    }
  }, [isRecordingPlay, isRecordingPaused]);

  return <button title="Timer">{convertTime(timer)}</button>
}
