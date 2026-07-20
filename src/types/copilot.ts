export interface DiagnoseAttemptRequest {
  tenant_id: string;
  student_id: string;
  question_content: string;
  concept_id: string;
  difficulty?: string;
  raw_answer?: string;
}

export interface DiagnoseAttemptResponse {
  attempt_id: string;
  recommended_action: string;
  identified_gaps: string[];
  explanation_summary: string;
  created_at: string;
}

export interface ApiErrorPayload {
  error: {
    code: number;
    message: string;
    type: string;
    details?: unknown;
  };
}
