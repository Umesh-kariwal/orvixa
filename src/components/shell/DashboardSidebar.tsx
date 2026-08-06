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
    if (tier === 'HIGH') return '#10b981';
    if (tier === 'MEDIUM') return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div style={{
      width: '320px',
      borderLeft: '1px solid var(--border-color)',
      backgroundColor: 'rgba(255, 255, 255, 0.01)',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      padding: '20px',
      overflowY: 'auto',
      userSelect: 'none',
      height: '100%',
    }}>
      {/* 1. Session Stats & Confidence Board */}
      {activeContext && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: '16px',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>Session Intelligence</span>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.72rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Detected Topic:</span>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                {activeContext.inferred_topic || 'Generic Context'}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Difficulty Category:</span>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)', textTransform: 'capitalize' }}>
                {activeContext.inferred_category || 'standard'}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Confidence Score:</span>
              <span style={{ 
                fontWeight: 700, 
                color: getConfidenceColor(activeContext.confidence_tier),
                backgroundColor: 'rgba(255,255,255,0.02)',
                padding: '2px 6px',
                borderRadius: '4px',
              }}>
                {activeContext.confidence_tier} ({Math.round(activeContext.confidence_score * 100)}%)
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>DOM Scraped Length:</span>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                {activeContext.observed_body_length || 0} characters
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 3. Action Shortcut Cards */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        borderRadius: '16px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>Quick Modules</span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            { id: 'explain', label: 'Explain Concept', desc: 'Detailed breakdown of active screen', icon: <BookOpen size={14} color="#a78bfa" /> },
            { id: 'hint', label: 'Socratic Hint', desc: 'Ask step-by-step hints to solve', icon: <Lightbulb size={14} color="#f59e0b" /> },
            { id: 'practice_quiz', label: 'Practice Quiz', desc: 'Generate test questions on active topic', icon: <Award size={14} color="#10b981" /> },
            { id: 'mock_interview', label: 'Mock Interview', desc: 'Trigger a formal learning voice review', icon: <Users size={14} color="#ec4899" /> },
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
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.04)',
                cursor: 'pointer',
                display: 'flex',
                gap: '10px',
                alignItems: 'center',
                transition: 'background-color 150ms ease, transform 150ms ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)';
                e.currentTarget.style.transform = 'none';
              }}
            >
              {item.icon}
              <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-primary)' }}>{item.label}</span>
                <span style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
