let stream;
let videoEL;

async function receiver(request) {
  chrome.runtime.sendMessage(request);

  if (request.message === 'start-record' && request.enableCamera) {
    stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    const videoEL = document.createElement('video');
    videoEL.autoplay = true;
    videoEL.srcObject = stream;
    videoEL.id = 'reco-recording';
    document.body.appendChild(videoEL);

    videoEL.style.cssText = "width:160px; height:160px; position: fixed; bottom: 20px; right: 20px; border-radius: 50%; z-index: 99999;";
  }

  if (request.message === 'stop-record') {
    try {
      stream.getTracks().forEach((track) => { track.stop(); });
      if (videoEL) {
        videoEL.srcObject = null;
        document.body.removeChild(videoEL);
      }
      const el = document.getElementById('reco-recording');
      el.parentNode.removeChild(el);
    } catch (error) {
      stream.getTracks().forEach((track) => { track.stop(); });
    }
  }
}

chrome.runtime.onMessage.addListener(receiver);