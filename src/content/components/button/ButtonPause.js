import { h } from 'preact';

export default function ButtonPause({ onClick, style }) {
  return <button onClick={onClick} style={style} title="Pause Recording">
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
    </svg>
  </button>
}