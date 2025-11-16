import { Component, ErrorInfo, ReactNode } from 'react';
import Router from 'next/router';

interface HydrationErrorBoundaryProps {
  children: ReactNode;
}

interface HydrationErrorBoundaryState {
  hasError: boolean;
  message?: string;
}

const isHydrationError = (error: Error) => {
  if (!error?.message) {
    return false;
  }
  return /Hydration failed/i.test(error.message) || /didn't match the client/i.test(error.message);
};

class HydrationErrorBoundary extends Component<HydrationErrorBoundaryProps, HydrationErrorBoundaryState> {
  state: HydrationErrorBoundaryState = {
    hasError: false
  };

  static getDerivedStateFromError(error: Error): HydrationErrorBoundaryState | null {
    if (isHydrationError(error)) {
      return { hasError: true, message: error.message };
    }
    return null;
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (isHydrationError(error)) {
      if (typeof window !== 'undefined') {
        Router.replace('/');
      }
    } else {
      if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.error(error, errorInfo);
      }
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'var(--bg)' }}>
          <p style={{ color: 'var(--muted)' }}>Refreshing your session…</p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default HydrationErrorBoundary;
