import { jest } from '@jest/globals';
import type * as ReactModule from 'react';
import type * as ReactNativeModule from 'react-native';

// Native modules have no implementation under Jest; use the libraries' official mocks.
jest.mock('@react-native-async-storage/async-storage', () =>
  jest.requireActual<object>('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
jest.mock('@react-native-community/netinfo', () =>
  jest.requireActual<object>('@react-native-community/netinfo/jest/netinfo-mock.js'),
);
jest.mock(
  'react-native-safe-area-context',
  () => jest.requireActual<{ default: object }>('react-native-safe-area-context/jest/mock').default,
);
// The splash screen is native; tests check when the app asks to hide it.
jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: jest.fn(() => Promise.resolve(true)),
  hideAsync: jest.fn(() => Promise.resolve(true)),
}));

// The focus system's remote-key setup (the TV app imports it at startup). Harmless for the
// phone project, which never renders a focus root.
import '../focus/focusKeys';

// The video player is native: a plain view carrying its props, so tests can read `source` and
// `paused` and fire its events (`fireEvent(video, 'load')` calls `onLoad`).
jest.mock('react-native-video', () => {
  const { createElement } = jest.requireActual<typeof ReactModule>('react');
  const { View } = jest.requireActual<typeof ReactNativeModule>('react-native');
  return { __esModule: true, default: (props: object) => createElement(View, props) };
});
// Phones lock the orientation around the player; tests check the calls.
jest.mock('expo-screen-orientation', () => ({
  lockAsync: jest.fn(() => Promise.resolve()),
  OrientationLock: { PORTRAIT_UP: 'PORTRAIT_UP', LANDSCAPE: 'LANDSCAPE' },
}));
