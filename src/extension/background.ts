// Chrome Extension Background Service Worker (Manifest V3)
declare const chrome: any;

chrome.runtime.onInstalled.addListener(() => {
  console.log('[Orvixa Background] Intelligence Layer extension installed.');
});

// Helper to check if a URL can have content scripts injected
function isInjectableUrl(url?: string): boolean {
  if (!url) return false;
  return url.startsWith('http://') || url.startsWith('https://');
}

// Helper to inject content script dynamically and toggle the panel
function sendToggleMessageOrInject(tabId: number, url?: string) {
  if (!isInjectableUrl(url)) {
    console.warn('[Orvixa Background] Cannot inject side panel on system page:', url);
    return;
  }

  chrome.tabs.sendMessage(tabId, { type: 'ORVIXA_TOGGLE_PANEL' }, (response: any) => {
    const err = chrome.runtime.lastError;
    if (err && err.message.includes('Could not establish connection')) {
      console.log('[Orvixa Background] Content script not active in tab. Injecting dynamically...');
      
      // Inject the compiled content script asset into the target tab
      chrome.scripting.executeScript(
        {
          target: { tabId },
          files: ['contentScript.js'],
        },
        () => {
          const injectErr = chrome.runtime.lastError;
          if (injectErr) {
            console.error('[Orvixa Background] Dynamic injection failed:', injectErr.message);
            return;
          }
          
          console.log('[Orvixa Background] Content script injected successfully. Retrying toggle message...');
          // Small delay to ensure the content script listener has registered
          setTimeout(() => {
            chrome.tabs.sendMessage(tabId, { type: 'ORVIXA_TOGGLE_PANEL' }, () => {
              const retryErr = chrome.runtime.lastError;
              if (retryErr) {
                console.error('[Orvixa Background] Retry toggle message failed:', retryErr.message);
              }
            });
          }, 150);
        }
      );
    } else if (err) {
      console.error('[Orvixa Background] Unexpected message error:', err.message);
    } else {
      console.log('[Orvixa Background] Toggle command delivered successfully. Response:', response);
    }
  });
}

// Listener for Extension Action Click
chrome.action.onClicked.addListener((tab: any) => {
  if (tab?.id) {
    sendToggleMessageOrInject(tab.id, tab.url);
  }
});

// Listener for Command Key triggers
chrome.commands.onCommand.addListener((command: string) => {
  console.log('[Orvixa Background] Command shortcut triggered:', command);
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs: any[]) => {
    const activeTab = tabs[0];
    if (activeTab?.id) {
      sendToggleMessageOrInject(activeTab.id, activeTab.url);
    }
  });
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
