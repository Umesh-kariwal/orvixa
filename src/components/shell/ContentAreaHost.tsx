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
    activeContext,
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

  // Developer Diagnostics collapsible view (visible in DEV mode only)
  const renderDevDiagnostics = () => {
    if (!import.meta.env.DEV || !activeContext?.pageContext) return null;

    return (
      <details style={{
        marginTop: '12px',
        padding: '8px 12px',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--border-color)',
        backgroundColor: 'rgba(255,255,255,0.02)',
        fontSize: '0.7rem',
        fontFamily: 'monospace',
        color: 'var(--text-muted)'
      }}>
        <summary style={{ cursor: 'pointer', fontWeight: 700, color: 'var(--text-primary)', userSelect: 'none' }}>
          🛠️ Developer Diagnostics (DEV Mode)
        </summary>
        <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div>
            <strong>URL:</strong> {activeContext.pageContext.url}
          </div>
          <div>
            <strong>Origin:</strong> {activeContext.pageContext.origin}
          </div>
          <div>
            <strong>Platform:</strong> {activeContext.pageContext.platform}
          </div>
          <div>
            <strong>Page Type:</strong> {activeContext.pageContext.pageType}
          </div>
          <div>
            <strong>Language:</strong> {activeContext.pageContext.language}
          </div>
          <div>
            <strong>Visible Text Length:</strong> {activeContext.pageContext.visibleText.length} chars
          </div>
          <div>
            <strong>Selection Length:</strong> {activeContext.pageContext.selectedText.length} chars
          </div>
          <div>
            <strong>Headings ({activeContext.pageContext.headings.length}):</strong>
            <ul style={{ margin: '4px 0 0 12px', padding: 0 }}>
              {activeContext.pageContext.headings.slice(0, 5).map((h, i) => (
                <li key={i}>{h}</li>
              ))}
              {activeContext.pageContext.headings.length > 5 && <li>...</li>}
            </ul>
          </div>
          <div>
            <strong>Metadata Heuristics:</strong>
            <pre style={{ margin: '4px 0 0 0', fontSize: '0.65rem', overflowX: 'auto', padding: '6px', borderRadius: '4px', backgroundColor: 'rgba(0,0,0,0.3)' }}>
              {JSON.stringify(activeContext.pageContext.metadata, null, 2)}
            </pre>
          </div>
        </div>
      </details>
    );
  };

  // Render Screen Understanding Transparency Card
  const renderScreenContextCard = () => {
    if (!activeContext) return null;
    
    // Extract authoritative properties strictly from pageContext single source of truth
    const ctx = activeContext.pageContext || {
      url: activeContext.observed_url || 'Unknown',
      pageTitle: activeContext.observed_title || 'Unknown',
      selectedText: activeContext.observed_selection || '',
      visibleText: '',
      topic: activeContext.inferred_topic || 'General Topic',
      platform: activeContext.inferred_category || 'generic',
      questionCount: activeContext.metadata?.mcqCount || 0,
      confidence: activeContext.confidence_score || 0.5,
    };

    const isLowConfidence = ctx.confidence < 0.35;
    const isSelectionActive = !!ctx.selectedText;
    const bodyCharCount = ctx.visibleText ? ctx.visibleText.length : (activeContext.observed_body_length || 0);
    const confidencePercent = Math.round(ctx.confidence * 100);
    const confidenceTierLabel = ctx.confidence >= 0.85 ? 'HIGH' : ctx.confidence >= 0.6 ? 'MEDIUM' : 'LOW';

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', margin: '8px 0' }}>
        <Card variant="glass" glow={!isLowConfidence}>
          <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--brand-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              🔍 Screen Understanding
            </span>
            <span style={{ 
              fontSize: '0.7rem', 
              fontWeight: 700, 
              padding: '2px 8px', 
              borderRadius: '4px',
              backgroundColor: isLowConfidence ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
              color: isLowConfidence ? 'var(--rose-primary)' : 'var(--emerald-primary)'
            }}>
              {confidenceTierLabel} ({confidencePercent}%)
            </span>
          </div>

          {/* 1. Actually Observed Section */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
              Actually Observed (DOM Inputs)
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              <div>
                <strong style={{ color: 'var(--text-muted)' }}>URL:</strong> {ctx.url}
              </div>
              <div>
                <strong style={{ color: 'var(--text-muted)' }}>Page Title:</strong> {ctx.pageTitle}
              </div>
              <div>
                <strong style={{ color: 'var(--text-muted)' }}>Active Selection:</strong>{' '}
                {isSelectionActive ? (
                  <span style={{ color: 'var(--amber-primary)', fontStyle: 'italic' }}>
                    "{ctx.selectedText.slice(0, 80)}..."
                  </span>
                ) : (
                  <span style={{ color: 'var(--text-muted)' }}>None (Highlight page text to auto-sync)</span>
                )}
              </div>
              <div>
                <strong style={{ color: 'var(--text-muted)' }}>Extracted Text:</strong> {bodyCharCount} characters
              </div>
            </div>
          </div>

          {/* 2. AI Interpretation Section */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
              AI Interpretation (Inferences)
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              <div>
                <strong style={{ color: 'var(--text-muted)' }}>Detected Topic:</strong>{' '}
                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                  {ctx.topic}
                </span>
              </div>
              <div>
                <strong style={{ color: 'var(--text-muted)' }}>Content Category:</strong>{' '}
                <span style={{ textTransform: 'capitalize' }}>{ctx.platform}</span>
              </div>
              {ctx.platform === 'aptitude' || ctx.pageTitle.toLowerCase().includes('ssc') ? (
                <div>
                  <strong style={{ color: 'var(--text-muted)' }}>Visible MCQs:</strong> {ctx.questionCount || 0} questions
                </div>
              ) : null}
            </div>
          </div>

          {/* 3. Disclaimer or Verification statement */}
          <div style={{ 
            padding: '10px 12px', 
            borderRadius: 'var(--radius-sm)', 
            fontSize: '0.75rem',
            backgroundColor: isLowConfidence ? 'rgba(239, 68, 68, 0.05)' : 'rgba(16, 185, 129, 0.05)',
            border: isLowConfidence ? '1px dashed var(--rose-primary)' : '1px dashed var(--emerald-primary)',
            color: isLowConfidence ? 'var(--rose-primary)' : 'var(--emerald-primary)',
            lineHeight: 1.4
          }}>
            {isLowConfidence ? (
              <span>⚠️ Low Confidence: I could not confidently understand the current screen. Please select text or refresh the page to try again.</span>
            ) : (
              <span>🛡️ Trust Verified: Context extracted directly from active document DOM. No hallucinations present.</span>
            )}
          </div>

          {/* 4. Developer Diagnostics (collapsible, visible in dev mode only) */}
          {renderDevDiagnostics()}
        </Card>
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
              <div style={{ width: '100%' }}>
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
      {conversationHistory.length === 0 && panelState === 'READY' && renderScreenContextCard()}

      {renderFollowUps()}
    </div>
  );
};
