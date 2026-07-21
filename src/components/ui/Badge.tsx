import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'concept' | 'level' | 'action' | 'mastery' | 'amber' | 'rose';
  icon?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'concept',
  icon,
  className = '',
  style,
}) => {
  const getVariantStyles = (): React.CSSProperties => {
    switch (variant) {
      case 'level':
        return {
          backgroundColor: 'var(--brand-primary)',
          color: '#ffffff',
          fontWeight: 700,
        };
      case 'amber':
        return {
          backgroundColor: 'var(--amber-bg)',
          color: 'var(--amber-primary)',
          border: '1px solid var(--amber-border)',
        };
      case 'mastery':
        return {
          backgroundColor: 'var(--emerald-bg)',
          color: 'var(--emerald-primary)',
          border: '1px solid var(--emerald-border)',
          fontWeight: 700,
        };
      case 'rose':
        return {
          backgroundColor: 'var(--rose-bg)',
          color: 'var(--rose-primary)',
          border: '1px solid var(--rose-border)',
        };
      case 'action':
        return {
          backgroundColor: 'var(--bg-surface-elevated)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-highlight)',
          fontWeight: 600,
        };
      default: // concept
        return {
          backgroundColor: 'var(--bg-surface-elevated)',
          color: 'var(--text-secondary)',
          border: '1px solid var(--border-color)',
          fontFamily: 'var(--font-mono)',
        };
    }
  };

  const badgeStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 10px',
    borderRadius: 'var(--radius-pill)',
    fontSize: '0.78rem',
    fontWeight: 500,
    lineHeight: 1,
    whiteSpace: 'nowrap',
    ...getVariantStyles(),
    ...style,
  };

  return (
    <span style={badgeStyle} className={className}>
      {icon && <span style={{ display: 'inline-flex', alignItems: 'center' }}>{icon}</span>}
      {children}
    </span>
  );
};
