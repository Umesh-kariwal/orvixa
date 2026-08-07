import React from 'react';
import { useSidePanel } from '@/hooks/useSidePanel';
import { Button } from '@/components/ui/Button';
import {
  X,
  Maximize2,
  Minimize2,
  Layers,
  GraduationCap,
  Settings,
  Trash2,
} from 'lucide-react';

export const TopBar: React.FC = () => {
  const {
    closePanel,
    isExpanded,
    toggleExpand,
    panelMode,
    togglePanelMode,
    activeContext,
    currentView,
    setCurrentView,
    resetSession,
    conversationHistory,
  } = useSidePanel();

  const titleText = activeContext?.sanitized_summary || 'Universal Learning Copilot';

  const getContextBadgeLabel = () => {
    if (!activeContext || !activeContext.pageContext) {
      return 'Syncing...';
    }
    const { observed_url, pageContext, inferred_category } = activeContext;
    const url = observed_url?.toLowerCase() || '';
    const category = (inferred_category || pageContext?.platform || '').toLowerCase();

    if (url.includes('leetcode.com')) {
      return 'LeetCode Problem';
    }
    if (url.includes('wikipedia.org')) {
      return 'Wikipedia Article';
    }
    if (url.includes('google.com') || url.includes('google.co.in')) {
      return 'Google Search';
    }
    if (url.includes('github.com')) {
      return 'GitHub Repository';
    }
    if (url.includes('notion.so') || url.includes('notion.site')) {
      return 'Notion Page';
    }
    if (category === 'code') {
      return 'Code Workspace';
    }
    if (category === 'docs') {
      return 'Article Context';
    }
    return 'Context Ready';
  };

  // Onboarding View is dedicated; hide non-essential toggle icons
  if (currentView === 'onboarding') {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          backgroundColor: 'var(--bg-glass)',
          backdropFilter: 'var(--glass-blur)',
          WebkitBackdropFilter: 'var(--glass-blur)',
          borderBottom: '1px solid var(--border-color)',
          userSelect: 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--brand-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
            }}
          >
            <GraduationCap size={16} />
          </div>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Welcome to Orvixa
          </span>
        </div>
        <Button variant="ghost" size="sm" onClick={closePanel}>
          <X size={16} />
        </Button>
      </div>
    );
  }

  if (panelMode === 'floating') {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '6px 12px',
          backgroundColor: 'var(--bg-glass)',
          backdropFilter: 'var(--glass-blur)',
          WebkitBackdropFilter: 'var(--glass-blur)',
          borderBottom: '1px solid var(--border-color)',
          userSelect: 'none',
          width: '100%',
        }}
      >
        {/* Left: Simplified Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {titleText.length > 25 ? titleText.slice(0, 25) + '...' : titleText}
          </span>
        </div>

        {/* Right: Only Essential Buttons (Dock Switch & Close) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={togglePanelMode} 
            title="Switch to Dock Mode"
            aria-label="Switch to Dock Mode"
          >
            <Layers size={14} />
          </Button>

          <Button 
            variant="ghost" 
            size="sm" 
            onClick={closePanel} 
            title="Close Panel"
            aria-label="Close Panel"
          >
            <X size={16} />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', userSelect: 'none', borderBottom: '1px solid var(--border-color)' }}>
      {/* Row 1: Header Brand & Application Controls */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 16px',
          backgroundColor: 'var(--bg-glass)',
          backdropFilter: 'var(--glass-blur)',
          WebkitBackdropFilter: 'var(--glass-blur)',
        }}
      >
        {/* Left: Brand Logo & Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            onClick={() => setCurrentView('learning')}
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '8px',
              backgroundColor: 'var(--brand-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-sm)',
            }}
            title="Return to Learning Thread"
          >
            <GraduationCap size={13} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              Orvixa
            </span>
            {activeContext && activeContext.pageContext ? (
              <span 
                style={{ 
                  width: '6px', 
                  height: '6px', 
                  borderRadius: '50%', 
                  backgroundColor: 'var(--emerald-primary)',
                  boxShadow: '0 0 6px var(--emerald-primary)',
                  display: 'inline-block',
                  cursor: 'help',
                }} 
                title={`Synced Context: ${titleText}`}
              />
            ) : (
              <span 
                style={{ 
                  width: '6px', 
                  height: '6px', 
                  borderRadius: '50%', 
                  backgroundColor: 'var(--amber-primary)',
                  boxShadow: '0 0 6px var(--amber-primary)',
                  display: 'inline-block',
                  cursor: 'help',
                }} 
                title="Synchronizing page elements..."
              />
            )}
          </div>
        </div>

        {/* Center: Full Context Badge capsule (Only when expanded) */}
        {isExpanded && activeContext && activeContext.pageContext && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.15)',
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '0.68rem',
            color: 'var(--emerald-primary)',
            fontWeight: 700,
            maxWidth: '320px',
          }}>
            <span style={{ 
              width: '4px', 
              height: '4px', 
              borderRadius: '50%', 
              backgroundColor: '#10b981',
              display: 'inline-block' 
            }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {getContextBadgeLabel()}: {titleText}
            </span>
          </div>
        )}

        {/* Right: Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', paddingRight: '4px' }}>
          {conversationHistory.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetSession}
              title="Reset Chat Session"
              aria-label="Reset Chat Session"
              style={{ padding: '6px', color: 'var(--rose-primary)', width: '28px', height: '28px', borderRadius: '50%' }}
            >
              <Trash2 size={13} />
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentView(currentView === 'settings' ? 'learning' : 'settings')}
            title="Settings Configuration"
            aria-label="Settings Configuration"
            style={{ padding: '6px', width: '28px', height: '28px', borderRadius: '50%' }}
          >
            <Settings size={13} style={{ color: currentView === 'settings' ? 'var(--brand-primary)' : 'inherit' }} />
          </Button>

          <Button 
            variant="ghost" 
            size="sm" 
            onClick={togglePanelMode} 
            title={`Switch to ${panelMode === 'dock' ? 'Floating' : 'Dock'} Mode`}
            aria-label={`Switch to ${panelMode === 'dock' ? 'Floating' : 'Dock'} Mode`}
            style={{ padding: '6px', width: '28px', height: '28px', borderRadius: '50%' }}
          >
            <Layers size={13} />
          </Button>

          <Button 
            variant="ghost" 
            size="sm" 
            onClick={toggleExpand} 
            title={isExpanded ? 'Restore Dock' : 'Expand Panel'}
            aria-label={isExpanded ? 'Restore Dock' : 'Expand Panel'}
            style={{ padding: '6px', width: '28px', height: '28px', borderRadius: '50%' }}
          >
            {isExpanded ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
          </Button>

          <Button 
            variant="ghost" 
            size="sm" 
            onClick={closePanel} 
            title="Collapse Panel (Esc)"
            aria-label="Collapse Panel"
            style={{ padding: '6px', width: '28px', height: '28px', borderRadius: '50%' }}
          >
            <X size={14} />
          </Button>
        </div>
      </div>
    </div>
  );
};
