import { h, render } from "preact";
import App from "./App";

const onMessage = async (request, _, sendResponse) => {
  try {
    if (request.message === 'start-record' && request.from === 'worker') {
      let rootElement = document.getElementById('reco-record');
      if (rootElement) {
        rootElement.parentNode.removeChild(rootElement);
      }

      rootElement = document.createElement('div');
      rootElement.id = 'reco-record';
      document.body.appendChild(rootElement);
      render(<App request={request} />, rootElement);
      sendResponse(request);
    }

    if (request.message === 'stop-record' && request.from === 'worker') {
      sendResponse(request);
    }
  } catch (error) {
    const permission = await navigator.permissions.query({ name: 'microphone' });
    await chrome.runtime.sendMessage({ from: 'content', error: error.message, permission });
    sendResponse(error);
  }
};

chrome.runtime.onMessage.addListener(onMessage);