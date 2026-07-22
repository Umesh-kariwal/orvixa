import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class GlobalErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[GlobalErrorBoundary] Caught rendering exception:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  public render() {
    if (this.state.hasError) {
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
          <h2 style={{ margin: 0, fontSize: '20px', color: '#ef4444' }}>Orvixa Engine Failure</h2>
          <p style={{ color: '#9ca3af', fontSize: '14px', margin: 0 }}>
            {isDev ? 'Detailed rendering crash stack trace (Development mode):' : 'A critical interface error occurred. Please try reloading the sidebar panel.'}
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
              {this.state.error?.toString()}
              {this.state.errorInfo?.componentStack && `\n\nComponent Stack:\n${this.state.errorInfo.componentStack}`}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
