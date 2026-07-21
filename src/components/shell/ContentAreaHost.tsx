import React from 'react';
import { useSidePanel } from '@/hooks/useSidePanel';
import { Card } from '@/components/ui/Card';
import { Heading, Text } from '@/components/ui/Typography';
import { Badge } from '@/components/ui/Badge';
import { OrvixaIntentRenderer } from '@/components/renderers/OrvixaIntentRenderer';
import { Sparkles, AlertCircle, RefreshCw } from 'lucide-react';

export const ContentAreaHost: React.FC = () => {
  const { panelState, selectedAction, streamingText, errorMessage } = useSidePanel();

  if (panelState === 'THINKING') {
    return (
      <div style={{ padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Card variant="glass" glow style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <RefreshCw size={20} style={{ animation: 'spin 1s linear infinite', color: 'var(--brand-primary)' }} />
          <div>
            <Heading level={4}>Orvixa Context Intelligence Engine</Heading>
            <Text variant="secondary">Deriving intent & analyzing active page context...</Text>
          </div>
        </Card>
      </div>
    );
  }

  if (panelState === 'STREAMING' || (panelState === 'READY' && streamingText)) {
    // Construct Typed Intent Payload dynamically
    const intentType = selectedAction?.action_id === 'trace_execution'
      ? 'CODE_DIFF_TRACE'
      : selectedAction?.action_id === 'find_bugs'
      ? 'CHECKLIST'
      : selectedAction?.action_id === 'compare'
      ? 'COMPARISON_TABLE'
      : 'MICRO_SUMMARY';

    const samplePayload = {
      intent_type: intentType,
      confidence: 0.94,
      summary: streamingText || 'Diagnostic analysis completed successfully.',
      structured_data: {
        text: streamingText,
        filename: 'main.py',
        diff: [
          '@@ -14,7 +14,7 @@ def process_user_input(payload):',
          '   # Check array bounds before accessing index',
          '-  if index >= len(items):',
          '+  if items is not None and index < len(items):',
          '       return None',
        ],
        items: [
          'Check array bounds before access',
          'Verify null pointer initialization',
          'Re-run unit test suite',
        ],
      },
      is_streaming: panelState === 'STREAMING',
    };

    return (
      <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Action Header Badge */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Badge variant="mastery" icon={<Sparkles size={12} />}>
            {selectedAction?.label || 'Context Intelligence'}
          </Badge>
          <Text variant="muted">Live Response Stream</Text>
        </div>

        {/* Universal Intent Renderer Runtime Slot */}
        <OrvixaIntentRenderer rawPayload={samplePayload} isStreaming={panelState === 'STREAMING'} />
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

      <Heading level={3}>Web Intelligence Layer Active</Heading>
      <Text variant="secondary" style={{ textAlign: 'center', maxWidth: '300px' }}>
        Select any action pill above or highlight text/code on the host page to activate instant diagnostic guidance.
      </Text>
    </div>
  );
};
