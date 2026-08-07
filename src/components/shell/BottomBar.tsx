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
        padding: '16px 20px 24px 20px',
        backgroundColor: 'var(--bg-primary)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        alignItems: 'center',
        width: '100%',
      }}
    >
      <div 
        style={{ 
          display: 'flex', 
          flexDirection: 'column',
          width: '100%', 
          maxWidth: isExpanded ? '800px' : '100%',
          backgroundColor: 'var(--bg-surface)',
          border: isFocused ? '1px solid var(--brand-primary)' : '1px solid var(--border-color)',
          borderRadius: '20px',
          padding: '8px 12px',
          boxShadow: isFocused ? 'var(--shadow-aura)' : 'var(--shadow-sm)',
          transition: 'all var(--motion-fast) var(--easing-default)',
        }}
      >
        <textarea
          rows={1}
          placeholder="Ask Orvixa to explain, hint, or teach..."
          value={promptInput}
          onChange={(e) => setPromptInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={{
            width: '100%',
            backgroundColor: 'transparent',
            border: 'none',
            color: 'var(--text-primary)',
            fontSize: '0.85rem',
            outline: 'none',
            fontFamily: 'var(--font-sans)',
            resize: 'none',
            maxHeight: '120px',
            padding: '4px 6px',
            lineHeight: '1.5',
          }}
        />

        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginTop: '6px',
          paddingTop: '6px',
          borderTop: promptInput.trim() || isFocused ? '1px solid var(--border-color)' : '1px solid transparent',
          transition: 'border-color var(--motion-fast) var(--easing-default)',
        }}>
          {/* Left Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleScanScreen}
              disabled={!isContextReady}
              title={isContextReady ? "Analyze Screen Content" : "Waiting for page context..."}
              style={{ 
                padding: '6px', 
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                opacity: isContextReady ? 1 : 0.4, 
                cursor: isContextReady ? 'pointer' : 'not-allowed' 
              }}
            >
              <Scan size={14} style={{ color: isContextReady ? 'var(--brand-primary)' : 'var(--text-muted)' }} />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVoiceModeActive(true)}
              title="Start Voice Session"
              style={{ 
                padding: '6px',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                cursor: 'pointer' 
              }}
            >
              <Headphones size={14} style={{ color: 'var(--text-muted)' }} />
            </Button>
          </div>

          {/* Right Send Button */}
          <Button 
            variant="primary" 
            size="sm" 
            onClick={handleSend} 
            disabled={!promptInput.trim()}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              padding: 0,
              backgroundColor: promptInput.trim() ? 'var(--brand-primary)' : 'var(--border-color)',
              color: promptInput.trim() ? '#ffffff' : 'var(--text-muted)',
              transition: 'all var(--motion-fast) var(--easing-default)',
            }}
          >
            <CornerDownLeft size={13} />
          </Button>
        </div>
      </div>

      {renderPerformanceMetrics()}
    </div>
  );
};
