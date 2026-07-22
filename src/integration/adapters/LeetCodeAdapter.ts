import { BasePlatformAdapter } from '../core/BasePlatformAdapter';
import type { PlatformCapability, NormalizedPlatformContext } from '../core/types';
import { SelectionExtractor } from '../extractors/SelectionExtractor';
import { EditorExtractor } from '../extractors/EditorExtractor';
import type { CurrentContext } from '@/types/context';

export class LeetCodeAdapter extends BasePlatformAdapter {
  public readonly adapterId = 'leetcode';
  public readonly name = 'LeetCode Platform';
  public readonly priority = 90;
  public readonly capabilities: PlatformCapability[] = [
    'CODE',
    'IDE',
    'SELECTION',
  ];

  public match(url: string, doc: Document): number {
    let score = 0.0;
    if (url.includes('leetcode.com')) score += 0.7;
    const isExtensionMode = window.location.search.includes('mode=extension');
    if (!isExtensionMode) {
      if (doc.querySelector('[data-track-load="description_content"], div.monaco-editor')) score += 0.3;
    }
    return Math.min(1.0, score);
  }

  public extractContext(url: string, doc: Document, hostContext?: CurrentContext): NormalizedPlatformContext {
    const activeContext = hostContext || {
      url,
      origin: '',
      hostname: '',
      pageTitle: 'LeetCode Problem',
      pageType: 'leetcode',
      platform: 'leetcode',
      language: 'en',
      selectedText: '',
      visibleText: '',
      headings: [],
      metadata: {},
      topic: '',
      contentType: '',
      difficulty: '',
      questionCount: 0,
      confidence: 0.90,
      timestamp: Date.now(),
    };

    const confidence = this.match(activeContext.url, doc);
    const selection = activeContext.selectedText 
      ? { type: 'selection' as const, content: activeContext.selectedText, location: 'user_selection' } 
      : SelectionExtractor.extract();
      
    const codeSnippet = hostContext ? undefined : EditorExtractor.extract(doc);
    const problemTitle = activeContext.metadata?.leetcodeTitle || activeContext.pageTitle || 'LeetCode Problem';

    const enrichedContext: CurrentContext = {
      ...activeContext,
      topic: problemTitle,
      contentType: 'LeetCode Coding Problem',
      confidence,
      timestamp: Date.now(),
    };

    return {
      platform: this.createPlatformInfo(confidence, 'code', activeContext.url),
      capabilities: this.capabilities,
      title: problemTitle,
      summary: `LeetCode coding context: "${problemTitle}"`,
      primarySnippet: selection || codeSnippet || undefined,
      secondarySnippets: codeSnippet ? [codeSnippet] : [],
      metadata: { problemTitle },
      timestamp: Date.now(),
      pageContext: enrichedContext,
    };
  }
}
