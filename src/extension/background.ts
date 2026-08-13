// Chrome Extension Background Service Worker (Manifest V3)
// Handles: tab management, voice commands, desktop automation
declare const chrome: any;

chrome.runtime.onInstalled.addListener(() => {
  console.log('[Orvixa Background] Intelligence Layer v2 installed.');
});

function isInjectableUrl(url?: string): boolean {
  if (!url) return false;
  return url.startsWith('http://') || url.startsWith('https://');
}

function sendToggleMessageOrInject(tabId: number, url?: string) {
  if (!isInjectableUrl(url)) {
    console.warn('[Orvixa Background] Cannot inject on system page:', url);
    return;
  }
  chrome.tabs.sendMessage(tabId, { type: 'ORVIXA_TOGGLE_PANEL' }, (_response: any) => {
    const err = chrome.runtime.lastError;
    if (err && err.message?.includes('Could not establish connection')) {
      chrome.scripting.executeScript(
        { target: { tabId }, files: ['contentScript.js'] },
        () => {
          if (chrome.runtime.lastError) return;
          setTimeout(() => {
            chrome.tabs.sendMessage(tabId, { type: 'ORVIXA_TOGGLE_PANEL' }, () => {
              chrome.runtime.lastError; // consume error
            });
          }, 150);
        }
      );
    }
  });
}

// ─────────────────────────────────────────────────────────────
// DESKTOP AUTOMATION HANDLER
// Called from VoiceOverlay via chrome.runtime.sendMessage
// ─────────────────────────────────────────────────────────────
chrome.runtime.onMessage.addListener((request: any, _sender: any, sendResponse: any) => {

  // ── Storage sync ──────────────────────────────────────────
  if (request.type === 'ORVIXA_SYNC_STORAGE') {
    chrome.storage.local.set(request.data, () => { sendResponse({ status: 'success' }); });
    return true;
  }

  // ── Open URL in new tab ───────────────────────────────────
  if (request.type === 'ORVIXA_OPEN_URL') {
    chrome.tabs.create({ url: request.url, active: true }, (tab: any) => {
      sendResponse({ status: 'ok', tabId: tab.id });
    });
    return true;
  }

  // ── Get current tab info ──────────────────────────────────
  if (request.type === 'ORVIXA_GET_ACTIVE_TAB') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs: any[]) => {
      const tab = tabs[0];
      sendResponse({ tabId: tab?.id, url: tab?.url, title: tab?.title });
    });
    return true;
  }

  // ── Get page content from active tab ─────────────────────
  if (request.type === 'ORVIXA_GET_PAGE_CONTENT') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs: any[]) => {
      const tab = tabs[0];
      if (!tab?.id || !isInjectableUrl(tab.url)) {
        sendResponse({ content: '', url: tab?.url || '' });
        return;
      }
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => ({
          text: document.body?.innerText?.slice(0, 8000) || '',
          title: document.title,
          url: window.location.href,
        }),
      }, (results: any[]) => {
        const r = results?.[0]?.result;
        sendResponse({ content: r?.text || '', title: r?.title || '', url: r?.url || '' });
      });
    });
    return true;
  }

  // ── Find and focus a tab by URL pattern ──────────────────
  if (request.type === 'ORVIXA_FOCUS_TAB') {
    chrome.tabs.query({}, (tabs: any[]) => {
      const match = tabs.find((t: any) => t.url && t.url.includes(request.pattern));
      if (match) {
        chrome.tabs.update(match.id, { active: true });
        chrome.windows.update(match.windowId, { focused: true });
        sendResponse({ found: true, tabId: match.id });
      } else {
        // Open fresh if not found
        chrome.tabs.create({ url: request.fallbackUrl || request.pattern, active: true }, (tab: any) => {
          sendResponse({ found: false, tabId: tab.id });
        });
      }
    });
    return true;
  }

  // ── Execute JS in active tab (advanced actions) ───────────
  if (request.type === 'ORVIXA_EXEC_IN_TAB') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs: any[]) => {
      const tab = tabs[0];
      if (!tab?.id || !isInjectableUrl(tab.url)) {
        sendResponse({ status: 'error', reason: 'not injectable' });
        return;
      }
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: new Function('args', request.code) as any,
        args: [request.args || {}],
      }, (results: any[]) => {
        sendResponse({ status: 'ok', result: results?.[0]?.result });
      });
    });
    return true;
  }

  // ── Scroll active tab ─────────────────────────────────────
  if (request.type === 'ORVIXA_SCROLL') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs: any[]) => {
      const tab = tabs[0];
      if (!tab?.id) { sendResponse({ status: 'error' }); return; }
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: (direction: string) => {
          window.scrollBy({ top: direction === 'down' ? 400 : -400, behavior: 'smooth' });
        },
        args: [request.direction],
      }, () => sendResponse({ status: 'ok' }));
    });
    return true;
  }

  // ── Take screenshot ───────────────────────────────────────
  if (request.type === 'ORVIXA_SCREENSHOT') {
    chrome.tabs.captureVisibleTab({ format: 'jpeg', quality: 85 }, (dataUrl: string) => {
      sendResponse({ dataUrl });
    });
    return true;
  }
});

// Extension icon click
chrome.action.onClicked.addListener((tab: any) => {
  if (tab?.id) sendToggleMessageOrInject(tab.id, tab.url);
});

// Keyboard shortcut
chrome.commands.onCommand.addListener((_command: string) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs: any[]) => {
    const tab = tabs[0];
    if (tab?.id) sendToggleMessageOrInject(tab.id, tab.url);
  });
});
