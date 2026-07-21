// Chrome Extension Background Service Worker (Manifest V3)
declare const chrome: any;

chrome.runtime.onInstalled.addListener(() => {
  console.log('[Orvixa Background] Intelligence Layer extension installed.');
});

// Listener for Extension Action Click
chrome.action.onClicked.addListener((tab: any) => {
  if (tab?.id) {
    chrome.tabs.sendMessage(tab.id, { type: 'ORVIXA_TOGGLE_PANEL' });
  }
});

// Listener for Content Script Messages
chrome.runtime.onMessage.addListener((request: any, _sender: any, sendResponse: any) => {
  if (request.type === 'ORVIXA_SYNC_STORAGE') {
    chrome.storage.local.set(request.data, () => {
      sendResponse({ status: 'success' });
    });
    return true;
  }
});
