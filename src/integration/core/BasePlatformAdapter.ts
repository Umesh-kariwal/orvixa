import type { PlatformCapability, PlatformInfo, NormalizedPlatformContext } from './types';
import type { CurrentContext } from '@/types/context';

export abstract class BasePlatformAdapter {
  /**
   * Unique adapter identifier (e.g. github, leetcode, notion, generic).
   */
  public abstract readonly adapterId: string;

  /**
   * Display name of the platform.
   */
  public abstract readonly name: string;

  /**
   * Priority score for resolution (higher priority evaluated first).
   */
  public abstract readonly priority: number;

  /**
   * Advertised platform capabilities.
   */
  public abstract readonly capabilities: PlatformCapability[];

  /**
   * Evaluates multi-signal confidence that this adapter matches the current DOM/URL state.
   * Returns score between 0.0 and 1.0.
   */
  public abstract match(url: string, document: Document): number;

  /**
   * Extracts and normalizes current page state into universal context schema.
   */
  public abstract extractContext(url: string, document: Document, hostContext?: CurrentContext): NormalizedPlatformContext;

  /**
   * Returns true if adapter supports specified capability.
   */
  public hasCapability(cap: PlatformCapability): boolean {
    return this.capabilities.includes(cap);
  }

  /**
   * Utility to construct initial platform metadata.
   */
  protected createPlatformInfo(confidence: number, category: PlatformInfo['category'] = 'generic', activeUrl: string): PlatformInfo {
    return {
      platformId: this.adapterId,
      name: this.name,
      category,
      confidence,
      activeUrl,
    };
  }
}
