import React, { useState } from 'react';
import { useSidePanel } from '@/hooks/useSidePanel';
import { Button } from '@/components/ui/Button';
import { CornerDownLeft, Scan, Headphones } from 'lucide-react';

export const BottomBar: React.FC = () => {
  const { executeAction, performanceMetrics, activeContext, isExpanded, setIsVoiceModeActive } = useSidePanel();
  const [promptInput, setPromptInput] = useState<string>('');

  const isContextReady = !!(activeContext && activeContext.pageContext && activeContext.observed_title !== 'orvixa' && !activeContext.observed_url?.startsWith('chrome-extension://'));
  console.log('[DEBUG-BOTTOMBAR] Context state:', {
    hasActiveContext: !!activeContext,
    hasPageContext: !!activeContext?.pageContext,
    observed_title: activeContext?.observed_title,
    observed_url: activeContext?.observed_url,
    isContextReady
  });

  const handleSend = () => {
    if (!promptInput.trim()) return;
    executeAction({
      action_id: 'custom_learning_query',
      label: promptInput.slice(0, 20),
      description: promptInput,
      icon: 'sparkles',
    });
    setPromptInput('');
  };

  const handleScanScreen = () => {
    if (!isContextReady) return;
    executeAction({
      action_id: 'explain',
      label: 'Screen Analysis',
      description: 'Analyze active learning screen content',
      icon: 'sparkles',
    });
  };

  const renderPerformanceMetrics = () => {
    // Only display metrics during local development (Vite dev mode)
    if (!import.meta.env.DEV) return null;
    if (!performanceMetrics) return null;

    const { firstOpenTime, ttft, totalDuration } = performanceMetrics;
    if (!firstOpenTime && !ttft && !totalDuration) return null;

    return (
      <div style={{
        display: 'flex',
        justifyContent: 'space-around',
        fontSize: '10px',
        color: 'var(--text-secondary)',
        paddingTop: '8px',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        width: '100%',
        maxWidth: isExpanded ? '850px' : '100%',
      }}>
        {firstOpenTime && <span>Open: {firstOpenTime}ms</span>}
        {ttft && <span>TTFT: {ttft}ms</span>}
        {totalDuration && <span>Stream: {totalDuration}ms</span>}
      </div>
    );
  };

  const [isFocused, setIsFocused] = useState(false);

  return (
    <div
      style={{
        padding: '14px 18px',
        backgroundColor: 'var(--bg-glass)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        borderTop: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        alignItems: 'center',
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.03)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', maxWidth: isExpanded ? '850px' : '100%' }}>
        {/* Compact Screen Analysis Trigger Icon (Law 3 Privacy Rules) */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleScanScreen}
          disabled={!isContextReady}
          title={isContextReady ? "Analyze Screen Content (Explicit User Permission)" : "Waiting for active page context synchronization..."}
          style={{ padding: '8px', opacity: isContextReady ? 1 : 0.4, cursor: isContextReady ? 'pointer' : 'not-allowed' }}
        >
          <Scan size={16} style={{ color: isContextReady ? 'var(--brand-primary)' : 'var(--text-muted)' }} />
        </Button>

        {/* Input Prompt Box */}
        <input
          type="text"
          placeholder="Ask Orvixa to explain, hint, or teach..."
          value={promptInput}
          onChange={(e) => setPromptInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={{
            flex: 1,
            padding: '9px 14px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--bg-surface-elevated)',
            border: isFocused ? '1px solid var(--brand-primary)' : '1px solid var(--border-color)',
            boxShadow: isFocused ? 'var(--shadow-aura)' : 'none',
            color: 'var(--text-primary)',
            fontSize: '0.85rem',
            outline: 'none',
            fontFamily: 'var(--font-sans)',
            transition: 'all var(--motion-fast) var(--easing-default)',
          }}
        />

        {/* Voice Assistant Activation Trigger (ChatGPT-Style Headphone Icon) */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsVoiceModeActive(true)}
          title="Start Immersive Voice Conversation"
          style={{ padding: '8px', cursor: 'pointer' }}
        >
          <Headphones size={16} style={{ color: 'var(--text-muted)' }} />
        </Button>

        <Button 
          variant="primary" 
          size="sm" 
          onClick={handleSend} 
          disabled={!promptInput.trim()}
          style={{
            boxShadow: promptInput.trim() ? '0 2px 8px rgba(124, 58, 237, 0.25)' : 'none',
            transition: 'all var(--motion-fast) var(--easing-default)',
          }}
        >
          <CornerDownLeft size={14} />
        </Button>
      </div>

      {renderPerformanceMetrics()}
    </div>
  );
};
