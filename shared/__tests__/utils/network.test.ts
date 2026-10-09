import { describe, expect, it, jest } from '@jest/globals';
import NetInfo, { type NetInfoState } from '@react-native-community/netinfo';
import { isOnlineState, subscribeToOnlineStatus } from '../../utils/network';

describe('isOnlineState', () => {
  it.each([
    { isConnected: true, online: true },
    // Still checking: treated as online so the app doesn't flash an offline notice.
    { isConnected: null, online: true },
    { isConnected: false, online: false },
  ])('isConnected=$isConnected → $online', (row) => {
    expect(isOnlineState(row)).toBe(row.online);
  });

  it('ignores isInternetReachable, which can be wrong on working networks', () => {
    // Seen on the Android TV emulator: connected, internet works, but reported unreachable.
    expect(isOnlineState({ isConnected: true, isInternetReachable: false } as NetInfoState)).toBe(
      true,
    );
  });
});

describe('subscribeToOnlineStatus', () => {
  it('maps NetInfo states to online/offline and returns NetInfo’s unsubscribe', () => {
    let emit: (state: NetInfoState) => void = () => undefined;
    const unsubscribe = jest.fn();
    jest.mocked(NetInfo.addEventListener).mockImplementation((listener) => {
      emit = listener;
      return unsubscribe;
    });
    const listener = jest.fn();

    const stop = subscribeToOnlineStatus(listener);
    emit({ isConnected: false, isInternetReachable: false } as NetInfoState);
    emit({ isConnected: true, isInternetReachable: true } as NetInfoState);
    stop();

    expect(listener.mock.calls).toEqual([[false], [true]]);
    expect(unsubscribe).toHaveBeenCalled();
  });
});
