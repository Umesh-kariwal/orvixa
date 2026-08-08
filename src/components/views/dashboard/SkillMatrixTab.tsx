import React, { useState } from 'react';
import { Award, Trophy, BookOpen } from 'lucide-react';

interface SkillNode {
  id: string;
  name: string;
  category: string;
  progress: number;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  lessons: number;
  quizzesPassed: number;
  description: string;
  color: string;
  x: number;
  y: number;
}

const mockNodes: SkillNode[] = [
  { id: '1', name: 'Socratic Logic', category: 'General Reasoning', progress: 85, level: 'Expert', lessons: 8, quizzesPassed: 6, description: 'Understanding logical structures, premises, and core truth tables.', color: 'var(--brand-primary)', x: 50, y: 15 },
  { id: '2', name: 'Binary Trees', category: 'Data Structures', progress: 65, level: 'Intermediate', lessons: 5, quizzesPassed: 3, description: 'Tree structures, depth-first traversal algorithms, and balancing nodes.', color: '#3b82f6', x: 25, y: 45 },
  { id: '3', name: 'Semantic Markup', category: 'Web Development', progress: 95, level: 'Beginner', lessons: 12, quizzesPassed: 10, description: 'Using core HTML5 tags like article, main, header, and section for SEO compliance.', color: 'var(--emerald-primary)', x: 75, y: 45 },
  { id: '4', name: 'JS Event Loop', category: 'Web Development', progress: 40, level: 'Advanced', lessons: 6, quizzesPassed: 2, description: 'Call stack, task queue, microtasks, and Web APIs interaction model.', color: 'var(--amber-primary)', x: 75, y: 80 },
  { id: '5', name: 'Graph Theory', category: 'Algorithms', progress: 20, level: 'Intermediate', lessons: 4, quizzesPassed: 1, description: 'Adjacency matrices, DFS/BFS algorithms, and pathfinding models.', color: 'var(--rose-primary)', x: 25, y: 80 },
];

export const SkillMatrixTab: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<SkillNode | null>(mockNodes[0]);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      color: 'var(--text-primary)',
      animation: 'fadeIn var(--motion-fast) var(--easing-default)',
    }}>
      {/* Visual Interactive Map Wrapper */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: '240px',
        backgroundColor: 'rgba(0, 0, 0, 0.25)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        boxShadow: 'inset 0 4px 20px rgba(0, 0, 0, 0.3)',
      }}>
        {/* SVG Connectors Background Grid */}
        <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
          {/* Connector Paths */}
          <path d="M 50% 15% L 25% 45%" stroke="rgba(255, 255, 255, 0.06)" strokeWidth="2" strokeDasharray="4 4" />
          <path d="M 50% 15% L 75% 45%" stroke="rgba(255, 255, 255, 0.06)" strokeWidth="2" strokeDasharray="4 4" />
          <path d="M 25% 45% L 25% 80%" stroke="rgba(255, 255, 255, 0.06)" strokeWidth="2" strokeDasharray="4 4" />
          <path d="M 75% 45% L 75% 80%" stroke="rgba(255, 255, 255, 0.06)" strokeWidth="2" strokeDasharray="4 4" />
          
          {/* Active pulse path indicator for selected node */}
          {selectedNode && (
            <circle
              cx={`${selectedNode.x}%`}
              cy={`${selectedNode.y}%`}
              r="22"
              fill="none"
              stroke={selectedNode.color}
              strokeWidth="1.5"
              style={{
                opacity: 0.5,
                transformOrigin: `${selectedNode.x}% ${selectedNode.y}%`,
                animation: 'pulse 2s infinite ease-in-out'
              }}
            />
          )}
        </svg>

        {/* Floating Skill Nodes */}
        {mockNodes.map((node) => {
          const isSelected = selectedNode?.id === node.id;
          const isHovered = hoveredNode === node.id;
          return (
            <button
              key={node.id}
              onClick={() => setSelectedNode(node)}
              onMouseEnter={() => setHoveredNode(node.id)}
              onMouseLeave={() => setHoveredNode(null)}
              style={{
                position: 'absolute',
                left: `${node.x}%`,
                top: `${node.y}%`,
                transform: 'translate(-50%, -50%)',
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                backgroundColor: isSelected ? node.color : 'rgba(20, 20, 25, 0.85)',
                border: isSelected ? '2px solid #ffffff' : `2px solid ${node.color}`,
                boxShadow: isSelected || isHovered ? `0 0 16px ${node.color}` : 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isSelected ? '#ffffff' : node.color,
                transition: 'all 200ms cubic-bezier(0.16, 1, 0.3, 1)',
                zIndex: isSelected ? 10 : 5,
              }}
              title={node.name}
            >
              <Trophy size={15} style={{ color: 'inherit' }} />
            </button>
          );
        })}
        
        {/* Floating Instructions */}
        <div style={{
          position: 'absolute',
          bottom: '10px',
          left: '12px',
          fontSize: '0.62rem',
          color: 'var(--text-muted)',
          pointerEvents: 'none'
        }}>
          💡 Tap a node to explore cognitive parameters
        </div>
      </div>

      {/* Selected Node Details Display Panel */}
      {selectedNode && (
        <div style={{
          padding: '18px',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'var(--bg-surface-elevated)',
          border: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          boxShadow: 'var(--shadow-md)',
          animation: 'slideUp var(--motion-fast) var(--easing-default)'
        }}>
          {/* Header Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {selectedNode.category}
              </span>
              <h4 style={{ margin: '2px 0 0 0', fontSize: '0.95rem', fontWeight: 800 }}>{selectedNode.name}</h4>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px' }}>
              <span style={{
                fontSize: '0.6rem',
                fontWeight: 800,
                padding: '3px 8px',
                borderRadius: 'var(--radius-pill)',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-secondary)'
              }}>
                {selectedNode.level}
              </span>
            </div>
          </div>

          {/* Description */}
          <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: '1.45' }}>
            {selectedNode.description}
          </p>

          {/* Metrics grids */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', paddingTop: '6px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(255, 255, 255, 0.01)',
              border: '1px solid var(--border-color)',
            }}>
              <BookOpen size={13} style={{ color: selectedNode.color }} />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.58rem', color: 'var(--text-muted)' }}>Lessons Studied</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{selectedNode.lessons} Modules</span>
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(255, 255, 255, 0.01)',
              border: '1px solid var(--border-color)',
            }}>
              <Award size={13} style={{ color: 'var(--emerald-primary)' }} />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.58rem', color: 'var(--text-muted)' }}>Quizzes Mastered</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{selectedNode.quizzesPassed} Completed</span>
              </div>
            </div>
          </div>

          {/* Progress Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', borderTop: '1px solid var(--border-color)', paddingTop: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', fontWeight: 700 }}>
              <span style={{ color: 'var(--text-secondary)' }}>Overall Comprehension</span>
              <span style={{ color: selectedNode.color }}>{selectedNode.progress}%</span>
            </div>
            <div style={{ width: '100%', height: '6px', backgroundColor: 'rgba(255, 255, 255, 0.04)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{
                width: `${selectedNode.progress}%`,
                height: '100%',
                backgroundColor: selectedNode.color,
                boxShadow: `0 0 10px ${selectedNode.color}`,
                borderRadius: '3px',
              }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
