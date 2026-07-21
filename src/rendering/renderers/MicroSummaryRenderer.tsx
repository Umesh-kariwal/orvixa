import React from 'react';
import { Card } from '@/components/ui/Card';
import { Heading, Text } from '@/components/ui/Typography';
import { Sparkles } from 'lucide-react';
import type { RendererComponentProps } from '../core/types';

export const MicroSummaryRenderer: React.FC<RendererComponentProps> = ({ payload }) => {
  const summaryText = payload.summary || payload.structured_data?.text || 'Context analysis complete.';

  return (
    <Card variant="glass" glow>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Sparkles size={18} style={{ color: 'var(--brand-primary)', flexShrink: 0 }} />
        <div>
          <Heading level={4} style={{ marginBottom: '2px' }}>
            Micro-Insight
          </Heading>
          <Text variant="body">{summaryText}</Text>
        </div>
      </div>
    </Card>
  );
};
