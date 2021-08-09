let vid = document.getElementById('vid')

const blobUrl = window.location.search.split('=')[1]

vid.src = blobUrl

const onDownloadVid = () => {
  let filename = window.prompt('Please enter video file name: ')

  let downloadLink = document.createElement('a');
  downloadLink.href = blobUrl;
  downloadLink.download = `${filename}.webm`;

  document.body.appendChild(downloadLink);
  downloadLink.click();

  URL.revokeObjectURL(blobUrl);
  document.body.removeChild(downloadLink);
}

window.onbeforeunload = function (e) {
  if (blobUrl) {
    URL.revokeObjectURL(blobUrl)
  }

  const confirmationMessage = 'Are you sure you want to leave?';

  (e || window.event).returnValue = confirmationMessage;
  return confirmationMessage;
};

document.getElementById('btn-download').addEventListener('click', onDownloadVid, false)