function receiver (request, sender, response) {
  if (request.message === 'start-record') {    
    chrome.runtime.sendMessage({ message: 'start-recording' });
  }
}

chrome.runtime.onMessage.addListener(receiver);