import React from 'react';
import { useSidePanel } from '@/hooks/useSidePanel';
import { 
  Award, 
  BookOpen, 
  Lightbulb, 
  Users, 
  Trash2,
  Download,
  AudioLines,
  Zap,
  Activity,
  CheckCircle2
} from 'lucide-react';

export const DashboardSidebar: React.FC = () => {
  const { 
    executeAction, 
    conversationHistory, 
    resetSession,
    setIsVoiceModeActive
  } = useSidePanel();

  // Export Study Guide handler
  const handleExportTranscript = () => {
    if (conversationHistory.length === 0) return;
    const text = conversationHistory
      .map((msg) => `${msg.role === 'user' ? 'Learner' : 'Orvixa'}: ${msg.text}`)
      .join('\n\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orvixa-study-notes-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{
      width: '320px',
      borderLeft: '1px solid var(--border-color)',
      backgroundColor: '#09090e',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      padding: '24px 20px',
      overflowY: 'auto',
      userSelect: 'none',
      height: '100%',
    }}>

      {/* Widget 1: Autonomous AI Agent Control Suite (Bugatti Agent Hub) */}
      <div style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--brand-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Zap size={13} /> Autonomous AI Agent Suite
          </span>
          <span style={{
            fontSize: '0.6rem', padding: '2px 8px', borderRadius: '12px',
            background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.25)',
            color: '#10b981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px'
          }}>
            <Activity size={10} /> LIVE AGENT
          </span>
        </div>
        
        <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
          Autonomous browser manipulation & voice-driven action engine:
        </span>

        {/* Agent Capabilities Status List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
          {[
            { label: 'YouTube Video Auto-Play & Ad Skip', desc: 'Searches & clicks 1st video automatically' },
            { label: 'Natural Language DOM Clicker', desc: 'Say "Click Login" or "Click Subscribe"' },
            { label: 'Smart Web Input Auto-Filler', desc: 'Say "Type hello" into active web fields' },
            { label: 'WhatsApp & Gmail Compose', desc: 'Direct message drafting via voice' },
          ].map((item) => (
            <div key={item.label} style={{
              display: 'flex', gap: '8px', alignItems: 'flex-start',
              padding: '6px 8px', borderRadius: '6px',
              background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)'
            }}>
              <CheckCircle2 size={12} style={{ color: '#818cf8', flexShrink: 0, marginTop: '2px' }} />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-primary)' }}>{item.label}</span>
                <span style={{ fontSize: '0.58rem', color: 'var(--text-muted)' }}>{item.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Widget 2: Quick Study Modules (Interactive Study triggers) */}
      <div style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}>
        <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Quick Study Modules
        </span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            { id: 'explain', label: 'Explain Concept', desc: 'Detailed breakdown of active screen', icon: <BookOpen size={13} /> },
            { id: 'hint', label: 'Socratic Hint', desc: 'Ask step-by-step hints to solve', icon: <Lightbulb size={13} /> },
            { id: 'practice_quiz', label: 'Practice Quiz', desc: 'Generate test questions on active topic', icon: <Award size={13} /> },
            { id: 'mock_interview', label: 'Mock Interview', desc: 'Trigger a formal learning voice review', icon: <Users size={13} /> },
          ].map((item) => (
            <div 
              key={item.id}
              onClick={() => executeAction({
                action_id: item.id,
                label: item.label,
                description: item.desc,
                icon: 'sparkles'
              })}
              style={{
                padding: '10px 12px',
                borderRadius: '8px',
                background: 'rgba(255,255,255,0.01)',
                border: '1px solid var(--border-color)',
                cursor: 'pointer',
                display: 'flex',
                gap: '10px',
                alignItems: 'center',
                transition: 'all var(--motion-fast) ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(99, 102, 241, 0.06)';
                e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.3)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.01)';
                e.currentTarget.style.borderColor = 'var(--border-color)';
                e.currentTarget.style.transform = 'none';
              }}
            >
              <span style={{ color: 'var(--brand-primary)', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                {item.icon}
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-primary)' }}>{item.label}</span>
                <span style={{ fontSize: '0.58rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Widget 3: Workspace Utility Center */}
      <div style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}>
        <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Workspace Control Panel
        </span>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {/* A. Launch Voice Call Assistant */}
          <button
            onClick={() => setIsVoiceModeActive(true)}
            style={{
              padding: '10px 14px',
              borderRadius: '8px',
              backgroundColor: 'rgba(99, 102, 241, 0.05)',
              border: '1px solid rgba(99, 102, 241, 0.15)',
              color: 'var(--brand-primary)',
              fontSize: '0.72rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all var(--motion-fast) ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(99, 102, 241, 0.12)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(99, 102, 241, 0.05)')}
          >
            <AudioLines size={13} />
            Launch Voice Assistant
          </button>

          {/* B. Export Study Guide */}
          <button
            onClick={handleExportTranscript}
            disabled={conversationHistory.length === 0}
            style={{
              padding: '10px 14px',
              borderRadius: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-color)',
              color: conversationHistory.length === 0 ? 'var(--text-muted)' : 'var(--text-secondary)',
              fontSize: '0.72rem',
              fontWeight: 800,
              cursor: conversationHistory.length === 0 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all var(--motion-fast) ease',
            }}
            onMouseEnter={(e) => {
              if (conversationHistory.length > 0) {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)';
                e.currentTarget.style.color = '#ffffff';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)';
              e.currentTarget.style.color = conversationHistory.length === 0 ? 'var(--text-muted)' : 'var(--text-secondary)';
            }}
          >
            <Download size={13} />
            Export Study Notes (.txt)
          </button>

          {/* C. Reset Session */}
          <button
            onClick={resetSession}
            style={{
              padding: '10px 14px',
              borderRadius: '8px',
              backgroundColor: 'rgba(239, 68, 68, 0.05)',
              border: '1px solid rgba(239, 68, 68, 0.15)',
              color: 'var(--rose-primary)',
              fontSize: '0.72rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all var(--motion-fast) ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.12)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.05)')}
          >
            <Trash2 size={13} />
            Reset Learning Room
          </button>
        </div>
      </div>
    </div>
  );
};
