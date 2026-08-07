import React from 'react';
import { useSidePanel } from '@/hooks/useSidePanel';
import { 
  Award, 
  BookOpen, 
  Lightbulb, 
  Users, 
} from 'lucide-react';

export const DashboardSidebar: React.FC = () => {
  const { activeContext, executeAction } = useSidePanel();

  const getConfidenceColor = (tier: string) => {
    if (tier === 'HIGH') return 'var(--emerald-primary)';
    if (tier === 'MEDIUM') return 'var(--amber-primary)';
    return 'var(--rose-primary)';
  };

  const getConfidenceBg = (tier: string) => {
    if (tier === 'HIGH') return 'var(--emerald-bg)';
    if (tier === 'MEDIUM') return 'var(--amber-bg)';
    return 'var(--rose-bg)';
  };

  const getConfidenceBorder = (tier: string) => {
    if (tier === 'HIGH') return 'var(--emerald-border)';
    if (tier === 'MEDIUM') return 'var(--amber-border)';
    return 'var(--rose-border)';
  };

  return (
    <div style={{
      width: '300px',
      borderLeft: '1px solid var(--border-color)',
      backgroundColor: 'var(--bg-surface-elevated)',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      padding: '20px',
      overflowY: 'auto',
      userSelect: 'none',
      height: '100%',
    }}>
      {/* 1. Session Stats & Confidence Board */}
      {activeContext && (
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
            Session Intelligence
          </span>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.72rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Detected Topic</span>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.75rem' }}>
                {activeContext.inferred_topic || 'Generic Context'}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '6px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Category:</span>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)', textTransform: 'capitalize' }}>
                {activeContext.inferred_category || 'standard'}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '6px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Confidence:</span>
              <span style={{ 
                fontWeight: 700, 
                color: getConfidenceColor(activeContext.confidence_tier),
                backgroundColor: getConfidenceBg(activeContext.confidence_tier),
                border: `1px solid ${getConfidenceBorder(activeContext.confidence_tier)}`,
                padding: '2px 8px', 
                borderRadius: 'var(--radius-pill)',
                fontSize: '0.65rem',
              }}>
                {activeContext.confidence_tier} ({Math.round(activeContext.confidence_score * 100)}%)
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '6px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>DOM Scraped:</span>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                {activeContext.observed_body_length || 0} chars
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 3. Action Shortcut Cards */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-md)',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        boxShadow: 'var(--shadow-sm)',
      }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
          Quick Modules
        </span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            { id: 'explain', label: 'Explain Concept', desc: 'Detailed breakdown of active screen', icon: <BookOpen size={14} /> },
            { id: 'hint', label: 'Socratic Hint', desc: 'Ask step-by-step hints to solve', icon: <Lightbulb size={14} /> },
            { id: 'practice_quiz', label: 'Practice Quiz', desc: 'Generate test questions on active topic', icon: <Award size={14} /> },
            { id: 'mock_interview', label: 'Mock Interview', desc: 'Trigger a formal learning voice review', icon: <Users size={14} /> },
          ].map((item) => (
            <div 
              key={item.id}
              onClick={() => executeAction({
                action_id: item.id,
                label: item.label,
                description: item.desc,
                icon: 'sparkles'
              })}
              style={{
                padding: '10px 12px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-color)',
                cursor: 'pointer',
                display: 'flex',
                gap: '10px',
                alignItems: 'center',
                transition: 'all var(--motion-fast) var(--easing-default)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-surface)';
                e.currentTarget.style.borderColor = 'var(--border-highlight)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-surface-elevated)';
                e.currentTarget.style.borderColor = 'var(--border-color)';
                e.currentTarget.style.transform = 'none';
              }}
            >
              <span style={{ color: 'var(--brand-primary)', display: 'flex', alignItems: 'center' }}>
                {item.icon}
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-primary)' }}>{item.label}</span>
                <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
