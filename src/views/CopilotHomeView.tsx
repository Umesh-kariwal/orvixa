import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { CopilotForm } from '@/components/copilot/CopilotForm';
import { CopilotResponseView } from '@/components/copilot/CopilotResponseView';
import { copilotService } from '@/services/copilotService';
import type { DiagnoseAttemptRequest, DiagnoseAttemptResponse } from '@/types/copilot';
import { AlertCircle } from 'lucide-react';

export const CopilotHomeView: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DiagnoseAttemptResponse | null>(null);

  const handleDiagnose = async (data: DiagnoseAttemptRequest) => {
    setLoading(true);
    setError(null);
    try {
      const response = await copilotService.diagnoseAttempt(data);
      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect to Orvixa AI Backend API');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <CopilotForm onSubmit={handleDiagnose} isLoading={loading} />

      {error && (
        <Card style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#ef4444' }}>
            <AlertCircle size={20} />
            <div>
              <strong style={{ display: 'block', fontSize: '0.95rem' }}>API Connection Error</strong>
              <span style={{ fontSize: '0.85rem' }}>{error}</span>
            </div>
          </div>
        </Card>
      )}

      {result && <CopilotResponseView response={result} />}
    </div>
  );
};
