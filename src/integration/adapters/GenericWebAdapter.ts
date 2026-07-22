import { BasePlatformAdapter } from '../core/BasePlatformAdapter';
import type { PlatformCapability, NormalizedPlatformContext } from '../core/types';
import type { CurrentContext } from '@/types/context';

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

  public extractContext(url: string, _doc: Document, hostContext?: CurrentContext): NormalizedPlatformContext {
    const activeContext = hostContext || {
      url,
      origin: '',
      hostname: '',
      pageTitle: 'Web Page',
      pageType: 'generic',
      platform: 'generic',
      language: 'en',
      selectedText: '',
      visibleText: '',
      headings: [],
      metadata: {},
      topic: '',
      contentType: '',
      difficulty: '',
      questionCount: 0,
      confidence: 0.5,
      timestamp: Date.now(),
    };

    const urlLower = activeContext.url.toLowerCase();
    const hostnameLower = activeContext.hostname.toLowerCase();
    const combined = `${activeContext.pageTitle} ${activeContext.url} ${activeContext.visibleText}`.toLowerCase();
    
    // Default category classification fallback
    let category: NormalizedPlatformContext['platform']['category'] = 'generic';
    let confidence = activeContext.confidence || 0.5;
    let contentType = 'Web Page';
    let detectedTopic = 'General Topic';
    let mcqCount = 0;

    if (activeContext) {
      // Determine content type and category from host metadata
      if (hostnameLower.includes('wikipedia.org')) {
        contentType = 'Wikipedia Article';
        category = 'docs';
        confidence = 0.95;
        detectedTopic = activeContext.pageTitle.replace(' - Wikipedia', '').trim();
      } else if (hostnameLower.includes('leetcode.com')) {
        contentType = 'LeetCode Problem';
        category = 'code';
        confidence = 0.98;
        detectedTopic = activeContext.metadata?.leetcodeTitle || activeContext.pageTitle.replace(' - LeetCode', '').trim();
      } else if (hostnameLower.includes('github.com')) {
        contentType = 'GitHub Repository';
        category = 'code';
        confidence = 0.96;
        detectedTopic = activeContext.metadata?.githubRepo || 'Repository Code';
      } else if (hostnameLower.includes('google.com') && urlLower.includes('search')) {
        contentType = 'Google Search Results';
        category = 'generic';
        confidence = 0.85;
        const qMatch = activeContext.url.match(/[?&]q=([^&]+)/);
        detectedTopic = qMatch ? decodeURIComponent(qMatch[1].replace(/\+/g, ' ')) : 'Search Query';
      } else if (hostnameLower.includes('youtube.com')) {
        contentType = 'YouTube Video';
        category = 'generic';
        confidence = 0.80;
        detectedTopic = activeContext.pageTitle.replace(' - YouTube', '').trim();
      } else if (hostnameLower.includes('geeksforgeeks.org')) {
        contentType = 'GeeksForGeeks Tutorial';
        category = 'code';
        confidence = 0.92;
        detectedTopic = activeContext.pageTitle.replace(' - GeeksforGeeks', '').trim();
      } else if (combined.includes('documentation') || combined.includes('api reference') || urlLower.includes('docs.')) {
        contentType = 'Developer Documentation';
        category = 'docs';
        confidence = 0.90;
        detectedTopic = activeContext.pageTitle;
      } else if (combined.includes('interview') || combined.includes('behavioral question') || combined.includes('system design')) {
        contentType = 'Interview Question';
        category = 'generic';
        confidence = 0.92;
        detectedTopic = activeContext.pageTitle;
      } else if (combined.includes('ssc cgl') || combined.includes('aptitude') || combined.includes('quant') || combined.includes('reasoning')) {
        contentType = 'MCQ Practice / Aptitude';
        category = 'generic';
        confidence = 0.94;
        detectedTopic = 'SSC CGL Quantitative Aptitude';
      }

      // If text content is extremely low, reduce confidence tier as requested in Part 4
      if (activeContext.visibleText.trim().length < 150 && !activeContext.selectedText) {
        confidence = 0.25; // Forces low confidence warning
        contentType = 'Empty Tab / Minimal Text';
      }

      // Count MCQs if present in body text
      const questionMatches = activeContext.visibleText.match(/(?:question|q\.?|\b\d+\b)\s*\d+[:.)]|\b\d+[:.)]\s+[A-Z]/gi) || [];
      mcqCount = Math.max(0, questionMatches.length);
    }

    const enrichedContext: CurrentContext = {
      ...activeContext,
      topic: detectedTopic,
      contentType,
      questionCount: mcqCount,
      confidence,
      timestamp: Date.now(),
    };

    return {
      platform: this.createPlatformInfo(confidence, category, activeContext.url),
      capabilities: this.capabilities,
      title: activeContext.pageTitle,
      summary: `Active context: ${contentType} - "${activeContext.pageTitle}"`,
      primarySnippet: activeContext.selectedText ? { type: 'selection', content: activeContext.selectedText, location: 'user_selection' } : undefined,
      secondarySnippets: [],
      metadata: { 
        ...activeContext.metadata, 
        contentType, 
        detectedTopic,
        mcqCount,
        bodyLength: activeContext.visibleText.trim().length
      },
      timestamp: Date.now(),
      pageContext: enrichedContext,
    };
  }
}
