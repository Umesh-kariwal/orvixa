import React from 'react';
import { useSidePanel } from '@/hooks/useSidePanel';
import { Card } from '@/components/ui/Card';
import { Heading, Text } from '@/components/ui/Typography';
import { Badge } from '@/components/ui/Badge';
import { Sparkles, Code2, AlertCircle, RefreshCw } from 'lucide-react';

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
    return (
      <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Action Header Card */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Badge variant="mastery" icon={<Sparkles size={12} />}>
            {selectedAction?.label || 'Context Intelligence'}
          </Badge>
          <Text variant="muted">Live Response Stream</Text>
        </div>

        {/* Typed Intent Schema Display Slot */}
        <Card variant="glass" glow>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Heading level={3} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Code2 size={18} style={{ color: 'var(--brand-primary)' }} />
              Diagnostic Analysis
            </Heading>

            <Text variant="body" style={{ whiteSpace: 'pre-wrap' }}>
              {streamingText}
            </Text>

            {/* Structured Intent Code Diff Trace Render */}
            <div
              style={{
                backgroundColor: 'var(--bg-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '12px',
                marginTop: '8px',
              }}
            >
              <Text variant="muted" style={{ display: 'block', marginBottom: '6px' }}>
                Suggested Fix (Diff Trace):
              </Text>
              <Text variant="code">
                {`- if (index >= array.length)\n+ if (array && index < array.length)`}
              </Text>
            </div>
          </div>
        </Card>
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
