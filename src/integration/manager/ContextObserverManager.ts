import { AdapterRegistry } from '../core/AdapterRegistry';
import type { NormalizedPlatformContext } from '../core/types';
import type { CurrentContext } from '@/types/context';

export interface ObserverCallbacks {
  onContextChange: (context: NormalizedPlatformContext) => void;
}

export class ContextObserverManager {
  private static observer: MutationObserver | null = null;
  private static selectionHandler: (() => void) | null = null;
  private static messageHandler: ((event: MessageEvent) => void) | null = null;
  private static debounceTimer: any = null;
  private static currentContext: NormalizedPlatformContext | null = null;
  private static hostContext: CurrentContext | null = null;
  private static registeredCallbacks: ObserverCallbacks | null = null;
  private static retryTimer: any = null;
  private static retryAttempts = 0;
  private static hasAcknowledged = false;

  /**
   * Initializes dynamicObservers listening for selection and route changes.
   */
  public static startObserving(callbacks: ObserverCallbacks): void {
    this.stopObserving();
    this.registeredCallbacks = callbacks;

    // 1. Initial Extraction
    this.triggerExtraction(callbacks);

    // 2. Selection Change Listener (Debounced 200ms)
    this.selectionHandler = () => {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => {
        this.triggerExtraction(callbacks);
      }, 200);
    };
    document.addEventListener('selectionchange', this.selectionHandler);

    // 3. Lightweight MutationObserver for DOM changes
    this.observer = new MutationObserver(() => {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => {
        this.triggerExtraction(callbacks);
      }, 500);
    });

    this.observer.observe(document.body, { childList: true, subtree: false });

    // 4. Message listener for cross-origin host context synchronization
    this.messageHandler = (event: MessageEvent) => {
      if (event.data && event.data.source === 'orvixa-content' && event.data.action === 'context_update') {
        console.log('[DEBUG-STAGE-3] ContextObserverManager: Message received:', event.data);
        console.log('[DEBUG-STAGE-3] Details:', {
          contextId: 'ctx_' + event.data.context?.timestamp,
          title: event.data.context?.pageTitle,
          url: event.data.context?.url,
        });
        
        this.hostContext = event.data.context;
        this.hasAcknowledged = true;
        clearInterval(this.retryTimer);

        // Send ACK back to content script
        window.parent.postMessage({
          source: 'orvixa-copilot',
          action: 'ack',
          contextId: 'ctx_' + event.data.context?.timestamp
        }, '*');

        if (this.registeredCallbacks) {
          this.triggerExtraction(this.registeredCallbacks);
        }
      }
    };
    window.addEventListener('message', this.messageHandler);

    this.hasAcknowledged = false;
    this.retryAttempts = 0;

    // 5. Instantly request initial context synchronization from host page to eliminate load race condition
    const isExtensionMode = window.location.search.includes('mode=extension');
    if (isExtensionMode) {
      window.parent.postMessage({ source: 'orvixa-copilot', action: 'ready' }, '*');

      // Auto-retry Ready handshake every 1000ms up to 3 times
      this.retryTimer = setInterval(() => {
        if (!this.hasAcknowledged && this.retryAttempts < 3) {
          this.retryAttempts++;
          console.log('[DEBUG-STAGE-2.2] Retrying ready handshake attempt:', this.retryAttempts);
          window.parent.postMessage({ source: 'orvixa-copilot', action: 'ready' }, '*');
        } else {
          clearInterval(this.retryTimer);
        }
      }, 1000);
    }
  }

  /**
   * Triggers context extraction using resolved platform adapter.
   */
  public static triggerExtraction(callbacks: ObserverCallbacks): NormalizedPlatformContext {
    const isExtensionMode = window.location.search.includes('mode=extension');
    
    // Construct single source of truth context object
    // If extension mode but no host context yet, return a loading context to prevent 'orvixa' iframe fallback!
    if (isExtensionMode && !this.hostContext) {
      const initializingContext: NormalizedPlatformContext = {
        platform: { platformId: 'generic', name: 'generic', confidence: 0, category: 'generic', activeUrl: '' },
        capabilities: [],
        title: 'Initializing Orvixa...',
        summary: 'Synchronizing active learning screen context...',
        primarySnippet: { type: 'text', content: '' },
        secondarySnippets: [],
        metadata: { detectedTopic: 'Initializing...' },
        timestamp: Date.now(),
        pageContext: null as any // Force null pageContext so UI knows context is not ready
      };
      this.currentContext = initializingContext;
      callbacks.onContextChange(initializingContext);
      return initializingContext;
    }

    const activeContext = isExtensionMode && this.hostContext 
      ? this.hostContext 
      : this.extractHostContext(document);

    const adapter = AdapterRegistry.resolve(activeContext.url, document);
    const context = adapter.extractContext(activeContext.url, document, activeContext);

    this.currentContext = context;
    callbacks.onContextChange(context);
    return context;
  }

  /**
   * Local page extraction fallback for web development tab mode
   */
  private static extractHostContext(doc: Document): CurrentContext {
    const url = window.location.href;
    const origin = window.location.origin;
    const hostname = window.location.hostname;
    const pageTitle = doc.title || '';
    const language = doc.documentElement.lang || 'en';
    const selection = window.getSelection()?.toString() || '';
    const visibleText = doc.body ? doc.body.innerText : '';
    const headings = Array.from(doc.querySelectorAll('h1, h2, h3, h4'))
      .map((el) => el.textContent?.trim() || '')
      .filter((txt) => txt.length > 0);

    const leetcodeTitle = doc.querySelector('div[class*="title"], [data-cy="question-title"]')?.textContent?.trim() || '';
    let githubRepo = '';
    if (hostname.includes('github.com')) {
      githubRepo = window.location.pathname.split('/').slice(1, 3).join('/');
    }
    const metaDescription = doc.querySelector('meta[name="description"]')?.getAttribute('content') || '';
    const ogTitle = doc.querySelector('meta[property="og:title"]')?.getAttribute('content') || '';
    const ogDescription = doc.querySelector('meta[property="og:description"]')?.getAttribute('content') || '';

    let platform = 'generic';
    if (hostname.includes('github.com')) {
      platform = 'github';
    } else if (hostname.includes('leetcode.com')) {
      platform = 'leetcode';
    } else if (hostname.includes('notion.so') || hostname.includes('notion.site')) {
      platform = 'notion';
    }

    return {
      url,
      origin,
      hostname,
      pageTitle,
      pageType: platform,
      platform,
      language,
      selectedText: selection,
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
  }

  /**
   * Stops all active observers.
   */
  public static stopObserving(): void {
    if (this.selectionHandler) {
      document.removeEventListener('selectionchange', this.selectionHandler);
      this.selectionHandler = null;
    }

    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }

    if (this.messageHandler) {
      window.removeEventListener('message', this.messageHandler);
      this.messageHandler = null;
    }

    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }

    if (this.retryTimer) {
      clearInterval(this.retryTimer);
      this.retryTimer = null;
    }

    this.registeredCallbacks = null;
  }

  public static getCurrentContext(): NormalizedPlatformContext | null {
    return this.currentContext;
  }
}
