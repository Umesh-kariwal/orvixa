import { BasePlatformAdapter } from '../core/BasePlatformAdapter';
import type { PlatformCapability, NormalizedPlatformContext } from '../core/types';
import { SelectionExtractor } from '../extractors/SelectionExtractor';
import type { CurrentContext } from '@/types/context';

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
    const isExtensionMode = window.location.search.includes('mode=extension');
    if (!isExtensionMode) {
      if (doc.querySelector('.notion-page-content, .notion-body')) score += 0.3;
    }
    return Math.min(1.0, score);
  }

  public extractContext(url: string, doc: Document, hostContext?: CurrentContext): NormalizedPlatformContext {
    const activeContext = hostContext || {
      url,
      origin: '',
      hostname: '',
      pageTitle: 'Notion Page',
      pageType: 'notion',
      platform: 'notion',
      language: 'en',
      selectedText: '',
      visibleText: '',
      headings: [],
      metadata: {},
      topic: '',
      contentType: '',
      difficulty: '',
      questionCount: 0,
      confidence: 0.85,
      timestamp: Date.now(),
    };

    const confidence = this.match(activeContext.url, doc);
    const selection = activeContext.selectedText 
      ? { type: 'selection' as const, content: activeContext.selectedText, location: 'user_selection' } 
      : SelectionExtractor.extract();
      
    const pageTitle = activeContext.pageTitle || 'Notion Page';

    const enrichedContext: CurrentContext = {
      ...activeContext,
      topic: pageTitle,
      contentType: 'Notion Document',
      confidence,
      timestamp: Date.now(),
    };

    return {
      platform: this.createPlatformInfo(confidence, 'docs', activeContext.url),
      capabilities: this.capabilities,
      title: pageTitle,
      summary: `Notion Document: ${pageTitle}`,
      primarySnippet: selection || undefined,
      secondarySnippets: [],
      metadata: { pageTitle },
      timestamp: Date.now(),
      pageContext: enrichedContext,
    };
  }
}
