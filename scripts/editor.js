const contentElement = document.querySelector('.content');
const formConvert = document.getElementById('form-convert');
const btnConvert = formConvert.querySelector('button');
const videoPlayer = document.getElementById('vid');
const img = document.createElement('img')

const btnClearCache = document.getElementById('btn-clear-cache');

var tmpRecordedChunks;
var blob;
var blobUrl;

if (window.recordedChunks) {
  tmpRecordedChunks = window.recordedChunks.slice(0);
  blob = new Blob(tmpRecordedChunks, { type: window.mimeType });
  blobUrl = window.URL.createObjectURL(blob);
}

videoPlayer.src = blobUrl + "#t=" + window.recordedChunks.length;

const onDownloadVid = (e) => {
  try {
    e.preventDefault();
    const target = e.target.elements;

    let filename = target[0].value || 'reco';
    let vidType = window.mimeType || 'webm';

    download(tmpRecordedChunks, filename, vidType)
  } catch (error) {
    window.URL.revokeObjectURL(blobUrl);
  }
}

const onConvertToGif = (e) => {
  e.preventDefault();

  img.src = null;

  const videosElement = document.querySelectorAll('video')
  const target = e.target.elements;

  btnConvert.disabled = true;

  gifshot.createGIF({
    video: blobUrl,
    gifWidth: target[1].value || videosElement[0].getBoundingClientRect().width,
    gifHeight: target[2].value || videosElement[0].getBoundingClientRect().height,
    interval: 0.2,
    numFrames: target[3].value || 40,
    frameDuration: 1,
    sampleInterval: 10,
    numWorkers: target[4].value || 2,
    progressCallback: (captureProgress) => {
      captureProgress = captureProgress * 100
      if (captureProgress) captureProgress -= 2;
      btnConvert.textContent = 'Conversion (' + (parseInt(captureProgress, 10)) + '%)';
    }
  }, function (obj) {

    if (obj.error) {
      console.log(obj.error);
    }
    else {
      btnConvert.textContent = 'Conversion (100%)';
      videosElement[0].classList.add('mb-20')

      // preview video gif
      img.src = obj.image;
      img.alt = 'reco gif';
      img.classList.add('mb-10')

      const btn = document.createElement('button');
      btn.textContent = 'Download gif'

      btn.onclick = () => {
        const filename = target[0].value;
        download(obj.image, filename, null, 'gif');
      }

      contentElement.appendChild(img)
      contentElement.appendChild(btn)

      btnConvert.disabled = false;

      let intervalId = setInterval(() => {
        let vidMask = document.querySelector('[crossorigin="Anonymous"]');
        if (vidMask && vidMask.id !== 'videoPlayer') {
          vidMask.style.display = 'none';
          clearInterval(intervalId)
        }
      }, 2000);
    }
  });
}

function loadStoredVideos() {
  const videos = localStorage.getItem('videos')
    ? JSON.parse(localStorage.getItem('videos'))
    : [];

  if (videos.length > 0) {
    const listVideos = document.getElementById('videos');
    for (const records of videos) {
      const videoEL = document.createElement('video')
      videoEL.controls = true;
      const videoBlob = new Blob(records, { type: window.mimeType });
      videoEL.src = window.URL.createObjectURL(videoBlob);
      listVideos.appendChild(videoEL);
    }
  }
}

const onClearCache = () => {
  try {
    const isOk = window.confirm('Are you sure you want to clear cache?')
    if (isOk) {
      videoPlayer.src = null;
      tmpRecordedChunks = [];
      blob = null;
      blobUrl = null;
      window.URL.revokeObjectURL(blobUrl);
      btnClearCache.textContent = 'Empty cache';
      setTimeout(() => { btnClearCache.textContent = 'Clear cache'; }, 3000);
    }
  } catch (error) { }
}

window.onbeforeunload = function (e) {
  try {
    const confirmationMessage = 'Are you sure you want to leave?';
    (e || window.event).returnValue = confirmationMessage;
    if (blobUrl) { window.URL.revokeObjectURL(blobUrl) }
    return confirmationMessage;
  } catch (error) {
    if(blobUrl) window.URL.revokeObjectURL(blobUrl);
  }
};

formConvert.addEventListener('submit', onConvertToGif, false)
btnClearCache.addEventListener('click', onClearCache);
document.getElementById('form-download').addEventListener('submit', onDownloadVid, false)