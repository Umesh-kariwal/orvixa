import React from 'react';

export interface HeadingProps {
  level?: 1 | 2 | 3 | 4;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const Heading: React.FC<HeadingProps> = ({
  level = 2,
  children,
  className = '',
  style,
}) => {
  const getHeadingStyles = (): React.CSSProperties => {
    switch (level) {
      case 1:
        return { fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.2 };
      case 2:
        return { fontSize: '1.35rem', fontWeight: 700, letterSpacing: '-0.01em', lineHeight: 1.3 };
      case 3:
        return { fontSize: '1.1rem', fontWeight: 600, lineHeight: 1.4 };
      default:
        return { fontSize: '0.95rem', fontWeight: 600, lineHeight: 1.4 };
    }
  };

  const headingStyle: React.CSSProperties = {
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-sans)',
    ...getHeadingStyles(),
    ...style,
  };

  switch (level) {
    case 1:
      return <h1 style={headingStyle} className={className}>{children}</h1>;
    case 2:
      return <h2 style={headingStyle} className={className}>{children}</h2>;
    case 3:
      return <h3 style={headingStyle} className={className}>{children}</h3>;
    default:
      return <h4 style={headingStyle} className={className}>{children}</h4>;
  }
};

export interface TextProps {
  variant?: 'body' | 'secondary' | 'muted' | 'code';
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const Text: React.FC<TextProps> = ({
  variant = 'body',
  children,
  className = '',
  style,
}) => {
  const getVariantStyles = (): React.CSSProperties => {
    switch (variant) {
      case 'secondary':
        return { color: 'var(--text-secondary)', fontSize: '0.9rem' };
      case 'muted':
        return { color: 'var(--text-muted)', fontSize: '0.8rem' };
      case 'code':
        return {
          fontFamily: 'var(--font-mono)',
          color: 'var(--text-primary)',
          fontSize: '0.85rem',
          backgroundColor: 'var(--bg-surface-elevated)',
          padding: '2px 6px',
          borderRadius: 'var(--radius-sm)',
        };
      default:
        return { color: 'var(--text-primary)', fontSize: '0.95rem' };
    }
  };

  return (
    <span
      style={{
        fontFamily: variant === 'code' ? 'var(--font-mono)' : 'var(--font-sans)',
        lineHeight: 1.5,
        ...getVariantStyles(),
        ...style,
      }}
      className={className}
    >
      {children}
    </span>
  );
};
