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
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      height: '100%',
      overflowY: 'auto',
      color: 'var(--text-primary)',
      backgroundColor: 'var(--bg-panel)',
      fontFamily: 'var(--font-family)',
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
          }}
        >
          ←
        </button>
        <span style={{ fontSize: '18px', fontWeight: 700 }}>Privacy Dashboard</span>
      </div>

      <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
        Orvixa is built on a **Privacy-First** architecture. We do not inspect your pages in the background, run analytics trackers, or monitor microphones. Web content is processed strictly after user actions.
      </p>

      {/* Security Status Indicators */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {metrics.map((m, idx) => (
          <div
            key={idx}
            style={{
              padding: '12px 14px',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{m.label}</span>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: m.status === 'secure' ? '#10b981' : '#a78bfa',
                background: m.status === 'secure' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(167, 139, 250, 0.1)',
                padding: '4px 8px',
                borderRadius: '6px',
              }}
            >
              {m.value}
            </span>
          </div>
        ))}
      </div>

      {/* Security Seal */}
      <div style={{
        marginTop: 'auto',
        padding: '14px',
        borderRadius: '12px',
        background: 'rgba(16, 185, 129, 0.05)',
        border: '1px solid rgba(16, 185, 129, 0.1)',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '12px', fontWeight: 600, color: '#10b981', marginBottom: '4px' }}>
          🛡️ Secured by Default
        </div>
        <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
          All requests are sanitized via local regular expression masks and stripped of sensitive data before leaving your browser.
        </p>
      </div>
    </div>
  );
};
