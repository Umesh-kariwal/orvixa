import { BasePlatformAdapter } from '../core/BasePlatformAdapter';
import type { PlatformCapability, NormalizedPlatformContext, ExtractedSnippet } from '../core/types';
import { SelectionExtractor } from '../extractors/SelectionExtractor';
import { EditorExtractor } from '../extractors/EditorExtractor';
import { MetadataExtractor } from '../extractors/MetadataExtractor';

export interface GitHubContextMetadata {
  pageType: 'pull_request' | 'commit' | 'code_blob' | 'issue' | 'repository';
  repoName: string;
  prNumber?: string;
  commitHash?: string;
  filename?: string;
  changedFilesCount?: number;
  additions?: number;
  deletions?: number;
}

export class GitHubAdapter extends BasePlatformAdapter {
  public readonly adapterId = 'github';
  public readonly name = 'GitHub Platform';
  public readonly priority = 95;
  public readonly capabilities: PlatformCapability[] = [
    'CODE',
    'SELECTION',
    'THREADING',
    'MARKDOWN',
    'TABLES',
    'METRICS',
  ];

  public match(url: string, doc: Document): number {
    let score = 0.0;
    if (url.includes('github.com')) score += 0.7;
    if (doc.querySelector('header.Header, div.AppHeader, a[href="https://github.com"]')) score += 0.25;
    if (doc.querySelector('.pull-discussion-timeline, .file-navigation, .js-issue-title, .diff-table')) score += 0.05;
    return Math.min(1.0, score);
  }

  public extractContext(url: string, doc: Document, _hostContext?: any): NormalizedPlatformContext {
    const confidence = this.match(url, doc);
    const meta = MetadataExtractor.extract(doc);
    const selection = SelectionExtractor.extract();
    const codeSnippet = EditorExtractor.extract(doc);

    // Detect GitHub Page Sub-Type
    let pageType: GitHubContextMetadata['pageType'] = 'repository';
    let prNumber: string | undefined = undefined;
    let commitHash: string | undefined = undefined;

    if (url.includes('/pull/')) {
      pageType = 'pull_request';
      const match = url.match(/\/pull\/(\d+)/);
      if (match) prNumber = match[1];
    } else if (url.includes('/commit/')) {
      pageType = 'commit';
      const match = url.match(/\/commit\/([a-f0-9]+)/);
      if (match) commitHash = match[1];
    } else if (url.includes('/blob/')) {
      pageType = 'code_blob';
    } else if (url.includes('/issues/')) {
      pageType = 'issue';
    }

    // Extract Title & Repository Name
    const titleEl = doc.querySelector('.js-issue-title, h1.public, .file-navigation, h1');
    const title = titleEl?.textContent?.trim() || doc.title || 'GitHub Repository';

    // Extract Changed Files & Diff Lines if on PR or Commit page
    const diffSnippets: ExtractedSnippet[] = [];
    const diffTable = doc.querySelector('.diff-table, .js-diff-table');

    if (diffTable) {
      const diffText = Array.from(doc.querySelectorAll('.blob-code-inner, .js-file-content'))
        .slice(0, 30)
        .map((el) => el.textContent || '')
        .join('\n');

      if (diffText.trim()) {
        diffSnippets.push({
          type: 'code',
          content: diffText,
          location: 'github_diff_view',
        });
      }
    }

    const githubMeta: GitHubContextMetadata = {
      pageType,
      repoName: url.split('/')[3] + '/' + url.split('/')[4] || 'github_repo',
      prNumber,
      commitHash,
    };

    return {
      platform: this.createPlatformInfo(confidence, 'code'),
      capabilities: this.capabilities,
      title,
      summary: `GitHub ${pageType.replace('_', ' ').toUpperCase()}: ${title}`,
      primarySnippet: selection || diffSnippets[0] || codeSnippet || undefined,
      secondarySnippets: [...diffSnippets, ...(codeSnippet ? [codeSnippet] : [])],
      metadata: { ...meta, ...githubMeta },
      timestamp: Date.now(),
    };
  }
}
