import type { BasePlatformAdapter } from './BasePlatformAdapter';
import { GenericWebAdapter } from '../adapters/GenericWebAdapter';

export class AdapterRegistry {
  private static adapters: BasePlatformAdapter[] = [];
  private static fallbackAdapter = new GenericWebAdapter();

  /**
   * Registers a platform adapter plugin.
   */
  public static register(adapter: BasePlatformAdapter): void {
    this.adapters.push(adapter);
    // Sort by priority descending
    this.adapters.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Resolves the best matching platform adapter evaluating multi-signal confidence.
   */
  public static resolve(url: string, doc: Document): BasePlatformAdapter {
    let bestAdapter: BasePlatformAdapter = this.fallbackAdapter;
    let maxConfidence = 0.3; // Threshold required to override generic fallback

    for (const adapter of this.adapters) {
      const confidence = adapter.match(url, doc);
      if (confidence > maxConfidence) {
        maxConfidence = confidence;
        bestAdapter = adapter;
      }
    }

    return bestAdapter;
  }

  /**
   * Returns list of registered adapter IDs.
   */
  public static getRegisteredAdapterIds(): string[] {
    return this.adapters.map((a) => a.adapterId);
  }

  /**
   * Clears registry for testing.
   */
  public static clear(): void {
    this.adapters = [];
  }
}
