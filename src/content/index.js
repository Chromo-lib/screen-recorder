import { h, render } from "preact";
import App from "./App";
import Camera from "./Camera";
import './style.css'

const createElement = (id = 'reco-controls') => {
  let rootElement = document.getElementById(id);
  if (rootElement) {
    rootElement.parentNode.removeChild(rootElement);
  }

  rootElement = document.createElement('div');
  rootElement.id = id;
  document.body.appendChild(rootElement);
  return rootElement
}

const onMessage = async (request, _, sendResponse) => {
  try {
    if (request.message === 'start-record' && request.from === 'worker') {
      render(<Camera request={request} />, createElement('reco-camera'));
      render(<App request={request} />, createElement());
      sendResponse(request);
    }

    if (request.message === 'stop-record' && request.from === 'worker') {
      sendResponse(request);
    }
  } catch (error) {
    console.log(error);
    const permission = await navigator.permissions.query({ name: 'microphone' });
    await chrome.runtime.sendMessage({ from: 'content', error: error.message, permission });
    sendResponse(error);
  }
};

chrome.runtime.onMessage.addListener(onMessage);