import React from 'react';
import { useSidePanel } from '@/hooks/useSidePanel';
import { Button } from '@/components/ui/Button';
import { BookOpen, HelpCircle, GraduationCap, Target, Users, Sparkles } from 'lucide-react';
import type { RecommendedAction } from '@/types/context';

export const ActionPillsRow: React.FC = () => {
  const { executeAction, selectedAction, panelState } = useSidePanel();

  const learningActions: RecommendedAction[] = [
    { action_id: 'explain', label: 'Explain', description: 'Explain Binary Search algorithm', icon: 'book' },
    { action_id: 'hint', label: 'Socratic Hint', description: 'Give me a progressive hint ladder', icon: 'hint' },
    { action_id: 'teach', label: 'Teach Deeply', description: 'Stepwise pedagogical walkthrough', icon: 'teach' },
    { action_id: 'practice', label: 'Practice Quiz', description: 'Generate practice exercise', icon: 'target' },
    { action_id: 'interview', label: 'Mock Interview', description: 'Start technical roleplay interview', icon: 'users' },
  ];

  const renderIcon = (iconKey?: string) => {
    switch (iconKey) {
      case 'book':
        return <BookOpen size={13} style={{ marginRight: '6px' }} />;
      case 'hint':
        return <HelpCircle size={13} style={{ marginRight: '6px' }} />;
      case 'teach':
        return <GraduationCap size={13} style={{ marginRight: '6px' }} />;
      case 'target':
        return <Target size={13} style={{ marginRight: '6px' }} />;
      case 'users':
        return <Users size={13} style={{ marginRight: '6px' }} />;
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
      {learningActions.map((action) => {
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
