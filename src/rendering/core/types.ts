export type IntentType =
  | 'MICRO_SUMMARY'
  | 'CHECKLIST'
  | 'COMPARISON_TABLE'
  | 'CODE_DIFF_TRACE'
  | 'SOCRATIC_HINT'
  | 'KEY_METRICS_GRID'
  | 'TIMELINE'
  | 'SAFE_MARKDOWN'
  | 'ERROR'
  | 'FALLBACK';

export interface RendererMetadata {
  intentType: IntentType;
  name: string;
  version: string;
  description: string;
  priority: number;
}

export interface IntentPayload<T = any> {
  intent_type: IntentType;
  confidence: number;
  summary: string;
  structured_data: T;
  is_streaming?: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedPayload?: IntentPayload;
}

export interface RenderMetrics {
  renderTimeMs: number;
  lookupTimeMs: number;
  wasFallbackUsed: boolean;
  validationErrorCount: number;
}

export interface RendererComponentProps<T = any> {
  payload: IntentPayload<T>;
  isStreaming?: boolean;
  onActionTrigger?: (actionId: string, data?: any) => void;
}
