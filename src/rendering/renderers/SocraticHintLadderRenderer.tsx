import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Heading, Text } from '@/components/ui/Typography';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { HelpCircle, ChevronRight } from 'lucide-react';
import type { RendererComponentProps } from '../core/types';

export const SocraticHintLadderRenderer: React.FC<RendererComponentProps> = ({ payload }) => {
  const hints: string[] = payload.structured_data?.hints || [
    'Level 1: Look at the trigonometric component applied in Step 2.',
    'Level 2: Which component acts perpendicular to the inclined surface?',
    'Level 3: Normal force calculation requires N = m * g * cos(theta).',
    'Level 4: Substitute cos(30) = 0.866 into the friction equation F_f = mu * N.',
  ];

  const [revealedLevel, setRevealedLevel] = useState<number>(1);

  return (
    <Card variant="glass">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <Heading level={3} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <HelpCircle size={18} style={{ color: 'var(--amber-primary)' }} />
          Socratic Guidance Ladder
        </Heading>
        <Badge variant="level">Level {revealedLevel} / 4</Badge>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {hints.slice(0, revealedLevel).map((hintText, idx) => (
          <div
            key={idx}
            style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--amber-bg)',
              border: '1px solid var(--amber-border)',
            }}
          >
            <Text variant="body">{hintText}</Text>
          </div>
        ))}

        {revealedLevel < hints.length && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setRevealedLevel((prev) => Math.min(hints.length, prev + 1))}
            style={{ alignSelf: 'flex-start', marginTop: '4px' }}
          >
            Reveal Next Hint Level <ChevronRight size={14} style={{ marginLeft: '4px' }} />
          </Button>
        )}
      </div>
    </Card>
  );
};
