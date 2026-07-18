import React from 'react';
import { logger } from '../utils/logger';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    logger.error('ErrorBoundary caught:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-white px-6">
          <div className="max-w-md text-center">
            <h1 className="text-2xl font-light font-serif italic mb-4">
              Something went wrong
            </h1>
            <p className="text-sm text-zinc-500 mb-6">
              The application encountered an unexpected error. Please reload to continue.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="border border-black px-6 py-2 text-xs uppercase tracking-widest font-semibold hover:bg-black hover:text-white transition-colors"
            >
              Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
