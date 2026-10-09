import { type HWEvent, TVEventHandler } from 'react-native';
import type { AppKey, Dispatch } from '../keys';

/** A TV platform's remote events (react-native-tvos `TVEventHandler` event types) → app keys. */
export type TVEventKeyMap = Readonly<Record<string, AppKey>>;

/**
 * Native key action for a key going down. Both TV platforms send one event per press, as the
 * release (`1`): tvOS buttons are tap gestures that fire when they end, and Android TV sends
 * key-downs only if React Native's `enableKeyDownEvents` flag is on. If it ever is, the key-down
 * is dropped so a press still counts once.
 */
const KEY_DOWN = 0;

/** The app key for a remote event, or undefined if the map doesn't use it (or it's a key-down). */
export function tvEventToKey(keyMap: TVEventKeyMap, event: HWEvent): AppKey | undefined {
  if (Number(event.eventKeyAction) === KEY_DOWN) return undefined;
  return keyMap[event.eventType];
}

/** Sends a TV platform's remote presses to `dispatch`, mapped with its `keyMap`. */
export function listenForTVEvents(keyMap: TVEventKeyMap, dispatch: Dispatch): () => void {
  const subscription = TVEventHandler.addListener((event) => {
    const key = tvEventToKey(keyMap, event);
    if (key) dispatch({ key });
  });
  return () => subscription?.remove();
}
