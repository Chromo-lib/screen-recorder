import checkDevicesPermission from "./checkDevicesPermission";

const onMessage = async (request, _, sendResponse) => {
  try {
    request = await checkDevicesPermission(request);

    const response = await chrome.tabs.sendMessage(request.tabId, { ...request, from: 'worker' });    
    sendResponse(response || 'Recording start...');

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
