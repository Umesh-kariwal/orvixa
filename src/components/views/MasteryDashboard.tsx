import React, { useState } from 'react';
import { useSidePanel } from '@/hooks/useSidePanel';
import { 
  Layers, 
  Search, 
  TrendingUp, 
  Sparkles,
  ExternalLink
} from 'lucide-react';

// Mock learning progress data for visual styling
const mockSkills = [
  { id: '1', name: 'Binary Search Trees', category: 'Algorithms', level: 'Intermediate', progress: 65, color: 'var(--brand-primary)', status: 'Active learning' },
  { id: '2', name: 'HTML5 Semantic Structures', category: 'Web Development', level: 'Beginner', progress: 90, color: 'var(--emerald-primary)', status: 'Mastered' },
  { id: '3', name: 'Asynchronous JavaScript (Promises)', category: 'Core JS', level: 'Advanced', progress: 40, color: 'var(--amber-primary)', status: 'Needs review' },
  { id: '4', name: 'Quantum Computing Basics', category: 'Physics', level: 'Beginner', progress: 15, color: 'var(--rose-primary)', status: 'Started' },
];

const mockFlashcards = [
  { id: '1', question: 'What is the time complexity of searching in a balanced BST?', answer: 'O(log n) because the search space is halved at each level.', category: 'Algorithms', nextReview: 'In 2 hours' },
  { id: '2', question: 'What is the difference between map() and forEach()?', answer: 'map() returns a new array with transformed elements, while forEach() executes a function on each element and returns undefined.', category: 'Web Development', nextReview: 'In 1 day' },
  { id: '3', question: 'Explain quantum superposition.', answer: 'The ability of a quantum system to be in multiple states at the same time until it is measured.', category: 'Physics', nextReview: 'Ready to review' },
];

const mockArchive = [
  { id: '1', title: 'India - Simple English Wikipedia', url: 'https://simple.wikipedia.org/wiki/India', date: 'Aug 8, 2026', duration: '12m studied', notes: 'Extracted key topics on geographical bounds and history.' },
  { id: '2', title: 'LeetCode 704. Binary Search', url: 'https://leetcode.com/problems/binary-search/', date: 'Aug 7, 2026', duration: '28m studied', notes: 'Mastered the iterative search logic.' },
  { id: '3', title: 'React Hooks API Reference', url: 'https://react.dev/reference/react', date: 'Aug 6, 2026', duration: '45m studied', notes: 'Reviewed dependencies rules of useEffect.' },
];

