'use strict';

const args = new URLSearchParams(location.search);

window.addEventListener('DOMContentLoaded', () => navigator.mediaDevices.getUserMedia({
  audio: true
}).then(() => chrome.runtime.sendMessage({
  method: 'record',
  video: args.get('video'),
  audio: args.get('audio')
}, () => window.close())).catch(() => chrome.runtime.sendMessage({
  method: 'notify',
  message: 'Recording is aborted due to lack of microphone access. Either use different audio source or allow the microphone access'
}, () => chrome.tabs.create({
  url: 'chrome://settings/content/siteDetails?site=' + encodeURIComponent(location.href)
}, () => window.close()))));

