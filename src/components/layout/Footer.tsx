import React from 'react';
import { Container } from '../ui/Container';

export const Footer: React.FC = () => {
  return (
    <footer
      style={{
        borderTop: '1px solid var(--border-color)',
        backgroundColor: 'var(--bg-surface)',
        padding: '20px 0',
        marginTop: 'auto',
      }}
    >
      <Container
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.85rem',
          color: 'var(--text-muted)',
        }}
      >
        <div>
          &copy; {new Date().getFullYear()} Orvixa Platform. All rights reserved.
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <span>Architecture Baseline v0.1.0</span>
        </div>
      </Container>
    </footer>
  );
};
