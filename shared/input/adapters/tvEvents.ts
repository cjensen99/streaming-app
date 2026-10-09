import { type HWEvent, TVEventHandler } from 'react-native';
import type { AppKey, Dispatch } from '../keys';

/** A TV platform's remote events (react-native-tvos `TVEventHandler` event types) → app keys. */
export type TVEventKeyMap = Readonly<Record<string, AppKey>>;

export interface TVKeyMaps {
  /** One press, one key. */
  keys: TVEventKeyMap;
  /** Button held down (long-press events): the key repeats until it's released. */
  holdKeys: TVEventKeyMap;
}

/** While a button is held, its key repeats this often. */
export const HOLD_REPEAT_MS = 150;

/**
 * Native key actions. Both TV platforms send one event per press, as the release (`1`): tvOS
 * buttons are tap gestures that fire when they end, and Android TV sends key-downs only if React
 * Native's `enableKeyDownEvents` flag is on (if it ever is, the key-down is dropped so a press
 * still counts once). Long presses are the exception: they start with a key-down and end with a
 * release.
 */
const KEY_DOWN = 0;
const KEY_UP = 1;

/** The app key for a press, or undefined if the map doesn't use it (or it's a key-down). */
export function tvEventToKey(keyMap: TVEventKeyMap, event: HWEvent): AppKey | undefined {
  if (Number(event.eventKeyAction) === KEY_DOWN) return undefined;
  return keyMap[event.eventType];
}

/** Sends a TV platform's remote presses to `dispatch`, mapped with its key maps. */
export function listenForTVEvents({ keys, holdKeys }: TVKeyMaps, dispatch: Dispatch): () => void {
  let repeat: ReturnType<typeof setInterval> | undefined;
  const stopRepeating = () => {
    clearInterval(repeat);
    repeat = undefined;
  };

  const subscription = TVEventHandler.addListener((event) => {
    // Any other event (including the hold's own release) ends a hold.
    stopRepeating();
    const heldKey = holdKeys[event.eventType];
    if (heldKey) {
      if (Number(event.eventKeyAction) === KEY_UP) return;
      dispatch({ key: heldKey });
      repeat = setInterval(() => dispatch({ key: heldKey }), HOLD_REPEAT_MS);
      return;
    }
    const key = tvEventToKey(keys, event);
    if (key) dispatch({ key });
  });

  return () => {
    stopRepeating();
    subscription?.remove();
  };
}
