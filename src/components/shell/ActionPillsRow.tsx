import React from 'react';
import { useSidePanel } from '@/hooks/useSidePanel';
import { Button } from '@/components/ui/Button';
import { Code, Bug, GitCommit, FileText, ShieldAlert, Sparkles } from 'lucide-react';
import type { RecommendedAction } from '@/types/context';

export const ActionPillsRow: React.FC = () => {
  const { activeContext, executeAction, selectedAction, panelState } = useSidePanel();

  const defaultActions: RecommendedAction[] = [
    { action_id: 'explain_code', label: 'Explain Code', description: 'Explains active code snippet in 1 sentence', icon: 'code' },
    { action_id: 'trace_execution', label: 'Trace Execution', description: 'Traces execution flow and variables', icon: 'git-commit' },
    { action_id: 'find_bugs', label: 'Debug & Fix', description: 'Scans selected code for edge-case bugs', icon: 'bug' },
    { action_id: 'summarize_pr', label: 'Summarize PR', description: 'Generates 3-bullet PR summary', icon: 'file-text' },
  ];

  const actions = activeContext?.recommended_actions.length
    ? activeContext.recommended_actions
    : defaultActions;

  const renderIcon = (iconKey?: string) => {
    switch (iconKey) {
      case 'code':
        return <Code size={13} style={{ marginRight: '6px' }} />;
      case 'bug':
        return <Bug size={13} style={{ marginRight: '6px' }} />;
      case 'git-commit':
        return <GitCommit size={13} style={{ marginRight: '6px' }} />;
      case 'file-text':
        return <FileText size={13} style={{ marginRight: '6px' }} />;
      case 'shield-alert':
        return <ShieldAlert size={13} style={{ marginRight: '6px' }} />;
      default:
        return <Sparkles size={13} style={{ marginRight: '6px' }} />;
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 16px',
        backgroundColor: 'var(--bg-primary)',
        borderBottom: '1px solid var(--border-color)',
        overflowX: 'auto',
        scrollbarWidth: 'none',
      }}
    >
      {actions.map((action) => {
        const isSelected = selectedAction?.action_id === action.action_id;
        const isLoading = isSelected && (panelState === 'THINKING' || panelState === 'STREAMING');

        return (
          <Button
            key={action.action_id}
            variant={isSelected ? 'glow' : 'secondary'}
            size="sm"
            disabled={isLoading}
            onClick={() => executeAction(action)}
            style={{ flexShrink: 0, fontSize: '0.8rem' }}
          >
            {renderIcon(action.icon)}
            {action.label}
          </Button>
        );
      })}
    </div>
  );
};
