import { TVEventControl } from 'react-native';
import { listenForBack } from './backButton';
import type { InputAdapter } from './InputAdapter';
import { listenForTVEvents, type TVEventKeyMap } from './tvEvents';

/**
 * Apple TV (Siri Remote) events → app keys. Menu isn't here: it arrives through `BackHandler`
 * as Back (`backButton.ts`) while the Menu key is enabled. Events not listed are ignored.
 */
const TVOS_KEYS: TVEventKeyMap = {
  up: 'up',
  down: 'down',
  left: 'left',
  right: 'right',
  select: 'select',
  playPause: 'playPause',
};

/** Apple TV remotes. */
export const remoteAdapter: InputAdapter = {
  start(dispatch) {
    const stopBack = listenForBack(dispatch);
    const stopKeys = listenForTVEvents(TVOS_KEYS, dispatch);
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
