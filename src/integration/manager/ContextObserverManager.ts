import { AdapterRegistry } from '../core/AdapterRegistry';
import type { NormalizedPlatformContext } from '../core/types';

export interface ObserverCallbacks {
  onContextChange: (context: NormalizedPlatformContext) => void;
}

export class ContextObserverManager {
  private static observer: MutationObserver | null = null;
  private static selectionHandler: (() => void) | null = null;
  private static debounceTimer: any = null;
  private static currentContext: NormalizedPlatformContext | null = null;

  /**
   * Initializes dynamicObservers listening for selection and route changes.
   */
  public static startObserving(callbacks: ObserverCallbacks): void {
    this.stopObserving();

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

    // 3. Lightweight MutationObserver for SPA Route changes
    this.observer = new MutationObserver(() => {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => {
        this.triggerExtraction(callbacks);
      }, 500);
    });

    this.observer.observe(document.body, { childList: true, subtree: false });
  }

  /**
   * Triggers context extraction using resolved platform adapter.
   */
  public static triggerExtraction(callbacks: ObserverCallbacks): NormalizedPlatformContext {
    const url = window.location.href;
    const adapter = AdapterRegistry.resolve(url, document);
    const context = adapter.extractContext(url, document);

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

    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
  }

  public static getCurrentContext(): NormalizedPlatformContext | null {
    return this.currentContext;
  }
}
