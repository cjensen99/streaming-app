import { useFocusEffect } from '@react-navigation/native';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useCallback } from 'react';
import { logger } from '../utils/logger';

const lock = (orientation: ScreenOrientation.OrientationLock) =>
  ScreenOrientation.lockAsync(orientation).catch((error: unknown) =>
    logger.warn('Could not lock the screen orientation', error),
  );

/**
 * Turns the phone to landscape while this screen is showing, and back to portrait (the menus'
 * orientation, see `App.tsx`) as soon as it starts closing.
 */
export function useLandscape(): void {
  useFocusEffect(
    useCallback(() => {
      void lock(ScreenOrientation.OrientationLock.LANDSCAPE);
      return () => void lock(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    }, []),
  );
}
