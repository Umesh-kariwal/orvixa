import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  variant?: 'default' | 'glass' | 'amber' | 'emerald';
  glow?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  style,
  variant = 'default',
  glow = false,
}) => {
  const getVariantStyles = (): React.CSSProperties => {
    switch (variant) {
      case 'glass':
        return {
          backgroundColor: 'var(--bg-glass)',
          backdropFilter: 'var(--glass-blur)',
          WebkitBackdropFilter: 'var(--glass-blur)',
          border: `1px solid ${glow ? 'var(--border-highlight)' : 'var(--border-color)'}`,
          boxShadow: glow ? 'var(--shadow-aura)' : 'var(--shadow-md)',
        };
      case 'amber':
        return {
          backgroundColor: 'var(--amber-bg)',
          border: '1px solid var(--amber-border)',
          boxShadow: 'var(--shadow-glow-amber)',
        };
      case 'emerald':
        return {
          backgroundColor: 'var(--emerald-bg)',
          border: '1px solid var(--emerald-border)',
          boxShadow: 'var(--shadow-glow-emerald)',
        };
      default:
        return {
          backgroundColor: 'var(--bg-surface)',
          border: `1px solid ${glow ? 'var(--border-highlight)' : 'var(--border-color)'}`,
          boxShadow: glow ? 'var(--shadow-aura)' : 'var(--shadow-sm)',
        };
    }
  };

  const baseCardStyle: React.CSSProperties = {
    borderRadius: 'var(--radius-lg)',
    padding: 'var(--space-lg)',
    transition: 'all var(--motion-normal) var(--easing-default)',
    ...getVariantStyles(),
    ...style,
  };

  return (
    <div style={baseCardStyle} className={className}>
      {children}
    </div>
  );
};
