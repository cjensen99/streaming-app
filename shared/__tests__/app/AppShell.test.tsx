import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import NetInfo, { type NetInfoState } from '@react-native-community/netinfo';
import { act, screen, waitFor } from '@testing-library/react-native';
import * as SplashScreen from 'expo-splash-screen';
import { categoryPlaylistUrl } from '../../api/iptv/rails';
import { SPLASH_MAX_WAIT_MS } from '../../hooks/useAppShell';
import { mockFetch } from '../helpers/mockFetch';
import { appRoutes, renderApp, resetAppState } from '../helpers/renderScreens';

jest.mock('../../ui/Image', () => jest.requireActual<object>('../helpers/mockImage'));
jest.mock('expo-image', () => ({ Image: { prefetch: () => Promise.resolve(true) } }));

/** Lets the test switch the device's connection on and off. */
let setConnected: (isConnected: boolean) => void = () => undefined;

beforeEach(async () => {
  await resetAppState();
  jest.mocked(SplashScreen.hideAsync).mockClear();
  jest.mocked(NetInfo.addEventListener).mockImplementation((listener) => {
    setConnected = (isConnected) => listener({ isConnected } as NetInfoState);
    return () => undefined;
  });
});
afterEach(() => {
  jest.useRealTimers();
});

const pendingRails = () =>
  appRoutes({
    [categoryPlaylistUrl('news')]: { pending: true },
    [categoryPlaylistUrl('sports')]: { pending: true },
    [categoryPlaylistUrl('movies')]: { pending: true },
  });

describe('No internet connection', () => {
  it('covers the app while offline, hiding it from screen readers, and uncovers it after', async () => {
    mockFetch(appRoutes());
    await renderApp();
    await waitFor(() =>
      expect(screen.queryAllByTestId('rail-spinner', { includeHiddenElements: true })).toHaveLength(
        0,
      ),
    );

    await act(() => setConnected(false));

    expect(screen.getByText('No internet connection')).toBeOnTheScreen();
    // Still mounted underneath (so the user returns to the same place), but not reachable.
    expect(screen.queryByRole('header', { name: 'News' })).not.toBeOnTheScreen();
    expect(screen.getByRole('header', { name: 'News', includeHiddenElements: true })).toBeTruthy();

    await act(() => setConnected(true));

    expect(screen.queryByText('No internet connection')).not.toBeOnTheScreen();
    expect(screen.getByRole('header', { name: 'News' })).toBeOnTheScreen();
  });
});

describe('Splash screen', () => {
  it('stays up while any rail is still loading', async () => {
    mockFetch(appRoutes({ [categoryPlaylistUrl('movies')]: { pending: true } }));
    await renderApp();

    await waitFor(() =>
      expect(screen.getAllByRole('button', { name: 'ESPNews' }).length).toBeGreaterThan(0),
    );
    expect(SplashScreen.hideAsync).not.toHaveBeenCalled();
  });

  it('hides once every rail has finished, even if one failed', async () => {
    mockFetch(appRoutes({ [categoryPlaylistUrl('movies')]: { status: 404 } }));
    await renderApp();

    await waitFor(() => expect(SplashScreen.hideAsync).toHaveBeenCalledTimes(1));
    expect(screen.getByText("Couldn't load Movies.")).toBeOnTheScreen();
  });

  it(`hides after ${SPLASH_MAX_WAIT_MS / 1000} s even if the channels are still loading`, async () => {
    jest.useFakeTimers();
    mockFetch(pendingRails());
    await renderApp();

    await act(() => jest.advanceTimersByTime(SPLASH_MAX_WAIT_MS - 1));
    expect(SplashScreen.hideAsync).not.toHaveBeenCalled();

    await act(() => jest.advanceTimersByTime(1));
    expect(SplashScreen.hideAsync).toHaveBeenCalledTimes(1);
    expect(screen.getAllByTestId('rail-spinner', { includeHiddenElements: true })).toHaveLength(3);
  });

  it('hides straight away when the app starts offline', async () => {
    mockFetch(pendingRails());
    await renderApp();

    await act(() => setConnected(false));

    expect(SplashScreen.hideAsync).toHaveBeenCalledTimes(1);
    expect(screen.getByText('No internet connection')).toBeOnTheScreen();
  });
});
