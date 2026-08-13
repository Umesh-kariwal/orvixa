// Chrome Extension Content Script
// Authoritative single DOM context extraction entry point.
// Collects all document, window, headings, selection, and metadata signals into a unified CurrentContext object.
declare const chrome: any;

(() => {
  if (document.getElementById('orvixa-extension-root')) {
    return; // Prevent duplicate injection
  }

  const hostDiv = document.createElement('div');
  hostDiv.id = 'orvixa-extension-root';
  document.documentElement.appendChild(hostDiv);

  const iframe = document.createElement('iframe');
  iframe.id = 'orvixa-copilot-iframe';
  iframe.src = chrome.runtime.getURL('index.html?mode=extension');
  iframe.setAttribute('scrolling', 'no');
  iframe.setAttribute('allow', 'microphone');
  
  // Style iframe to sit fixed on the right margin safely
  Object.assign(iframe.style, {
    position: 'fixed',
    top: '0',
    right: '0',
    height: '100vh',
    width: '0px', // Start hidden, let React app set dimensions
    border: 'none',
    overflow: 'hidden',
    zIndex: '999999999',
    colorScheme: 'none',
    transition: 'width 200ms cubic-bezier(0.16, 1, 0.3, 1), transform 200ms ease',
  });

  hostDiv.appendChild(iframe);

  let lastContextSignature = '';
  // Authoritative Context Extraction routine
  const sendContextToIframe = (force = false) => {
    const url = window.location.href;
    const origin = window.location.origin;
    const hostname = window.location.hostname;
    const pageTitle = document.title || '';
    const language = document.documentElement.lang || 'en';
    const selectedText = window.getSelection()?.toString() || '';
    const visibleText = document.body ? document.body.innerText : '';
    
    const signature = `${url}|${pageTitle}|${selectedText}|${visibleText.length}|${visibleText.slice(0, 300)}`;
    if (!force && signature === lastContextSignature) {
      return;
    }
    lastContextSignature = signature;
    
    const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4'))
      .map((el) => el.textContent?.trim() || '')
      .filter((txt) => txt.length > 0);

    // Platform-specific elements
    const leetcodeTitle = document.querySelector('div[class*="title"], [data-cy="question-title"]')?.textContent?.trim() || '';
    let githubRepo = '';
    if (hostname.includes('github.com')) {
      githubRepo = window.location.pathname.split('/').slice(1, 3).join('/');
    }
    const metaDescription = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
    const ogTitle = document.querySelector('meta[property="og:title"]')?.getAttribute('content') || '';
    const ogDescription = document.querySelector('meta[property="og:description"]')?.getAttribute('content') || '';

    // Determine platform ID matching Resolve heuristics
    let platform = 'generic';
    if (hostname.includes('github.com')) {
      platform = 'github';
    } else if (hostname.includes('leetcode.com')) {
      platform = 'leetcode';
    } else if (hostname.includes('notion.so') || hostname.includes('notion.site')) {
      platform = 'notion';
    }

    const currentContext = {
      url,
      origin,
      hostname,
      pageTitle,
      pageType: platform,
      platform,
      language,
      selectedText,
      visibleText,
      headings,
      metadata: {
        leetcodeTitle,
        githubRepo,
        metaDescription,
        ogTitle,
        ogDescription,
      },
      topic: '',
      contentType: '',
      difficulty: '',
      questionCount: 0,
      confidence: 1.0,
      timestamp: Date.now(),
    };

    console.log('[DEBUG-STAGE-1] Content Script Context Extraction:', {
      timestamp: currentContext.timestamp,
      contextId: 'ctx_' + currentContext.timestamp,
      URL: currentContext.url,
      Title: currentContext.pageTitle,
      Platform: currentContext.platform,
      SelectedTextLength: currentContext.selectedText.length,
      VisibleTextLength: currentContext.visibleText.length,
    });

    console.log('[DEBUG-STAGE-2] postMessage payload:', {
      source: 'orvixa-content',
      action: 'context_update',
      context: currentContext
    });

    iframe.contentWindow?.postMessage({
      source: 'orvixa-content',
      action: 'context_update',
      context: currentContext
    }, '*');
  };

  // Sync context on tab load immediately
  iframe.addEventListener('load', () => {
    sendContextToIframe(true);
  });

  // E2E Drag/Resize State Management
  let dragBlocker: HTMLDivElement | null = null;
  let dragStartPos = { x: 0, y: 0 };
  let dragStartMouse = { x: 0, y: 0 };
  let isDragging = false;

  let resizeBlocker: HTMLDivElement | null = null;
  let resizeStartSize = { width: 0, height: 0 };
  let resizeStartMouse = { x: 0, y: 0 };
  let isResizing = false;
  let resizeStartPos = { x: 0, y: 0 };
  let resizeDirection = 'sw';

  let isDockResizing = false;
  let dockResizeStartWidthPercent = 0;
  let dockResizeStartMouseX = 0;
  let dockResizeBlocker: HTMLDivElement | null = null;
  let currentResizeWidth = 420;
  let currentResizeHeight = 600;
  let currentResizeLeft = 100;
  let currentDockWidthPercent = 30;

  // Window-level mouse tracker to bypass cross-origin mouse lock stutters
  window.addEventListener('mousemove', (e) => {
    if (isDragging && dragBlocker) {
      const deltaX = e.screenX - dragStartMouse.x;
      const deltaY = e.screenY - dragStartMouse.y;
      
      // Calculate coordinates ensuring panel stays inside the viewport bounds
      const newX = Math.max(10, Math.min(window.innerWidth - 150, dragStartPos.x + deltaX));
      const newY = Math.max(10, Math.min(window.innerHeight - 150, dragStartPos.y + deltaY));

      iframe.style.left = `${newX}px`;
      iframe.style.top = `${newY}px`;
      iframe.style.right = 'auto';

      iframe.contentWindow?.postMessage({
        source: 'orvixa-content',
        action: 'drag_move',
        x: newX,
        y: newY
      }, '*');
    } else if (isResizing && resizeBlocker) {
      const deltaX = e.screenX - resizeStartMouse.x;
      const deltaY = e.screenY - resizeStartMouse.y;
      
      let newWidth = resizeStartSize.width;
      let newHeight = resizeStartSize.height;
      let newLeft = resizeStartPos.x;

      if (resizeDirection === 'w' || resizeDirection === 'sw') {
        newWidth = Math.max(320, Math.min(window.innerWidth - 50, resizeStartSize.width - deltaX));
        newLeft = resizeStartPos.x + (resizeStartSize.width - newWidth);
      } else if (resizeDirection === 'e' || resizeDirection === 'se') {
        newWidth = Math.max(320, Math.min(window.innerWidth - 50, resizeStartSize.width + deltaX));
      }

      if (resizeDirection === 's' || resizeDirection === 'sw' || resizeDirection === 'se') {
        newHeight = Math.max(300, Math.min(window.innerHeight - 50, resizeStartSize.height + deltaY));
      }

      iframe.style.width = `${newWidth}px`;
      iframe.style.height = `${newHeight}px`;
      iframe.style.left = `${newLeft}px`;

      currentResizeWidth = newWidth;
      currentResizeHeight = newHeight;
      currentResizeLeft = newLeft;
    } else if (isDockResizing && dockResizeBlocker) {
      const deltaX = e.screenX - dockResizeStartMouseX;
      // Moving mouse to left (negative deltaX) increases width
      const onePercentPx = window.innerWidth / 100;
      const deltaPercent = -deltaX / onePercentPx;
      const newPercent = Math.max(25, Math.min(50, dockResizeStartWidthPercent + deltaPercent));

      const targetWidth = `${newPercent}vw`;
      iframe.style.width = targetWidth;

      // Adjust host page body size and shift in real time
      document.body.style.setProperty('width', `calc(100% - ${targetWidth})`, 'important');
      document.body.style.setProperty('margin-right', targetWidth, 'important');

      currentDockWidthPercent = newPercent;
    }
  });

  window.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      if (dragBlocker) {
        dragBlocker.remove();
        dragBlocker = null;
      }
      iframe.style.transition = 'width 200ms cubic-bezier(0.16, 1, 0.3, 1), height 200ms cubic-bezier(0.16, 1, 0.3, 1)';
      iframe.contentWindow?.postMessage({
        source: 'orvixa-content',
        action: 'drag_end'
      }, '*');
    }

    if (isResizing) {
      isResizing = false;
      if (resizeBlocker) {
        resizeBlocker.remove();
        resizeBlocker = null;
      }
      iframe.style.transition = 'width 200ms cubic-bezier(0.16, 1, 0.3, 1), height 200ms cubic-bezier(0.16, 1, 0.3, 1)';
      iframe.contentWindow?.postMessage({
        source: 'orvixa-content',
        action: 'resize_end',
        width: currentResizeWidth,
        height: currentResizeHeight,
        x: currentResizeLeft
      }, '*');
    }

    if (isDockResizing) {
      isDockResizing = false;
      if (dockResizeBlocker) {
        dockResizeBlocker.remove();
        dockResizeBlocker = null;
      }
      iframe.style.transition = 'width 200ms cubic-bezier(0.16, 1, 0.3, 1), height 200ms cubic-bezier(0.16, 1, 0.3, 1)';
      iframe.contentWindow?.postMessage({
        source: 'orvixa-content',
        action: 'dock_resize_end',
        widthPercent: currentDockWidthPercent
      }, '*');
    }
  });

  // Listen for dimension update and context request messages from React App inside the iframe
  window.addEventListener('message', (event) => {
    if (event.data && event.data.source === 'orvixa-copilot') {
      const { action } = event.data;
      
      if (action === 'layout_change') {
        const { panelState, panelMode, widthPercent, isExpanded, floatingPosition, floatingSize } = event.data;
        const isVisible = panelState !== 'COLLAPSED' && panelState !== 'HIDDEN';

        if (!isVisible) {
          iframe.style.width = '0px';
          iframe.style.pointerEvents = 'none';
          iframe.style.borderLeft = 'none';
          iframe.style.border = 'none';
          iframe.style.borderRadius = '0px';
          iframe.style.boxShadow = 'none';

          // Reset webpage shifts to 100% clean original state
          document.body.style.setProperty('width', '100%', 'important');
          document.body.style.setProperty('margin-right', '0px', 'important');
          document.body.style.setProperty('transform', 'none', 'important');
          document.documentElement.style.setProperty('overflow-x', 'visible', 'important');
          return;
        }

        iframe.style.pointerEvents = 'auto';

        if (panelMode === 'dock') {
          // Revert any absolute floating styling
          iframe.style.left = 'auto';
          iframe.style.top = '0px';
          iframe.style.right = '0px';
          iframe.style.height = '100vh';
          iframe.style.borderRadius = '0px';
          iframe.style.boxShadow = 'none';
          iframe.style.border = 'none';

          const targetWidth = isExpanded ? '100vw' : `${widthPercent}vw`;
          iframe.style.width = targetWidth;

          // Apply clean border dividing boundary in dock mode unless full screen
          if (!isExpanded) {
            iframe.style.borderLeft = '1px solid rgba(255, 255, 255, 0.15)';
          } else {
            iframe.style.borderLeft = 'none';
          }

          // Dock page resizing (resizes webpage smoothly so content is not blocked)
          const isCollapsedOrHidden = targetWidth === '0px' || targetWidth === '180px' || targetWidth === '100vw';
          document.body.style.setProperty('transition', 'margin-right 200ms cubic-bezier(0.16, 1, 0.3, 1), width 200ms cubic-bezier(0.16, 1, 0.3, 1)', 'important');

          if (!isCollapsedOrHidden) {
            document.body.style.setProperty('width', `calc(100% - ${targetWidth})`, 'important');
            document.body.style.setProperty('transform', 'translate3d(0, 0, 0)', 'important');
            document.body.style.setProperty('margin-right', targetWidth, 'important');
            document.documentElement.style.setProperty('overflow-x', 'hidden', 'important');
          } else {
            document.body.style.setProperty('width', '100%', 'important');
            document.body.style.setProperty('transform', 'none', 'important');
            document.body.style.setProperty('margin-right', '0px', 'important');
            document.documentElement.style.setProperty('overflow-x', 'visible', 'important');
          }
        } else if (panelMode === 'floating') {
          // Floating mode: zero host page shift and no dividing border on iframe
          iframe.style.borderLeft = 'none';
          document.body.style.setProperty('width', '100%', 'important');
          document.body.style.setProperty('margin-right', '0px', 'important');
          document.body.style.setProperty('transform', 'none', 'important');
          document.documentElement.style.setProperty('overflow-x', 'visible', 'important');

          // Sanitize positions and dimensions to guarantee it never renders off-screen
          const posX = (floatingPosition && typeof floatingPosition.x === 'number' && !isNaN(floatingPosition.x)) ? floatingPosition.x : 100;
          const posY = (floatingPosition && typeof floatingPosition.y === 'number' && !isNaN(floatingPosition.y)) ? floatingPosition.y : 100;
          const sizeW = (floatingSize && typeof floatingSize.width === 'number' && !isNaN(floatingSize.width)) ? floatingSize.width : 420;
          const sizeH = (floatingSize && typeof floatingSize.height === 'number' && !isNaN(floatingSize.height)) ? floatingSize.height : 600;

          // Position the iframe element natively as a floating card
          iframe.style.right = 'auto';
          iframe.style.top = `${posY}px`;
          iframe.style.left = `${posX}px`;
          iframe.style.width = `${sizeW}px`;
          iframe.style.height = `${sizeH}px`;
          iframe.style.borderRadius = '16px';
          iframe.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.4)';
          iframe.style.border = '1px solid rgba(255, 255, 255, 0.12)';
        }
      } else if (action === 'drag_start') {
        const { startX, startY, currentX, currentY } = event.data;
        isDragging = true;
        dragStartMouse = { x: startX, y: startY };
        dragStartPos = { x: currentX, y: currentY };

        dragBlocker = document.createElement('div');
        dragBlocker.id = 'orvixa-drag-blocker';
        Object.assign(dragBlocker.style, {
          position: 'fixed',
          top: '0',
          left: '0',
          width: '100vw',
          height: '100vh',
          zIndex: '1000000000',
          cursor: 'move',
          background: 'transparent',
        });
        document.documentElement.appendChild(dragBlocker);
        iframe.style.transition = 'none';

      } else if (action === 'resize_start') {
        const { startX, startY, currentWidth, currentHeight, currentX, currentY, direction } = event.data;
        isResizing = true;
        resizeDirection = direction || 'sw';
        resizeStartMouse = { x: startX, y: startY };
        resizeStartSize = { width: currentWidth, height: currentHeight };
        const initX = (typeof currentX === 'number' && !isNaN(currentX)) ? currentX : 100;
        const initY = (typeof currentY === 'number' && !isNaN(currentY)) ? currentY : 100;
        resizeStartPos = { x: initX, y: initY };

        resizeBlocker = document.createElement('div');
        resizeBlocker.id = 'orvixa-resize-blocker';
        Object.assign(resizeBlocker.style, {
          position: 'fixed',
          top: '0',
          left: '0',
          width: '100vw',
          height: '100vh',
          zIndex: '1000000000',
          cursor: `${resizeDirection}-resize`,
          background: 'transparent',
        });
        document.documentElement.appendChild(resizeBlocker);
        iframe.style.transition = 'none';

      } else if (action === 'dock_resize_start') {
        const { startX, currentWidthPercent } = event.data;
        isDockResizing = true;
        dockResizeStartMouseX = startX;
        dockResizeStartWidthPercent = currentWidthPercent;

        dockResizeBlocker = document.createElement('div');
        dockResizeBlocker.id = 'orvixa-dock-resize-blocker';
        Object.assign(dockResizeBlocker.style, {
          position: 'fixed',
          top: '0',
          left: '0',
          width: '100vw',
          height: '100vh',
          zIndex: '1000000000',
          cursor: 'col-resize',
          background: 'transparent',
        });
        document.documentElement.appendChild(dockResizeBlocker);
        iframe.style.transition = 'none';

      } else if (action === 'drag_end') {
        isDragging = false;
        if (dragBlocker) {
          dragBlocker.remove();
          dragBlocker = null;
        }
        iframe.style.transition = 'width 200ms cubic-bezier(0.16, 1, 0.3, 1), height 200ms cubic-bezier(0.16, 1, 0.3, 1)';
      } else if (action === 'resize_end') {
        isResizing = false;
        if (resizeBlocker) {
          resizeBlocker.remove();
          resizeBlocker = null;
        }
        iframe.style.transition = 'width 200ms cubic-bezier(0.16, 1, 0.3, 1), height 200ms cubic-bezier(0.16, 1, 0.3, 1)';
      } else if (action === 'dock_resize_end') {
        isDockResizing = false;
        if (dockResizeBlocker) {
          dockResizeBlocker.remove();
          dockResizeBlocker = null;
        }
        iframe.style.transition = 'width 200ms cubic-bezier(0.16, 1, 0.3, 1), height 200ms cubic-bezier(0.16, 1, 0.3, 1)';
      } else if (action === 'request_context' || action === 'ready') {
        console.log(`[DEBUG-STAGE-2.1] Handshake received action: ${action}`);
        sendContextToIframe(true);
      } else if (action === 'ack') {
        console.log(`[DEBUG-STAGE-2.5] Handshake ACK received for contextId: ${event.data.contextId}`);
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

  // Listen for DOM mutations (automatic context sync on single-page-app questions/answers updates)
  let mutationDebounce: any = null;
  const observer = new MutationObserver(() => {
    clearTimeout(mutationDebounce);
    mutationDebounce = setTimeout(() => {
      sendContextToIframe();
    }, 800);
  });
  if (document.body) {
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });
  }

  // Forward keyboard and action menu toggle triggers from Background service worker
  chrome.runtime.onMessage.addListener((message: any) => {
    if (message.type === 'ORVIXA_TOGGLE_PANEL') {
      sendContextToIframe(true);
      iframe.contentWindow?.postMessage({ source: 'orvixa-content', action: 'toggle' }, '*');
    }
  });

  // ─────────────────────────────────────────────────────────────
  // AUTONOMOUS YOUTUBE AUTO-PLAY & AD SKIP ENGINE
  // Runs natively inside any YouTube tab context!
  // ─────────────────────────────────────────────────────────────
  if (window.location.hostname.includes('youtube.com')) {
    // 1. If on YouTube Search Page — Auto-click & Navigate to 1st Video!
    if (window.location.pathname.includes('/results')) {
      let attempts = 0;
      const maxAttempts = 30;

      const tryPlayFirstVideo = () => {
        attempts++;
        const anchors = Array.from(document.querySelectorAll('a[href*="/watch?v="]')) as HTMLAnchorElement[];
        const validVideoAnchor = anchors.find(a => {
          const href = a.href || '';
          return href.includes('/watch?v=') && !href.includes('googleadservices') && !href.includes('&list=');
        });

        if (validVideoAnchor && validVideoAnchor.href) {
          window.location.href = validVideoAnchor.href;
          return true;
        }

        if (attempts < maxAttempts) {
          setTimeout(tryPlayFirstVideo, 250);
        }
        return false;
      };

      tryPlayFirstVideo();

      const ytObserver = new MutationObserver(() => {
        if (tryPlayFirstVideo()) ytObserver.disconnect();
      });
      if (document.body) {
        ytObserver.observe(document.body, { childList: true, subtree: true });
      }
    }

    // 2. If on YouTube Watch Page — Auto Skip Ads & Ensure Unmuted Playback!
    if (window.location.pathname.includes('/watch')) {
      setInterval(() => {
        const skipBtn = document.querySelector('.ytp-ad-skip-button, .ytp-ad-skip-button-modern, .ytp-ad-overlay-close-button') as HTMLElement;
        if (skipBtn) skipBtn.click();

        const video = document.querySelector('video') as HTMLVideoElement;
        if (video && video.paused) {
          video.play().catch(() => {});
        }
      }, 500);
    }
  }

  console.log('[Orvixa Extension] Context Engine extraction layer successfully initialized.');
})();
