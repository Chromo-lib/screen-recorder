let stream;

let videoEL, divCameraEL, divControlsEL;
let spanVideoOffEL, spanMuteEL, spanStopEL, spanPauseEL;
let muted = false, videoOff = false, videoPause = false;

const svgVolumeUp = `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M8 8H3C2.44772 8 2 8.44772 2 9V15C2 15.5523 2.44772 16 3 16H8L14 21V3L8 8Z" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M17 9.35425C17.6224 10.0594 18 10.9856 18 12.0001C18 13.0145 17.6224 13.9408 17 14.6459" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M21 8C21.6224 9.06603 22 10.4663 22 12C22 13.5337 21.6224 14.934 21 16" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg><div class="jsx-3256151754 icon-caption"></div>`;
const svgMuted = `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M22 10L20 12M20 12L18 14M20 12L18 10M20 12L22 14" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M8.5 8H3C2.44772 8 2 8.44772 2 9V15C2 15.5523 2.44772 16 3 16H8.5L15 21V3L8.5 8Z" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg><div class="jsx-3256151754 icon-caption"></div>`;
const svgCamOn = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#000" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M0 5a2 2 0 0 1 2-2h7.5a2 2 0 0 1 1.983 1.738l3.11-1.382A1 1 0 0 1 16 4.269v7.462a1 1 0 0 1-1.406.913l-3.111-1.382A2 2 0 0 1 9.5 13H2a2 2 0 0 1-2-2V5z"/></svg>`;
const svgCamOFF = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#000" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M10.961 12.365a1.99 1.99 0 0 0 .522-1.103l3.11 1.382A1 1 0 0 0 16 11.731V4.269a1 1 0 0 0-1.406-.913l-3.111 1.382A2 2 0 0 0 9.5 3H4.272l6.69 9.365zm-10.114-9A2.001 2.001 0 0 0 0 5v6a2 2 0 0 0 2 2h5.728L.847 3.366zm9.746 11.925-10-14 .814-.58 10 14-.814.58z"/></svg>`;

createMuteButton();
createVideoOffButton();
createPauseButton();
createStopButton();

async function onMessage(request) {
  const { message, enableCamera, microphone, enableAudioCamera } = request;

  if (message === 'audio-or-camera-permission') {
    try {
      const micState = await navigator.permissions.query({ name: 'microphone' });
      const camState = await navigator.permissions.query({ name: 'camera' });
      let permissionState = micState.state !== 'granted' ? micState : camState;

      permissionState.onchange = function () {
        console.log(this.state);
        if (this.state === 'granted') {
          chrome.runtime.sendMessage({ ...request, message: 'content-granted' });
        }
        else {
          if (chrome.runtime?.id) {
            chrome.runtime.sendMessage({ ...request, message: 'permission-fail' });
          }
        }
      }

      if (micState.state === 'granted' || camState.state === 'granted') {
        chrome.runtime.sendMessage({ ...request, message: 'content-granted' });
      }
      else {
        stream = await navigator.mediaDevices.getUserMedia({ video: enableCamera, audio: enableAudioCamera || microphone });
        stream.getTracks().forEach((track) => { track.stop(); });
      }
    } catch (error) {
      chrome.runtime.sendMessage({ ...request, message: 'permission-fail' });
      console.log('background-ask-audio-or-camera-permission', error);
    }
  }

  if (message === 'background-start-record') {
    try {
      videoOff = enableCamera;
      muted = enableAudioCamera;

      if (!muted && !videoOff) muted = true;

      stream = await navigator.mediaDevices.getUserMedia({ video: videoOff, audio: muted });

      if (stream.getAudioTracks().length > 0) {
        stream.getAudioTracks().forEach(track => { track.enabled = muted; });
      }

      spanMuteEL.innerHTML = muted ? svgMuted : svgVolumeUp;
      spanVideoOffEL.innerHTML = videoOff ? svgCamOFF : svgCamOn;

      createLocalVideo(request);
      chrome.runtime.sendMessage(request);
    } catch (error) {
      destroy();
      console.log('background-start-record', error);
    }
  }

  if (message && message.includes('stop-record')) {
    destroy()
    console.log('Recording is stoped');
  }
}

// ui
function createVideoOffButton() {
  spanVideoOffEL = document.createElement('span');
  spanVideoOffEL.style.cssText = `margin-bottom: 10px; background: #ffffffd1; display: flex; align-items:center; justify-content: center; cursor: pointer; padding: 5px 8px; border-radius: 50%;  box-shadow: 2px 2px 7px 0 rgb(0 0 0 / 13%);`;
  spanVideoOffEL.innerHTML = videoOff ? svgCamOFF : svgCamOn;

  spanVideoOffEL.onclick = () => {
    videoOff = !videoOff;
    if (stream.getVideoTracks().length > 0) {
      stream.getVideoTracks().forEach(track => {
        track.enabled = videoOff;
      });
    }
    spanVideoOffEL.innerHTML = videoOff ? svgCamOFF : svgCamOn;
  }
}

