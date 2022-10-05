import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { btnStyle } from '../styles';
import convertTime from '../utils/convertTime';

export default function Timer({ isRecordingPlay, isRecordingPaused }) {
  const [timer, setTimer] = useState('00:00');

  useEffect(() => {
    let timerId;

    if (isRecordingPlay) {
      const initialTime = Date.now();

      timerId = setInterval(() => {
        if (!isRecordingPaused) {
          const timeDifference = Date.now() - initialTime;
          const formatted = convertTime(timeDifference);
          setTimer(formatted);
        }
      }, 100);
    }

    return () => {
      clearInterval(timerId)
    }
  }, [isRecordingPlay, isRecordingPaused]);

  return (
    <button style={btnStyle} title="Timer">{timer}</button>
  )
}
