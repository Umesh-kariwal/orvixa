import React from 'react';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Typography';
import type { RendererComponentProps } from '../core/types';

export const SafeMarkdownRenderer: React.FC<RendererComponentProps> = ({ payload }) => {
  const content = payload.summary || payload.structured_data?.markdown || '';

  // Safe Sanitizer: Strips any HTML tags or script injection attempts
  const sanitizeText = (raw: string): string => {
    return raw.replace(/<[^>]*>?/gm, '');
  };

  const safeContent = sanitizeText(content);

  return (
    <Card variant="glass">
      <Text variant="body" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
        {safeContent}
      </Text>
    </Card>
  );
};
