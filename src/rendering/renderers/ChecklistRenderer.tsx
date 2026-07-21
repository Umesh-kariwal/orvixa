import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Heading, Text } from '@/components/ui/Typography';
import { CheckSquare, Square } from 'lucide-react';
import type { RendererComponentProps } from '../core/types';

export const ChecklistRenderer: React.FC<RendererComponentProps> = ({ payload }) => {
  const initialItems: string[] = payload.structured_data?.items || [
    'Check array bounds before access',
    'Verify null pointer initialization',
    'Re-run unit test suite',
  ];

  const [completedIndices, setCompletedIndices] = useState<Set<number>>(new Set());

  const toggleCheck = (index: number) => {
    setCompletedIndices((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  return (
    <Card variant="glass">
      <Heading level={3} style={{ marginBottom: '12px' }}>
        {payload.summary || 'Recommended Action Checklist'}
      </Heading>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {initialItems.map((item, idx) => {
          const isDone = completedIndices.has(idx);
          return (
            <div
              key={idx}
              onClick={() => toggleCheck(idx)}
              className="orvixa-focus-ring"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 12px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-primary)',
                border: '1px solid var(--border-color)',
                cursor: 'pointer',
                userSelect: 'none',
              }}
            >
              {isDone ? (
                <CheckSquare size={16} style={{ color: 'var(--emerald-primary)' }} />
              ) : (
                <Square size={16} style={{ color: 'var(--text-muted)' }} />
              )}
              <Text
                variant="body"
                style={{
                  textDecoration: isDone ? 'line-through' : 'none',
                  color: isDone ? 'var(--text-muted)' : 'var(--text-primary)',
                }}
              >
                {item}
              </Text>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
