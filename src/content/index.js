import { h, render } from "preact";
import App from "./App";

const onMessage = async (request, _, sendResponse) => {
  try {    
    if (request.message === 'start-record' && request.from === 'worker') {
      const div = document.createElement('div')
      document.body.appendChild(div);
      render(<App request={request} />, div);
      sendResponse(request);
    }

    if (request.message === 'stop-record' && request.from === 'worker') {
      sendResponse(request);
    }
  } catch (error) {
    const permission = await navigator.permissions.query({ name: 'microphone' });
    await chrome.runtime.sendMessage({ from: 'content', error: error.message, permission });
    console.log(error);
  }
};

chrome.runtime.onMessage.addListener(onMessage);