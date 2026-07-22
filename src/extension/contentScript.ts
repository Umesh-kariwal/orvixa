// Chrome Extension Content Script
// Injects Orvixa Sidebar iframe and coordinates window postMessage dimensions, host page layout shifts, and context synchronization.
declare const chrome: any;

(() => {
  if (document.getElementById('orvixa-extension-root')) {
    return; // Prevent duplicate injection
  }

  const hostDiv = document.createElement('div');
  hostDiv.id = 'orvixa-extension-root';
  document.body.appendChild(hostDiv);

  const iframe = document.createElement('iframe');
  iframe.id = 'orvixa-copilot-iframe';
  iframe.src = chrome.runtime.getURL('index.html?mode=extension');
  
  // Style iframe to sit fixed on the right margin safely
  Object.assign(iframe.style, {
    position: 'fixed',
    top: '0',
    right: '0',
    height: '100vh',
    width: '0px', // Start hidden, let React app set dimensions
    border: 'none',
    zIndex: '999999999',
    colorScheme: 'none',
    transition: 'width 200ms cubic-bezier(0.16, 1, 0.3, 1), transform 200ms ease',
  });

  hostDiv.appendChild(iframe);

  // Gathers and forwards high-fidelity host document context to the sandboxed sidebar iframe
  const sendContextToIframe = () => {
    let leetcodeTitle = document.querySelector('div[class*="title"], [data-cy="question-title"]')?.textContent?.trim() || '';
    let githubRepo = '';
    if (window.location.hostname.includes('github.com')) {
      githubRepo = window.location.pathname.split('/').slice(1, 3).join('/');
    }
    const metaDescription = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';

    const contextPayload = {
      source: 'orvixa-content',
      action: 'context_update',
      url: window.location.href,
      title: document.title,
      selection: window.getSelection()?.toString() || '',
      bodyText: document.body.innerText,
      hostname: window.location.hostname,
      leetcodeTitle,
      githubRepo,
      metaDescription
    };
    iframe.contentWindow?.postMessage(contextPayload, '*');
  };

  // Sync context on tab load immediately
  iframe.addEventListener('load', () => {
    sendContextToIframe();
  });

  // Listen for dimension update and context request messages from React App inside the iframe
  window.addEventListener('message', (event) => {
    if (event.data && event.data.source === 'orvixa-copilot') {
      const { action, width } = event.data;
      if (action === 'resize') {
        iframe.style.width = width;

        // Bypasses click blocking by forcing width to 0 when collapsed/hidden
        if (width === '0px' || width === '180px') {
          iframe.style.pointerEvents = 'none';
        } else {
          iframe.style.pointerEvents = 'auto';
        }

        // Host page layout workspace shift (resizes webpage smoothly so content is not blocked)
        if (width !== '0px' && width !== '180px' && width !== '100vw') {
          document.body.style.transition = 'margin-right 200ms cubic-bezier(0.16, 1, 0.3, 1)';
          document.body.style.marginRight = width;
        } else {
          document.body.style.transition = 'margin-right 200ms cubic-bezier(0.16, 1, 0.3, 1)';
          document.body.style.marginRight = '0px';
        }
      } else if (action === 'request_context') {
        sendContextToIframe();
      }
    }
  });

  // Listen for text selection changes on the host webpage
  let selectionDebounce: any = null;
  document.addEventListener('selectionchange', () => {
    clearTimeout(selectionDebounce);
    selectionDebounce = setTimeout(() => {
      sendContextToIframe();
    }, 300);
  });

  // Forward keyboard and action menu toggle triggers from Background service worker
  chrome.runtime.onMessage.addListener((message: any) => {
    if (message.type === 'ORVIXA_TOGGLE_PANEL') {
      sendContextToIframe();
      iframe.contentWindow?.postMessage({ source: 'orvixa-content', action: 'toggle' }, '*');
    }
  });

  // Double-redundancy: Listen for shortcut key directly on the host document page
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      sendContextToIframe();
      iframe.contentWindow?.postMessage({ source: 'orvixa-content', action: 'toggle' }, '*');
    }
  });

  console.log('[Orvixa Extension] Sidebar iframe successfully injected with context sync.');
})();
