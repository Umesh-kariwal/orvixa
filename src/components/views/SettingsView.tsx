import React, { useState } from 'react';
import { useSidePanel } from '@/hooks/useSidePanel';

export const SettingsView: React.FC = () => {
  const {
    customApiKey,
    saveApiKey,
    panelMode,
    togglePanelMode,
    isPinned,
    togglePin,
    setCurrentView,
  } = useSidePanel();

  const [apiKeyInput, setApiKeyInput] = useState<string>(customApiKey);
  const [showKey, setShowKey] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<string>('');

  const handleSaveKey = () => {
    saveApiKey(apiKeyInput.trim());
    setSaveStatus('Preferences saved successfully!');
    setTimeout(() => setSaveStatus(''), 2500);
  };

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
        <span style={{ fontSize: '1.1rem', fontWeight: 700, letterSpacing: '-0.02em' }}>Settings</span>
      </div>

      {/* API Configuration */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
          Google Gemini API Key
        </label>
        <div style={{ display: 'flex', gap: '6px' }}>
          <input
            type={showKey ? 'text' : 'password'}
            value={apiKeyInput}
            onChange={(e) => setApiKeyInput(e.target.value)}
            placeholder="AI provider API credentials..."
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              fontSize: '0.8rem',
              outline: 'none',
              transition: 'border-color 0.2s ease',
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--brand-primary)')}
            onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border-color)')}
          />
          <button
            onClick={() => setShowKey(!showKey)}
            style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--bg-surface-elevated)';
              e.currentTarget.style.borderColor = 'var(--border-highlight)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--bg-surface)';
              e.currentTarget.style.borderColor = 'var(--border-color)';
            }}
          >
            {showKey ? 'Hide' : 'Show'}
          </button>
        </div>
        <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
          Custom keys take priority over default settings. Leave blank to run local stub fallbacks.
        </p>
      </div>

      {/* Preferences Options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>Dock Layout Mode</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              Attach sidebar dock side-by-side or launch float
            </div>
          </div>
          <button
            onClick={togglePanelMode}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-sm)',
              background: panelMode === 'dock' ? 'var(--brand-gradient)' : 'var(--bg-surface)',
              border: panelMode === 'dock' ? 'none' : '1px solid var(--border-color)',
              color: panelMode === 'dock' ? 'var(--text-inverse)' : 'var(--text-primary)',
              fontSize: '0.7rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: panelMode === 'dock' ? '0 2px 8px rgba(124, 58, 237, 0.2)' : 'none',
            }}
            onMouseEnter={(e) => {
              if (panelMode !== 'dock') e.currentTarget.style.background = 'var(--bg-surface-elevated)';
            }}
            onMouseLeave={(e) => {
              if (panelMode !== 'dock') e.currentTarget.style.background = 'var(--bg-surface)';
            }}
          >
            {panelMode.toUpperCase()}
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>Sticky Panel Locking</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              Keep side panel locked even if clicking outside
            </div>
          </div>
          <button
            onClick={togglePin}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-sm)',
              background: isPinned ? 'var(--emerald-primary)' : 'var(--bg-surface)',
              border: isPinned ? 'none' : '1px solid var(--border-color)',
              color: isPinned ? '#ffffff' : 'var(--text-primary)',
              fontSize: '0.7rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: isPinned ? 'var(--shadow-glow-emerald)' : 'none',
            }}
            onMouseEnter={(e) => {
              if (!isPinned) e.currentTarget.style.background = 'var(--bg-surface-elevated)';
            }}
            onMouseLeave={(e) => {
              if (!isPinned) e.currentTarget.style.background = 'var(--bg-surface)';
            }}
          >
            {isPinned ? 'STICKY' : 'AUTO-HIDE'}
          </button>
        </div>
      </div>

      {/* Keyboard Shortcuts */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
        <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>Configured Shortcut Keys</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
          <span>Toggle copilot panel:</span>
          <kbd style={{
            background: 'var(--bg-surface-elevated)',
            padding: '4px 8px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-color)',
            fontWeight: 'bold',
            color: 'var(--text-primary)',
          }}>
            Ctrl + Shift + Y
          </kbd>
        </div>
      </div>

      {/* Actions */}
      <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {saveStatus && (
          <div style={{
            fontSize: '0.75rem',
            color: 'var(--emerald-primary)',
            textAlign: 'center',
            fontWeight: 600,
          }}>
            {saveStatus}
          </div>
        )}
        <button
          onClick={handleSaveKey}
          style={{
            padding: '12px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--brand-gradient)',
            border: 'none',
            color: 'var(--text-inverse)',
            fontWeight: 700,
            cursor: 'pointer',
            fontSize: '0.82rem',
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 15px rgba(124, 58, 237, 0.3)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(124, 58, 237, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(124, 58, 237, 0.3)';
          }}
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};
