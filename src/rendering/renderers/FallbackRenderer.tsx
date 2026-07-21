import React from 'react';
import { Card } from '@/components/ui/Card';
import { Heading, Text } from '@/components/ui/Typography';
import { HelpCircle, AlertTriangle } from 'lucide-react';
import type { RendererComponentProps } from '../core/types';

export const FallbackRenderer: React.FC<RendererComponentProps> = ({ payload }) => {
  return (
    <Card variant="glass">
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <HelpCircle size={18} style={{ color: 'var(--brand-primary)' }} />
        <Heading level={4}>Generic Context Renderer</Heading>
      </div>
      <Text variant="body">{payload.summary || 'Context analysis updated.'}</Text>
    </Card>
  );
};

export const ErrorRenderer: React.FC<RendererComponentProps> = ({ payload }) => {
  return (
    <Card variant="amber">
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <AlertTriangle size={18} style={{ color: 'var(--rose-primary)' }} />
        <Heading level={4} style={{ color: 'var(--rose-primary)' }}>
          Diagnostic Render Warning
        </Heading>
      </div>
      <Text variant="secondary">
        {payload.summary || 'Validation or rendering error encountered. Graceful fallback active.'}
      </Text>
    </Card>
  );
};
