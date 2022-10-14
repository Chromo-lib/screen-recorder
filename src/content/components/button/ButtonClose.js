import { h } from 'preact';

export default function ButtonClose({ onClick, className ,title="Close Camera"}) {
  return <button onClick={onClick} class={className} title={title}>
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  </button>
}
