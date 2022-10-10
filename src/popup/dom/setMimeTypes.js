export default function setMimeTypes() {
  const selectMimeTypeEL = document.getElementById('mimeType')
  const mimeTypes = [
    'video/webm',
    'video/webm;codecs=vp8',
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8.0',
    'video/webm;codecs=vp9.0',
    'video/webm;codecs=h264',
    'video/webm;codecs=H264',
    'video/webm;codecs=avc1',
    'video/webm;codecs=vp8,opus',
    'video/WEBM;codecs=VP8,OPUS',
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,vp9,opus',
    'video/webm;codecs=h264,opus',
    'video/webm;codecs=h264,vp9,opus',
    'video/x-matroska;codecs=avc1',
    // 'audio/webm',
    // 'audio/wav'
  ];

  mimeTypes.filter(mimeType => {
    if (MediaRecorder.isTypeSupported(mimeType)) {
      const option = document.createElement('option');
      option.textContent = mimeType;
      option.value = mimeType;
      if ('video/webm') option.selected = true;
      selectMimeTypeEL.appendChild(option);
    }
  })
}
