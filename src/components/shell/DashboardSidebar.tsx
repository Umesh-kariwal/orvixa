import React, { useState, useEffect } from 'react';
import { useSidePanel } from '@/hooks/useSidePanel';
import { 
  Award, 
  BookOpen, 
  Lightbulb, 
  Users, 
  Trash2,
  Download,
  Play,
  Pause,
  RotateCcw,
  AudioLines
} from 'lucide-react';

export const DashboardSidebar: React.FC = () => {
  const { 
    executeAction, 
    conversationHistory, 
    resetSession,
    setIsVoiceModeActive
  } = useSidePanel();

  // 1. Session Focus Timer States (Stopwatch)
  const [seconds, setSeconds] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(true);

  useEffect(() => {
    let interval: any = null;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const handleResetTimer = () => {
    setSeconds(0);
    setIsActive(false);
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  // 2. Export Study Guide handler
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
      {/* Widget 1: Interactive Focus Timer */}
      <div style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
      }}>
        <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-secondary)' }}>
          ⏱️ Study Focus Timer
        </span>
        
        <div style={{ 
          fontSize: '2rem', 
          fontWeight: 900, 
          fontFamily: 'monospace', 
          color: isActive ? 'var(--brand-primary)' : 'var(--text-muted)',
          letterSpacing: '2px',
          textShadow: isActive ? '0 0 10px rgba(99, 102, 241, 0.2)' : 'none',
          transition: 'all 0.3s ease',
        }}>
          {formatTime(seconds)}
        </div>

        {/* Stopwatch interactive buttons */}
        <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
          <button
            onClick={() => setIsActive(!isActive)}
            style={{
              flex: 1,
              padding: '6px 10px',
              borderRadius: '20px',
              backgroundColor: isActive ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)',
              border: isActive ? '1px solid rgba(245, 158, 11, 0.25)' : '1px solid rgba(16, 185, 129, 0.25)',
              color: isActive ? 'var(--amber-primary)' : 'var(--emerald-primary)',
              fontSize: '0.68rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all var(--motion-fast) ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.03)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'none')}
          >
            {isActive ? <Pause size={12} /> : <Play size={12} />}
            {isActive ? 'Pause' : 'Resume'}
          </button>

          <button
            onClick={handleResetTimer}
            style={{
              padding: '6px 12px',
              borderRadius: '20px',
              backgroundColor: 'rgba(255,255,255,0.02)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-secondary)',
              fontSize: '0.68rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all var(--motion-fast) ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
              e.currentTarget.style.color = 'var(--rose-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
          >
            <RotateCcw size={12} />
          </button>
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
