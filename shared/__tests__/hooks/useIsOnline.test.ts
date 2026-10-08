import { describe, expect, it, jest } from '@jest/globals';
import NetInfo, { type NetInfoState } from '@react-native-community/netinfo';
import { act, renderHook } from '@testing-library/react-native';
import { useIsOnline } from '../../hooks/useIsOnline';

describe('useIsOnline', () => {
  it('starts online, follows connectivity changes and unsubscribes on unmount', async () => {
    let emit: (state: NetInfoState) => void = () => undefined;
    const unsubscribe = jest.fn();
    jest.mocked(NetInfo.addEventListener).mockImplementation((listener) => {
      emit = listener;
      return unsubscribe;
    });

    const { result, unmount } = await renderHook(() => useIsOnline());
    expect(result.current).toBe(true);

    await act(() => emit({ isConnected: false, isInternetReachable: false } as NetInfoState));
    expect(result.current).toBe(false);

    await act(() => emit({ isConnected: true, isInternetReachable: true } as NetInfoState));
    expect(result.current).toBe(true);

    await unmount();
    expect(unsubscribe).toHaveBeenCalled();
  });
});