function createMuteButton() {
  spanMuteEL = document.createElement('span');
  spanMuteEL.style.cssText = `margin-bottom: 10px; background: #ffffffd1; display: flex; align-items:center; justify-content: center; cursor: pointer; padding: 5px 8px; border-radius: 50%; box-shadow: 2px 2px 7px 0 rgb(0 0 0 / 13%);`;
  spanMuteEL.innerHTML = muted ? svgMuted : svgVolumeUp;

  spanMuteEL.onclick = () => {
    muted = !muted;
    chrome.runtime.sendMessage({ message: 'mute-microphone', muted });
    if (stream.getAudioTracks().length > 0) {
      stream.getAudioTracks().forEach(track => {
        track.enabled = muted;
      });
    }
    spanMuteEL.innerHTML = muted ? svgMuted : svgVolumeUp;
  }
}

function createStopButton() {
  spanStopEL = document.createElement('span');
  const svgStop = `<svg width="24" height="24" viewBox="0 0 24 24" fill="#fff" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="4" width="16" height="16" rx="2" stroke="#e91e63" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></rect></svg>`;
  spanStopEL.style.cssText = `margin-bottom: 10px; background: #e91e63; display: flex; align-items:center; justify-content: center; cursor: pointer; padding: 5px 8px; border-radius: 50%; box-shadow: 2px 2px 7px 0 rgb(0 0 0 / 13%);`;
  spanStopEL.innerHTML = svgStop;

  spanStopEL.onclick = () => {
    chrome.runtime.sendMessage({ message: 'stop-record' });
  }
}

function createPauseButton() {
  const svgPlause = `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M5 21V3L19 12L5 21Z" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>`;
  const svgStop = `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><rect x="6" y="4" width="4" height="16" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></rect><rect x="14" y="4" width="4" height="16" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></rect></svg>`;

  spanPauseEL = document.createElement('span');

  spanPauseEL.style.cssText = `margin-bottom: 10px; background: #ffffffd1; display: flex; align-items:center; justify-content: center; cursor: pointer; padding: 5px 8px; border-radius: 50%; box-shadow: 2px 2px 7px 0 rgb(0 0 0 / 13%);`;
  spanPauseEL.innerHTML = videoPause ? svgPlause : svgStop;

  spanPauseEL.onclick = () => {
    videoPause = !videoPause;
    spanPauseEL.innerHTML = videoPause ? svgPlause : svgStop;
    if (videoPause) chrome.runtime.sendMessage({ message: 'pause-record', pause: videoPause });
    else chrome.runtime.sendMessage({ message: 'resume-record', pause: videoPause });
  }
}

function createLocalVideo(request) {
  divControlsEL = document.createElement('div');
  divControlsEL.id = 'reco-controls';

  divControlsEL.appendChild(spanPauseEL);
  divControlsEL.appendChild(spanMuteEL);
  divControlsEL.appendChild(spanVideoOffEL);
  divControlsEL.appendChild(spanStopEL);

  divControlsEL.style.cssText = `position: fixed; bottom: 15px; left: 15px; z-index: 99999;
  display: flex; align-items: center; flex-direction: column;`;

  if (request.enableCamera) {
    divCameraEL = document.createElement('div');
    divCameraEL.id = 'reco-camera';

    divCameraEL.style.cssText = `width: 170px; height:170px;
    position: fixed; bottom: 15px; right: 15px; z-index: 99999; 
    border-radius: 50%; overflow: hidden; background: black;`;

    videoEL = document.createElement('video');
    videoEL.autoplay = true;
    videoEL.srcObject = stream;
    videoEL.style.cssText = `width: 100%; height: 100%;`;
    divCameraEL.appendChild(videoEL);
    document.body.appendChild(divCameraEL);
  }
  document.body.appendChild(divControlsEL);
}

function destroy() {
  try {
    if (stream) {
      stream.getTracks().forEach((track) => {
        track.enabled = false;
        track.stop();
      });
      stream = null;
    }
    if (videoEL) videoEL.srcObject = null;
    if (divControlsEL && divControlsEL.parentNode) document.body.removeChild(divControlsEL);
    if (divCameraEL && divCameraEL.parentNode) document.body.removeChild(divCameraEL);

    const elcontrol = document.getElementById('reco-controls');
    if (elcontrol && elcontrol.parentNode) elcontrol.parentNode.removeChild(elcontrol);

    const el = document.getElementById('reco-camera');
    if (el && el.parentNode) el.parentNode.removeChild(el);
  } catch (error) {
    console.log('Error destroy....', error);
  }
}

chrome.runtime.onMessage.addListener(onMessage);
