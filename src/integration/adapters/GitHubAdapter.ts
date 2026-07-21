import { BasePlatformAdapter } from '../core/BasePlatformAdapter';
import type { PlatformCapability, NormalizedPlatformContext } from '../core/types';
import { SelectionExtractor } from '../extractors/SelectionExtractor';
import { EditorExtractor } from '../extractors/EditorExtractor';
import { MetadataExtractor } from '../extractors/MetadataExtractor';

export class GitHubAdapter extends BasePlatformAdapter {
  public readonly adapterId = 'github';
  public readonly name = 'GitHub Platform';
  public readonly priority = 90;
  public readonly capabilities: PlatformCapability[] = [
    'CODE',
    'SELECTION',
    'THREADING',
    'MARKDOWN',
  ];

  public match(url: string, doc: Document): number {
    let score = 0.0;
    if (url.includes('github.com')) score += 0.7;
    if (doc.querySelector('header.Header, div.AppHeader, a[href="https://github.com"]')) score += 0.25;
    if (doc.querySelector('.pull-discussion-timeline, .file-navigation, .js-issue-title')) score += 0.05;
    return Math.min(1.0, score);
  }

  public extractContext(url: string, doc: Document): NormalizedPlatformContext {
    const confidence = this.match(url, doc);
    const meta = MetadataExtractor.extract(doc);
    const selection = SelectionExtractor.extract();
    const codeSnippet = EditorExtractor.extract(doc);

    const titleEl = doc.querySelector('.js-issue-title, h1.public, .file-navigation');
    const title = titleEl?.textContent?.trim() || doc.title || 'GitHub Repository';

    return {
      platform: this.createPlatformInfo(confidence, 'code'),
      capabilities: this.capabilities,
      title,
      summary: `GitHub context: ${title}`,
      primarySnippet: selection || codeSnippet || undefined,
      secondarySnippets: codeSnippet && selection ? [codeSnippet] : [],
      metadata: meta,
      timestamp: Date.now(),
    };
  }
}
