import { BasePlatformAdapter } from '../core/BasePlatformAdapter';
import type { PlatformCapability, NormalizedPlatformContext } from '../core/types';
import { SelectionExtractor } from '../extractors/SelectionExtractor';
import { EditorExtractor } from '../extractors/EditorExtractor';

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
    if (doc.querySelector('[data-track-load="description_content"], div.monaco-editor')) score += 0.3;
    return Math.min(1.0, score);
  }

  public extractContext(url: string, doc: Document): NormalizedPlatformContext {
    const confidence = this.match(url, doc);
    const selection = SelectionExtractor.extract();
    const codeSnippet = EditorExtractor.extract(doc);

    const problemTitle = doc.querySelector('div[class*="title"], [data-cy="question-title"]')?.textContent?.trim() || 'LeetCode Problem';

    return {
      platform: this.createPlatformInfo(confidence, 'code'),
      capabilities: this.capabilities,
      title: problemTitle,
      summary: `LeetCode coding context: ${problemTitle}`,
      primarySnippet: selection || codeSnippet || undefined,
      secondarySnippets: codeSnippet && selection ? [codeSnippet] : [],
      metadata: { problemTitle },
      timestamp: Date.now(),
    };
  }
}
