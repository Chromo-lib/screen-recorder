import { h, Fragment } from 'preact';
import { useState } from 'preact/hooks';
import IconCodec from './components/icons/IconCodec';
import ToggleMic from './containers/ToggleMic';
import ToggleCamera from './containers/ToggleCamera';
import MediaSource from './components/MediaSource';
import AudioInputs from './containers/AudioInputs';

import MimeTypes from './containers/MimeTypes';
import Resolutions from './containers/Resolutions';
import VideoInputs from './containers/VideoInputs';

import getCurrentTabId from './utils/getCurrentTabId';
import checkDevices from './utils/checkDevices';
import checkPermission from './utils/checkPermission';
import Message from './components/Message';
import isFirefox from './utils/isFirefox';

function App() {

  const [options, setOptions] = useState({
    videoMediaSource: 'tab', // webcam, tab, desktop, window

    audioInput: 'default',
    videoInput: 'default',

    enableMicrophone: true,
    enableCamera: true,
    enableAudioCamera: false,

    mimeType: isFirefox ? 'video/webm' : 'video/webm;codecs=vp8,opus',

    enableTimer: true,
    autoDownload: true,
    resolution: '1280x720',

    placeholder: {
      radius: 50,
      width: 240,
      height: 240
    }
  });

  const [message, setMessage] = useState(null)

  const onChange = e => {
    console.log(e.target.name, e.target.value);
    if (e.target.name.startsWith('placeholder')) {
      const name = e.target.name.replace(/\w+\./g, '');
      let placeholder = { ...options.placeholder, [name]: e.target.value };
      setOptions({ ...options, placeholder });
    }
    else setOptions({ ...options, [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
  }

  const onStartRecording = async e => {
    e.preventDefault();
    const [width, height] = options.resolution.split('x');
    const resolution = { width: +width, height: +height };

    try {
      const permission = await checkPermission(options);
      const devicesStatus = await checkDevices();
      const tabInfos = await getCurrentTabId();

      const response = await chrome.runtime.sendMessage({
        from: 'popup',
        message: 'start-record',
        ...tabInfos,
        ...options,
        ...devicesStatus,
        resolution
      });

    } catch (error) {
      if (!error.message.includes('The message port closed before a response was received')) {
        setMessage(error.message)
      }
    }
  }

  return <Fragment>

    <MediaSource />

    <form onSubmit={onStartRecording}>
      <fieldset class="w-100 d-flex align-center">
        <legend>Microphone</legend>
        <ToggleMic onClick={(status) => { setOptions({ ...options, enableMicrophone: status }) }} value={options.enableMicrophone} />
        <AudioInputs onChange={onChange} value={options.audioInput} />
      </fieldset>

      <fieldset>
        <legend>Camera</legend>

        <div class="w-100 d-flex align-center">
          <ToggleCamera onClick={(status) => { setOptions({ ...options, enableCamera: status }) }} value={options.enableCamera} />
          <VideoInputs onChange={onChange} value={options.videoInput} />
        </div>

        <div class="w-100 vertical-align justify-between mt-1">
          H: <input type="number" id="placeholder.height" name="placeholder.height"
            min="0" onChange={onChange} value={options.placeholder.height} title="Height (px)" />
          W: <input type="number" id="placeholder.width" name="placeholder.width"
            min="0" onChange={onChange} value={options.placeholder.width} title="Width (px)" />
          R: <input type="number" id="placeholder.width" name="placeholder.radius"
            min="0" onChange={onChange} value={options.placeholder.radius} title="Border Radius (%)" />
        </div>
      </fieldset>

      <fieldset class="w-100 d-flex align-center">
        <legend>video Codec</legend>
        <IconCodec />
        <MimeTypes onChange={onChange} value={options.mimeType} />
      </fieldset>

      <fieldset class="w-100">
        <legend>options</legend>

        <Resolutions onChange={onChange} value={options.resolution} />

        <div class="w-100 vertical-align">
          <input type="checkbox" id="enableTimer" name="enableTimer" onChange={onChange} value={options.enableTimer} checked={options.enableTimer} />
          <label for="enableTimer">Enable timer</label>
        </div>

        <div class="w-100 vertical-align">
          <input type="checkbox" id="autoDownload" name="autoDownload" onChange={onChange} value={options.autoDownload} checked={options.autoDownload} />
          <label for="autoDownload">Enable auto download</label>
        </div>
      </fieldset>

      <button type="submit" class="w-100">start recording</button>
    </form>

    {message && <Message text={message} />}
  </Fragment>
}

export default App;