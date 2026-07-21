import React from 'react';
import type { IntentType, RendererMetadata, RendererComponentProps, RenderMetrics } from './types';

export interface RendererPlugin {
  metadata: RendererMetadata;
  component: React.ComponentType<RendererComponentProps>;
}

export class RendererRegistry {
  private static registry = new Map<IntentType, RendererPlugin>();
  private static fallbackPlugin: RendererPlugin | null = null;
  private static metrics: RenderMetrics = {
    renderTimeMs: 0,
    lookupTimeMs: 0,
    wasFallbackUsed: false,
    validationErrorCount: 0,
  };

  /**
   * Registers a new atomic intent renderer plugin. O(1) registration.
   */
  public static register(plugin: RendererPlugin): void {
    this.registry.set(plugin.metadata.intentType, plugin);
    if (plugin.metadata.intentType === 'FALLBACK') {
      this.fallbackPlugin = plugin;
    }
  }

  /**
   * Resolves the renderer for a given intent type in O(1) time complexity.
   */
  public static resolve(intentType: IntentType): RendererPlugin {
    const startTime = performance.now();
    const plugin = this.registry.get(intentType);
    const lookupTime = performance.now() - startTime;

    this.metrics.lookupTimeMs = lookupTime;

    if (plugin) {
      this.metrics.wasFallbackUsed = false;
      return plugin;
    }

    // Fallback if plugin is unmapped or missing
    this.metrics.wasFallbackUsed = true;
    if (this.fallbackPlugin) {
      return this.fallbackPlugin;
    }

    throw new Error(`RendererRegistry Error: No renderer registered for intent '${intentType}' and no Fallback plugin configured.`);
  }

  /**
   * Returns current renderer metrics observability data.
   */
  public static getMetrics(): RenderMetrics {
    return { ...this.metrics };
  }

  /**
   * Clears registry for testing.
   */
  public static clear(): void {
    this.registry.clear();
    this.fallbackPlugin = null;
  }
}
