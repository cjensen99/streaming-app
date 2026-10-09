import { useEffect, useState } from 'react';
import { useHomeRails } from './useHomeRails';
import { useIsMyListLoaded } from './useIsMyListLoaded';
import { useIsOnline } from './useIsOnline';
import { useHideSplashScreen } from './useSplashScreen';

/** The longest the splash screen waits for channels before showing loading rails instead. */
export const SPLASH_MAX_WAIT_MS = 5_000;

export interface AppShellState {
  /** False while the device has no network connection: the app shows "No internet connection". */
  isOnline: boolean;
}

/**
 * App-wide state above the screens. Keeps the splash screen up until the first screen is worth
 * showing: My List is read and every category rail has loaded or failed, or `SPLASH_MAX_WAIT_MS`
 * has passed (slow networks then see loading rails). Offline, it hides straight away so the
 * "No internet connection" screen shows.
 */
export function useAppShell(): AppShellState {
  const isOnline = useIsOnline();
  const rails = useHomeRails();
  const isMyListLoaded = useIsMyListLoaded();

  const [waitedTooLong, setWaitedTooLong] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setWaitedTooLong(true), SPLASH_MAX_WAIT_MS);
    return () => clearTimeout(timer);
  }, []);

  const channelsSettled = isMyListLoaded && rails.every(({ isLoading }) => !isLoading);
  useHideSplashScreen(!isOnline || channelsSettled || waitedTooLong);

  return { isOnline };
}
