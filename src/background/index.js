let id = chrome.runtime.id;
chrome.contentSettings['microphone'].set({ primaryPattern: `*://${id}/*`, setting: 'allow' });
chrome.contentSettings['camera'].set({ primaryPattern: `*://${id}/*`, setting: 'allow' });

const onMessage = async (request, _, sendResponse) => {
   try {
      const { message, tabId, videoMediaSource } = request;

      let editorTabId = null;

      if (message === 'start-record' && tabId) {
         const tabs = await chrome.tabs.query({ currentWindow: true, active: true });

         if (videoMediaSource !== 'webcam') {
            chrome.desktopCapture.chooseDesktopMedia([videoMediaSource || 'window', 'screen', 'tab'], tabs[0], async (id) => {
               // send message to content
               const response = await chrome.tabs.sendMessage(tabId, { ...request, chromeMediaSourceId: id });
               console.log(response);
            });
         }
         else {
            const response = await chrome.tabs.sendMessage(tabId, request);
            console.log(response);
         }
      }
      if (message === "record-over") {
         console.log(request);
         const tab = chrome.tabs.create({ url: '../editor/index.html' });
         const response = await chrome.tabs.sendMessage(tab.id, request);
         editorTabId = tab.id;
         sendResponse(request)
      }
      if (message === "get-chunks") {
         const response = await chrome.tabs.sendMessage(tab.id, request);
         sendResponse(request)
      }
      else {
         sendResponse(request);
      }

      // await chrome.runtime.sendMessage(request);    
   } catch (error) {
      console.log(error.message);
   }
};

chrome.runtime.onMessage.addListener(onMessage);