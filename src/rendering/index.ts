import { RendererRegistry } from './core/RendererRegistry';
import { MicroSummaryRenderer } from './renderers/MicroSummaryRenderer';
import { ChecklistRenderer } from './renderers/ChecklistRenderer';
import { ComparisonTableRenderer } from './renderers/ComparisonTableRenderer';
import { CodeDiffTraceRenderer } from './renderers/CodeDiffTraceRenderer';
import { SocraticHintLadderRenderer } from './renderers/SocraticHintLadderRenderer';
import { KeyMetricsGridRenderer } from './renderers/KeyMetricsGridRenderer';
import { TimelineRenderer } from './renderers/TimelineRenderer';
import { SafeMarkdownRenderer } from './renderers/SafeMarkdownRenderer';
import { FallbackRenderer, ErrorRenderer } from './renderers/FallbackRenderer';

// Auto-register all 10 production atomic intent renderers
RendererRegistry.register({
  metadata: { intentType: 'MICRO_SUMMARY', name: 'Micro Summary', version: '1.0', description: '1-line concise insight', priority: 1 },
  component: MicroSummaryRenderer,
});

RendererRegistry.register({
  metadata: { intentType: 'CHECKLIST', name: 'Checklist', version: '1.0', description: 'Interactive task checklist', priority: 1 },
  component: ChecklistRenderer,
});

RendererRegistry.register({
  metadata: { intentType: 'COMPARISON_TABLE', name: 'Comparison Table', version: '1.0', description: 'Sortable comparison table', priority: 1 },
  component: ComparisonTableRenderer,
});

RendererRegistry.register({
  metadata: { intentType: 'CODE_DIFF_TRACE', name: 'Code Diff Trace', version: '1.0', description: 'Syntax highlighted diff trace', priority: 1 },
  component: CodeDiffTraceRenderer,
});

RendererRegistry.register({
  metadata: { intentType: 'SOCRATIC_HINT', name: 'Socratic Hint Ladder', version: '1.0', description: 'Stepwise hint revealer', priority: 1 },
  component: SocraticHintLadderRenderer,
});

RendererRegistry.register({
  metadata: { intentType: 'KEY_METRICS_GRID', name: 'Key Metrics Grid', version: '1.0', description: 'Data highlights grid', priority: 1 },
  component: KeyMetricsGridRenderer,
});

RendererRegistry.register({
  metadata: { intentType: 'TIMELINE', name: 'Timeline', version: '1.0', description: 'Vertical event timeline', priority: 1 },
  component: TimelineRenderer,
});

RendererRegistry.register({
  metadata: { intentType: 'SAFE_MARKDOWN', name: 'Safe Markdown', version: '1.0', description: 'Sanitized markdown viewer', priority: 1 },
  component: SafeMarkdownRenderer,
});

RendererRegistry.register({
  metadata: { intentType: 'ERROR', name: 'Error', version: '1.0', description: 'Diagnostic error renderer', priority: 1 },
  component: ErrorRenderer,
});

RendererRegistry.register({
  metadata: { intentType: 'FALLBACK', name: 'Fallback', version: '1.0', description: 'Generic fallback renderer', priority: 0 },
  component: FallbackRenderer,
});

export { RendererRegistry } from './core/RendererRegistry';
export { SchemaValidator } from './core/schemaValidator';
export type { IntentPayload, ValidationResult, RenderMetrics } from './core/types';
