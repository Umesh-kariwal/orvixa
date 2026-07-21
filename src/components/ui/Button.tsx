import React, { type ButtonHTMLAttributes } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'glow';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  disabled,
  style,
  ...props
}) => {
  const baseStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 600,
    borderRadius: 'var(--radius-md)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1,
    transition: 'all var(--motion-fast) var(--easing-default)',
    border: 'none',
    fontFamily: 'var(--font-sans)',
  };

  const sizeStyles: Record<string, React.CSSProperties> = {
    sm: { padding: '6px 12px', fontSize: '0.85rem', height: '32px' },
    md: { padding: '10px 18px', fontSize: '0.95rem', height: '42px' },
    lg: { padding: '14px 24px', fontSize: '1.05rem', height: '50px' },
  };

  const variantStyles: Record<string, React.CSSProperties> = {
    primary: {
      background: 'var(--brand-gradient)',
      color: '#ffffff',
      boxShadow: 'var(--shadow-sm)',
    },
    glow: {
      background: 'var(--brand-gradient)',
      color: '#ffffff',
      boxShadow: 'var(--shadow-aura)',
    },
    secondary: {
      backgroundColor: 'var(--bg-surface)',
      color: 'var(--text-primary)',
      border: '1px solid var(--border-color)',
    },
    outline: {
      backgroundColor: 'transparent',
      color: 'var(--brand-primary)',
      border: '1px solid var(--brand-primary)',
    },
    ghost: {
      backgroundColor: 'transparent',
      color: 'var(--text-secondary)',
    },
  };

  return (
    <button
      style={{
        ...baseStyles,
        ...sizeStyles[size],
        ...variantStyles[variant],
        ...style,
      }}
      disabled={disabled}
      className={`orvixa-focus-ring ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
