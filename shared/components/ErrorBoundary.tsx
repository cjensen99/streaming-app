import { Component, type ErrorInfo, type ReactNode } from 'react';
import { logger } from '../utils/logger';
import { DefaultFocus } from '../focus/DefaultFocus';
import { FocusRoot } from '../focus/FocusRoot';
import { ErrorState } from './ErrorState';

export interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * Catches errors thrown while rendering its children, logs them (`logger.error` is where crash
 * reporting would hook in) and shows an error screen whose "Try again" renders the children
 * afresh. A class because React has no hook for error boundaries.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  override state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    logger.error('Unexpected render error', { error, componentStack: info.componentStack });
  }

  private readonly reset = () => this.setState({ error: null });

  override render() {
    if (!this.state.error) return this.props.children;
    // Its own focus area (the screens' areas went with them), with Try again focused (TVs).
    return (
      <FocusRoot active>
        <DefaultFocus>
          <ErrorState
            message="The app hit an unexpected problem."
            onRetry={this.reset}
            retryLabel="Try again"
          />
        </DefaultFocus>
      </FocusRoot>
    );
  }
}
