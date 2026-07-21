import React from 'react';
import { useSidePanel } from '@/hooks/useSidePanel';
import { Card } from '@/components/ui/Card';
import { Heading, Text } from '@/components/ui/Typography';
import { Badge } from '@/components/ui/Badge';
import { OrvixaIntentRenderer } from '@/components/renderers/OrvixaIntentRenderer';
import { Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import type { IntentPayload } from '@/rendering/core/types';

export const ContentAreaHost: React.FC = () => {
  const { panelState, selectedAction, streamingText, errorMessage, activeContext } = useSidePanel();

  if (panelState === 'THINKING') {
    return (
      <div style={{ padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Card variant="glass" glow style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <RefreshCw size={20} style={{ animation: 'spin 1s linear infinite', color: 'var(--brand-primary)' }} />
          <div>
            <Heading level={4}>GitHub Intelligence Suite</Heading>
            <Text variant="secondary">Analyzing repository, diffs & active page context...</Text>
          </div>
        </Card>
      </div>
    );
  }

  if (panelState === 'STREAMING' || (panelState === 'READY' && streamingText)) {
    const actionId = selectedAction?.action_id || 'explain_code';

    let intentType: IntentPayload['intent_type'] = 'MICRO_SUMMARY';
    let structuredData: any = { text: streamingText };

    if (actionId === 'trace_execution') {
      intentType = 'CODE_DIFF_TRACE';
      structuredData = {
        filename: 'src/core/context_engine.rs',
        diff: [
          '@@ -24,8 +24,9 @@ pub fn process_intent_signal(signal: &Signal) -> Confidence {',
          '   // Guard against uninitialized state',
          '-  if signal.confidence < 0.40 {',
          '+  if signal.is_null() || signal.confidence < 0.40 {',
          '       return Confidence::Unknown;',
          '   }',
        ],
      };
    } else if (actionId === 'review_pr') {
      intentType = 'CHECKLIST';
      structuredData = {
        items: [
          'Step 1: Review Security Sanitizer in app/core/context/privacy.py',
          'Step 2: Inspect SSE Streaming Gateway in app/api/v1/stream.py',
          'Step 3: Verify zero CSS leakage in ShadowHost.tsx',
          'Step 4: Re-run backend Pytest suite',
        ],
      };
    } else if (actionId === 'commit_summary') {
      intentType = 'TIMELINE';
      structuredData = {
        events: [
          { timestamp: 'File 1', title: 'privacy.py', description: 'Added automatic PII redaction for token keys' },
          { timestamp: 'File 2', title: 'stream.py', description: 'Integrated Server-Sent Events gateway' },
          { timestamp: 'File 3', title: 'ShadowHost.tsx', description: 'Isolated host DOM from extension styles' },
        ],
      };
    } else if (actionId === 'debug_assistant') {
      intentType = 'CHECKLIST';
      structuredData = {
        items: [
          'Root Cause: Unchecked null pointer on signal initialization',
          'Fix 1: Add null coalescing check before accessing .confidence',
          'Fix 2: Re-test with Pytest test suite',
        ],
      };
    } else if (actionId === 'codebase_qa') {
      intentType = 'SAFE_MARKDOWN';
      structuredData = {
        markdown: streamingText || 'This function extracts and normalizes active page context into a universal context payload.',
      };
    }

    const payload: IntentPayload = {
      intent_type: intentType,
      confidence: 0.96,
      summary: streamingText || 'GitHub Intelligence Analysis Completed.',
      structured_data: structuredData,
      is_streaming: panelState === 'STREAMING',
    };

    return (
      <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Action Header Badge */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Badge variant="mastery" icon={<Sparkles size={12} />}>
            {selectedAction?.label || 'GitHub Intelligence'}
          </Badge>
          <Text variant="muted">Live Stream</Text>
        </div>

        {/* Universal Intent Renderer Runtime Slot */}
        <OrvixaIntentRenderer rawPayload={payload} isStreaming={panelState === 'STREAMING'} />
      </div>
    );
  }

  if (panelState === 'ERROR') {
    return (
      <div style={{ padding: '24px 16px' }}>
        <Card variant="amber">
          <Heading level={4} style={{ color: 'var(--rose-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={18} /> Execution Error
          </Heading>
          <Text variant="secondary">{errorMessage || 'Connection interrupted. Fallback active.'}</Text>
        </Card>
      </div>
    );
  }

  // Default IDLE State
  const pageTitle = activeContext?.sanitized_summary || 'GitHub Repository';

  return (
    <div style={{ padding: '32px 16px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: 'var(--radius-pill)',
          backgroundColor: 'var(--amber-bg)',
          border: '1px solid var(--amber-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--amber-primary)',
        }}
      >
        <Sparkles size={24} />
      </div>

      <Heading level={3}>GitHub Intelligence Active</Heading>
      <Text variant="secondary" style={{ textAlign: 'center', maxWidth: '300px' }}>
        Active Context: {pageTitle}. Select any action pill above to perform instant PR code review, commit analysis, or execution tracing.
      </Text>
    </div>
  );
};
