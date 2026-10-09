import { BackHandler } from 'react-native';
import type { Dispatch } from '../keys';

/**
 * Sends the platform's Back button (Android Back, the tvOS Menu button) to `dispatch` as `back`.
 * Returning false hands an unhandled press to the platform's default. Back handlers run newest
 * first, so this one, started above the navigation container, decides before React Navigation's.
 */
export function listenForBack(dispatch: Dispatch): () => void {
  const subscription = BackHandler.addEventListener(
    'hardwareBackPress',
    () => dispatch({ key: 'back' }) === 'handled',
  );
  return () => subscription.remove();
}
