const onMessage = async (request, _, sendResponse) => {
  try {
    const { message, tabId, videoMediaSource } = request;

    if (message === 'start-record' && tabId) {
      const tabs = await chrome.tabs.query({ currentWindow: true, active: true });

      if (videoMediaSource !== 'webcam') {
        chrome.desktopCapture.chooseDesktopMedia([videoMediaSource || 'window', 'screen', 'tab'], tabs[0], async (id) => {
          // send message to content
          const response = await chrome.tabs.sendMessage(tabId, { ...request, chromeMediaSourceId: id });
          console.log(response);
        });
      }
      else {
        const response = await chrome.tabs.sendMessage(tabId, request);
        console.log(response);
      }
    }
    else {
      sendResponse(request);
    }

    // await chrome.runtime.sendMessage(request);

    // chrome.tabs.create({
    //   url: browserName() + '://settings/content/siteDetails?site=' + encodeURIComponent(location.href)
    // });
  } catch (error) {
    console.log(error.message);
  }
};

chrome.runtime.onMessage.addListener(onMessage);