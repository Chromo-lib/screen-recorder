import { h } from 'preact';

export default function ButtonStop({ onClick, style, title }) {
  return <button onClick={onClick} style={style} title={title}>
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="red" viewBox="0 0 24 24" stroke-width="1.5" stroke="red">
      <path stroke-linecap="round" stroke-linejoin="round" d="M5.25 7.5A2.25 2.25 0 017.5 5.25h9a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-9z" />
    </svg>
  </button>
}