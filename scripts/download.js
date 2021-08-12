const contentElement = document.querySelector('.content');

const formConvert = document.getElementById('form-convert');
const btnConvert = formConvert.querySelector('button');

const vid = document.getElementById('vid')
const blobUrl = window.location.search.split('=')[1];

vid.src = blobUrl;

const download = (filename, type, url) => {
  let link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.${type}`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

const onDownloadVid = (e) => {
  try {
    e.preventDefault();

    const target = e.target.elements;

    let vidType = target[0].value || 'webm';
    let filename = target[1].value || 'reco';

    download(filename, vidType, blobUrl)

    setTimeout(function () {
      window.URL.revokeObjectURL(blobUrl);
    }, 100);
  } catch (error) {
    window.URL.revokeObjectURL(blobUrl);
  }
}

const convertGif = (e) => {
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
      btnConvert.textContent = 'Conversion (' + (parseInt(captureProgress * 100, 10)) + '%)';
    }
  }, function (obj) {

    if (obj.error) {
      console.log(obj.error);
    }
    else {
      videosElement[0].classList.add('mb-20')
      if (videosElement[1] && videosElement[1].id !== 'vid') {
        videosElement[1].style.display = 'none';
      }

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

formConvert.addEventListener('submit', convertGif, false)
document.getElementById('form-download').addEventListener('submit', onDownloadVid, false)