import { listenForBack } from './backButton';
import type { InputAdapter } from './InputAdapter';
import { listenForTVEvents, type TVKeyMaps } from './tvEvents';

/**
 * Android TV and Fire TV remote events → app keys. Back isn't here: it arrives through the Back
 * button (`backButton.ts`). Events not listed are ignored.
 */
const ANDROID_TV_KEYS: TVKeyMaps['keys'] = {
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

/** A held arrow: the long-press events, sent when the hold starts and when it ends. */
const HOLD_KEYS: TVKeyMaps['holdKeys'] = {
  longUp: 'up',
  longDown: 'down',
  longLeft: 'left',
  longRight: 'right',
};

/** Android TV and Fire TV remotes. */
export const remoteAdapter: InputAdapter = {
  start(dispatch) {
    const stopBack = listenForBack(dispatch);
    const stopKeys = listenForTVEvents({ keys: ANDROID_TV_KEYS, holdKeys: HOLD_KEYS }, dispatch);
    return () => {
      stopBack();
      stopKeys();
    };
  },
};
