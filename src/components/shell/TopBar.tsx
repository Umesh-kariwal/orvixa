import React from 'react';
import { useSidePanel } from '@/hooks/useSidePanel';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  X,
  Maximize2,
  Minimize2,
  Pin,
  PinOff,
  Layout,
  Layers,
  ShieldCheck,
  GraduationCap,
  Settings,
  Shield,
} from 'lucide-react';

export const TopBar: React.FC = () => {
  const {
    closePanel,
    isExpanded,
    toggleExpand,
    panelMode,
    togglePanelMode,
    isPinned,
    togglePin,
    activeContext,
    currentView,
    setCurrentView,
  } = useSidePanel();

  const titleText = activeContext?.sanitized_summary || 'Universal Learning Copilot';
  const confidenceTier = activeContext?.confidence_tier || 'HIGH';
  const confidenceScore = activeContext?.confidence_score || 0.98;

  // Onboarding View is dedicated; hide non-essential toggle icons
  if (currentView === 'onboarding') {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          backgroundColor: 'var(--bg-surface)',
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

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        backgroundColor: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-color)',
        userSelect: 'none',
      }}
    >
      {/* Left: Learning Icon & Context Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div
          onClick={() => setCurrentView('learning')}
          style={{
            width: '28px',
            height: '28px',
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
          <GraduationCap size={16} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {titleText.length > 22 ? titleText.slice(0, 22) + '...' : titleText}
          </span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            Orvixa Learning Layer ({panelMode.toUpperCase()})
          </span>
        </div>
      </div>

      {/* Center: Confidence Badge */}
      <Badge
        variant={confidenceTier === 'HIGH' ? 'mastery' : 'amber'}
        icon={<ShieldCheck size={12} />}
      >
        {confidenceTier} ({Math.round(confidenceScore * 100)}%)
      </Badge>

      {/* Right: Controls (Privacy, Settings, Pin, Mode, Expand, Collapse) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCurrentView(currentView === 'privacy' ? 'learning' : 'privacy')}
          title="Privacy Dashboard"
          aria-label="Privacy Dashboard"
        >
          <Shield size={14} style={{ color: currentView === 'privacy' ? '#10b981' : 'inherit' }} />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCurrentView(currentView === 'settings' ? 'learning' : 'settings')}
          title="Settings Configuration"
          aria-label="Settings Configuration"
        >
          <Settings size={14} style={{ color: currentView === 'settings' ? '#a78bfa' : 'inherit' }} />
        </Button>

        <Button 
          variant="ghost" 
          size="sm" 
          onClick={togglePin} 
          title={isPinned ? 'Unpin Panel' : 'Pin Panel'}
          aria-label={isPinned ? 'Unpin Panel' : 'Pin Panel'}
        >
          {isPinned ? <PinOff size={14} style={{ color: 'var(--amber-primary)' }} /> : <Pin size={14} />}
        </Button>

        <Button 
          variant="ghost" 
          size="sm" 
          onClick={togglePanelMode} 
          title={`Switch to ${panelMode === 'dock' ? 'Floating' : 'Dock'} Mode`}
          aria-label={`Switch to ${panelMode === 'dock' ? 'Floating' : 'Dock'} Mode`}
        >
          {panelMode === 'dock' ? <Layers size={14} /> : <Layout size={14} />}
        </Button>

        <Button 
          variant="ghost" 
          size="sm" 
          onClick={toggleExpand} 
          title={isExpanded ? 'Restore Dock' : 'Expand Panel'}
          aria-label={isExpanded ? 'Restore Dock' : 'Expand Panel'}
        >
          {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
        </Button>

        <Button 
          variant="ghost" 
          size="sm" 
          onClick={closePanel} 
          title="Collapse Panel (Esc)"
          aria-label="Collapse Panel"
        >
          <X size={16} />
        </Button>
      </div>
    </div>
  );
};
