export default async function getCurrentTabId() {
  const tabs = await chrome.tabs.query({ currentWindow: true, active: true });
  const currentTab = tabs[0];
  const tabURL = new URL(currentTab.url).origin;

  if (currentTab.url.includes('chrome://')) {
    throw new Error('This page is not supported...')
  }
  else return { tabId: currentTab.id, tabTitle: currentTab.title, tabURL }
}