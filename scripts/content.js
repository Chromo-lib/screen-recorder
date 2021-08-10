function receiver (request) {
  if (request.message === 'start-record') {
    chrome.runtime.sendMessage({ message: 'start-record' });
  }

  if (request.message === 'stop-record') {
    chrome.runtime.sendMessage({ message: 'stop-record' });
  }
}

chrome.runtime.onMessage.addListener(receiver);