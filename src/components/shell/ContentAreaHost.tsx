import React, { useState } from 'react';
import { useSidePanel } from '@/hooks/useSidePanel';
import { useVoice } from '@/hooks/useVoice';
import { Card } from '@/components/ui/Card';
import { Heading, Text } from '@/components/ui/Typography';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { OrvixaIntentRenderer } from '@/components/renderers/OrvixaIntentRenderer';
import { OnboardingView } from '@/components/views/OnboardingView';
import { 
  Sparkles, 
  AlertCircle, 
  RefreshCw, 
  Compass, 
  HelpCircle, 
  BookOpen, 
  Award,
  Copy,
  Check,
  Volume2
} from 'lucide-react';

export const ContentAreaHost: React.FC = () => {
  const {
    panelState,
    selectedAction,
    streamingText,
    errorMessage,
    conversationHistory,
    thinkingStep,
    currentView,
    executeAction,
    activeContext,
    isExpanded,
  } = useSidePanel();

  const { speakText, isSpeaking, stopSpeaking } = useVoice();
  const [copiedMessageIndex, setCopiedMessageIndex] = useState<number | null>(null);

  // Route Views based on Current Settings View Selection
  if (currentView === 'onboarding') {
    return <OnboardingView />;
  }

  // Render Welcome Landing Screen when chat history is empty
  const renderWelcomeLanding = () => {
    if (conversationHistory.length !== 0 || panelState !== 'READY') return null;

    const quickActions = [
      { id: 'explain', title: 'Explain Concept', desc: 'Get a thorough, clear breakdown of what is on your screen right now.', icon: <Compass size={18} /> },
      { id: 'hint', title: 'Socratic Hint Ladder', desc: 'Ask step-by-step questions to guide you to the solution without spoiling it.', icon: <HelpCircle size={18} /> },
      { id: 'teach', title: 'Deep Walkthrough', desc: 'Go through a detailed walkthrough of the entire page content.', icon: <BookOpen size={18} /> },
      { id: 'practice_quiz', title: 'Practice Quiz', desc: 'Generate test questions on the active topic to practice.', icon: <Award size={18} /> }
    ];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', padding: '16px 0' }}>
        {/* Welcome Hero */}
        <div style={{
          textAlign: 'center',
          padding: '36px 24px',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-md)',
          position: 'relative',
          overflow: 'hidden',
          backdropFilter: 'var(--glass-blur)',
          WebkitBackdropFilter: 'var(--glass-blur)',
        }}>
          {/* Futuristic ambient radial glow */}
          <div style={{
            position: 'absolute',
            top: '-50%',
            left: '-50%',
            width: '200%',
            height: '200%',
            background: 'radial-gradient(circle at center, rgba(129, 140, 248, 0.08) 0%, transparent 60%)',
            pointerEvents: 'none',
          }} />

          <Heading level={2} style={{ 
            fontSize: '1.4rem', 
            fontWeight: 800, 
            marginBottom: '8px', 
            color: 'var(--text-primary)', 
            letterSpacing: '-0.03em',
            position: 'relative'
          }}>
            Welcome to Orvixa
          </Heading>
          <Text variant="secondary" style={{ 
            fontSize: '0.82rem', 
            maxWidth: '460px', 
            margin: '0 auto', 
            color: 'var(--text-secondary)', 
            lineHeight: '1.5',
            position: 'relative' 
          }}>
            Your universal learning copilot. I am synced with your active browser screen. Select an option below or type a message to start.
          </Text>
        </div>

        {/* Quick Actions Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Text variant="secondary" style={{ fontWeight: 800, fontSize: '0.8rem', color: 'var(--text-primary)', paddingLeft: '4px', letterSpacing: '-0.01em', textTransform: 'uppercase', opacity: 0.8 }}>
            What would you like to do?
          </Text>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isExpanded ? 'repeat(2, 1fr)' : '1fr',
            gap: '14px',
          }}>
            {quickActions.map((act) => (
              <div
                key={act.id}
                onClick={() => executeAction({
                  action_id: act.id,
                  label: act.title,
                  description: act.desc,
                  icon: 'sparkles'
                })}
                style={{
                  padding: '16px',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  cursor: 'pointer',
                  display: 'flex',
                  gap: '14px',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'all var(--motion-fast) ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.borderColor = 'var(--brand-primary)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                }}
              >
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(99, 102, 241, 0.05)',
                  border: '1px solid rgba(99, 102, 241, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--brand-primary)',
                  flexShrink: 0,
                }}>
                  {act.icon}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>{act.title}</span>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', lineHeight: '1.35' }}>{act.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderScreenContextCard = () => {
    if (!activeContext || !activeContext.pageContext) return null;
    const { pageTitle, topic, hostname, platform, difficulty, questionCount } = activeContext.pageContext;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.78rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Host Resource:</span>
          <span style={{ fontWeight: 700 }}>{hostname}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Detected Platform:</span>
          <span style={{ fontWeight: 700, textTransform: 'capitalize' }}>{platform.replace('_', ' ')}</span>
        </div>
        {topic && (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Subject:</span>
            <span style={{ fontWeight: 700 }}>{topic}</span>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Difficulty Estimation:</span>
          <span style={{ fontWeight: 700, color: 'var(--amber-primary)', textTransform: 'uppercase' }}>{difficulty}</span>
        </div>
        {questionCount > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Evaluated Problems:</span>
            <span style={{ fontWeight: 700 }}>{questionCount}</span>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Title:</span>
          <span style={{ fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '180px' }}>{pageTitle}</span>
        </div>
      </div>
    );
  };

  const renderActiveContextBlock = () => {
    if (!activeContext || !activeContext.pageContext) return null;
    const isReady = activeContext.observed_title !== 'orvixa' && !activeContext.observed_url?.startsWith('chrome-extension://');
    if (!isReady) return null;

    return (
      <div style={{ margin: '0 0 16px 0', width: '100%' }}>
        <details style={{
          backgroundColor: 'rgba(255, 255, 255, 0.01)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          padding: '8px 12px',
        }}>
          <summary style={{
            fontSize: '0.72rem',
            fontWeight: 800,
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            userSelect: 'none',
            outline: 'none',
          }}>
            🎯 Study Environment Context Loaded
          </summary>
          <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid var(--border-color)' }}>
            {renderScreenContextCard()}
          </div>
        </details>
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
    <div style={{
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      maxWidth: isExpanded ? '850px' : '100%',
      margin: isExpanded ? '0 auto' : '0',
      width: '100%'
    }}>

      {/* Render Active Page Context Card */}
      {renderActiveContextBlock()}

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
              {isUser ? 'Learner' : 'Orvixa'}
            </span>
            {isUser ? (
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--brand-primary)',
                  color: '#ffffff',
                  fontSize: '0.85rem',
                  border: 'none',
                }}
              >
                {msg.text}
              </div>
            ) : (
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
                <OrvixaIntentRenderer
                  rawPayload={{
                    intent_type: 'SAFE_MARKDOWN',
                    confidence: 0.98,
                    summary: msg.text,
                    structured_data: { markdown: msg.text },
                    is_streaming: false,
                  }}
                  isStreaming={false}
                />
                
                {/* Minimal AI Action Toolbar at bottom left of AI bubble */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginTop: '6px',
                  paddingLeft: '4px',
                }}>
                  {/* Copy button */}
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(msg.text);
                      setCopiedMessageIndex(index);
                      setTimeout(() => setCopiedMessageIndex(null), 2000);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--text-muted)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.68rem',
                      fontWeight: 600,
                      padding: '2px 6px',
                      borderRadius: '4px',
                      transition: 'all var(--motion-fast) ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                  >
                    {copiedMessageIndex === index ? <Check size={11} style={{ color: '#10b981' }} /> : <Copy size={11} />}
                    <span>{copiedMessageIndex === index ? 'Copied!' : 'Copy'}</span>
                  </button>

                  {/* Read Aloud button */}
                  <button
                    onClick={() => {
                      if (isSpeaking) {
                        stopSpeaking();
                      } else {
                        speakText(msg.text);
                      }
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: isSpeaking ? 'var(--brand-primary)' : 'var(--text-muted)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.68rem',
                      fontWeight: 600,
                      padding: '2px 6px',
                      borderRadius: '4px',
                      transition: 'all var(--motion-fast) ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = isSpeaking ? 'var(--brand-primary)' : 'var(--text-muted)')}
                  >
                    <Volume2 size={11} />
                    <span>{isSpeaking ? 'Mute' : 'Speak'}</span>
                  </button>
                </div>
              </div>
            )}
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
              intent_type: 'SAFE_MARKDOWN',
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
      {conversationHistory.length === 0 && panelState === 'READY' && renderWelcomeLanding()}
    </div>
  );
};
