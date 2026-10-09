import { Directions, SpatialNavigation } from 'react-tv-space-navigation';
import type { AppKey, InputHandler } from '../input/keys';

/**
 * Connects the focus system to the app's input (TVs; imported by the TV app only). Keys arrive
 * from the input dispatcher after every input layer has had its say, so a layer (e.g. the player,
 * later) can take a key before focus moves.
 *
 * The library's remote configuration is global by design, so the active screens' listeners live
 * here, at module level: each screen's focus root subscribes while it's active.
 */
const KEY_DIRECTIONS: Partial<Record<AppKey, Directions>> = {
  up: Directions.UP,
  down: Directions.DOWN,
  left: Directions.LEFT,
  right: Directions.RIGHT,
  select: Directions.ENTER,
};

type DirectionListener = (direction: Directions | null) => void;
const listeners = new Set<DirectionListener>();

SpatialNavigation.configureRemoteControl({
  remoteControlSubscriber: (listener: DirectionListener) => {
    listeners.add(listener);
    return listener;
  },
  remoteControlUnsubscriber: (listener: DirectionListener) => {
    listeners.delete(listener);
  },
});

/** Moves focus (or selects) for a key. `pass` for keys focus doesn't use, or with no active screen. */
export const sendKeyToFocus: InputHandler = ({ key }) => {
  const direction = KEY_DIRECTIONS[key];
  if (!direction || listeners.size === 0) return 'pass';
  listeners.forEach((listener) => listener(direction));
  return 'handled';
};
