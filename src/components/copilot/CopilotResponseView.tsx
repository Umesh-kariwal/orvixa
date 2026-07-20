import React from 'react';
import { Card } from '@/components/ui/Card';
import type { DiagnoseAttemptResponse } from '@/types/copilot';
import { Sparkles, CheckCircle2, AlertTriangle, Lightbulb } from 'lucide-react';

interface CopilotResponseViewProps {
  response: DiagnoseAttemptResponse;
}

export const CopilotResponseView: React.FC<CopilotResponseViewProps> = ({ response }) => {
  const getActionColor = (action: string) => {
    switch (action.toUpperCase()) {
      case 'HINT':
        return '#f59e0b';
      case 'CONCEPT_EXPLANATION':
        return '#6366f1';
      case 'ERROR_DIAGNOSIS':
        return '#ef4444';
      default:
        return '#10b981';
    }
  };

  const actionColor = getActionColor(response.recommended_action);

  return (
    <Card glow style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Sparkles style={{ color: actionColor }} size={24} />
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>AI Pedagogical Response</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Attempt ID: {response.attempt_id}
            </span>
          </div>
        </div>

        <div
          style={{
            backgroundColor: `${actionColor}15`,
            border: `1px solid ${actionColor}50`,
            color: actionColor,
            padding: '6px 14px',
            borderRadius: 'var(--radius-md)',
            fontWeight: 700,
            fontSize: '0.85rem',
            letterSpacing: '0.05em',
          }}
        >
          RECOMMENDED: {response.recommended_action}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Lightbulb size={16} style={{ color: actionColor }} /> Pedagogical Summary
        </div>
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            padding: '14px 16px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-color)',
            fontSize: '0.95rem',
            lineHeight: '1.6',
          }}
        >
          {response.explanation_summary}
        </div>
      </div>

      {response.identified_gaps && response.identified_gaps.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <AlertTriangle size={16} style={{ color: '#f59e0b' }} /> Identified Knowledge Gaps
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {response.identified_gaps.map((gap, idx) => (
              <span
                key={idx}
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.8rem',
                  fontFamily: 'monospace',
                  color: 'var(--text-primary)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <CheckCircle2 size={12} style={{ color: '#10b981' }} />
                {gap}
              </span>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};
