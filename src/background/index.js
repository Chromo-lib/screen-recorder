let videoURL = null;
let videoLen = 0;
let tabTitle = null;

const onMessage = async (request, _, sendResponse) => {
  try {
    if (request.from === 'popup') {
      const response = await chrome.tabs.sendMessage(request.tabId, { ...request, from: 'worker' });
      sendResponse(response || 'Recording start...');
    }

    if (request.from === 'content' && request.videoURL) {
      sendResponse(null);
      videoURL = request.videoURL;
      videoLen = request.videoLen;
      tabTitle = request.tabTitle;
      chrome.tabs.create({ url: "editor.html", active: true });
    }

    if (request.from === 'editor') {
      sendResponse({ tabTitle, videoURL, videoLen, from: 'background' });
    }
  } catch (error) {
    console.log(error.message);
    sendResponse(null)
  }
};

chrome.runtime.onMessage.addListener(onMessage);