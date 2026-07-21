import React from 'react';
import { useSidePanel } from '@/hooks/useSidePanel';
import { Button } from '@/components/ui/Button';
import { Code, Bug, GitCommit, FileText, HelpCircle, Activity, Sparkles } from 'lucide-react';
import type { RecommendedAction } from '@/types/context';

export const ActionPillsRow: React.FC = () => {
  const { activeContext, executeAction, selectedAction, panelState } = useSidePanel();

  const isGitHub = activeContext?.primary_intent?.toLowerCase().includes('github') ||
                   activeContext?.sanitized_summary?.toLowerCase().includes('github');

  const githubActions: RecommendedAction[] = [
    { action_id: 'explain_code', label: 'Explain Code', description: 'Explains active code snippet in 1 sentence', icon: 'code' },
    { action_id: 'review_pr', label: 'PR Review', description: 'Generates PR summary, risk analysis & review order', icon: 'file-text' },
    { action_id: 'commit_summary', label: 'Commit Summary', description: 'Explains commit changes and impact', icon: 'git-commit' },
    { action_id: 'debug_assistant', label: 'Debug & Fix', description: 'Scans for stack trace or bug root cause', icon: 'bug' },
    { action_id: 'trace_execution', label: 'Trace Execution', description: 'Traces execution flow and dependencies', icon: 'activity' },
    { action_id: 'codebase_qa', label: 'Codebase Q&A', description: 'Answers contextual code questions', icon: 'help' },
  ];

  const defaultActions: RecommendedAction[] = [
    { action_id: 'explain_code', label: 'Explain Code', description: 'Explains active code snippet in 1 sentence', icon: 'code' },
    { action_id: 'trace_execution', label: 'Trace Execution', description: 'Traces execution flow and variables', icon: 'activity' },
    { action_id: 'debug_assistant', label: 'Debug & Fix', description: 'Scans selected code for edge-case bugs', icon: 'bug' },
  ];

  const actions = isGitHub ? githubActions : defaultActions;

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
      case 'activity':
        return <Activity size={13} style={{ marginRight: '6px' }} />;
      case 'help':
        return <HelpCircle size={13} style={{ marginRight: '6px' }} />;
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
