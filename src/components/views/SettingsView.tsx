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
        <span style={{ fontSize: '18px', fontWeight: 700 }}>Settings</span>
      </div>

      {/* API Configuration */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
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
              padding: '10px 12px',
              borderRadius: '8px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-light)',
              color: 'var(--text-primary)',
              fontSize: '13px',
              outline: 'none',
            }}
          />
          <button
            onClick={() => setShowKey(!showKey)}
            style={{
              padding: '10px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-light)',
              color: 'var(--text-primary)',
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            {showKey ? 'Hide' : 'Show'}
          </button>
        </div>
        <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
          Custom keys take priority over default settings. Leave blank to run local stub fallbacks.
        </p>
      </div>

      {/* Preferences Options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600 }}>Dock Layout Mode</div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              Attach sidebar dock side-by-side or launch float
            </div>
          </div>
          <button
            onClick={togglePanelMode}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              background: panelMode === 'dock' ? '#a78bfa' : 'rgba(255, 255, 255, 0.05)',
              border: 'none',
              color: '#ffffff',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {panelMode.toUpperCase()}
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600 }}>Sticky Panel Locking</div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              Keep side panel locked even if clicking outside
            </div>
          </div>
          <button
            onClick={togglePin}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              background: isPinned ? '#10b981' : 'rgba(255, 255, 255, 0.05)',
              border: 'none',
              color: '#ffffff',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {isPinned ? 'STICKY' : 'AUTO-HIDE'}
          </button>
        </div>
      </div>

      {/* Keyboard Shortcuts */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
        <div style={{ fontSize: '13px', fontWeight: 600 }}>Configured Shortcut Keys</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)' }}>
          <span>Toggle copilot panel:</span>
          <kbd style={{ background: 'var(--bg-card)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border-light)' }}>
            Ctrl + K
          </kbd>
        </div>
      </div>

      {/* Actions */}
      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {saveStatus && (
          <div style={{
            fontSize: '12px',
            color: '#10b981',
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
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #a78bfa 0%, #ec4899 100%)',
            border: 'none',
            color: '#ffffff',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '13px',
          }}
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};
