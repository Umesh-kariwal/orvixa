import { BasePlatformAdapter } from '../core/BasePlatformAdapter';
import type { PlatformCapability, NormalizedPlatformContext } from '../core/types';
import { SelectionExtractor } from '../extractors/SelectionExtractor';
import { MetadataExtractor } from '../extractors/MetadataExtractor';

export interface HostPageContext {
  url: string;
  title: string;
  selection: string;
  bodyText: string;
  hostname: string;
  leetcodeTitle?: string;
  githubRepo?: string;
  metaDescription?: string;
}

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

  public extractContext(url: string, doc: Document, hostContext?: HostPageContext): NormalizedPlatformContext {
    const meta = hostContext 
      ? { 
          title: hostContext.title, 
          description: hostContext.metaDescription || '',
          url: hostContext.url,
          hostname: hostContext.hostname
        } 
      : MetadataExtractor.extract(doc);

    const selectionText = hostContext ? hostContext.selection : (SelectionExtractor.extract()?.content || '');
    const pageTitle = hostContext ? hostContext.title : (doc.title || 'Web Page');
    const bodyText = hostContext ? hostContext.bodyText : (doc.body?.innerText || '');
    const activeUrl = hostContext ? hostContext.url : url;

    // Default category classification fallback
    let category: NormalizedPlatformContext['platform']['category'] = 'generic';
    let confidence = 0.5;
    let contentType = 'Web Page';
    let detectedTopic = 'General Topic';
    let mcqCount = 0;

    if (hostContext) {
      const hn = hostContext.hostname.toLowerCase();
      const combined = `${hostContext.title} ${hostContext.url} ${hostContext.bodyText}`.toLowerCase();
      
      // Determine content type and category from host metadata
      if (hn.includes('wikipedia.org')) {
        contentType = 'Wikipedia Article';
        category = 'docs';
        confidence = 0.95;
        detectedTopic = hostContext.title.replace(' - Wikipedia', '').trim();
      } else if (hn.includes('leetcode.com')) {
        contentType = 'LeetCode Problem';
        category = 'code';
        confidence = 0.98;
        detectedTopic = hostContext.leetcodeTitle || hostContext.title.replace(' - LeetCode', '').trim();
      } else if (hn.includes('github.com')) {
        contentType = 'GitHub Repository';
        category = 'code';
        confidence = 0.96;
        detectedTopic = hostContext.githubRepo || 'Repository Code';
      } else if (hn.includes('google.com') && hostContext.url.includes('search')) {
        contentType = 'Google Search Results';
        category = 'generic';
        confidence = 0.85;
        const qMatch = hostContext.url.match(/[?&]q=([^&]+)/);
        detectedTopic = qMatch ? decodeURIComponent(qMatch[1].replace(/\+/g, ' ')) : 'Search Query';
      } else if (hn.includes('youtube.com')) {
        contentType = 'YouTube Video';
        category = 'generic';
        confidence = 0.80;
        detectedTopic = hostContext.title.replace(' - YouTube', '').trim();
      } else if (hn.includes('geeksforgeeks.org')) {
        contentType = 'GeeksForGeeks Tutorial';
        category = 'code';
        confidence = 0.92;
        detectedTopic = hostContext.title.replace(' - GeeksforGeeks', '').trim();
      } else if (combined.includes('documentation') || combined.includes('api reference') || combined.includes('docs.')) {
        contentType = 'Developer Documentation';
        category = 'docs';
        confidence = 0.90;
        detectedTopic = hostContext.title;
      } else if (combined.includes('interview') || combined.includes('behavioral question') || combined.includes('system design')) {
        contentType = 'Interview Question';
        category = 'generic';
        confidence = 0.92;
        detectedTopic = hostContext.title;
      } else if (combined.includes('ssc cgl') || combined.includes('aptitude') || combined.includes('quant') || combined.includes('reasoning')) {
        contentType = 'MCQ Practice / Aptitude';
        category = 'generic';
        confidence = 0.94;
        detectedTopic = 'SSC CGL Quantitative Aptitude';
      }

      // If text content is extremely low, reduce confidence tier as requested in Part 4
      if (bodyText.trim().length < 150 && !selectionText) {
        confidence = 0.25; // Forces low confidence warning
        contentType = 'Empty Tab / Minimal Text';
      }

      // Count MCQs if present in body text
      const questionMatches = bodyText.match(/(?:question|q\.?|\b\d+\b)\s*\d+[:.)]|\b\d+[:.)]\s+[A-Z]/gi) || [];
      mcqCount = Math.max(0, questionMatches.length);
    }

    return {
      platform: {
        platformId: this.adapterId,
        name: this.name,
        category,
        confidence,
        activeUrl,
      },
      capabilities: this.capabilities,
      title: pageTitle,
      summary: `Active context: ${contentType} - "${pageTitle}"`,
      primarySnippet: selectionText ? { type: 'selection', content: selectionText, location: 'user_selection' } : undefined,
      secondarySnippets: [],
      metadata: { 
        ...meta, 
        contentType, 
        detectedTopic,
        mcqCount,
        bodyLength: bodyText.trim().length
      },
      timestamp: Date.now(),
    };
  }
}
