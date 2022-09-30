import checkDevicesPermission from "./checkDevicesPermission";

const onMessage = async (request, _, sendResponse) => {
  try {
    const { from, message, tabId, videoMediaSource } = request;

    if (from === 'popup' && message === 'start-record' && tabId) {
      const tabs = await chrome.tabs.query({ currentWindow: true, active: true });

      request = await checkDevicesPermission(request);

      if (videoMediaSource !== 'webcam') {
        chrome.desktopCapture.chooseDesktopMedia([videoMediaSource || 'window', 'screen', 'tab'], tabs[0], async (chromeMediaSourceId) => {
          if (chromeMediaSourceId) {
            const response = await chrome.tabs.sendMessage(tabId, { ...request, from: 'worker', chromeMediaSourceId });
            console.log(response);
            sendResponse('Recording start...');
          }
        });
      }
      else {
        const response = await chrome.tabs.sendMessage(tabId, { ...request, from: 'worker' });
        console.log(response);
        sendResponse('Recording start...');
      }
    }
    else {
      sendResponse(request);
    }

    // await chrome.runtime.sendMessage(request);    
  } catch (error) {
    console.log(error.message);
  }
};

chrome.runtime.onMessage.addListener(onMessage);

// window.addEventListener('DOMContentLoaded', async () => {
//   try {
//     const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
//     stream.getTracks().forEach(track => track.stop());
//     window.close();
//   } catch (error) {
//     const permission = await navigator.permissions.query({ name: 'microphone' });

//     if (permission.state === 'denied') {
//       chrome.tabs.create({
//         url: browserName() + '://settings/content/siteDetails?site=' + encodeURIComponent(location.href)
//       });

//       permission.onchange = function () {
//         console.log('Camera permission state has changed to ', this.state);
//         if (this.state !== 'granted') chrome.runtime.sendMessage({ message: 'permission-fail' });
//       };
//     }
//     window.close();
//   }
// });