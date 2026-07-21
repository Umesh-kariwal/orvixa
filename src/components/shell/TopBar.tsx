import React from 'react';
import { useSidePanel } from '@/hooks/useSidePanel';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { X, Maximize2, Minimize2, Settings, ShieldCheck, GraduationCap } from 'lucide-react';

export const TopBar: React.FC = () => {
  const { closePanel, isExpanded, toggleExpand, activeContext } = useSidePanel();

  const titleText = activeContext?.sanitized_summary || 'Universal Learning Copilot';
  const confidenceTier = activeContext?.confidence_tier || 'HIGH';
  const confidenceScore = activeContext?.confidence_score || 0.98;

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

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {titleText.length > 22 ? titleText.slice(0, 22) + '...' : titleText}
          </span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            Orvixa Learning Layer
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

      {/* Right: Controls (Expand, Settings, Collapse) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <Button variant="ghost" size="sm" onClick={toggleExpand} title={isExpanded ? 'Restore Dock' : 'Expand Panel'}>
          {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
        </Button>

        <Button variant="ghost" size="sm" title="Orvixa Settings">
          <Settings size={14} />
        </Button>

        <Button variant="ghost" size="sm" onClick={closePanel} title="Collapse Panel (Esc)">
          <X size={16} />
        </Button>
      </div>
    </div>
  );
};
