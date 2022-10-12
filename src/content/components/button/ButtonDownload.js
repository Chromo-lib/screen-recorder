import { h } from 'preact';

export default function ButtonDownload({ onClick, style }) {
  return <button onClick={onClick} style={style} title="Download Recording">
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
    <span style={{ marginLeft: '10px' }}>Download</span>
  </button>
}