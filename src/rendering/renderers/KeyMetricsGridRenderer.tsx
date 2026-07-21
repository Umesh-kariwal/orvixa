import React from 'react';
import { Card } from '@/components/ui/Card';
import { Heading, Text } from '@/components/ui/Typography';
import { Activity } from 'lucide-react';
import type { RendererComponentProps } from '../core/types';

export interface MetricItem {
  label: string;
  value: string;
  change?: string;
}

export const KeyMetricsGridRenderer: React.FC<RendererComponentProps> = ({ payload }) => {
  const metrics: MetricItem[] = payload.structured_data?.metrics || [
    { label: 'Retention Score', value: '94%', change: '+6%' },
    { label: 'Latency', value: '42ms', change: '-15ms' },
    { label: 'Misconceptions Defeated', value: '18', change: '3 Today' },
  ];

  return (
    <Card variant="glass">
      <Heading level={3} style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Activity size={18} style={{ color: 'var(--emerald-primary)' }} />
        {payload.summary || 'Performance & Retention Metrics'}
      </Heading>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '10px' }}>
        {metrics.map((m, idx) => (
          <div
            key={idx}
            style={{
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-primary)',
              border: '1px solid var(--border-color)',
            }}
          >
            <Text variant="muted" style={{ display: 'block', fontSize: '0.75rem', marginBottom: '4px' }}>
              {m.label}
            </Text>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {m.value}
            </div>
            {m.change && (
              <span style={{ fontSize: '0.7rem', color: 'var(--emerald-primary)', fontWeight: 600 }}>
                {m.change}
              </span>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
};
