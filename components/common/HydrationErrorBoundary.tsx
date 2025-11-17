import { Component, ErrorInfo, ReactNode } from 'react';
import Router from 'next/router';
import { LocaleContext, LocaleContextValue } from '../../context/LocaleContext';
import { Locale, TRANSLATIONS } from '../../constants/i18n';

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
  static contextType = LocaleContext;
  declare context: LocaleContextValue | undefined;

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
        console.error(error, errorInfo);
      }
    }
  }

  render() {
    if (this.state.hasError) {
      const locale: Locale = this.context?.locale ?? 'en';
      const message = TRANSLATIONS[locale].hydration.refreshing;
      return (
        <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'var(--bg)' }}>
          <p style={{ color: 'var(--muted)' }}>{message}</p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default HydrationErrorBoundary;
