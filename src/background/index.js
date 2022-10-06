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
    sendResponse(null)
  }
};

chrome.runtime.onMessage.addListener(onMessage);

// const permissionsToRequest = {
//   permissions: ["camera", "microphone"],
//   origins: [tabURL]
// }


//   function onResponse(response) {
//     if (response) {
//       console.log("Permission was granted");
//     } else {
//       console.log("Permission was refused");
//     }
//     return chrome.permissions.getAll();
//   }

//   chrome.permissions.request(permissionsToRequest)
//     .then(onResponse)
//     .then((currentPermissions) => {
//     console.log(`Current permissions:`, currentPermissions);
//   });
