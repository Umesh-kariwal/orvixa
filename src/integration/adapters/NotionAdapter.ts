import { BasePlatformAdapter } from '../core/BasePlatformAdapter';
import type { PlatformCapability, NormalizedPlatformContext } from '../core/types';
import { SelectionExtractor } from '../extractors/SelectionExtractor';

export class NotionAdapter extends BasePlatformAdapter {
  public readonly adapterId = 'notion';
  public readonly name = 'Notion Workspace';
  public readonly priority = 85;
  public readonly capabilities: PlatformCapability[] = [
    'MARKDOWN',
    'TABLES',
    'SELECTION',
  ];

  public match(url: string, doc: Document): number {
    let score = 0.0;
    if (url.includes('notion.so') || url.includes('notion.site')) score += 0.7;
    if (doc.querySelector('.notion-page-content, .notion-body')) score += 0.3;
    return Math.min(1.0, score);
  }

  public extractContext(url: string, doc: Document, _hostContext?: any): NormalizedPlatformContext {
    const confidence = this.match(url, doc);
    const selection = SelectionExtractor.extract();
    const pageTitle = doc.querySelector('.notion-page-block [contenteditable="true"], title')?.textContent?.trim() || 'Notion Page';

    return {
      platform: this.createPlatformInfo(confidence, 'docs'),
      capabilities: this.capabilities,
      title: pageTitle,
      summary: `Notion Document: ${pageTitle}`,
      primarySnippet: selection || undefined,
      secondarySnippets: [],
      metadata: { pageTitle },
      timestamp: Date.now(),
    };
  }
}
