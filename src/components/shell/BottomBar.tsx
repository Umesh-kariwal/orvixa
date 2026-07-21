import React, { useState } from 'react';
import { useSidePanel } from '@/hooks/useSidePanel';
import { Button } from '@/components/ui/Button';
import { MessageSquarePlus, CornerDownLeft } from 'lucide-react';

export const BottomBar: React.FC = () => {
  const { executeAction } = useSidePanel();
  const [showChatFallback, setShowChatFallback] = useState<boolean>(false);
  const [promptInput, setPromptInput] = useState<string>('');

  const handleSend = () => {
    if (!promptInput.trim()) return;
    executeAction({
      action_id: 'custom_query',
      label: promptInput.slice(0, 20),
      description: promptInput,
      icon: 'sparkles',
    });
    setPromptInput('');
  };

  return (
    <div
      style={{
        padding: '12px 16px',
        backgroundColor: 'var(--bg-surface)',
        borderTop: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
    >
      {!showChatFallback ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            ✦ Context derived automatically from host page
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowChatFallback(true)}
            style={{ fontSize: '0.75rem', gap: '4px' }}
          >
            <MessageSquarePlus size={13} /> Ask Fallback Question
          </Button>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="text"
            placeholder="Type optional prompt fallback..."
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
      )}
    </div>
  );
};
