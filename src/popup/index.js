const alertEl = document.querySelector('.alert');
const videoMediaSourceEL = document.getElementById('video-media-source');

let recordOptions = {
  videoMediaSource: 'tab',
  microphoneID: 'default',
  cameraID: 'default',

  enableMicrophone: false,
  enableCamera: false,
  enableAudioCamera: false,

  mimeType: 'video/webm;codecs=vp8,opus',

  enableTimer: true,
  autoDownload: true,

  resolution: { width: 1280, height: 720 },
}

const getCurrentTabId = async () => {
  const tabs = await chrome.tabs.query({ currentWindow: true, active: true });
  const currentTab = tabs[0];
  const tabURL = new URL("https://haikel-fazzani.ml/portfolio/19-drag-react").origin;

  if (currentTab.url.includes('chrome://')) {
    throw new Error('This page is not supported...')
  }
  else return { tabId: currentTab.id, tabTitle: currentTab.title, tabURL }
}

const onGrantPermission = async () => {
  try {
    const tabId = await getCurrentTabId();
    const response = await chrome.runtime.sendMessage({ from: 'popup', message: 'grant-permission', tabId, ...recordOptions });
    console.log(response);
  } catch (error) {
    console.log(error.message);
  }
}

const onStartRecord = async (e) => {
  e.preventDefault();
  try {
    for (const element of e.target.elements) {
      const value = element.value;
      const name = element.name;

      if (value && name) {
        if (name === "resolution") { recordOptions.resolution = resolutions[+value]; }
        if (element.type === 'checkbox') recordOptions[name] = JSON.parse(element.checked);
        else recordOptions[name] = value && value.length > 1 ? value : recordOptions[name];
      }
    }

    const devicesStatus = await checkDevices();

    const tabInfos = await getCurrentTabId();
    const response = await chrome.runtime.sendMessage({
      from: 'popup',
      message: 'start-record',
      ...tabInfos,
      ...recordOptions,
      ...devicesStatus
    });

    alertEl.style.display = 'block';
    alertEl.textContent = response;
  } catch (error) {
    if (!error.message.includes('The message port closed before a response was received')) {
      alertEl.style.display = 'block';
      alertEl.textContent = error.message;
    }
  }
}

const onTabVideoMediaSource = e => {
  let value = e.target.dataset.value || e.target.parentNode.dataset.value

  let liTarget = e.target.nodeName === 'LI'
    ? e.target : e.target.parentNode.nodeName === 'LI'
      ? e.target.parentNode : null;

  if (liTarget && value) {
    value = value === 'off' ? false : value;
    recordOptions = { ...recordOptions, videoMediaSource: value };

    Array.from(videoMediaSourceEL.children).forEach(li => {
      li.classList.remove('active-tab')
    });

    liTarget.classList.add('active-tab');
  }
}

document.getElementById('video-media-source').addEventListener('click', onTabVideoMediaSource);
document.getElementById('form-start-record').addEventListener('submit', onStartRecord);
// document.getElementById('btn-grant-permission').addEventListener('click', onGrantPermission, false);