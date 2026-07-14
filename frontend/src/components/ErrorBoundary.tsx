import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: (error: Error) => ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error!);
      }
      return (
        <div style={{ padding: '20px', color: 'red', backgroundColor: 'white', border: '5px solid red', margin: '20px', borderRadius: '8px' }}>
          <h1 style={{ fontSize: '24px', marginBottom: '10px' }}>Something went wrong in the Admin Panel.</h1>
          <pre style={{ whiteSpace: 'pre-wrap', background: '#f5f5f5', padding: '15px', borderRadius: '4px', overflowX: 'auto' }}>
            {this.state.error?.toString()}
            {"\n\n"}
            {this.state.error?.stack}
          </pre>
        </div>
      );
    }

    return this.props.children;
  }
}
