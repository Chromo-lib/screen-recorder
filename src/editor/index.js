import './style.css';

const formDownload = document.getElementById('form-download');
let store = { videoURL: null, videoLen: 0, tabTitle: null };

function downloadVideo(url, filename, vidExtension = 'webm') {
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.${vidExtension}`;

  document.body.appendChild(link);
  link.click();

  setTimeout(() => {
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }, 1000);
}

chrome.runtime.sendMessage({ from: 'editor' }, (response) => {
  if (response && response.videoURL) {
    store = { ...response };
    document.querySelector('video').src = response.videoURL + "#t=" + response.videoLen;
    document.querySelector('h1').textContent = response.tabTitle;
  }
});

const onDownload = (e) => {
  e.preventDefault();
  if (store.videoURL) {
    const filename = e.target.elements[0].value;
    downloadVideo(store.videoURL, filename || store.tabTitle);
  }
}

window.onbeforeunload = function (e) {
  try {
    const confirmationMessage = 'Are you sure you want to leave?';
    (e || window.event).returnValue = confirmationMessage;
    if (store.videoURL) { window.URL.revokeObjectURL(store.videoURL) }
    return confirmationMessage;
  } catch (error) {
    if (store.videoURL) window.URL.revokeObjectURL(store.videoURL);
  }
};

formDownload.addEventListener('submit', onDownload);