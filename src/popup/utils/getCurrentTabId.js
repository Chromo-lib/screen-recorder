const tabsQuery = (options) => new Promise((resolve) => chrome.tabs.query(options, resolve));

export default async function getCurrentTabId() {
  const tabs = await tabsQuery({ currentWindow: true, active: true });
  const currentTab = tabs[0];
  const tabURL = new URL(currentTab.url).origin;

  if (currentTab.url.includes('browser://')) throw new Error('This page is not supported...');
  else return { tabId: currentTab.id, tabTitle: currentTab.title, tabURL }
}