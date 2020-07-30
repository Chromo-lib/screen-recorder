function downloadVid (blobUrl) {
  let a = document.createElement("a");
  document.body.appendChild(a);
  a.style = "display: none";
  a.href = blobUrl;
  a.download = "reco.mp4";
  a.click();
}

function createVidElement (blobUrl) {
  removeDomElement('vid-recorded');

  let vidTwo = document.createElement('video');

  vidTwo.src = blobUrl;
  vidTwo.controls = true;
  vidTwo.id = 'vid-recorded';

  document.getElementById('vid-rec').appendChild(vidTwo);
}

function removeDomElement (id) {
  let elem = document.getElementById(id);
  return elem ? elem.parentNode.removeChild(elem) : null;
}
