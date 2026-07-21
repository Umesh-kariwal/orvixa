import React from 'react';
import { useSidePanel } from '@/hooks/useSidePanel';

export const OnboardingView: React.FC = () => {
  const { completeOnboarding } = useSidePanel();

  return (
    <div style={{
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      height: '100%',
      overflowY: 'auto',
      color: 'var(--text-primary)',
      backgroundColor: 'var(--bg-panel)',
      fontFamily: 'var(--font-family)',
    }}>
      {/* Welcome Header */}
      <div style={{ textAlign: 'center', marginTop: '16px' }}>
        <div style={{
          fontSize: '32px',
          fontWeight: 800,
          background: 'linear-gradient(135deg, #a78bfa 0%, #ec4899 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '8px',
        }}>
          Meet Orvixa
        </div>
        <p style={{
          fontSize: '14px',
          color: 'var(--text-secondary)',
          margin: 0,
          lineHeight: '1.5',
        }}>
          Your silent, permission-based Socratic learning and interview partner.
        </p>
      </div>

      {/* Feature Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{
          padding: '16px',
          borderRadius: '12px',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
        }}>
          <h4 style={{ margin: '0 0 6px 0', fontSize: '14px', color: '#a78bfa' }}>✦ Context Awareness</h4>
          <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
            Understand questions, equations, and algorithms exactly where they appear, without copying and pasting.
          </p>
        </div>

        <div style={{
          padding: '16px',
          borderRadius: '12px',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
        }}>
          <h4 style={{ margin: '0 0 6px 0', fontSize: '14px', color: '#ec4899' }}>✦ Socratic Hint Ladders</h4>
          <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
            Instead of giving away straight answers, Orvixa guides you through steps to help you learn intuitively.
          </p>
        </div>

        <div style={{
          padding: '16px',
          borderRadius: '12px',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
        }}>
          <h4 style={{ margin: '0 0 6px 0', fontSize: '14px', color: '#10b981' }}>✦ Strict User Privacy</h4>
          <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
            Zero background monitoring. Your webpage context is processed only when you initiate actions.
          </p>
        </div>
      </div>

      {/* Keyboard Shortcuts Info */}
      <div style={{
        padding: '16px',
        borderRadius: '12px',
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px dashed rgba(255, 255, 255, 0.1)',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
          Summon or dismiss the Copilot anytime with:
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
          <kbd style={{
            padding: '4px 8px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-light)',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 'bold',
          }}>
            Ctrl + K
          </kbd>
          <span style={{ color: 'var(--text-secondary)' }}>or</span>
          <kbd style={{
            padding: '4px 8px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-light)',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 'bold',
          }}>
            Cmd + K
          </kbd>
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={completeOnboarding}
        style={{
          padding: '14px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #a78bfa 0%, #ec4899 100%)',
          border: 'none',
          color: '#ffffff',
          fontWeight: 700,
          cursor: 'pointer',
          marginTop: 'auto',
          fontSize: '14px',
          transition: 'transform 0.15s ease',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.02)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      >
        Start Learning
      </button>
    </div>
  );
};
