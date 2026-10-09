import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { type HWEvent, TVEventControl, TVEventHandler } from 'react-native';
import { hardwareBackAdapter } from '../../input/adapters/hardwareBackAdapter';
import type * as RemoteAdapter from '../../input/adapters/remoteAdapter';
import { HOLD_REPEAT_MS, tvEventToKey } from '../../input/adapters/tvEvents';
import type { Dispatch, InputEvent } from '../../input/keys';
import { mockBackButton } from '../helpers/backButton';

/** Loads one platform's adapter by file name (Jest would otherwise pick one for us). */
const loadRemoteAdapter = (platform: 'android' | 'ios') =>
  jest.requireActual<typeof RemoteAdapter>(`../../input/adapters/remoteAdapter.${platform}.ts`)
    .remoteAdapter;

/** Captures the TVEventHandler listener, so a test can send remote events to it. */
function mockRemote() {
  let listener: (event: HWEvent) => void = () => undefined;
  const remove = jest.fn();
  jest.spyOn(TVEventHandler, 'addListener').mockImplementation((callback) => {
    listener = callback;
    return { remove } as unknown as ReturnType<typeof TVEventHandler.addListener>;
  });
  return { send: (event: HWEvent) => listener(event), remove };
}

/** Starts an adapter and returns the app keys it sends for the given remote events. */
function keysFor(platform: 'android' | 'ios', events: HWEvent[]) {
  const remote = mockRemote();
  mockBackButton();
  const received: InputEvent[] = [];
  loadRemoteAdapter(platform).start((event) => (received.push(event), 'handled'));
  events.forEach(remote.send);
  return received.map(({ key }) => key);
}

const press = (eventType: string): HWEvent => ({ eventType, eventKeyAction: 1 });

describe('tvEventToKey (both TV platforms)', () => {
  const map = { right: 'right', select: 'select' } as const;

  it('maps a press, sent as the key release or with no action', () => {
    expect(tvEventToKey(map, { eventType: 'right', eventKeyAction: 1 })).toBe('right');
    expect(tvEventToKey(map, { eventType: 'right' })).toBe('right');
  });

  it('ignores key-downs, so a press counts once even if Android sends both', () => {
    expect(tvEventToKey(map, { eventType: 'select', eventKeyAction: 0 })).toBeUndefined();
    expect(
      tvEventToKey(map, { eventType: 'select', eventKeyAction: '0' as never }),
    ).toBeUndefined();
  });

  it('ignores events the map does not list', () => {
    expect(tvEventToKey(map, press('rewind'))).toBeUndefined();
  });
});

describe.each(['android', 'ios'] as const)('remoteAdapter.%s', (platform) => {
  it('maps the remote buttons the app uses to the same app keys', () => {
    expect(
      keysFor(platform, ['up', 'down', 'left', 'right', 'select', 'playPause'].map(press)),
    ).toEqual(['up', 'down', 'left', 'right', 'select', 'playPause']);
  });

  it('ignores other remote events (Back comes through the Back button)', () => {
    expect(
      keysFor(platform, ['menu', 'back', 'focus', 'blur', 'longSelect', 'rewind'].map(press)),
    ).toEqual([]);
  });

  it('sends Back to the dispatcher, and leaves unhandled Back to the platform', () => {
    mockRemote();
    const back = mockBackButton();
    const dispatch = jest.fn<Dispatch>(() => 'handled');
    loadRemoteAdapter(platform).start(dispatch);

    expect(back.press()).toBe(true);
    expect(dispatch).toHaveBeenCalledWith({ key: 'back' });

    dispatch.mockReturnValue('pass');
    expect(back.press()).toBe(false);
  });

  it('stops listening when stopped', () => {
    const remote = mockRemote();
    const back = mockBackButton();
    const stop = loadRemoteAdapter(platform).start(jest.fn<Dispatch>(() => 'handled'));

    stop();

    expect(remote.remove).toHaveBeenCalled();
    expect(back.press()).toBe(false);
  });
});

describe.each(['android', 'ios'] as const)('remoteAdapter.%s, holding an arrow', (platform) => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it(`repeats the key every ${HOLD_REPEAT_MS} ms until it's released`, () => {
    jest.useFakeTimers();
    const remote = mockRemote();
    mockBackButton();
    const received: InputEvent[] = [];
    loadRemoteAdapter(platform).start((event) => (received.push(event), 'handled'));

    remote.send({ eventType: 'longRight', eventKeyAction: 0 }); // hold starts
    expect(received).toEqual([{ key: 'right' }]);

    jest.advanceTimersByTime(HOLD_REPEAT_MS * 3);
    expect(received).toHaveLength(4);

    remote.send({ eventType: 'longRight', eventKeyAction: 1 }); // released
    jest.advanceTimersByTime(HOLD_REPEAT_MS * 3);
    expect(received).toHaveLength(4);
  });

  it('stops repeating when another button is pressed, or the adapter stops', () => {
    jest.useFakeTimers();
    const remote = mockRemote();
    mockBackButton();
    const received: InputEvent[] = [];
    const stop = loadRemoteAdapter(platform).start((event) => (received.push(event), 'handled'));

    remote.send({ eventType: 'longDown', eventKeyAction: 0 });
    remote.send(press('select'));
    jest.advanceTimersByTime(HOLD_REPEAT_MS * 3);
    expect(received.map(({ key }) => key)).toEqual(['down', 'select']);

    remote.send({ eventType: 'longUp', eventKeyAction: 0 });
    stop();
    jest.advanceTimersByTime(HOLD_REPEAT_MS * 3);
    expect(received.map(({ key }) => key)).toEqual(['down', 'select', 'up']);
  });
});

describe('remoteAdapter.android (Android TV, Fire TV)', () => {
  it('treats separate Play and Pause buttons as play/pause', () => {
    expect(keysFor('android', [press('play'), press('pause')])).toEqual(['playPause', 'playPause']);
  });

  it('has nothing to do when navigation changes', () => {
    expect(loadRemoteAdapter('android')).not.toHaveProperty('setCanGoBack');
  });
});

describe('remoteAdapter.ios (Apple TV)', () => {
  it('gives the Menu button to the app when there is a screen to go back to, and to the system on the top one', () => {
    const enable = jest
      .spyOn(TVEventControl, 'enableTVMenuKey')
      .mockImplementation(() => undefined);
    const disable = jest
      .spyOn(TVEventControl, 'disableTVMenuKey')
      .mockImplementation(() => undefined);
    const adapter = loadRemoteAdapter('ios');

    adapter.setCanGoBack?.(true);
    expect(enable).toHaveBeenCalledTimes(1);

    adapter.setCanGoBack?.(false);
    expect(disable).toHaveBeenCalledTimes(1);
  });
});

describe('hardwareBackAdapter (phones)', () => {
  it('sends Android Back to the dispatcher', () => {
    const back = mockBackButton();
    const dispatch = jest.fn<Dispatch>(() => 'handled');
    hardwareBackAdapter.start(dispatch);

    expect(back.press()).toBe(true);
    expect(dispatch).toHaveBeenCalledWith({ key: 'back' });
  });
});
