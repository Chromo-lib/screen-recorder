import { h, render } from "preact";
import App from "./App";

const onMessage = async (request, _, sendResponse) => {
  try {
    sendResponse(request);

    if (request.message === 'start-record') {
      const div = document.createElement('div')
      document.body.appendChild(div);
      render(<App request={request} />, div);
    }

    if (request.message === 'stop-record') {

    }
  } catch (error) {
    const permission = await navigator.permissions.query({ name: 'microphone' });
    await chrome.runtime.sendMessage({ from: 'content', error: error.message, permission });
    console.log(error);
  }
};

chrome.runtime.onMessage.addListener(onMessage);