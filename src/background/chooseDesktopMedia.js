export default async function chooseDesktopMedia(videoMediaSource) {
  const tabs = await chrome.tabs.query({ currentWindow: true, active: true });

  return new Promise((resolve, reject) => {
    chrome.desktopCapture.chooseDesktopMedia([videoMediaSource || 'window', 'screen', 'tab'], tabs[0], async (chromeMediaSourceId) => {
      resolve(chromeMediaSourceId)
    });
  });
}