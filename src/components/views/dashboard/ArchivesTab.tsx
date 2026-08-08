import React, { useState } from 'react';
import { Search, ExternalLink, Calendar, Clock, Download } from 'lucide-react';

interface ArchiveItem {
  id: string;
  title: string;
  url: string;
  date: string;
  duration: string;
  summary: string;
  concepts: string[];
  quizzesTaken: number;
}

const mockArchive: ArchiveItem[] = [
  { 
    id: '1', 
    title: 'India - Simple English Wikipedia', 
    url: 'https://simple.wikipedia.org/wiki/India', 
    date: 'Aug 8, 2026', 
    duration: '12m studied', 
    summary: 'Explored historical boundaries, political configurations, and main physical subregions of the Indian peninsula.',
    concepts: ['Subcontinental geography', 'Federal republic dynamics', 'Ancient civilizational matrices'],
    quizzesTaken: 2
  },
  { 
    id: '2', 
    title: 'LeetCode 704. Binary Search', 
    url: 'https://leetcode.com/problems/binary-search/', 
    date: 'Aug 7, 2026', 
    duration: '28m studied', 
    summary: 'Analyzed optimal search bounds on sorted array datasets. Reviewed Socratic suggestions about mid index overflow rules.',
    concepts: ['Index overflow mitigation', 'Logarithmic runtime proof', 'Iterative pointer boundaries'],
    quizzesTaken: 1
  },
  { 
    id: '3', 
    title: 'React Hooks API Reference', 
    url: 'https://react.dev/reference/react', 
    date: 'Aug 6, 2026', 
    duration: '45m studied', 
    summary: 'Deep dive into rendering lifecycles, synchronization callbacks, and dependencies arrays inside functional layouts.',
    concepts: ['Dependency identity checks', 'Side-effects isolation', 'Cleanups closures'],
    quizzesTaken: 3
  },
];

export const ArchivesTab: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  const filteredArchive = mockArchive.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.summary.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeItem = mockArchive.find((item) => item.id === selectedItemId) || null;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      color: 'var(--text-primary)',
      animation: 'fadeIn var(--motion-fast) var(--easing-default)',
    }}>
      {/* Search Input */}
      <div style={{ display: 'flex', position: 'relative', alignItems: 'center' }}>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search learning history..."
          style={{
            width: '100%',
            padding: '8px 12px 8px 32px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-primary)',
            fontSize: '0.75rem',
            outline: 'none',
            transition: 'border-color var(--motion-fast) ease',
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--brand-primary)')}
          onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border-color)')}
        />
        <Search size={12} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} />
      </div>

      {/* Main split display layout */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {activeItem ? (
          /* Detailed Expanded Item View */
          <div style={{
            padding: '16px',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            animation: 'fadeIn var(--motion-fast) ease',
          }}>
            {/* Top row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <button
                onClick={() => setSelectedItemId(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--brand-primary)',
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                ← Back to List
              </button>
              
              <button
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.62rem',
                }}
                title="Export Notes"
              >
                <Download size={10} />
                Export
              </button>
            </div>

            {/* Title */}
            <div>
              <a
                href={activeItem.url}
                target="_blank"
                rel="noreferrer"
                style={{
                  fontSize: '0.9rem',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                {activeItem.title}
                <ExternalLink size={12} style={{ color: 'var(--text-muted)' }} />
              </a>
              <div style={{ display: 'flex', gap: '10px', marginTop: '4px', fontSize: '0.62rem', color: 'var(--text-muted)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                  <Calendar size={10} /> {activeItem.date}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                  <Clock size={10} /> {activeItem.duration}
                </span>
              </div>
            </div>

            {/* Summary */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)' }}>
                Session Synopsis
              </span>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.45' }}>
                {activeItem.summary}
              </p>
            </div>

            {/* Core Concepts */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)' }}>
                Extracted Concepts
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {activeItem.concepts.map((concept, idx) => (
                  <span
                    key={idx}
                    style={{
                      fontSize: '0.62rem',
                      backgroundColor: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid var(--border-color)',
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-pill)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    {concept}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* List View */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filteredArchive.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedItemId(item.id)}
                style={{
                  padding: '14px',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  transition: 'all var(--motion-fast) ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.borderColor = 'var(--border-highlight)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <h5 style={{
                      margin: 0,
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {item.title}
                    </h5>
                    <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>{item.date}</span>
                  </div>
                  <span style={{ fontSize: '0.62rem', fontWeight: 800, color: 'var(--brand-primary)' }}>
                    {item.duration}
                  </span>
                </div>

                <p style={{
                  margin: 0,
                  fontSize: '0.7rem',
                  color: 'var(--text-secondary)',
                  lineHeight: '1.4',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                }}>
                  {item.summary}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
