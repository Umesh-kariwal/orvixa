import { apiRequest } from '@/api/client';
import type { DiagnoseAttemptRequest, DiagnoseAttemptResponse } from '@/types/copilot';

export const copilotService = {
  /**
   * Submits a student attempt context to the backend API for AI diagnosis.
   */
  async diagnoseAttempt(request: DiagnoseAttemptRequest): Promise<DiagnoseAttemptResponse> {
    return apiRequest<DiagnoseAttemptResponse>('/copilot/diagnose', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },
};
