import React from 'react';
import { Card } from '@/components/ui/Card';
import { Heading, Text } from '@/components/ui/Typography';
import { Code2 } from 'lucide-react';
import type { RendererComponentProps } from '../core/types';

export const CodeDiffTraceRenderer: React.FC<RendererComponentProps> = ({ payload }) => {
  const fileTitle = payload.structured_data?.filename || 'main.py';
  const diffLines: string[] = payload.structured_data?.diff || [
    '@@ -14,7 +14,7 @@ def process_user_input(payload):',
    '   # Check array bounds before accessing index',
    '-  if index >= len(items):',
    '+  if items is not None and index < len(items):',
    '       return None',
  ];

  return (
    <Card variant="glass" glow>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <Heading level={4} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Code2 size={16} style={{ color: 'var(--brand-primary)' }} />
          {fileTitle}
        </Heading>
        <Text variant="muted">Code Diff Trace</Text>
      </div>

      <div
        style={{
          backgroundColor: 'var(--bg-primary)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)',
          padding: '10px 12px',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.82rem',
          lineHeight: 1.6,
          overflowX: 'auto',
        }}
      >
        {diffLines.map((line, idx) => {
          let lineBg = 'transparent';
          let textColor = 'var(--text-primary)';

          if (line.startsWith('+')) {
            lineBg = 'rgba(16, 185, 129, 0.15)';
            textColor = 'var(--emerald-primary)';
          } else if (line.startsWith('-')) {
            lineBg = 'rgba(244, 63, 94, 0.15)';
            textColor = 'var(--rose-primary)';
          } else if (line.startsWith('@@')) {
            textColor = 'var(--text-muted)';
          }

          return (
            <div key={idx} style={{ backgroundColor: lineBg, color: textColor, padding: '2px 4px', borderRadius: '3px' }}>
              <span style={{ display: 'inline-block', width: '24px', opacity: 0.5, userSelect: 'none' }}>
                {idx + 1}
              </span>
              {line}
            </div>
          );
        })}
      </div>
    </Card>
  );
};
