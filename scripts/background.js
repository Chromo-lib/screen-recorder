'use strict';

const notify = e => chrome.notifications.create({
  type: 'basic',
  iconUrl: '../icons/icon64.png',
  title: chrome.runtime.getManifest().name,
  message: e.message || e
});

function getSupportedMimeTypes () {
  const mimeTypes = [
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm;codecs=h264,opus',
    'video/mp4;codecs=h264,aac',
  ];
  return mimeTypes.filter(mimeType => MediaRecorder.isTypeSupported(mimeType))[0]
}

function openDownloadTab (recordedChunks) {
  const blob = new Blob(recordedChunks, { type: getSupportedMimeTypes() });
  let blobUrl = window.URL.createObjectURL(blob);
  chrome.tabs.create({ url: 'download.html?blob=' + blobUrl });
}

let mediaRecorder = null;
let tracks = [];
let chunks = [];

const onMessage = async (request) => {
  if (request.message === 'start-record') {
    try {
      
      chunks = [];

      if (request.audio === 'mic' || request.audio === 'mixed') {
        const state = (await navigator.permissions.query({ name: 'microphone' })).state;
        if (state !== 'granted') {
          return chrome.windows.create({
            url: chrome.extension.getURL('../permission/index.html?' + `video=${request.video}&audio=${request.audio}`),
            width: 350,
            height: 350,
            type: 'popup'
          });
        }
      }

      const type = [request.video];
      if (request.audio === 'system' || request.audio === 'mixed') {
        type.push('audio');
      }

      const requestId = chrome.desktopCapture.chooseDesktopMedia(type, async streamKey => {
        try {
          tracks = [];
          const constraints = {
            video: {
              mandatory: {
                chromeMediaSource: 'desktop',
                chromeMediaSourceId: streamKey
              }
            }
          };

          if (request.audio === 'system' || request.audio === 'mixed') {
            constraints.audio = {
              mandatory: {
                chromeMediaSource: 'desktop',
                chromeMediaSourceId: streamKey
              }
            };
          }

          constraints.video.mandatory.maxWidth = screen.width * 2;
          constraints.video.mandatory.maxHeight = screen.height * 2;

          let stream = await navigator.mediaDevices.getUserMedia(constraints);

          const audioStream = await navigator.mediaDevices.getUserMedia({
            audio: {
              noiseSuppression: true,
              echoCancellation: true,
              deviceId: request.audioDeviceID
            }
          });

          if (stream.getAudioTracks().length === 0) {
            for (const track of audioStream.getAudioTracks()) {
              stream.addTrack(track);
            }
          }
          else {
            try {
              const context = new AudioContext();
              const destination = context.createMediaStreamDestination();
              context.createMediaStreamSource(audioStream).connect(destination);
              context.createMediaStreamSource(stream).connect(destination);
              const ns = new MediaStream();
              stream.getVideoTracks().forEach(track => ns.addTrack(track));
              destination.stream.getAudioTracks().forEach(track => ns.addTrack(track));
              tracks.push(...stream.getTracks());
              stream = ns;
            }
            catch (e) {
              console.log(e);
              if(request.notification) notify(e);
            }
          }

          tracks.push(...stream.getTracks());
          mediaRecorder = new MediaRecorder(stream, { mimeType: getSupportedMimeTypes() });

          mediaRecorder.onerror = e => {
            mediaRecorder.stop()
            if (request.notification) notify(e.message)
          }

          mediaRecorder.ondataavailable = e => {
            if (e.data.size) {
              chunks.push(e.data);
            }
          }

          mediaRecorder.onstop = e => {
            console.log('stop', mediaRecorder.state);            
            openDownloadTab(chunks)
          }

          console.log(request.audio);

          stream.getVideoTracks()[0].onended = function () {
            //audioStream.getAudioTracks()[0].enabled = true;
            chrome.desktopCapture.cancelChooseDesktopMedia(requestId)

            setTimeout(() => {
              tracks.forEach(track => track.stop());
              mediaRecorder.stop();              
            }, 100);
          };

          mediaRecorder.start(100);
        }
        catch (e) {
          console.log(e);
          if (request.notification) notify(e.message || 'Capturing Failed with an unknown error');
        }
      });
    }
    catch (e) {
      if (request.notification) notify(e.message || 'Capturing Failed with an unknown error');
    }
  }

  if (request.message === 'stop-record' && tracks && mediaRecorder) {
    if (mediaRecorder.state !== 'inactive') {
      tracks.forEach(track => track.stop());
      mediaRecorder.stop()
    }
    openDownloadTab(chunks)
  }
};

chrome.runtime.onMessage.addListener(onMessage);
