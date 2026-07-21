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
}
