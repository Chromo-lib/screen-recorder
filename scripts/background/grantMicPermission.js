async function grantMicPermission(request) {
  const { authorize } = request;
  const permission = await navigator.permissions.query({ name: 'microphone' });

  if (permission.state !== 'granted') {
    let params = '';
    let len = Object.keys(request).length - 1;

    for (const [key, value] of Object.entries(request)) {
      if (key) params += `${key}=${value}${len > 1 ? '&' : ''}`;
      len--;
    }

    params += '&audio=' + authorize.audio + '&video=' + authorize.video;

    chrome.windows.create({
      url: chrome.extension.getURL('../../permission/index.html?' + params), width: 400, height: 400, type: 'popup'
    });
  }

  return permission.state === 'granted'
}