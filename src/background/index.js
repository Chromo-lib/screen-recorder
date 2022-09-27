// let editorTabId = null;

const onMessage = async (request, _, sendResponse) => {
  try {
    const { message, tabId, videoMediaSource } = request;


    if (message === 'start-record' && tabId) {
      const tabs = await chrome.tabs.query({ currentWindow: true, active: true });

      let id = chrome.runtime.id;
      chrome.contentSettings['microphone'].set({ primaryPattern: `*://${id}/*`, setting: 'allow' });
      chrome.contentSettings['camera'].set({ primaryPattern: `*://${id}/*`, setting: 'allow' });

      if (videoMediaSource !== 'webcam') {
        chrome.desktopCapture.chooseDesktopMedia([videoMediaSource || 'window', 'screen', 'tab'], tabs[0], async (chromeMediaSourceId) => {
          if (chromeMediaSourceId) {
            const response = await chrome.tabs.sendMessage(tabId, { ...request, from: 'worker', chromeMediaSourceId });
            console.log(response);
          }
        });
      }
      else {
        const response = await chrome.tabs.sendMessage(tabId, { ...request, from: 'worker' });
        console.log(response);
      }
    }
    // if (message === "record-over") {
    //   console.log(request);
    //   const tab = chrome.tabs.create({ url: '../editor/index.html' });
    //   const response = await chrome.tabs.sendMessage(tab.id, { ...request, from: 'worker' });
    //   editorTabId = tab.id;
    //   sendResponse(request)
    // }
    // if (message === "get-chunks") {
    //   const response = await chrome.tabs.sendMessage(tab.id, { ...request, from: 'worker' });
    //   sendResponse(request)
    // }
    else {
      sendResponse(request);
    }

    // await chrome.runtime.sendMessage(request);    
  } catch (error) {
    console.log(error.message);
  }
};

chrome.runtime.onMessage.addListener(onMessage);