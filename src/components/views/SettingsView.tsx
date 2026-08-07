import React, { useState } from 'react';
import { useSidePanel } from '@/hooks/useSidePanel';
import { Button } from '@/components/ui/Button';
import { Key, Layers, Shield, X, Eye, EyeOff, Save } from 'lucide-react';

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
        <span style={{ fontSize: '0.95rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Settings</span>
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
        gap: '24px',
      }}>
        {/* API Key Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
            <Key size={14} style={{ color: 'var(--brand-primary)' }} />
            <label style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.02em' }}>
              Google Gemini API Key
            </label>
          </div>
          
          <div style={{ display: 'flex', position: 'relative', alignItems: 'center' }}>
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="Enter Gemini API key..."
              style={{
                width: '100%',
                padding: '10px 40px 10px 14px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                fontSize: '0.8rem',
                outline: 'none',
                fontFamily: 'var(--font-mono)',
                transition: 'all var(--motion-fast) ease',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--brand-primary)';
                e.currentTarget.style.boxShadow = 'var(--shadow-aura)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-color)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
            <button
              onClick={() => setShowKey(!showKey)}
              style={{
                position: 'absolute',
                right: '12px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
              }}
            >
              {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
          <p style={{ margin: 0, fontSize: '0.68rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
            A custom API key is kept locally on your device and never sent to our servers. Leave blank to run local mock fallback settings.
          </p>
        </div>

        {/* Layout Modes */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '16px', 
          borderTop: '1px solid var(--border-color)', 
          paddingTop: '20px' 
        }}>
          {/* Dock Layout Option */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0, flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 700 }}>
                <Layers size={14} style={{ color: 'var(--brand-primary)' }} />
                <span>Dock Layout Mode</span>
              </div>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', lineHeight: '1.3' }}>
                Dock side-by-side or run in a floating window.
              </span>
            </div>
            <button
              onClick={togglePanelMode}
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--radius-pill)',
                background: panelMode === 'dock' ? 'var(--brand-gradient)' : 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-color)',
                color: panelMode === 'dock' ? '#ffffff' : 'var(--text-secondary)',
                fontSize: '0.68rem',
                fontWeight: 800,
                cursor: 'pointer',
                transition: 'all var(--motion-fast) ease',
              }}
            >
              {panelMode.toUpperCase()}
            </button>
          </div>

          {/* Sticky Pinning */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0, flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 700 }}>
                <Shield size={14} style={{ color: 'var(--emerald-primary)' }} />
                <span>Sticky Panel Locking</span>
              </div>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', lineHeight: '1.3' }}>
                Keep sidebar pinned when clicking other page areas.
              </span>
            </div>
            <button
              onClick={togglePin}
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--radius-pill)',
                background: isPinned ? 'var(--emerald-primary)' : 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-color)',
                color: isPinned ? '#ffffff' : 'var(--text-secondary)',
                fontSize: '0.68rem',
                fontWeight: 800,
                cursor: 'pointer',
                transition: 'all var(--motion-fast) ease',
              }}
            >
              {isPinned ? 'STICKY' : 'AUTO-HIDE'}
            </button>
          </div>
        </div>

        {/* Keyboard Shortcuts */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '10px', 
          borderTop: '1px solid var(--border-color)', 
          paddingTop: '20px' 
        }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.02em', color: 'var(--text-secondary)' }}>
            Keyboard Shortcuts
          </span>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Toggle copilot panel:</span>
            <kbd style={{
              background: 'var(--bg-surface-elevated)',
              padding: '4px 8px',
              borderRadius: '6px',
              border: '1px solid var(--border-color)',
              fontWeight: 800,
              fontSize: '0.65rem',
              color: 'var(--text-primary)',
            }}>
              Ctrl + Shift + Y
            </kbd>
          </div>
        </div>
      </div>

      {/* Drawer Footer Actions */}
      <div style={{
        padding: '16px 20px',
        borderTop: '1px solid var(--border-color)',
        backgroundColor: 'var(--bg-surface)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}>
        {saveStatus && (
          <div style={{
            fontSize: '0.72rem',
            color: 'var(--emerald-primary)',
            textAlign: 'center',
            fontWeight: 700,
            marginBottom: '4px',
          }}>
            {saveStatus}
          </div>
        )}
        <Button
          onClick={handleSaveKey}
          variant="primary"
          style={{
            width: '100%',
            height: '38px',
            fontSize: '0.8rem',
            gap: '8px',
            borderRadius: '20px',
          }}
        >
          <Save size={14} />
          Save Settings
        </Button>
      </div>
    </div>
  );
};
