window.addEventListener('DOMContentLoaded', async () => {
  const params = new URL(window.location.href).searchParams;
  let config = {};

  for (const [key, value] of params) {
    config[key] = value === 'true' || value === 'false' ? JSON.parse(value) : value;
  }

  try {
    await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
    chrome.runtime.sendMessage({ ...config, message: 'start-record' });
    window.close();
  } catch (error) {
    const permission = await navigator.permissions.query({ name: 'camera' });

    if (permission.state === 'denied') {
      chrome.tabs.create({
        url: 'chrome://settings/content/siteDetails?site=' + encodeURIComponent(location.href)
      });

      permission.onchange = function () {
        console.log('Camera permission state has changed to ', this.state);
        if (this.state === 'granted') chrome.runtime.sendMessage({ ...config, message: 'start-record' });
      };
    }
    window.close();
  }
});
