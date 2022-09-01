function setAudioInputs() {
  const audioinputEL = document.getElementById('microphoneID');
  const videoinputEL = document.getElementById('cameraID');

  navigator.mediaDevices.enumerateDevices()
    .then(enumerator => {
      enumerator.forEach(input => {

        if (input.kind === "audioinput") {
          const option = document.createElement('option')
          option.textContent = input.label && input.label.length > 1 ? input.label : 'default';
          option.value = input.label && input.deviceId.length > 1 ? input.deviceId : 'default';
          audioinputEL.appendChild(option)
        }

        if (input.kind === "videoinput") {
          const option = document.createElement('option')
          option.textContent = input.label && input.label.length > 1 ? input.label : 'default';
          option.value = input.label && input.deviceId.length > 1 ? input.deviceId : 'default';
          videoinputEL.appendChild(option)
        }
      });
    });
}

function setMimeTypes() {
  const selectMimeTypeEL = document.getElementById('mimeType')
  const mimeTypes = [
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8',
    'video/webm;codecs=h264',
    'video/webm;codecs=avc1',
    'video/webm;codecs=daala',
    'video/mp4;codecs=h264,aac',
    'video/mpeg',
    'audio/webm',
    'audio/wav'
  ];

  mimeTypes.filter(mimeType => {
    if (MediaRecorder.isTypeSupported(mimeType)) {
      const option = document.createElement('option');
      option.textContent = mimeType;
      option.value = mimeType;
      selectMimeTypeEL.appendChild(option);
    }
  })
}

setMimeTypes();
setAudioInputs();