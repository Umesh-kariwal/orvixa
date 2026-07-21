import React from 'react';
import { Card } from '@/components/ui/Card';
import { Heading, Text } from '@/components/ui/Typography';
import { GitCommit } from 'lucide-react';
import type { RendererComponentProps } from '../core/types';

export interface TimelineEvent {
  timestamp: string;
  title: string;
  description: string;
}

export const TimelineRenderer: React.FC<RendererComponentProps> = ({ payload }) => {
  const events: TimelineEvent[] = payload.structured_data?.events || [
    { timestamp: '10:14 AM', title: 'Commit Created', description: 'Add context intelligence engine' },
    { timestamp: '10:15 AM', title: 'PII Sanitization Passed', description: '0 secret keys exposed' },
    { timestamp: '10:16 AM', title: 'Intent Derived', description: 'Code analysis score = 0.94' },
  ];

  return (
    <Card variant="glass">
      <Heading level={3} style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <GitCommit size={18} style={{ color: 'var(--brand-primary)' }} />
        {payload.summary || 'Execution Timeline'}
      </Heading>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', position: 'relative', paddingLeft: '16px' }}>
        {/* Timeline Line */}
        <div
          style={{
            position: 'absolute',
            top: 4,
            bottom: 4,
            left: 5,
            width: 2,
            backgroundColor: 'var(--border-color)',
          }}
        />

        {events.map((evt, idx) => (
          <div key={idx} style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {/* Timeline Dot */}
            <div
              style={{
                position: 'absolute',
                left: '-16px',
                top: '4px',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: 'var(--brand-primary)',
              }}
            />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Heading level={4}>{evt.title}</Heading>
              <Text variant="muted">{evt.timestamp}</Text>
            </div>
            <Text variant="secondary">{evt.description}</Text>
          </div>
        ))}
      </div>
    </Card>
  );
};
