function receiver (request) {
  chrome.runtime.sendMessage(request);
}

chrome.runtime.onMessage.addListener(receiver);