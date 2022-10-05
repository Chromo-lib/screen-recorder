const resolutions = [
  { width: 320, height: 240 },
  { width: 640, height: 480 },
  { width: 1280, height: 720 },
  { width: 1920, height: 1080 },
  { width: 3840, height: 2160 },
  { width: 4096, height: 2160 }
];

/**
 * @returns Promose<Object>
 */
async function checkDevices() {
  const status = { isMicrophoneConnected: false, isCameraConnected: false };
  const enumerator = await navigator.mediaDevices.enumerateDevices();

  enumerator.forEach(input => {
    if (input.kind === "audioinput") {
      status.isMicrophoneConnected = input.deviceId !== null && input.label !== null
    }

    if (input.kind === "videoinput") {
      status.isCameraConnected = input.deviceId !== null && input.label !== null
    }
  });

  return status;
}

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
    // 'audio/webm',
    // 'audio/wav'
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

function setResolutions() {
  const resolution = document.getElementById('resolution');

  resolutions.forEach((rs, index) => {
    const option = document.createElement('option');
    option.value = index;
    option.textContent = rs.width + 'x' + rs.height;
    if (rs.height === 720) option.selected = true;
    resolution.appendChild(option);
  });
}

setResolutions();
setMimeTypes();
setAudioInputs();