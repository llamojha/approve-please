import { Component, ErrorInfo, ReactNode } from 'react';
import Router from 'next/router';
import { LocaleContext, LocaleContextValue } from '../../context/LocaleContext';
import { Locale, TRANSLATIONS } from '../../constants/i18n';

interface HydrationErrorBoundaryProps {
  children: ReactNode;
}

interface HydrationErrorBoundaryState {
  hasError: boolean;
  isHydration: boolean;
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
    hasError: false,
    isHydration: false
  };
  static contextType = LocaleContext;
  declare context: LocaleContextValue | undefined;

  static getDerivedStateFromError(error: Error): HydrationErrorBoundaryState {
    return { hasError: true, isHydration: isHydrationError(error), message: error.message };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(error, errorInfo);
    if (isHydrationError(error) && typeof window !== 'undefined') {
      // Belt-and-braces: initial state is deterministic now, so this path
      // should never fire; keep the redirect for hydration errors only.
      Router.replace('/');
    }
  }

  render() {
    if (this.state.hasError) {
      const locale: Locale = this.context?.locale ?? 'en';
      const copy = TRANSLATIONS[locale].hydration;

      if (this.state.isHydration) {
        return (
          <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'var(--bg)' }}>
            <p style={{ color: 'var(--muted)' }}>{copy.refreshing}</p>
          </div>
        );
      }

      return (
        <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'var(--bg)' }}>
          <div style={{ display: 'grid', gap: '16px', justifyItems: 'center' }}>
            <p style={{ color: 'var(--muted)' }}>{copy.crashed}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: '1px solid var(--muted)',
                background: 'transparent',
                color: 'var(--muted)',
                cursor: 'pointer'
              }}
            >
              {copy.reloadButton}
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default HydrationErrorBoundary;
