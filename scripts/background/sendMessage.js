function sendMessage(request) {
  try {
    if (request.tabId && request.to !== 'popup') {
      chrome.tabs.sendMessage(+request.tabId, request);
    }
    else {
      chrome.runtime.sendMessage(request);
    }
  } catch (error) {
    console.log('sendMessage ', error);
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, request);
    });
  }
}