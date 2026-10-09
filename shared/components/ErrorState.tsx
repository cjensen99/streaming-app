import { Button } from '../ui/Button';
import { StateMessage } from './StateMessage';

export interface ErrorStateProps {
  /** Defaults to "Something went wrong". */
  title?: string;
  message?: string;
  /** Shows a Retry button when given. */
  onRetry?: () => void;
  /** Defaults to "Retry". */
  retryLabel?: string;
  testID?: string;
}

/** A failure that fills its parent, with a way to try again. */
export function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
  retryLabel = 'Retry',
  testID,
}: ErrorStateProps) {
  return (
    <StateMessage
      icon="alert"
      title={title}
      message={message}
      testID={testID}
      action={onRetry && <Button label={retryLabel} variant="primary" onSelect={onRetry} />}
    />
  );
}
