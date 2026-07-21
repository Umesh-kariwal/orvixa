import { BasePlatformAdapter } from '../core/BasePlatformAdapter';
import type { PlatformCapability, NormalizedPlatformContext } from '../core/types';
import { SelectionExtractor } from '../extractors/SelectionExtractor';
import { MetadataExtractor } from '../extractors/MetadataExtractor';

export class GenericWebAdapter extends BasePlatformAdapter {
  public readonly adapterId = 'generic';
  public readonly name = 'Universal Web Adapter';
  public readonly priority = 1; // Lowest fallback priority
  public readonly capabilities: PlatformCapability[] = [
    'SELECTION',
    'MARKDOWN',
    'FORMS',
  ];

  public match(_url: string, _doc: Document): number {
    return 0.1; // Baseline fallback confidence
  }

  public extractContext(_url: string, doc: Document): NormalizedPlatformContext {
    const meta = MetadataExtractor.extract(doc);
    const selection = SelectionExtractor.extract();
    const pageTitle = doc.title || 'Web Page';

    return {
      platform: this.createPlatformInfo(0.5, 'generic'),
      capabilities: this.capabilities,
      title: pageTitle,
      summary: `Active page: ${pageTitle}`,
      primarySnippet: selection || undefined,
      secondarySnippets: [],
      metadata: meta,
      timestamp: Date.now(),
    };
  }
}
