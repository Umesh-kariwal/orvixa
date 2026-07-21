import type { IntentPayload, ValidationResult } from './types';

export class SchemaValidator {
  /**
   * Validates raw AI intent payload against structural and security requirements.
   */
  public static validate(payload: any): ValidationResult {
    const errors: string[] = [];

    if (!payload || typeof payload !== 'object') {
      return { isValid: false, errors: ['Payload must be a non-null object'] };
    }

    if (!payload.intent_type || typeof payload.intent_type !== 'string') {
      errors.push('Missing or invalid intent_type property');
    }

    if (typeof payload.confidence !== 'number' || payload.confidence < 0 || payload.confidence > 1) {
      errors.push('Confidence score must be a number between 0.0 and 1.0');
    }

    if (payload.summary !== undefined && typeof payload.summary !== 'string') {
      errors.push('Summary property must be a string');
    }

    if (payload.structured_data === undefined || payload.structured_data === null) {
      errors.push('Missing structured_data payload');
    }

    if (errors.length > 0) {
      return { isValid: false, errors };
    }

    const sanitizedPayload: IntentPayload = {
      intent_type: payload.intent_type,
      confidence: payload.confidence,
      summary: payload.summary || '',
      structured_data: payload.structured_data,
      is_streaming: Boolean(payload.is_streaming),
    };

    return { isValid: true, errors: [], sanitizedPayload };
  }
}
