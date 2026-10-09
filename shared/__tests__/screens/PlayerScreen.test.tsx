import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { act, fireEvent, screen, waitFor, within } from '@testing-library/react-native';
import * as ScreenOrientation from 'expo-screen-orientation';
import { categoryPlaylistUrl } from '../../api/iptv/rails';
import { STALL_TIMEOUT_MS } from '../../hooks/usePlayerScreen';
import { CONTROLS_HIDE_MS } from '../../player/types';
import { isPhoneBuild } from '../helpers/formFactor';
import { mockFetch } from '../helpers/mockFetch';
import { appRoutes, renderApp, resetAppState } from '../helpers/renderScreens';

jest.mock('../../ui/Image', () => jest.requireActual<object>('../helpers/mockImage'));
jest.mock('expo-image', () => ({ Image: { prefetch: () => Promise.resolve(true) } }));

// ESPNews needs a referrer header (from the playlist's #EXTVLCOPT line).
const SPORTS_PLAYLIST = `#EXTM3U
#EXTINF:-1 tvg-id="ESPNews.us@SD" group-title="Sports",ESPNews (720p)
#EXTVLCOPT:http-referrer=https://espn.example.com/
https://espnews.example.com/live/index.m3u8
`;

beforeEach(resetAppState);
afterEach(() => {
  jest.useRealTimers();
});

const video = () => screen.getByTestId('video');
const spinner = () => screen.queryByLabelText('Loading');

/** Home → ESPNews → Play. Returns the test input, to press remote keys. */
async function openPlayer({ fakeTimers = false } = {}) {
  mockFetch(appRoutes({ [categoryPlaylistUrl('sports')]: SPORTS_PLAYLIST }));
  const input = await renderApp();
  const tile = await waitFor(() =>
    within(screen.getByTestId('rail-sports')).getByRole('button', { name: 'ESPNews' }),
  );
  await fireEvent.press(tile);
  const play = await screen.findByRole('button', { name: 'Play' });
  // From here on: the player's timeouts are the only timers left that matter.
  if (fakeTimers) jest.useFakeTimers();
  await fireEvent.press(play);
  await waitFor(() => expect(video()).toBeOnTheScreen());
  return input;
}

const startStream = () => fireEvent(video(), 'load', {});
const failStream = () =>
  fireEvent(video(), 'error', { error: { errorString: 'HTTP 403', errorCode: '22004' } });

/** Pauses or resumes the way this build's user would: the remote's Select (TV), a tap (phone). */
async function togglePause(press: (key: 'select') => Promise<unknown>) {
  if (!isPhoneBuild) return press('select');
  if (!screen.queryByRole('button', { name: /^(Play|Pause)$/ })) {
    await fireEvent.press(screen.getByTestId('player-surface'));
  }
  await fireEvent.press(screen.getByRole('button', { name: /^(Play|Pause)$/ }));
}

/** Whether the screen shows the stream paused: the pause icon (TV), the Play button (phone). */
const showsPaused = () =>
  isPhoneBuild
    ? screen.queryByRole('button', { name: 'Play' }) !== null
    : screen.queryByTestId('player-paused') !== null;

