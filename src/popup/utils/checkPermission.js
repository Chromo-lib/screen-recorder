/** 
 * @param {Object} recordOptions 
 * @returns boolean
 */
export default async function checkPermission(recordOptions) {
  if (recordOptions.enableCamera) {
    const permissionCam = await navigator.permissions.query({ name: 'camera' });

    if (permissionCam.state !== 'granted') {
      chrome.windows.create({ url: '../permission/index.html?video=true&audio=true', width: 400, height: 400, type: 'popup' });
      return;
    }
  }

  if (recordOptions.enableMicrophone) {
    const permissionMic = await navigator.permissions.query({ name: 'microphone' });

    if (permissionMic.state !== 'granted') {
      chrome.windows.create({ url: '../permission/index.html?video=true&audio=true', width: 400, height: 400, type: 'popup' });
      return;
    }
  }

  return true
}