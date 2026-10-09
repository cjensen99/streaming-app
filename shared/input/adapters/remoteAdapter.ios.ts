import { TVEventControl } from 'react-native';
import { listenForBack } from './backButton';
import type { InputAdapter } from './InputAdapter';
import { listenForTVEvents, type TVKeyMaps } from './tvEvents';

/**
 * Apple TV (Siri Remote) events → app keys. Menu isn't here: it arrives through `BackHandler`
 * as Back (`backButton.ts`) while the Menu key is enabled. Events not listed are ignored.
 */
const TVOS_KEYS: TVKeyMaps['keys'] = {
  up: 'up',
  down: 'down',
  left: 'left',
  right: 'right',
  select: 'select',
  playPause: 'playPause',
};

/** A held arrow: the long-press events, sent when the hold starts and when it ends. */
const HOLD_KEYS: TVKeyMaps['holdKeys'] = {
  longUp: 'up',
  longDown: 'down',
  longLeft: 'left',
  longRight: 'right',
};

/** Apple TV remotes. */
export const remoteAdapter: InputAdapter = {
  start(dispatch) {
    const stopBack = listenForBack(dispatch);
    const stopKeys = listenForTVEvents({ keys: TVOS_KEYS, holdKeys: HOLD_KEYS }, dispatch);
    return () => {
      stopBack();
      stopKeys();
    };
  },
  // Apple requires Menu on an app's top screen to return to the Apple TV home screen, so the
  // Menu key goes to the system there and to the app whenever there's a screen to go back to.
  setCanGoBack(canGoBack) {
    if (canGoBack) TVEventControl.enableTVMenuKey();
    else TVEventControl.disableTVMenuKey();
  },
};
