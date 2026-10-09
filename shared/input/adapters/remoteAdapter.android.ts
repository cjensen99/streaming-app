import { listenForBack } from './backButton';
import type { InputAdapter } from './InputAdapter';
import { listenForTVEvents, type TVEventKeyMap } from './tvEvents';

/**
 * Android TV and Fire TV remote events → app keys. Back isn't here: it arrives through the Back
 * button (`backButton.ts`). Events not listed are ignored.
 */
const ANDROID_TV_KEYS: TVEventKeyMap = {
  up: 'up',
  down: 'down',
  left: 'left',
  right: 'right',
  select: 'select',
  playPause: 'playPause',
  // Some remotes have separate Play and Pause buttons: both toggle.
  play: 'playPause',
  pause: 'playPause',
};

/** Android TV and Fire TV remotes. */
export const remoteAdapter: InputAdapter = {
  start(dispatch) {
    const stopBack = listenForBack(dispatch);
    const stopKeys = listenForTVEvents(ANDROID_TV_KEYS, dispatch);
    return () => {
      stopBack();
      stopKeys();
    };
  },
};
