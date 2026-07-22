import { BasePlatformAdapter } from '../core/BasePlatformAdapter';
import type { PlatformCapability, NormalizedPlatformContext, ExtractedSnippet } from '../core/types';
import { SelectionExtractor } from '../extractors/SelectionExtractor';
import { EditorExtractor } from '../extractors/EditorExtractor';
import { MetadataExtractor } from '../extractors/MetadataExtractor';
import type { CurrentContext } from '@/types/context';

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
    // Safely query DOM only when running in parent tab (non-iframe context)
    const isExtensionMode = window.location.search.includes('mode=extension');
    if (!isExtensionMode) {
      if (doc.querySelector('header.Header, div.AppHeader, a[href="https://github.com"]')) score += 0.25;
      if (doc.querySelector('.pull-discussion-timeline, .file-navigation, .js-issue-title, .diff-table')) score += 0.05;
    }
    return Math.min(1.0, score);
  }

  public extractContext(url: string, doc: Document, hostContext?: CurrentContext): NormalizedPlatformContext {
    const activeContext = hostContext || {
      url,
      origin: '',
      hostname: '',
      pageTitle: 'GitHub Repository',
      pageType: 'github',
      platform: 'github',
      language: 'en',
      selectedText: '',
      visibleText: '',
      headings: [],
      metadata: {},
      topic: '',
      contentType: '',
      difficulty: '',
      questionCount: 0,
      confidence: 0.95,
      timestamp: Date.now(),
    };

    const confidence = this.match(activeContext.url, doc);
    const meta = hostContext 
      ? { title: activeContext.pageTitle, description: activeContext.metadata?.metaDescription || '' } 
      : MetadataExtractor.extract(doc);
    const selection = activeContext.selectedText 
      ? ({ type: 'selection', content: activeContext.selectedText, location: 'user_selection' } as ExtractedSnippet) 
      : SelectionExtractor.extract();
    
    const codeSnippet = hostContext ? undefined : EditorExtractor.extract(doc);

    // Detect GitHub Page Sub-Type
    let pageType: GitHubContextMetadata['pageType'] = 'repository';
    let prNumber: string | undefined = undefined;
    let commitHash: string | undefined = undefined;

    if (activeContext.url.includes('/pull/')) {
      pageType = 'pull_request';
      const match = activeContext.url.match(/\/pull\/(\d+)/);
      if (match) prNumber = match[1];
    } else if (activeContext.url.includes('/commit/')) {
      pageType = 'commit';
      const match = activeContext.url.match(/\/commit\/([a-f0-9]+)/);
      if (match) commitHash = match[1];
    } else if (activeContext.url.includes('/blob/')) {
      pageType = 'code_blob';
    } else if (activeContext.url.includes('/issues/')) {
      pageType = 'issue';
    }

    // Extract Title & Repository Name using single source of truth context
    const title = activeContext.pageTitle || 'GitHub Repository';
    const repoName = activeContext.metadata?.githubRepo || (activeContext.url.split('/')[3] + '/' + activeContext.url.split('/')[4]) || 'github_repo';

    const githubMeta: GitHubContextMetadata = {
      pageType,
      repoName,
      prNumber,
      commitHash,
    };

    const enrichedContext: CurrentContext = {
      ...activeContext,
      topic: repoName,
      contentType: `GitHub ${pageType.replace('_', ' ').toUpperCase()}`,
      confidence,
      timestamp: Date.now(),
    };

    return {
      platform: this.createPlatformInfo(confidence, 'code', activeContext.url),
      capabilities: this.capabilities,
      title,
      summary: `GitHub ${pageType.replace('_', ' ').toUpperCase()}: ${title}`,
      primarySnippet: selection || codeSnippet || undefined,
      secondarySnippets: codeSnippet ? [codeSnippet] : [],
      metadata: { ...meta, ...githubMeta },
      timestamp: Date.now(),
      pageContext: enrichedContext,
    };
  }
}
