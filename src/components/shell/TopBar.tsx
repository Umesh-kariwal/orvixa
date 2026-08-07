import React from 'react';
import { useSidePanel } from '@/hooks/useSidePanel';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  X,
  Maximize2,
  Minimize2,
  Layers,
  ShieldCheck,
  GraduationCap,
  Settings,
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
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', userSelect: 'none' }}>
      {/* Row 1: Header Brand & Application Controls */}
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
        }}
      >
        {/* Left: Brand Logo & Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div
            onClick={() => setCurrentView('learning')}
            style={{
              width: '20px',
              height: '20px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--brand-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              cursor: 'pointer',
            }}
            title="Return to Learning Thread"
          >
            <GraduationCap size={12} />
          </div>
          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '0.5px' }}>
            Orvixa
          </span>
        </div>

        {/* Right: Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentView(currentView === 'settings' ? 'learning' : 'settings')}
            title="Settings Configuration"
            aria-label="Settings Configuration"
            style={{ padding: '4px' }}
          >
            <Settings size={14} style={{ color: currentView === 'settings' ? 'var(--brand-primary)' : 'inherit' }} />
          </Button>

          <Button 
            variant="ghost" 
            size="sm" 
            onClick={togglePanelMode} 
            title={`Switch to ${panelMode === 'dock' ? 'Floating' : 'Dock'} Mode`}
            aria-label={`Switch to ${panelMode === 'dock' ? 'Floating' : 'Dock'} Mode`}
            style={{ padding: '4px' }}
          >
            <Layers size={14} />
          </Button>

          <Button 
            variant="ghost" 
            size="sm" 
            onClick={toggleExpand} 
            title={isExpanded ? 'Restore Dock' : 'Expand Panel'}
            aria-label={isExpanded ? 'Restore Dock' : 'Expand Panel'}
            style={{ padding: '4px' }}
          >
            {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </Button>

          <Button 
            variant="ghost" 
            size="sm" 
            onClick={closePanel} 
            title="Collapse Panel (Esc)"
            aria-label="Collapse Panel"
            style={{ padding: '4px' }}
          >
            <X size={16} />
          </Button>
        </div>
      </div>

      {/* Row 2: Active Page Context Information */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '4px 12px',
          backgroundColor: 'var(--bg-primary)',
          borderBottom: '1px solid var(--border-color)',
        }}
      >
        {/* Left: Glowing indicator dot and Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0, flex: 1 }}>
          <span 
            style={{ 
              width: '6px', 
              height: '6px', 
              borderRadius: '50%', 
              backgroundColor: activeContext && activeContext.pageContext ? '#10b981' : '#f59e0b',
              boxShadow: activeContext && activeContext.pageContext ? '0 0 8px #10b981' : '0 0 8px #f59e0b',
              flexShrink: 0
            }} 
          />
          <span 
            style={{ 
              fontSize: '0.72rem', 
              color: 'var(--text-secondary)', 
              fontWeight: 500,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
            title={titleText}
          >
            {titleText}
          </span>
        </div>

        {/* Right: Badge */}
        <div className="topbar-badge" style={{ flexShrink: 0, marginLeft: '8px' }}>
          <Badge
            variant={activeContext && activeContext.pageContext ? 'mastery' : 'amber'}
            icon={<ShieldCheck size={10} />}
          >
            {getContextBadgeLabel()}
          </Badge>
        </div>
      </div>
    </div>
  );
};
