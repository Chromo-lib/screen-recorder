export default function convertTime(miliseconds) {
  if (miliseconds === 0) return '00:00'
  else {
    const totalSeconds = Math.floor(miliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds - minutes * 60;
    return (minutes < 10 ? '0' + minutes : minutes) + ':' + (seconds < 10 ? '0' + seconds : seconds);
  }
}