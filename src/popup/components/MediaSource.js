import { h } from 'preact';
import { useState } from 'preact/hooks';
import IconDesk from './icons/IconDesk';
import IconTab from './icons/IconTab';
import IconWebcam from './icons/IconWebcam';
import IconWin from './icons/IconWin';

const sources = [
  { label: 'tab', icon: <IconTab /> },
  { label: 'window', icon: <IconWin /> },
  { label: 'desktop', icon: <IconDesk /> },
  { label: 'webcam', icon: <IconWebcam /> },
]

export default function MediaSource() {

  const [tabIndex, setTabIndex] = useState(0);

  const onTab = index => {
    setTabIndex(index)
  }

  return <fieldset>
    <legend>Media Source</legend>
    <ul class="w-100 d-flex justify-between" id="video-media-source">
      {sources.map((s, i) => <li class={tabIndex === i ? "active-tab" : ""} title={s.label} key={i}
        onClick={() => { onTab(i) }}>
        {s.icon}
        <span>{s.label}</span>
      </li>)}
    </ul>
  </fieldset>
}
