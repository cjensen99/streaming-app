import { StateMessage } from './StateMessage';

export interface EmptyStateProps {
  message: string;
  title?: string;
  testID?: string;
}

/** Shown where a list would be when it has nothing in it, e.g. "No channels in My List yet". */
export function EmptyState({ message, title, testID }: EmptyStateProps) {
  return <StateMessage title={title} message={message} testID={testID} />;
}
