/** 
 * @param {Object} recordOptions 
 * @returns boolean
 */
export default async function checkPermission(recordOptions) {

  const isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
  const showPermissionWin = () => chrome.windows.create({ url: 'permission.html?video=true&audio=true', width: 400, height: 400, type: 'popup' });

  if (isFirefox) { showPermissionWin(); return; }

  if (recordOptions.enableCamera) {
    const permissionCam = await navigator.permissions.query({ name: 'camera' });

    if (permissionCam.state !== 'granted') {
      showPermissionWin();
      return;
    }
  }

  if (recordOptions.enableMicrophone) {
    const permissionMic = await navigator.permissions.query({ name: 'microphone' });

    if (permissionMic.state !== 'granted') {
      showPermissionWin();
      return;
    }
  }

  return true
}