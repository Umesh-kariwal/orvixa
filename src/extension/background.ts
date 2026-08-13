// Chrome Extension Background Service Worker (Manifest V3)
// Real Autonomous Browser Agent (Bugatti Engine)
declare const chrome: any;

chrome.runtime.onInstalled.addListener(() => {
  console.log('[Orvixa Background] Autonomous Browser Agent Layer v3 active.');
});

function isInjectableUrl(url?: string): boolean {
  if (!url) return false;
  return url.startsWith('http://') || url.startsWith('https://');
}

function sendToggleMessageOrInject(tabId: number, url?: string) {
  if (!isInjectableUrl(url)) return;
  chrome.tabs.sendMessage(tabId, { type: 'ORVIXA_TOGGLE_PANEL' }, (_response: any) => {
    const err = chrome.runtime.lastError;
    if (err && err.message?.includes('Could not establish connection')) {
      chrome.scripting.executeScript(
        { target: { tabId }, files: ['contentScript.js'] },
        () => {
          if (chrome.runtime.lastError) return;
          setTimeout(() => {
            chrome.tabs.sendMessage(tabId, { type: 'ORVIXA_TOGGLE_PANEL' }, () => {
              chrome.runtime.lastError;
            });
          }, 150);
        }
      );
    }
  });
}

// ─────────────────────────────────────────────────────────────
// AUTONOMOUS DESKTOP & BROWSER AGENT HANDLER
// ─────────────────────────────────────────────────────────────
chrome.runtime.onMessage.addListener((request: any, _sender: any, sendResponse: any) => {

  if (request.type === 'ORVIXA_SYNC_STORAGE') {
    chrome.storage.local.set(request.data, () => { sendResponse({ status: 'success' }); });
    return true;
  }

  if (request.type === 'ORVIXA_OPEN_URL') {
    chrome.tabs.create({ url: request.url, active: true }, (tab: any) => {
      sendResponse({ status: 'ok', tabId: tab.id });
    });
    return true;
  }

  if (request.type === 'ORVIXA_GET_ACTIVE_TAB') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs: any[]) => {
      const tab = tabs[0];
      sendResponse({ tabId: tab?.id, url: tab?.url, title: tab?.title });
    });
    return true;
  }

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

  if (request.type === 'ORVIXA_FOCUS_TAB') {
    chrome.tabs.query({}, (tabs: any[]) => {
      const match = tabs.find((t: any) => t.url && t.url.includes(request.pattern));
      if (match) {
        chrome.tabs.update(match.id, { active: true });
        chrome.windows.update(match.windowId, { focused: true });
        sendResponse({ found: true, tabId: match.id });
      } else {
        chrome.tabs.create({ url: request.fallbackUrl || request.pattern, active: true }, (tab: any) => {
          sendResponse({ found: false, tabId: tab.id });
        });
      }
    });
    return true;
  }

  // ─────────────────────────────────────────────────────────
  // AUTONOMOUS AGENT: YouTube Search + Auto-Click 1st Video
  // ─────────────────────────────────────────────────────────
  if (request.type === 'ORVIXA_AUTONOMOUS_YOUTUBE_PLAY') {
    const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(request.query)}`;
    chrome.tabs.create({ url: searchUrl, active: true }, (tab: any) => {
      // Listen for tab completion to auto-click 1st video
      const listener = (tabId: number, changeInfo: any) => {
        if (tabId === tab.id && changeInfo.status === 'complete') {
          chrome.tabs.onUpdated.removeListener(listener);
          // Inject script to click 1st video and skip ads
          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => {
              const tryClickVideo = () => {
                const videoLink = document.querySelector('ytd-video-renderer a#video-title, a.ytd-thumbnail') as HTMLAnchorElement;
                if (videoLink) {
                  videoLink.click();
                  return true;
                }
                return false;
              };
              if (!tryClickVideo()) {
                setTimeout(tryClickVideo, 1200);
                setTimeout(tryClickVideo, 2500);
              }
            },
          });
        }
      };
      chrome.tabs.onUpdated.addListener(listener);
      sendResponse({ status: 'ok', tabId: tab.id });
    });
    return true;
  }

  // ─────────────────────────────────────────────────────────
  // AUTONOMOUS AGENT: Click DOM Element By Text
  // ─────────────────────────────────────────────────────────
  if (request.type === 'ORVIXA_AUTO_CLICK_TEXT') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs: any[]) => {
      const tab = tabs[0];
      if (!tab?.id || !isInjectableUrl(tab.url)) {
        sendResponse({ status: 'error' });
        return;
      }
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: (targetText: string) => {
          const lower = targetText.toLowerCase();
          const clickable = Array.from(document.querySelectorAll('button, a, input[type="submit"], [role="button"]'));
          const match = clickable.find(el => (el as HTMLElement).innerText?.toLowerCase().includes(lower)) as HTMLElement;
          if (match) {
            match.click();
            return { clicked: true, text: match.innerText };
          }
          return { clicked: false };
        },
        args: [request.text],
      }, (results: any[]) => {
        sendResponse(results?.[0]?.result || { clicked: false });
      });
    });
    return true;
  }

  // ─────────────────────────────────────────────────────────
  // AUTONOMOUS AGENT: Fill Input Field By Label/Placeholder
  // ─────────────────────────────────────────────────────────
  if (request.type === 'ORVIXA_AUTO_FILL_INPUT') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs: any[]) => {
      const tab = tabs[0];
      if (!tab?.id || !isInjectableUrl(tab.url)) {
        sendResponse({ status: 'error' });
        return;
      }
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: (valToFill: string) => {
          const inputs = Array.from(document.querySelectorAll('input:not([type="hidden"]), textarea, [contenteditable="true"]')) as HTMLElement[];
          if (inputs.length > 0) {
            const target = inputs[0];
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
              (target as HTMLInputElement).value = valToFill;
              target.dispatchEvent(new Event('input', { bubbles: true }));
              target.dispatchEvent(new Event('change', { bubbles: true }));
            } else {
              target.innerText = valToFill;
              target.dispatchEvent(new Event('input', { bubbles: true }));
            }
            return { filled: true };
          }
          return { filled: false };
        },
        args: [request.value],
      }, (results: any[]) => {
        sendResponse(results?.[0]?.result || { filled: false });
      });
    });
    return true;
  }

  if (request.type === 'ORVIXA_SCROLL') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs: any[]) => {
      const tab = tabs[0];
      if (!tab?.id) { sendResponse({ status: 'error' }); return; }
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: (direction: string) => {
          window.scrollBy({ top: direction === 'down' ? 500 : -500, behavior: 'smooth' });
        },
        args: [request.direction],
      }, () => sendResponse({ status: 'ok' }));
    });
    return true;
  }

  if (request.type === 'ORVIXA_SCREENSHOT') {
    chrome.tabs.captureVisibleTab({ format: 'jpeg', quality: 85 }, (dataUrl: string) => {
      sendResponse({ dataUrl });
    });
    return true;
  }
});

chrome.action.onClicked.addListener((tab: any) => {
  if (tab?.id) sendToggleMessageOrInject(tab.id, tab.url);
});

chrome.commands.onCommand.addListener((_command: string) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs: any[]) => {
    const tab = tabs[0];
    if (tab?.id) sendToggleMessageOrInject(tab.id, tab.url);
  });
});
