import { Platform } from 'react-native';

/**
 * Device facts for small layout or behaviour differences that don't justify a `.mobile.tsx`
 * file. Read them from here rather than from `Platform` directly, so a future web-TV build can
 * provide its own answer (`device.web.ts`: react-native-web reports `Platform.isTV` as false).
 */
export const device = {
  /** A 10-foot TV app: tvOS, Android TV or Fire TV. */
  isTV: Platform.isTV,
} as const;
