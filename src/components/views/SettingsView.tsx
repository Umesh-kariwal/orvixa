import React, { useState, useEffect } from 'react';
import { useSidePanel } from '@/hooks/useSidePanel';
import { Button } from '@/components/ui/Button';
import { Key, Layers, Sparkles, X, Eye, EyeOff, Save, Palette, Cpu } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    customApiKey,
    saveApiKey,
    setCurrentView,
  } = useSidePanel();

  // Settings states loaded from storage
  const [apiKeyInput, setApiKeyInput] = useState<string>(customApiKey);
  const [nvidiaApiKey, setNvidiaApiKey] = useState<string>('');
  const [aiEngine, setAiEngine] = useState<string>('gemini');
  const [learningStyle, setLearningStyle] = useState<string>('explain');
  const [themeMode, setThemeMode] = useState<string>('void');
  
  const [showKey, setShowKey] = useState<boolean>(false);
  const [showNvidiaKey, setShowNvidiaKey] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<string>('');

  // Load preferences on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('orvixa_system_settings');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.nvidiaApiKey) setNvidiaApiKey(parsed.nvidiaApiKey);
        if (parsed.aiEngine) setAiEngine(parsed.aiEngine);
        if (parsed.learningStyle) setLearningStyle(parsed.learningStyle);
        if (parsed.themeMode) setThemeMode(parsed.themeMode);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleSaveSettings = () => {
    // Save Gemini API Key via useSidePanel context (for chat completions)
    saveApiKey(apiKeyInput.trim());

    // Save remaining preferences to localStorage
    const systemSettings = {
      geminiApiKey: apiKeyInput.trim(),  // also saved here for image generation
      nvidiaApiKey: nvidiaApiKey.trim(),
      aiEngine,
      learningStyle,
      themeMode
    };
    try {
      localStorage.setItem('orvixa_system_settings', JSON.stringify(systemSettings));
      
      // Dynamic theme injector (for premium theme updates!)
      applyTheme(themeMode);
      
      setSaveStatus('System settings updated successfully!');
      setTimeout(() => setSaveStatus(''), 2500);
    } catch (e) {
      setSaveStatus('Error saving preferences.');
    }
  };

  const applyTheme = (theme: string) => {
    const root = document.documentElement;
    if (theme === 'violet') {
      root.style.setProperty('--brand-primary', '#8b5cf6'); // Purple
      root.style.setProperty('--brand-secondary', '#a78bfa');
    } else if (theme === 'steel') {
      root.style.setProperty('--brand-primary', '#0ea5e9'); // Sky Blue
      root.style.setProperty('--brand-secondary', '#38bdf8');
    } else {
      root.style.setProperty('--brand-primary', '#6366f1'); // Indigo (Default)
      root.style.setProperty('--brand-secondary', '#818cf8');
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      color: 'var(--text-primary)',
      fontFamily: 'var(--font-sans)',
      userSelect: 'none',
      backgroundColor: '#07070c',
    }}>
      {/* Drawer Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '18px 24px',
        borderBottom: '1px solid var(--border-color)',
        backgroundColor: 'rgba(10, 10, 15, 0.5)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={16} style={{ color: 'var(--brand-primary)' }} />
          <span style={{ fontSize: '0.95rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Orvixa Settings</span>
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
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '28px',
      }}>
        {/* Section 1: AI Engines (Brain Selection) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
            <Cpu size={14} style={{ color: 'var(--brand-primary)' }} />
            <label style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              AI Intelligence Brain
            </label>
          </div>
          <select
            value={aiEngine}
            onChange={(e) => setAiEngine(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              fontSize: '0.8rem',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="gemini">Google Gemini 1.5 Pro (Standard)</option>
            <option value="llama">Nvidia Llama-3.1 70B (Fast & Precise)</option>
            <option value="mixtral">Nvidia Mixtral 8x22B (Advanced Reasoning)</option>
          </select>
        </div>

        {/* Section 2: Google Gemini Custom Key */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
            <Key size={14} style={{ color: 'var(--brand-primary)' }} />
            <label style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Google Gemini API Key
            </label>
          </div>
          <div style={{ display: 'flex', position: 'relative', alignItems: 'center' }}>
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="Enter custom Gemini key..."
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
              }}
            >
              {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>

        {/* Section 3: Nvidia Custom Key */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
            <Key size={14} style={{ color: 'var(--brand-primary)' }} />
            <label style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Nvidia NIM API Key (Optional)
            </label>
          </div>
          <div style={{ display: 'flex', position: 'relative', alignItems: 'center' }}>
            <input
              type={showNvidiaKey ? 'text' : 'password'}
              value={nvidiaApiKey}
              onChange={(e) => setNvidiaApiKey(e.target.value)}
              placeholder="Enter custom Nvidia NIM key..."
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
              }}
            />
            <button
              onClick={() => setShowNvidiaKey(!showNvidiaKey)}
              style={{
                position: 'absolute',
                right: '12px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)',
              }}
            >
              {showNvidiaKey ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>

        {/* Section 4: Pedagogical Defaults */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
            <Layers size={14} style={{ color: 'var(--brand-primary)' }} />
            <label style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Default Socratic Style
            </label>
          </div>
          <select
            value={learningStyle}
            onChange={(e) => setLearningStyle(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              fontSize: '0.8rem',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="explain">Full Explainer Mode</option>
            <option value="hint">Socratic Hints Mode</option>
            <option value="challenge">Challenge Mode</option>
          </select>
        </div>

        {/* Section 5: Theme Styles (Void / Violet / Steel) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
            <Palette size={14} style={{ color: 'var(--brand-primary)' }} />
            <label style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Interface Theme Accent
            </label>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            {['void', 'violet', 'steel'].map((theme) => (
              <button
                key={theme}
                onClick={() => setThemeMode(theme)}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: themeMode === theme ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-surface-elevated)',
                  border: themeMode === theme ? '1px solid var(--brand-primary)' : '1px solid var(--border-color)',
                  color: themeMode === theme ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'capitalize',
                  cursor: 'pointer',
                  transition: 'all var(--motion-fast) ease',
                }}
              >
                {theme}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Drawer Footer Actions */}
      <div style={{
        padding: '16px 20px',
        borderTop: '1px solid var(--border-color)',
        backgroundColor: 'rgba(10, 10, 15, 0.5)',
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
          onClick={handleSaveSettings}
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
          Apply & Save Settings
        </Button>
      </div>
    </div>
  );
};
