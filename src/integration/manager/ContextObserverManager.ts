import { AdapterRegistry } from '../core/AdapterRegistry';
import type { NormalizedPlatformContext } from '../core/types';

export interface ObserverCallbacks {
  onContextChange: (context: NormalizedPlatformContext) => void;
}

export interface HostPageContext {
  url: string;
  title: string;
  selection: string;
  bodyText: string;
  hostname: string;
  leetcodeTitle?: string;
  githubRepo?: string;
  metaDescription?: string;
}

export class ContextObserverManager {
  private static observer: MutationObserver | null = null;
  private static selectionHandler: (() => void) | null = null;
  private static messageHandler: ((event: MessageEvent) => void) | null = null;
  private static debounceTimer: any = null;
  private static currentContext: NormalizedPlatformContext | null = null;
  private static hostContext: HostPageContext | null = null;
  private static registeredCallbacks: ObserverCallbacks | null = null;

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
        this.hostContext = {
          url: event.data.url,
          title: event.data.title,
          selection: event.data.selection,
          bodyText: event.data.bodyText,
          hostname: event.data.hostname,
          leetcodeTitle: event.data.leetcodeTitle,
          githubRepo: event.data.githubRepo,
          metaDescription: event.data.metaDescription,
        };
        if (this.registeredCallbacks) {
          this.triggerExtraction(this.registeredCallbacks);
        }
      }
    };
    window.addEventListener('message', this.messageHandler);
  }

  /**
   * Triggers context extraction using resolved platform adapter.
   */
  public static triggerExtraction(callbacks: ObserverCallbacks): NormalizedPlatformContext {
    // If running in extension iframe, resolve using synced host context attributes
    const url = this.hostContext ? this.hostContext.url : window.location.href;
    const adapter = AdapterRegistry.resolve(url, document);
    const context = adapter.extractContext(url, document, this.hostContext);

    this.currentContext = context;
    callbacks.onContextChange(context);
    return context;
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

    this.registeredCallbacks = null;
  }

  public static getCurrentContext(): NormalizedPlatformContext | null {
    return this.currentContext;
  }
}
