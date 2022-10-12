import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import convertTime from '../utils/convertTime';

export default function Timer({ isRecordingPlay, isRecordingPaused }) {
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    let timerId;

    if (isRecordingPlay) {
      const initialTime = Date.now();

      timerId = setInterval(() => {
        if (!isRecordingPaused) {
          const timeDifference = Date.now() - initialTime;
          setTimer(timeDifference);
        }
      }, 100);
    }

    return () => {
      clearInterval(timerId)
    }
  }, [isRecordingPlay, isRecordingPaused]);

  return <button title="Timer">{convertTime(timer)}</button>
}
