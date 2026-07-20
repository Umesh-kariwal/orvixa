import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { DiagnoseAttemptRequest } from '@/types/copilot';
import { Send, BookOpen, User, Building2, HelpCircle } from 'lucide-react';

interface CopilotFormProps {
  onSubmit: (data: DiagnoseAttemptRequest) => void;
  isLoading: boolean;
}

export const CopilotForm: React.FC<CopilotFormProps> = ({ onSubmit, isLoading }) => {
  const [tenantId, setTenantId] = useState('mockpreps');
  const [studentId, setStudentId] = useState('student_101');
  const [questionContent, setQuestionContent] = useState('Solve for x: x^2 - 4 = 0');
  const [conceptId, setConceptId] = useState('c_quadratic_equations');
  const [difficulty, setDifficulty] = useState('INTERMEDIATE');
  const [rawAnswer, setRawAnswer] = useState('x = 2');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      tenant_id: tenantId,
      student_id: studentId,
      question_content: questionContent,
      concept_id: conceptId,
      difficulty,
      raw_answer: rawAnswer,
    });
  };

  const formGroupStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '0.85rem',
    fontWeight: 600,
    color: 'var(--text-secondary)',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  };

  const inputStyle: React.CSSProperties = {
    padding: '10px 14px',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-surface)',
    color: 'var(--text-primary)',
    fontSize: '0.95rem',
    fontFamily: 'inherit',
    outline: 'none',
  };

  return (
    <Card glow>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <BookOpen style={{ color: 'var(--brand-primary)' }} size={24} />
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>AI Pedagogical Diagnostic Simulator</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Submit a student attempt context to trigger end-to-end AI diagnosis
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
          <div style={formGroupStyle}>
            <label style={labelStyle}>
              <Building2 size={14} /> Tenant / Platform ID
            </label>
            <input
              style={inputStyle}
              value={tenantId}
              onChange={(e) => setTenantId(e.target.value)}
              required
            />
          </div>

          <div style={formGroupStyle}>
            <label style={labelStyle}>
              <User size={14} /> Student ID
            </label>
            <input
              style={inputStyle}
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              required
            />
          </div>

          <div style={formGroupStyle}>
            <label style={labelStyle}>
              <HelpCircle size={14} /> Concept ID
            </label>
            <input
              style={inputStyle}
              value={conceptId}
              onChange={(e) => setConceptId(e.target.value)}
              required
            />
          </div>

          <div style={formGroupStyle}>
            <label style={labelStyle}>Difficulty Tier</label>
            <select
              style={inputStyle}
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
            >
              <option value="FOUNDATIONAL">Foundational</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
            </select>
          </div>
        </div>

        <div style={formGroupStyle}>
          <label style={labelStyle}>Question Content</label>
          <textarea
            style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
            value={questionContent}
            onChange={(e) => setQuestionContent(e.target.value)}
            required
          />
        </div>

        <div style={formGroupStyle}>
          <label style={labelStyle}>Student Submitted Answer</label>
          <input
            style={inputStyle}
            value={rawAnswer}
            onChange={(e) => setRawAnswer(e.target.value)}
            placeholder="Student's raw answer attempt"
          />
        </div>

        <Button type="submit" disabled={isLoading} style={{ marginTop: '8px' }}>
          {isLoading ? (
            'Diagnosing Attempt...'
          ) : (
            <>
              <Send size={16} style={{ marginRight: '8px' }} /> Execute AI Diagnosis
            </>
          )}
        </Button>
      </form>
    </Card>
  );
};
