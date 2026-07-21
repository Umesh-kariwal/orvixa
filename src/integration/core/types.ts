export type PlatformCapability =
  | 'SELECTION'
  | 'CODE'
  | 'MARKDOWN'
  | 'TABLES'
  | 'PDFS'
  | 'FORMS'
  | 'CANVAS'
  | 'IDE'
  | 'THREADING'
  | 'METRICS';

export interface PlatformInfo {
  platformId: string;
  name: string;
  category: 'code' | 'docs' | 'lms' | 'qa' | 'pdf' | 'generic';
  confidence: number; // 0.0 - 1.0
  activeUrl: string;
  routePattern?: string;
}

export interface ExtractedSnippet {
  type: 'code' | 'text' | 'table' | 'selection' | 'prompt';
  content: string;
  language?: string;
  location?: string;
}

export interface NormalizedPlatformContext {
  platform: PlatformInfo;
  capabilities: PlatformCapability[];
  title: string;
  summary: string;
  primarySnippet?: ExtractedSnippet;
  secondarySnippets: ExtractedSnippet[];
  metadata: Record<string, any>;
  timestamp: number;
}
