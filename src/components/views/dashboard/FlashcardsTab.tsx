import React, { useState } from 'react';
import { Plus, Trash2, AlertTriangle } from 'lucide-react';

interface Flashcard {
  id: string;
  question: string;
  answer: string;
  category: string;
  interval: number; // in days
  easeFactor: number;
  repetitions: number;
  nextReviewDate: Date;
}

const initialCards: Flashcard[] = [
  { id: '1', question: 'What is the time complexity of searching in a balanced BST?', answer: 'O(log n) because the search space is halved at each level.', category: 'Algorithms', interval: 1, easeFactor: 2.5, repetitions: 1, nextReviewDate: new Date() },
  { id: '2', question: 'What is the difference between map() and forEach()?', answer: 'map() returns a new array with transformed elements, while forEach() executes a function on each element and returns undefined.', category: 'Web Development', interval: 2, easeFactor: 2.6, repetitions: 2, nextReviewDate: new Date() },
  { id: '3', question: 'Explain quantum superposition.', answer: 'The ability of a quantum system to be in multiple states at the same time until it is measured.', category: 'Physics', interval: 0, easeFactor: 2.5, repetitions: 0, nextReviewDate: new Date() },
];

export const FlashcardsTab: React.FC = () => {
  const [deck, setDeck] = useState<Flashcard[]>(initialCards);
  const [activeCardIdx, setActiveCardIdx] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  
  // Add form input states
  const [newQuestion, setNewQuestion] = useState<string>('');
  const [newAnswer, setNewAnswer] = useState<string>('');
  const [newCategory, setNewCategory] = useState<string>('General');

  const activeCard = deck[activeCardIdx] || null;

  // SM-2 Spaced Repetition Logic simulation
  const handleRateCard = (quality: number) => {
    if (!activeCard) return;

    const updatedCard = { ...activeCard };
    
    // Repetitions & Interval calculation based on response quality
    if (quality < 3) {
      updatedCard.repetitions = 0;
      updatedCard.interval = 1;
    } else {
      if (updatedCard.repetitions === 0) {
        updatedCard.interval = 1;
      } else if (updatedCard.repetitions === 1) {
        updatedCard.interval = 6;
      } else {
        updatedCard.interval = Math.round(updatedCard.interval * updatedCard.easeFactor);
      }
      updatedCard.repetitions += 1;
    }

    // Ease Factor calculation
    updatedCard.easeFactor = Math.max(
      1.3,
      updatedCard.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    );

    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + updatedCard.interval);
    updatedCard.nextReviewDate = nextDate;

    // Save back to deck
    const updatedDeck = deck.map((c) => (c.id === activeCard.id ? updatedCard : c));
    setDeck(updatedDeck);

    // Slide transition & move to next card
    setIsFlipped(false);
    setTimeout(() => {
      if (activeCardIdx < deck.length - 1) {
        setActiveCardIdx(activeCardIdx + 1);
      } else {
        setActiveCardIdx(0); // Loop back or show completed screen
      }
    }, 200);
  };

  const handleAddNewCard = () => {
    if (!newQuestion.trim() || !newAnswer.trim()) return;

    const newCard: Flashcard = {
      id: Date.now().toString(),
      question: newQuestion.trim(),
      answer: newAnswer.trim(),
      category: newCategory.trim(),
      interval: 0,
      easeFactor: 2.5,
      repetitions: 0,
      nextReviewDate: new Date(),
    };

    setDeck([newCard, ...deck]);
    setNewQuestion('');
    setNewAnswer('');
    setShowAddForm(false);
  };

  const handleDeleteCard = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedDeck = deck.filter((c) => c.id !== id);
    setDeck(updatedDeck);
    if (activeCardIdx >= updatedDeck.length && activeCardIdx > 0) {
      setActiveCardIdx(updatedDeck.length - 1);
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      color: 'var(--text-primary)',
      animation: 'fadeIn var(--motion-fast) var(--easing-default)',
    }}>
      {/* Create Card Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.02em', color: 'var(--text-secondary)' }}>
            Active Recall Decks
          </span>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{deck.length} total cards</span>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            backgroundColor: 'var(--brand-primary)',
            border: 'none',
            borderRadius: '20px',
            padding: '5px 12px',
            color: '#ffffff',
            fontSize: '0.65rem',
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: 'var(--shadow-sm)',
            transition: 'transform var(--motion-fast) ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.03)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'none')}
        >
          <Plus size={12} />
          Add Card
        </button>
      </div>

      {/* Manual Create Form Overlay */}
      {showAddForm && (
        <div style={{
          padding: '16px',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          animation: 'slideDown var(--motion-fast) ease',
        }}>
          <h4 style={{ margin: 0, fontSize: '0.78rem', fontWeight: 800, color: 'var(--brand-primary)' }}>New Spaced Study Card</h4>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>Topic / Category</label>
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="e.g. Algorithms, Science..."
              style={{
                padding: '8px 10px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                fontSize: '0.72rem',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>Question</label>
            <textarea
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              placeholder="Enter question details..."
              style={{
                padding: '8px 10px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                fontSize: '0.72rem',
                outline: 'none',
                minHeight: '40px',
                resize: 'none',
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>Explanation / Answer</label>
            <textarea
              value={newAnswer}
              onChange={(e) => setNewAnswer(e.target.value)}
              placeholder="Enter explanation details..."
              style={{
                padding: '8px 10px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                fontSize: '0.72rem',
                outline: 'none',
                minHeight: '60px',
                resize: 'none',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '4px' }}>
            <button
              onClick={() => setShowAddForm(false)}
              style={{
                padding: '5px 12px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'transparent',
                border: '1px solid var(--border-color)',
                color: 'var(--text-secondary)',
                fontSize: '0.65rem',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleAddNewCard}
              style={{
                padding: '5px 12px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--brand-primary)',
                border: 'none',
                color: '#ffffff',
                fontSize: '0.65rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Save Card
            </button>
          </div>
        </div>
      )}

      {/* Main Review Card Box */}
      {activeCard ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            style={{
              minHeight: '180px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: isFlipped ? 'rgba(99, 102, 241, 0.02)' : 'var(--bg-surface-elevated)',
              border: isFlipped ? '1px solid var(--brand-primary)' : '1px solid var(--border-color)',
              padding: '20px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative',
              transition: 'all 200ms cubic-bezier(0.16, 1, 0.3, 1)',
              boxShadow: isFlipped ? 'var(--shadow-aura)' : 'none',
            }}
          >
            {/* Top info */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.62rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--brand-primary)' }}>
                {activeCard.category}
              </span>
              <button
                onClick={(e) => handleDeleteCard(activeCard.id, e)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center',
                }}
                title="Delete Card"
              >
                <Trash2 size={12} />
              </button>
            </div>

            {/* Content text */}
            <div style={{ margin: '20px 0' }}>
              <p style={{
                margin: 0,
                fontSize: '0.85rem',
                fontWeight: 600,
                lineHeight: '1.5',
                color: 'var(--text-primary)',
                textAlign: 'center',
              }}>
                {isFlipped ? activeCard.answer : activeCard.question}
              </p>
            </div>

            {/* Bottom guide */}
            <div style={{
              fontSize: '0.62rem',
              color: 'var(--text-muted)',
              textAlign: 'center',
              borderTop: '1px solid rgba(255, 255, 255, 0.02)',
              paddingTop: '10px'
            }}>
              {isFlipped ? 'Tap card to show query' : 'Tap card to show solution'}
            </div>
          </div>

          {/* SM-2 Spaced Recall Rating Row */}
          {isFlipped && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr 1fr',
              gap: '6px',
              animation: 'slideUp var(--motion-fast) ease'
            }}>
              <button
                onClick={() => handleRateCard(1)}
                style={{
                  padding: '8px 4px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.15)',
                  color: 'var(--rose-primary)',
                  fontSize: '0.62rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                Again
              </button>
              <button
                onClick={() => handleRateCard(3)}
                style={{
                  padding: '8px 4px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'rgba(245, 158, 11, 0.08)',
                  border: '1px solid rgba(245, 158, 11, 0.15)',
                  color: 'var(--amber-primary)',
                  fontSize: '0.62rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                Hard
              </button>
              <button
                onClick={() => handleRateCard(4)}
                style={{
                  padding: '8px 4px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'rgba(59, 130, 246, 0.08)',
                  border: '1px solid rgba(59, 130, 246, 0.15)',
                  color: '#3b82f6',
                  fontSize: '0.62rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                Good
              </button>
              <button
                onClick={() => handleRateCard(5)}
                style={{
                  padding: '8px 4px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid rgba(16, 185, 129, 0.15)',
                  color: 'var(--emerald-primary)',
                  fontSize: '0.62rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                Easy
              </button>
            </div>
          )}
        </div>
      ) : (
        <div style={{
          padding: '30px',
          textAlign: 'center',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)',
          backgroundColor: 'rgba(255, 255, 255, 0.01)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '10px'
        }}>
          <AlertTriangle size={24} style={{ color: 'var(--text-muted)' }} />
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>Study Deck is Empty</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Add a new card manually above or save concepts while studying!
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
