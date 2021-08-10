let vid = document.getElementById('vid')

const blobUrl = window.location.search.split('=')[1]

vid.src = blobUrl

const onDownloadVid = () => {
  let filename = window.prompt('Please enter video file name: ')

  let link = document.createElement('a');
  link.href = blobUrl;
  link.download = `${filename}.mp4`;

  document.body.appendChild(link);
  link.click();

  setTimeout(function() {
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  }, 100);
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