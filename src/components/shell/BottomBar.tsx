import React, { useState } from 'react';
import { useSidePanel } from '@/hooks/useSidePanel';
import { Button } from '@/components/ui/Button';
import { CornerDownLeft, Scan } from 'lucide-react';

export const BottomBar: React.FC = () => {
  const { executeAction } = useSidePanel();
  const [promptInput, setPromptInput] = useState<string>('');

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
    executeAction({
      action_id: 'explain',
      label: 'Screen Analysis',
      description: 'Analyze active learning screen content',
      icon: 'sparkles',
    });
  };

  return (
    <div
      style={{
        padding: '12px 16px',
        backgroundColor: 'var(--bg-surface)',
        borderTop: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}
    >
      {/* Compact Screen Analysis Trigger Icon (Law 3 Privacy Rules) */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleScanScreen}
        title="Analyze Screen Content (Explicit User Permission)"
        style={{ padding: '8px' }}
      >
        <Scan size={16} style={{ color: 'var(--brand-primary)' }} />
      </Button>

      {/* Input Prompt Box */}
      <input
        type="text"
        placeholder="Ask Orvixa to explain, hint, or teach..."
        value={promptInput}
        onChange={(e) => setPromptInput(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        style={{
          flex: 1,
          padding: '8px 12px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--bg-primary)',
          border: '1px solid var(--border-color)',
          color: 'var(--text-primary)',
          fontSize: '0.85rem',
          outline: 'none',
          fontFamily: 'var(--font-sans)',
        }}
      />

      <Button variant="primary" size="sm" onClick={handleSend} disabled={!promptInput.trim()}>
        <CornerDownLeft size={14} />
      </Button>
    </div>
  );
};
