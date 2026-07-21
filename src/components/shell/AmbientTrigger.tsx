import React from 'react';
import { useSidePanel } from '@/hooks/useSidePanel';
import { Sparkles } from 'lucide-react';

export const AmbientTrigger: React.FC = () => {
  const { openPanel, panelState, activeContext } = useSidePanel();

  // Silence Policy: Do not render trigger if panel is open or confidence is UNKNOWN/LOW
  if (panelState !== 'COLLAPSED' && panelState !== 'IDLE') {
    return null;
  }

  const confidenceTier = activeContext?.confidence_tier || 'HIGH';
  if (confidenceTier === 'UNKNOWN' || confidenceTier === 'LOW') {
    return null; // Law 2: Default State = Invisible
  }

  return (
    <div
      onClick={openPanel}
      className="orvixa-focus-ring"
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 16px',
        borderRadius: 'var(--radius-pill)',
        backgroundColor: 'var(--bg-glass)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid var(--border-highlight)',
        boxShadow: 'var(--shadow-aura)',
        cursor: 'pointer',
        transition: 'transform 200ms ease, box-shadow 200ms ease',
        userSelect: 'none',
      }}
      title="Click to open Orvixa Intelligence Dock (Ctrl+K)"
    >
      <div
        style={{
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          backgroundColor: 'var(--brand-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          boxShadow: '0 0 10px var(--brand-primary)',
        }}
      >
        <Sparkles size={12} />
      </div>

      <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
        Orvixa (✦ 92%)
      </span>
    </div>
  );
};
