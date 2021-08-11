const vid = document.getElementById('vid')
const blobUrl = window.location.search.split('=')[1];

vid.src = blobUrl

const onDownloadVid = (e) => {
  try {
    e.preventDefault();

    const target = e.target.elements;

    let vidType = target[0].value || 'webm';
    let filename = target[1].value || 'reco';

    let link = document.createElement('a');
    link.href = blobUrl;
    link.download = `${filename}.${vidType}`;

    document.body.appendChild(link);
    link.click();

    setTimeout(function () {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    }, 100);
  } catch (error) {
    window.URL.revokeObjectURL(blobUrl);
  }
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

document.getElementById('form-download').addEventListener('submit', onDownloadVid, false)