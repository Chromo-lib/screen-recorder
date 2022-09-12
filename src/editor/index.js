chrome.runtime.sendMessage({ actionType: 'get-chunks' }, (response) => {
  // const { imageBase64, tabTitle } = response;
  console.log(response);

  if (response.chunks) {
    const video = document.getElementById('video');
    const url = window.URL.createObjectURL(response.chunks);
    video.src = url;
  }
});