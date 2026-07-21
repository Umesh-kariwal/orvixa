import React from 'react';
import { useRouteError } from 'react-router-dom';

export const AppErrorBoundary: React.FC = () => {
  const error: any = useRouteError();
  console.error('[AppErrorBoundary] Captured routing crash:', error);

  const errorMessage = error instanceof Error 
    ? error.message 
    : (typeof error === 'object' && error !== null ? JSON.stringify(error) : String(error));

  const errorStack = error instanceof Error ? error.stack : undefined;
  const isDev = import.meta.env.DEV;

  return (
    <div style={{
      padding: '40px 24px',
      color: '#f87171',
      backgroundColor: '#111827',
      minHeight: '100vh',
      fontFamily: 'sans-serif',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
    }}>
      <h2 style={{ margin: 0, fontSize: '20px', color: '#ef4444' }}>Orvixa Routing Collision</h2>
      <p style={{ color: '#9ca3af', fontSize: '14px', margin: 0 }}>
        {isDev ? 'Detailed crash stack trace (Development mode active):' : 'An unexpected application exception occurred. Please try reloading the sidebar.'}
      </p>
      
      {isDev && (
        <pre style={{
          padding: '16px',
          background: '#1f2937',
          borderRadius: '8px',
          color: '#f3f4f6',
          fontSize: '12px',
          overflowX: 'auto',
          margin: 0,
          border: '1px solid #374151',
          whiteSpace: 'pre-wrap',
        }}>
          {errorMessage}
          {errorStack && `\n\nStack:\n${errorStack}`}
        </pre>
      )}
    </div>
  );
};
