function browserName() {
  let browserName = 'No browser detection';
  if (/Chrome/gi.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor)) browserName = "chrome";
  if (/Edg/gi.test(navigator.userAgent)) browserName = "edge";
  return browserName;
}

window.addEventListener('DOMContentLoaded', async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
    stream.getTracks().forEach(track => track.stop());
    window.close();
  } catch (error) {
    const permission = await navigator.permissions.query({ name: 'microphone' });

    if (permission.state === 'denied') {
      chrome.tabs.create({
        url: browserName() + '://settings/content/siteDetails?site=' + encodeURIComponent(location.href)
      });

      permission.onchange = function () {
        console.log('Camera permission state has changed to ', this.state);
        if (this.state !== 'granted') chrome.runtime.sendMessage({ from: 'permission', message: 'permission-fail' });
      };
    }
    window.close();
  }
});