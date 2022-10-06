export default async function checkDevicesPermission(request) {
  const { enableCamera, enableMicrophone,tabURL } = request;

  const openSiteSettings = () => {
    let browserName = null;
    if (/Chrome/gi.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor)) browserName = "chrome";
    if (/Edg/gi.test(navigator.userAgent)) browserName = "edge";
    chrome.tabs.create({ url: browserName + '://settings/content/siteDetails?site=' + encodeURIComponent(tabURL) });    
    return;
  }

  if (enableCamera) {
    const permission = await navigator.permissions.query({ name: 'camera' });
    request.enableCamera = enableCamera && permission.state === 'granted';
    if (permission.state === 'denied') openSiteSettings()    
  }

  if (enableMicrophone) {
    const permission = await navigator.permissions.query({ name: 'microphone' });
    request.enableMicrophone = enableMicrophone && permission.state === 'granted';
    if (permission.state === 'denied') openSiteSettings()    
  }

  return request
}