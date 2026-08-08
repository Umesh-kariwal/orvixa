import React, { useState } from 'react';
import { useSidePanel } from '@/hooks/useSidePanel';
import { Layers, X } from 'lucide-react';
import { SkillMatrixTab } from './dashboard/SkillMatrixTab';
import { FlashcardsTab } from './dashboard/FlashcardsTab';
import { ArchivesTab } from './dashboard/ArchivesTab';

export const MasteryDashboard: React.FC = () => {
  const { setCurrentView } = useSidePanel();
  const [activeTab, setActiveTab] = useState<'analytics' | 'flashcards' | 'archives'>('analytics');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'analytics':
        return <SkillMatrixTab />;
      case 'flashcards':
        return <FlashcardsTab />;
      case 'archives':
        return <ArchivesTab />;
      default:
        return null;
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
          <X size={15} />
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
