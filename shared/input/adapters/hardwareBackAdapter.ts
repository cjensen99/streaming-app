import { listenForBack } from './backButton';
import type { InputAdapter } from './InputAdapter';

/** The phone app's input: the Android Back button (iOS phones have none; swipe-back is native). */
export const hardwareBackAdapter: InputAdapter = {
  start: listenForBack,
};
