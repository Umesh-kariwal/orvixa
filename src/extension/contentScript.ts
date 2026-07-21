// Chrome Extension Content Script
// Injects Orvixa Sidebar iframe and coordinates window postMessage dimensions.
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

  // Listen for dimension update message from React App inside the iframe
  window.addEventListener('message', (event) => {
    if (event.data && event.data.source === 'orvixa-copilot') {
      const { action, width } = event.data;
      if (action === 'resize') {
        iframe.style.width = width;
      }
    }
  });

  // Forward keyboard and action menu toggle triggers from Background service worker
  chrome.runtime.onMessage.addListener((message: any) => {
    if (message.type === 'ORVIXA_TOGGLE_PANEL') {
      iframe.contentWindow?.postMessage({ source: 'orvixa-content', action: 'toggle' }, '*');
    }
  });

  // Double-redundancy: Listen for shortcut key directly on the host document page
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      iframe.contentWindow?.postMessage({ source: 'orvixa-content', action: 'toggle' }, '*');
    }
  });

  console.log('[Orvixa Extension] Sidebar iframe successfully injected.');
})();
