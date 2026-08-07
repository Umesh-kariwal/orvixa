import React from 'react';
import { useSidePanel } from '@/hooks/useSidePanel';

export const PrivacyDashboard: React.FC = () => {
  const { customApiKey, setCurrentView } = useSidePanel();

  const metrics = [
    { label: 'Background Monitoring', value: 'DISABLED', status: 'secure' },
    { label: 'Screen Recording / Capture', value: 'DISABLED', status: 'secure' },
    { label: 'Microphone Access', value: 'DISABLED', status: 'secure' },
    { label: 'Webcam Access', value: 'DISABLED', status: 'secure' },
    { label: 'Automatic Cloud Uploads', value: 'DISABLED', status: 'secure' },
    { label: 'Data Processing Mode', value: 'ON-DEMAND ONLY', status: 'secure' },
    { label: 'Active Provider', value: customApiKey ? 'Custom Gemini API Key' : 'Local Developer Fallback', status: 'info' },
  ];

  return (
    <div style={{
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      color: 'var(--text-primary)',
      backgroundColor: 'var(--bg-primary)',
      fontFamily: 'var(--font-sans)',
      minHeight: '100%',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button
          onClick={() => setCurrentView('learning')}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            fontSize: '18px',
            cursor: 'pointer',
            padding: '4px',
            transition: 'transform 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateX(-2px)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateX(0)')}
        >
          ←
        </button>
        <span style={{ fontSize: '1.1rem', fontWeight: 700, letterSpacing: '-0.02em' }}>Privacy Dashboard</span>
      </div>

      <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
        Orvixa is built on a **Privacy-First** architecture. We do not inspect your pages in the background, run analytics trackers, or monitor microphones. Web content is processed strictly after user actions.
      </p>

      {/* Security Status Indicators */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {metrics.map((m, idx) => (
          <div
            key={idx}
            style={{
              padding: '12px 14px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.borderColor = 'var(--border-highlight)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = 'var(--border-color)';
            }}
          >
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{m.label}</span>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                color: m.status === 'secure' ? 'var(--emerald-primary)' : 'var(--brand-primary)',
                background: m.status === 'secure' ? 'var(--emerald-bg)' : 'rgba(124, 58, 237, 0.08)',
                border: m.status === 'secure' ? '1px solid var(--emerald-border)' : '1px solid rgba(124, 58, 237, 0.15)',
                padding: '4px 10px',
                borderRadius: 'var(--radius-pill)',
              }}
            >
              {m.value}
            </span>
          </div>
        ))}
      </div>

      {/* Security Seal */}
      <div style={{
        marginTop: '20px',
        padding: '16px',
        borderRadius: 'var(--radius-md)',
        background: 'var(--emerald-bg)',
        border: '1px solid var(--emerald-border)',
        boxShadow: 'var(--shadow-glow-emerald)',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--emerald-primary)', marginBottom: '6px' }}>
          🛡️ Secured by Default
        </div>
        <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: '1.45' }}>
          All requests are sanitized via local regular expression masks and stripped of sensitive data before leaving your browser.
        </p>
      </div>
    </div>
  );
};
