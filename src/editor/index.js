chrome.runtime.sendMessage({ actionType: 'get-chunks' }, (response) => {
  // const { imageBase64, tabTitle } = response;
 console.log(response);
});