describe('Player', () => {
  it('plays the channel full screen with its headers, with a spinner until it starts', async () => {
    await openPlayer();

    expect(video().props.source).toEqual({
      uri: 'https://espnews.example.com/live/index.m3u8',
      headers: { Referer: 'https://espn.example.com/' },
    });
    expect(video().props.paused).toBe(false);
    expect(spinner()).toBeOnTheScreen();

    await startStream();

    expect(spinner()).not.toBeOnTheScreen();
    expect(showsPaused()).toBe(false);
  });

  it('pauses and resumes, showing the paused state', async () => {
    const { press } = await openPlayer();
    await startStream();

    await togglePause(press);
    expect(video().props.paused).toBe(true);
    expect(showsPaused()).toBe(true);

    await togglePause(press);
    expect(video().props.paused).toBe(false);
    expect(showsPaused()).toBe(false);
  });

  it("toggles with the remote's Play/Pause button too", async () => {
    const { press } = await openPlayer();
    await startStream();

    expect(await press('playPause')).toBe('handled');
    expect(video().props.paused).toBe(true);
    await press('playPause');
    expect(video().props.paused).toBe(false);
  });

  it('closes with Back, stopping the stream, back on Detail', async () => {
    const { press } = await openPlayer();
    await startStream();

    expect(await press('back')).toBe('handled');

    await waitFor(() => expect(screen.queryByTestId('video')).not.toBeOnTheScreen());
    expect(screen.getByRole('button', { name: 'Play' })).toBeOnTheScreen();
  });

  it('shows an error with Retry, which starts the stream again', async () => {
    await openPlayer();
    await startStream();

    await failStream();

    expect(screen.getByText("Can't play this channel")).toBeOnTheScreen();
    expect(screen.queryByTestId('video')).not.toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Retry' }));

    expect(video()).toBeOnTheScreen();
    expect(spinner()).toBeOnTheScreen();
  });

  it('leaves from the error with its Back button', async () => {
    await openPlayer();
    await failStream();

    await fireEvent.press(screen.getByRole('button', { name: 'Back' }));

    await waitFor(() =>
      expect(screen.queryByText("Can't play this channel")).not.toBeOnTheScreen(),
    );
    expect(screen.getByRole('button', { name: 'Play' })).toBeOnTheScreen();
  });

  it("fails a stream that doesn't start, or stalls, for too long, but never while paused", async () => {
    const { press } = await openPlayer({ fakeTimers: true });
    await act(() => jest.advanceTimersByTime(STALL_TIMEOUT_MS - 1));
    await startStream();
    await fireEvent(video(), 'buffer', { isBuffering: true });
    // (Phones show a spinner instead of the pause button while stalled; the key works on both.)
    await press('playPause');

    await act(() => jest.advanceTimersByTime(STALL_TIMEOUT_MS * 2));
    expect(screen.queryByText("Can't play this channel")).not.toBeOnTheScreen();

    await press('playPause');
    await act(() => jest.advanceTimersByTime(STALL_TIMEOUT_MS));

    expect(screen.getByText("Can't play this channel")).toBeOnTheScreen();
  });
});

(isPhoneBuild ? describe : describe.skip)('Player on phones', () => {
  it('turns to landscape while open and back to portrait on the way out', async () => {
    const { press } = await openPlayer();
    expect(ScreenOrientation.lockAsync).toHaveBeenLastCalledWith('LANDSCAPE');

    await press('back');

    await waitFor(() =>
      expect(ScreenOrientation.lockAsync).toHaveBeenLastCalledWith('PORTRAIT_UP'),
    );
  });

  it('shows the controls on a tap and hides them after a while, unless paused', async () => {
    await openPlayer({ fakeTimers: true });
    await startStream();
    expect(screen.queryByRole('button', { name: 'Back' })).not.toBeOnTheScreen();

    await fireEvent.press(screen.getByTestId('player-surface'));
    expect(screen.getByRole('button', { name: 'Pause' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Back' })).toBeOnTheScreen();

    await act(() => jest.advanceTimersByTime(CONTROLS_HIDE_MS));
    expect(screen.queryByRole('button', { name: 'Back' })).not.toBeOnTheScreen();

    await fireEvent.press(screen.getByTestId('player-surface'));
    await fireEvent.press(screen.getByRole('button', { name: 'Pause' }));
    await act(() => jest.advanceTimersByTime(CONTROLS_HIDE_MS * 2));
    expect(screen.getByRole('button', { name: 'Play' })).toBeOnTheScreen();
  });

  it('closes with the Back arrow', async () => {
    await openPlayer();
    await startStream();
    await fireEvent.press(screen.getByTestId('player-surface'));

    await fireEvent.press(screen.getByRole('button', { name: 'Back' }));

    await waitFor(() => expect(screen.queryByTestId('video')).not.toBeOnTheScreen());
  });
});

(isPhoneBuild ? describe.skip : describe)('Player on TVs', () => {
  it('has no touch controls (the remote does it all)', async () => {
    await openPlayer();
    await startStream();

    expect(screen.queryByTestId('player-surface')).not.toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Back' })).not.toBeOnTheScreen();
  });
});
