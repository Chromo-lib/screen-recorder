const contentElement = document.querySelector('.content');
const formConvert = document.getElementById('form-convert');
const btnConvert = formConvert.querySelector('button');
const videoPlayer = document.getElementById('vid');

const blob = new Blob(window.recordedChunks, { type: window.vidMimeType });
const blobUrl = window.URL.createObjectURL(blob);

videoPlayer.src = blobUrl + "#t=" + window.recordedChunks.length;

const download = (filename, type) => {
  const nblob = new Blob(window.recordedChunks, { type });
  const url = window.URL.createObjectURL(nblob);

  let vidExtension = type.includes('webm')

  let link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.${vidExtension ? 'webm' : 'mp4'}`;

  document.body.appendChild(link);
  link.click();

  setTimeout(() => {
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }, 1000);
}

const onDownloadVid = (e) => {
  try {
    e.preventDefault();

    const target = e.target.elements;

    let vidType = target[0].value || 'webm';
    let filename = target[1].value || 'reco';

    download(filename, vidType)
  } catch (error) {
    window.URL.revokeObjectURL(blobUrl);
  }
}

const onConvertToGif = (e) => {
  e.preventDefault();

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

      // preview anddownload gif
      const img = document.createElement('img')
      img.src = obj.image;
      img.alt = 'reco gif';
      img.classList.add('mb-10')

      const btn = document.createElement('button');
      btn.textContent = 'Download gif'

      btn.onclick = () => {
        download(target[0].value, 'gif', obj.image);
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

window.onbeforeunload = function (e) {
  try {
    if (blobUrl) {
      window.URL.revokeObjectURL(blobUrl)
    }

    const confirmationMessage = 'Are you sure you want to leave?';
    (e || window.event).returnValue = confirmationMessage;

    return confirmationMessage;
  } catch (error) {
    window.URL.revokeObjectURL(blobUrl);
  }
};

formConvert.addEventListener('submit', onConvertToGif, false)
document.getElementById('form-download').addEventListener('submit', onDownloadVid, false)