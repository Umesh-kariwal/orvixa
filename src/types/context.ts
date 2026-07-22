export type ConfidenceTier = 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN';

export interface RecommendedAction {
  action_id: string;
  label: string;
  description: string;
  icon?: string;
}

export interface ActiveObjectPayload {
  object_type: string;
  content?: string;
  metadata?: Record<string, any>;
  is_sensitive?: boolean;
}

export interface NormalizedContextPayload {
  url: string;
  domain: string;
  platform_hint?: string;
  screen_title?: string;
  active_object?: ActiveObjectPayload;
  visible_text_summary?: string;
  recent_actions?: string[];
}

export interface CurrentContext {
  url: string;
  origin: string;
  hostname: string;
  pageTitle: string;
  pageType: string;
  platform: string;
  language: string;
  selectedText: string;
  visibleText: string;
  headings: string[];
  metadata: Record<string, any>;
  topic: string;
  contentType: string;
  difficulty: string;
  questionCount: number;
  confidence: number; // 0.0 - 1.0
  timestamp: number;
}

export interface ContextIntelligenceResult {
  context_id?: string;
  timestamp?: number;
  confidence_tier: ConfidenceTier;
  confidence_score: number;
  primary_intent: string;
  recommended_actions: RecommendedAction[];
  side_panel_state: string;
  redacted: boolean;
  sanitized_summary?: string;
  
  // Authoritative page context single source of truth
  pageContext?: CurrentContext;

  // Legacy fields preserved for back-compat
  observed_url?: string;
  observed_title?: string;
  observed_selection?: string;
  observed_body_length?: number;
  inferred_topic?: string;
  inferred_category?: string;
  metadata?: Record<string, any>;
}
