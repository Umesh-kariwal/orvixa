import React from 'react';
import { useSidePanel } from '@/hooks/useSidePanel';
import { Shield, ShieldAlert, X } from 'lucide-react';

export const PrivacyDashboard: React.FC = () => {
  const { customApiKey, setCurrentView } = useSidePanel();

  const metrics = [
    { label: 'Background Monitoring', value: 'DISABLED', status: 'secure' },
    { label: 'Screen Recording', value: 'DISABLED', status: 'secure' },
    { label: 'Microphone & Webcam', value: 'DISABLED', status: 'secure' },
    { label: 'Automatic Cloud Sync', value: 'DISABLED', status: 'secure' },
    { label: 'Data Processing Mode', value: 'ON-DEMAND ONLY', status: 'secure' },
    { label: 'Active Provider', value: customApiKey ? 'Custom Gemini Key' : 'Local Fallback', status: 'info' },
  ];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      color: 'var(--text-primary)',
      fontFamily: 'var(--font-sans)',
      userSelect: 'none',
    }}>
      {/* Drawer Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 20px',
        borderBottom: '1px solid var(--border-color)',
        backgroundColor: 'var(--bg-surface)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Shield size={16} style={{ color: 'var(--emerald-primary)' }} />
          <span style={{ fontSize: '0.95rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Privacy Dashboard</span>
        </div>
        <button
          onClick={() => setCurrentView('learning')}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'color var(--motion-fast) ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
        >
          <X size={16} />
        </button>
      </div>

      {/* Drawer Content */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
      }}>
        <div style={{
          padding: '14px',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'var(--bg-surface-elevated)',
          border: '1px solid var(--border-color)',
          fontSize: '0.78rem',
          color: 'var(--text-secondary)',
          lineHeight: '1.5',
        }}>
          Orvixa is built on a <strong style={{ color: 'var(--text-primary)' }}>Privacy-First</strong> architecture. We do not run background telemetry, monitor camera feeds, or upload raw local databases. Web page signals are processed only upon explicit user actions.
        </div>

        {/* Security Metrics List */}
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
                transition: 'all var(--motion-fast) ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.borderColor = 'var(--border-highlight)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.borderColor = 'var(--border-color)';
              }}
            >
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{m.label}</span>
              <span
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  color: m.status === 'secure' ? 'var(--emerald-primary)' : 'var(--brand-primary)',
                  backgroundColor: m.status === 'secure' ? 'var(--emerald-bg)' : 'rgba(99, 102, 241, 0.1)',
                  border: m.status === 'secure' ? '1px solid var(--emerald-border)' : '1px solid var(--border-color)',
                  padding: '3px 8px',
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
          marginTop: '12px',
          padding: '16px',
          borderRadius: 'var(--radius-lg)',
          background: 'var(--emerald-bg)',
          border: '1px solid var(--emerald-border)',
          textAlign: 'center',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <div style={{ 
            fontSize: '0.8rem', 
            fontWeight: 800, 
            color: 'var(--emerald-primary)', 
            marginBottom: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}>
            <ShieldAlert size={14} />
            <span>Secured & Sandbox Masked</span>
          </div>
          <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: '1.45' }}>
            All outbound requests are stripped of credential keys, local account data, and document security flags before leaving the client sandbox.
          </p>
        </div>
      </div>
    </div>
  );
};