export const MasteryDashboard: React.FC = () => {
  const { setCurrentView } = useSidePanel();
  const [activeTab, setActiveTab] = useState<'analytics' | 'flashcards' | 'archives'>('analytics');
  
  // Card flip states for flashcards view
  const [flippedCardId, setFlippedCardId] = useState<string | null>(null);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'analytics':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Header Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{
                padding: '16px',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-color)',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Study Time</span>
                <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>14.8 hrs</span>
                <span style={{ fontSize: '0.65rem', color: 'var(--emerald-primary)', display: 'flex', alignItems: 'center', gap: '2px' }}>
                  <TrendingUp size={10} /> +12% this week
                </span>
              </div>
              <div style={{
                padding: '16px',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-color)',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Concepts Learned</span>
                <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>12 / 24</span>
                <span style={{ fontSize: '0.65rem', color: 'var(--brand-primary)', display: 'flex', alignItems: 'center', gap: '2px' }}>
                  <Sparkles size={10} /> 3 topics mastered today
                </span>
              </div>
            </div>

            {/* Skill Matrix List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.02em', color: 'var(--text-secondary)' }}>
                Active Mastery Trees
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {mockSkills.map((skill) => (
                  <div
                    key={skill.id}
                    style={{
                      padding: '14px',
                      borderRadius: 'var(--radius-lg)',
                      backgroundColor: 'var(--bg-surface-elevated)',
                      border: '1px solid var(--border-color)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block' }}>{skill.category}</span>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>{skill.name}</span>
                      </div>
                      <span style={{
                        fontSize: '0.6rem',
                        fontWeight: 800,
                        padding: '3px 8px',
                        borderRadius: 'var(--radius-pill)',
                        backgroundColor: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-secondary)'
                      }}>{skill.level}</span>
                    </div>

                    {/* Progress Bar */}
                    <div style={{ width: '100%', height: '4px', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '2px', overflow: 'hidden', position: 'relative' }}>
                      <div style={{
                        width: `${skill.progress}%`,
                        height: '100%',
                        backgroundColor: skill.color,
                        borderRadius: '2px',
                        boxShadow: `0 0 8px ${skill.color}`
                      }} />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.65rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>{skill.status}</span>
                      <span style={{ fontWeight: 800, color: skill.color }}>{skill.progress}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'flashcards':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.02em', color: 'var(--text-secondary)' }}>
                Active Study Deck
              </span>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>3 cards pending</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {mockFlashcards.map((card) => {
                const isFlipped = flippedCardId === card.id;
                return (
                  <div
                    key={card.id}
                    onClick={() => setFlippedCardId(isFlipped ? null : card.id)}
                    style={{
                      minHeight: '130px',
                      borderRadius: 'var(--radius-lg)',
                      backgroundColor: isFlipped ? 'rgba(99, 102, 241, 0.03)' : 'var(--bg-surface-elevated)',
                      border: isFlipped ? '1px solid var(--brand-primary)' : '1px solid var(--border-color)',
                      padding: '16px',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                      boxShadow: isFlipped ? 'var(--shadow-aura)' : 'none',
                    }}
                  >
                    {/* Top row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 2 }}>
                      <span style={{
                        fontSize: '0.58rem',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        color: isFlipped ? 'var(--brand-primary)' : 'var(--text-muted)'
                      }}>{card.category}</span>
                      
                      <span style={{
                        fontSize: '0.62rem',
                        fontWeight: 700,
                        color: card.nextReview === 'Ready to review' ? 'var(--emerald-primary)' : 'var(--text-muted)'
                      }}>{card.nextReview}</span>
                    </div>

                    {/* Middle: Content */}
                    <div style={{ margin: '14px 0', zIndex: 2 }}>
                      <p style={{
                        margin: 0,
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        lineHeight: '1.45',
                        color: 'var(--text-primary)',
                      }}>
                        {isFlipped ? card.answer : card.question}
                      </p>
                    </div>

                    {/* Bottom: helper instructions */}
                    <div style={{
                      fontSize: '0.6rem',
                      color: 'var(--text-muted)',
                      textAlign: 'center',
                      borderTop: '1px solid rgba(255, 255, 255, 0.02)',
                      paddingTop: '8px',
                      zIndex: 2
                    }}>
                      {isFlipped ? 'Click to show question' : 'Click to reveal answer'}
                    </div>

                    {/* Background glow for flipped cards */}
                    {isFlipped && (
                      <div style={{
                        position: 'absolute',
                        bottom: '-30px',
                        right: '-30px',
                        width: '100px',
                        height: '100px',
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)',
                        filter: 'blur(10px)',
                        zIndex: 1
                      }} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'archives':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', position: 'relative', alignItems: 'center' }}>
              <input
                type="text"
                placeholder="Search past study sessions..."
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 32px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  fontSize: '0.75rem',
                  outline: 'none',
                }}
              />
              <Search size={12} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {mockArchive.map((item) => (
                <div
                  key={item.id}
                  style={{
                    padding: '14px',
                    borderRadius: 'var(--radius-lg)',
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          color: 'var(--text-primary)',
                          textDecoration: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {item.title}
                        <ExternalLink size={10} style={{ flexShrink: 0, color: 'var(--text-muted)' }} />
                      </a>
                      <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>{item.date}</span>
                    </div>
                    <span style={{
                      fontSize: '0.6rem',
                      fontWeight: 800,
                      color: 'var(--brand-primary)',
                      flexShrink: 0,
                    }}>{item.duration}</span>
                  </div>

                  <p style={{
                    margin: 0,
                    fontSize: '0.7rem',
                    color: 'var(--text-secondary)',
                    lineHeight: '1.4',
                  }}>
                    {item.notes}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      color: 'var(--text-primary)',
      fontFamily: 'var(--font-sans)',
      userSelect: 'none',
    }}>
      {/* Dashboard Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 20px',
        borderBottom: '1px solid var(--border-color)',
        backgroundColor: 'var(--bg-surface)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Layers size={15} style={{ color: 'var(--brand-primary)' }} />
          <span style={{ fontSize: '0.95rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Mastery Dashboard</span>
        </div>
        <button
          onClick={() => setCurrentView('learning')}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'color var(--motion-fast) ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
        >
          Close
        </button>
      </div>

      {/* Tabs Selector Navigation Row */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid var(--border-color)',
        backgroundColor: 'rgba(255, 255, 255, 0.01)',
      }}>
        <button
          onClick={() => setActiveTab('analytics')}
          style={{
            flex: 1,
            padding: '12px',
            border: 'none',
            background: 'none',
            color: activeTab === 'analytics' ? 'var(--brand-primary)' : 'var(--text-muted)',
            fontSize: '0.72rem',
            fontWeight: 800,
            cursor: 'pointer',
            borderBottom: activeTab === 'analytics' ? '2px solid var(--brand-primary)' : '2px solid transparent',
            transition: 'all 0.2s ease',
          }}
        >
          Skill Matrix
        </button>
        <button
          onClick={() => setActiveTab('flashcards')}
          style={{
            flex: 1,
            padding: '12px',
            border: 'none',
            background: 'none',
            color: activeTab === 'flashcards' ? 'var(--brand-primary)' : 'var(--text-muted)',
            fontSize: '0.72rem',
            fontWeight: 800,
            cursor: 'pointer',
            borderBottom: activeTab === 'flashcards' ? '2px solid var(--brand-primary)' : '2px solid transparent',
            transition: 'all 0.2s ease',
          }}
        >
          Study Cards
        </button>
        <button
          onClick={() => setActiveTab('archives')}
          style={{
            flex: 1,
            padding: '12px',
            border: 'none',
            background: 'none',
            color: activeTab === 'archives' ? 'var(--brand-primary)' : 'var(--text-muted)',
            fontSize: '0.72rem',
            fontWeight: 800,
            cursor: 'pointer',
            borderBottom: activeTab === 'archives' ? '2px solid var(--brand-primary)' : '2px solid transparent',
            transition: 'all 0.2s ease',
          }}
        >
          Archives
        </button>
      </div>

      {/* Main Tab Content Viewport */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '20px',
      }}>
        {renderTabContent()}
      </div>
    </div>
  );
};
