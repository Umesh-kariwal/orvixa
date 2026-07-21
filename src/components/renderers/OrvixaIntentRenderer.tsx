import React from 'react';
import { SchemaValidator } from '@/rendering/core/schemaValidator';
import { RendererRegistry } from '@/rendering';
import type { IntentPayload } from '@/rendering/core/types';

export interface OrvixaIntentRendererProps {
  rawPayload: any;
  isStreaming?: boolean;
  onActionTrigger?: (actionId: string, data?: any) => void;
}

export const OrvixaIntentRenderer: React.FC<OrvixaIntentRendererProps> = ({
  rawPayload,
  isStreaming = false,
  onActionTrigger,
}) => {
  // 1. Strict Schema Validation Step
  const validationResult = SchemaValidator.validate(rawPayload);

  if (!validationResult.isValid || !validationResult.sanitizedPayload) {
    const errorPayload: IntentPayload = {
      intent_type: 'ERROR',
      confidence: 0.0,
      summary: `Schema Validation Error: ${validationResult.errors.join(', ')}`,
      structured_data: { errors: validationResult.errors },
    };

    const ErrorPlugin = RendererRegistry.resolve('ERROR');
    const ErrorComp = ErrorPlugin.component;
    return <ErrorComp payload={errorPayload} isStreaming={isStreaming} onActionTrigger={onActionTrigger} />;
  }

  // 2. O(1) Plugin Resolution from Registry
  const payload = validationResult.sanitizedPayload;
  const plugin = RendererRegistry.resolve(payload.intent_type);
  const AtomicRenderer = plugin.component;

  // 3. Render Atomic Intent Component safely inside Shadow DOM
  return <AtomicRenderer payload={payload} isStreaming={isStreaming} onActionTrigger={onActionTrigger} />;
};
