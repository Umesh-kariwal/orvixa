import React from 'react';
import { useSidePanel } from '@/hooks/useSidePanel';
import { 
  Award, 
  BookOpen, 
  Lightbulb, 
  Users, 
  Compass,
  CheckSquare,
  HelpCircle
} from 'lucide-react';

export const DashboardSidebar: React.FC = () => {
  const { activeContext, executeAction, conversationHistory } = useSidePanel();

  // Deduce active topic
  const activeTopic = activeContext?.pageContext?.topic || activeContext?.inferred_topic || 'orvixa';
  const isMicroscopeTopic = activeTopic.toLowerCase().includes('microscope') || 
                            conversationHistory.some(m => m.text.toLowerCase().includes('microscope'));

  // Socratic study tasks
  const studyTasks = [
    { label: 'Examine Subject Structure', done: conversationHistory.length > 0 },
    { label: 'Solve Socratic Clue Ladder', done: conversationHistory.some(m => m.text.toLowerCase().includes('clue') || m.text.toLowerCase().includes('hint')) },
    { label: 'Verify concept with Quiz', done: conversationHistory.some(m => m.text.toLowerCase().includes('quiz') || m.text.toLowerCase().includes('question')) },
    { label: 'Conduct voice recap evaluation', done: false }
  ];

  // Dynamic session flashcards / glossaries
  const getDynamicGlossary = () => {
    if (isMicroscopeTopic) {
      return [
        { term: 'Light Path', def: 'Illuminates specimen using lenses.' },
        { term: 'Objective Lens', def: 'Core lens providing zoom magnification.' },
        { term: 'Fine Focus knob', def: 'Sharpens image resolution details.' }
      ];
    }
    return [
      { term: 'Core Hypothesis', def: 'Underlying conceptual foundation.' },
      { term: 'Workflow Path', def: 'Sequential execution diagram.' },
      { term: 'Key Formula/Metric', def: 'Mathematical or data-backed rule.' }
    ];
  };

  const glossary = getDynamicGlossary();

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
      {/* 1. Study Subject Blueprint */}
      <div style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--brand-primary)' }}>
          <Compass size={14} />
          <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Study Blueprint
          </span>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>Focus Subject:</span>
          <span style={{ fontWeight: 800, color: '#ffffff', fontSize: '0.9rem', textTransform: 'capitalize' }}>
            {activeTopic === 'orvixa' ? 'General Subject Study' : activeTopic}
          </span>
        </div>

        {/* Dynamic Study Checklist */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', borderTop: '1px solid var(--border-color)', paddingTop: '10px', marginTop: '4px' }}>
          <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '2px' }}>
            Socratic Progress Check:
          </span>
          {studyTasks.map((t, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.68rem' }}>
              <CheckSquare size={12} style={{ color: t.done ? 'var(--emerald-primary)' : 'var(--text-muted)', flexShrink: 0 }} />
              <span style={{ color: t.done ? 'var(--text-secondary)' : 'var(--text-muted)', textDecoration: t.done ? 'line-through' : 'none' }}>
                {t.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Interactive Flashcards / Definitions Glossary */}
      <div style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--brand-primary)' }}>
          <HelpCircle size={14} />
          <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Interactive Glossaries
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {glossary.map((card, idx) => (
            <div 
              key={idx}
              style={{
                padding: '8px 10px',
                borderRadius: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.01)',
                border: '1px solid var(--border-color)',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
              }}
            >
              <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--brand-primary)' }}>
                {card.term}
              </span>
              <span style={{ fontSize: '0.62rem', color: 'var(--text-secondary)', lineHeight: '1.3' }}>
                {card.def}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Action Shortcut Cards */}
      <div style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}>
        <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
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
    </div>
  );
};
