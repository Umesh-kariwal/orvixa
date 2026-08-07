import React from 'react';
import { useSidePanel } from '@/hooks/useSidePanel';

export const OnboardingView: React.FC = () => {
  const { completeOnboarding } = useSidePanel();

  return (
    <div style={{
      padding: '28px 24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      color: 'var(--text-primary)',
      backgroundColor: 'var(--bg-primary)',
      fontFamily: 'var(--font-sans)',
      minHeight: '100%',
    }}>
      {/* Welcome Header */}
      <div style={{ textAlign: 'center', marginTop: '8px' }}>
        <div style={{
          fontSize: '28px',
          fontWeight: 800,
          background: 'var(--brand-gradient)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '8px',
          letterSpacing: '-0.03em',
        }}>
          Meet Orvixa
        </div>
        <p style={{
          fontSize: '0.85rem',
          color: 'var(--text-secondary)',
          margin: 0,
          lineHeight: '1.5',
        }}>
          Your silent, permission-based Socratic learning and interview partner.
        </p>
      </div>

      {/* Feature Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div 
          style={{
            padding: '16px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-sm)',
            transition: 'all 0.20s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = 'var(--shadow-md)';
            e.currentTarget.style.borderColor = 'var(--border-highlight)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
            e.currentTarget.style.borderColor = 'var(--border-color)';
          }}
        >
          <h4 style={{ margin: '0 0 6px 0', fontSize: '0.85rem', fontWeight: 700, color: 'var(--brand-primary)' }}>✦ Context Awareness</h4>
          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.45' }}>
            Understand questions, equations, and algorithms exactly where they appear, without copying and pasting.
          </p>
        </div>

        <div 
          style={{
            padding: '16px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-sm)',
            transition: 'all 0.20s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = 'var(--shadow-md)';
            e.currentTarget.style.borderColor = 'var(--border-highlight)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
            e.currentTarget.style.borderColor = 'var(--border-color)';
          }}
        >
          <h4 style={{ margin: '0 0 6px 0', fontSize: '0.85rem', fontWeight: 700, color: 'var(--amber-primary)' }}>✦ Socratic Hint Ladders</h4>
          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.45' }}>
            Instead of giving away straight answers, Orvixa guides you through steps to help you learn intuitively.
          </p>
        </div>

        <div 
          style={{
            padding: '16px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-sm)',
            transition: 'all 0.20s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = 'var(--shadow-md)';
            e.currentTarget.style.borderColor = 'var(--border-highlight)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
            e.currentTarget.style.borderColor = 'var(--border-color)';
          }}
        >
          <h4 style={{ margin: '0 0 6px 0', fontSize: '0.85rem', fontWeight: 700, color: 'var(--emerald-primary)' }}>✦ Strict User Privacy</h4>
          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.45' }}>
            Zero background monitoring. Your webpage context is processed only when you initiate actions.
          </p>
        </div>
      </div>

      {/* Keyboard Shortcuts Info */}
      <div style={{
        padding: '16px',
        borderRadius: 'var(--radius-md)',
        background: 'var(--bg-surface-elevated)',
        border: '1px dashed var(--border-color)',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
          Summon or dismiss the Copilot anytime with:
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', alignItems: 'center' }}>
          <kbd style={{
            padding: '4px 8px',
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.72rem',
            fontWeight: 'bold',
            color: 'var(--text-primary)',
          }}>
            Ctrl + Shift + Y
          </kbd>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>or</span>
          <kbd style={{
            padding: '4px 8px',
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.72rem',
            fontWeight: 'bold',
            color: 'var(--text-primary)',
          }}>
            Cmd + Shift + Y
          </kbd>
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={completeOnboarding}
        style={{
          padding: '14px',
          borderRadius: 'var(--radius-md)',
          background: 'var(--brand-gradient)',
          border: 'none',
          color: 'var(--text-inverse)',
          fontWeight: 700,
          cursor: 'pointer',
          marginTop: '12px',
          fontSize: '0.85rem',
          transition: 'all var(--motion-fast) var(--easing-default)',
          boxShadow: '0 4px 15px rgba(124, 58, 237, 0.3)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(124, 58, 237, 0.45)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 15px rgba(124, 58, 237, 0.3)';
        }}
      >
        Start Learning
      </button>
    </div>
  );
};
