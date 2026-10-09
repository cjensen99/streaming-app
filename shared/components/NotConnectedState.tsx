import { StateMessage } from './StateMessage';

export interface NotConnectedStateProps {
  testID?: string;
}

/**
 * Shown full screen instead of the menus while the device has no network connection. Nothing to
 * press: channels load by themselves as soon as a connection appears.
 */
export function NotConnectedState({ testID }: NotConnectedStateProps) {
  return (
    <StateMessage
      icon="offline"
      title="No internet connection"
      message="Check your Wi-Fi or network cable. Channels will load as soon as you're back online."
      testID={testID}
    />
  );
}
