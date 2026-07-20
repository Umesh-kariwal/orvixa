import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  glow?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  style,
  glow = false,
}) => {
  const cardStyle: React.CSSProperties = {
    backgroundColor: 'var(--bg-glass)',
    backdropFilter: 'var(--glass-blur)',
    border: `1px solid ${glow ? 'var(--border-highlight)' : 'var(--border-color)'}`,
    borderRadius: 'var(--radius-lg)',
    padding: '24px',
    boxShadow: glow ? 'var(--shadow-glow)' : 'var(--shadow-md)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    ...style,
  };

  return (
    <div style={cardStyle} className={className}>
      {children}
    </div>
  );
};
