import React from 'react';
import { useSidePanel } from '@/hooks/useSidePanel';
import { Card } from '@/components/ui/Card';
import { Heading, Text } from '@/components/ui/Typography';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { OrvixaIntentRenderer } from '@/components/renderers/OrvixaIntentRenderer';
import { OnboardingView } from '@/components/views/OnboardingView';
import { SettingsView } from '@/components/views/SettingsView';
import { PrivacyDashboard } from '@/components/views/PrivacyDashboard';
import { Sparkles, AlertCircle, RefreshCw, Trash2, ArrowRight } from 'lucide-react';

export const ContentAreaHost: React.FC = () => {
  const {
    panelState,
    selectedAction,
    streamingText,
    errorMessage,
    conversationHistory,
    thinkingStep,
    currentView,
    resetSession,
    executeAction,
  } = useSidePanel();

  // Route Views based on Current Settings View Selection
  if (currentView === 'onboarding') {
    return <OnboardingView />;
  }
  if (currentView === 'settings') {
    return <SettingsView />;
  }
  if (currentView === 'privacy') {
    return <PrivacyDashboard />;
  }

  // Clear Session Action Link
  const renderResetHeader = () => {
    if (conversationHistory.length === 0) return null;
    return (
      <div style={{ display: 'flex', justifyContent: 'flex-end', paddingBottom: '12px' }}>
        <Button variant="ghost" size="sm" onClick={resetSession} style={{ color: 'var(--rose-primary)', gap: '4px' }}>
          <Trash2 size={13} /> Reset Learning Session
        </Button>
      </div>
    );
  };

  // Adaptive Follow-up Choices (Dynamic learning path builder)
  const renderFollowUps = () => {
    if (panelState !== 'READY' && panelState !== 'IDLE') return null;
    if (conversationHistory.length === 0) return null;

    const followUpOptions = [
      { action_id: 'explain', label: 'Explain Deeper', icon: 'book' },
      { action_id: 'teach', label: 'Give Socratic Clues', icon: 'hint' },
      { action_id: 'practice', label: 'Show Practice Quiz', icon: 'target' },
      { action_id: 'interview', label: 'Common Pitfalls & Mistakes', icon: 'users' },
    ];

    return (
      <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <Text variant="secondary" style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Next Pedagogical Suggestions:
        </Text>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {followUpOptions.map((opt) => (
            <Button
              key={opt.action_id}
              variant="secondary"
              size="sm"
              style={{ fontSize: '0.75rem', gap: '4px' }}
              onClick={() =>
                executeAction({
                  action_id: opt.action_id,
                  label: opt.label,
                  description: `Follow-up: ${opt.label}`,
                })
              }
            >
              {opt.label} <ArrowRight size={10} />
            </Button>
          ))}
        </div>
      </div>
    );
  };

  // Structured Loader Messaging based on active thinking steps
  if (panelState === 'THINKING') {
    let loaderMessage = 'Analyzing page elements...';
    if (thinkingStep === 'intent') loaderMessage = 'Detecting domain intent...';
    if (thinkingStep === 'explanation') loaderMessage = 'Structuring learning cards...';

    return (
      <div style={{ padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Card variant="glass" glow style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <RefreshCw size={20} style={{ animation: 'spin 1.2s linear infinite', color: 'var(--brand-primary)' }} />
          <div>
            <Heading level={4}>Orvixa Learning Engine</Heading>
            <Text variant="secondary">{loaderMessage}</Text>
          </div>
        </Card>
      </div>
    );
  }

  // Error Recovery & Auto-Retry Action (Friendly messages)
  if (panelState === 'ERROR') {
    return (
      <div style={{ padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <Card variant="amber">
          <Heading level={4} style={{ color: 'var(--rose-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={18} /> Connection Interrupted
          </Heading>
          <Text variant="secondary">
            {errorMessage || 'Failed to reach the AI server. Please verify your internet connection or check your custom Gemini API key.'}
          </Text>
        </Card>
        <Button
          variant="glow"
          onClick={() =>
            executeAction(
              selectedAction || {
                action_id: 'explain',
                label: 'Explain',
                description: 'Explain active context',
              }
            )
          }
        >
          Retry Connection
        </Button>
      </div>
    );
  }

  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {renderResetHeader()}

      {/* Render Conversation Thread History */}
      {conversationHistory.map((msg, index) => {
        const isUser = msg.role === 'user';
        return (
          <div
            key={index}
            style={{
              alignSelf: isUser ? 'flex-end' : 'flex-start',
              maxWidth: '90%',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}
          >
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: isUser ? 'right' : 'left' }}>
              {isUser ? 'Learner' : 'AI Copilot'}
            </span>
            <div
              style={{
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: isUser ? 'var(--brand-primary)' : 'var(--bg-primary)',
                color: isUser ? '#ffffff' : 'var(--text-primary)',
                fontSize: '0.85rem',
                border: isUser ? 'none' : '1px solid var(--border-color)',
              }}
            >
              {msg.text}
            </div>
          </div>
        );
      })}

      {/* Render Active Streaming Tokens */}
      {panelState === 'STREAMING' && (
        <div style={{ alignSelf: 'flex-start', width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Badge variant="mastery" icon={<Sparkles size={12} />}>
              {selectedAction?.label || 'Streaming Cards'}
            </Badge>
            <Text variant="muted">Live Stream</Text>
          </div>

          <OrvixaIntentRenderer
            rawPayload={{
              intent_type: selectedAction?.action_id === 'hint' ? 'SOCRATIC_HINT' : 'SAFE_MARKDOWN',
              confidence: 0.98,
              summary: streamingText,
              structured_data: { markdown: streamingText },
              is_streaming: true,
            }}
            isStreaming={true}
          />
        </div>
      )}

      {/* Idle / Initial Landing Guide */}
      {conversationHistory.length === 0 && panelState === 'READY' && (
        <div
          style={{
            padding: '32px 16px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius-pill)',
              backgroundColor: 'var(--amber-bg)',
              border: '1px solid var(--amber-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--amber-primary)',
            }}
          >
            <Sparkles size={24} />
          </div>
          <Heading level={3}>Orvixa Learning Experience</Heading>
          <Text variant="secondary" style={{ textAlign: 'center', maxWidth: '300px' }}>
            Highlight any text or click an action pill above to begin your interactive learning journey.
          </Text>
        </div>
      )}

      {renderFollowUps()}
    </div>
  );
};
