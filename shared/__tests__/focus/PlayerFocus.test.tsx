import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import type { AppKey } from '../../input/keys';
import { mockFetch } from '../helpers/mockFetch';
import { appRoutes, renderApp, resetAppState } from '../helpers/renderScreens';

jest.mock('../../ui/Image', () => jest.requireActual<object>('../helpers/mockImage'));
jest.mock('expo-image', () => ({ Image: { prefetch: () => Promise.resolve(true) } }));

beforeEach(resetAppState);

const focusedLabel = () =>
  screen.getByRole('button', { selected: true }).props.accessibilityLabel as string;

/** Home (focus on ABC News Live) → Select opens Detail → Select on Play opens the player. */
async function openPlayerWithRemote() {
  mockFetch(appRoutes());
  const input = await renderApp({ withFocus: true });
  const press = async (...keys: AppKey[]) => {
    for (const key of keys) await input.press(key);
  };
  await waitFor(() => expect(focusedLabel()).toBe('ABC News Live'));
  await press('select');
  await waitFor(() => expect(focusedLabel()).toBe('Play'));
  await press('select');
  await waitFor(() => expect(screen.getByTestId('video')).toBeOnTheScreen());
  return press;
}

describe('Player focus (TVs)', () => {
  it('Select pauses instead of pressing the Play button underneath', async () => {
    const press = await openPlayerWithRemote();
    await fireEvent(screen.getByTestId('video'), 'load', {});

    await press('select');

    expect(screen.getByTestId('video').props.paused).toBe(true);
    expect(screen.getByTestId('player-paused')).toBeOnTheScreen();
  });

  it('focuses Retry on an error, and Select retries', async () => {
    const press = await openPlayerWithRemote();
    await fireEvent(screen.getByTestId('video'), 'error', { error: { errorString: 'HTTP 403' } });

    await waitFor(() => expect(focusedLabel()).toBe('Retry'));
    await press('select');

    expect(screen.getByTestId('video')).toBeOnTheScreen();
  });

  it('returns to Detail with focus back on Play', async () => {
    const press = await openPlayerWithRemote();

    await press('back');

    await waitFor(() => expect(screen.queryByTestId('video')).not.toBeOnTheScreen());
    expect(focusedLabel()).toBe('Play');
  });
});
