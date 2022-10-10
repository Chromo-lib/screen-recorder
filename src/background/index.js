const onMessage = async (request, _, sendResponse) => {
  try {
    const response = await chrome.tabs.sendMessage(request.tabId, { ...request, from: 'worker' });
    sendResponse(response || 'Recording start...');
  } catch (error) {
    console.log(error.message);
    sendResponse(null)
  }
};

chrome.runtime.onMessage.addListener(onMessage);