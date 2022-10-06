export default function setAudioInputs() {
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
