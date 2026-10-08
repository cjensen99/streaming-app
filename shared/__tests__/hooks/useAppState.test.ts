import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { act, renderHook } from '@testing-library/react-native';
import { AppState, type AppStateStatus } from 'react-native';
import { useAppState } from '../../hooks/useAppState';

// React Native's Jest mock of AppState makes `currentState` a mock function, so tests set it.
const originalCurrentState = AppState.currentState;
afterEach(() => {
  AppState.currentState = originalCurrentState;
});

describe('useAppState', () => {
  it('follows app state changes and unsubscribes on unmount', async () => {
    let onChange: (state: AppStateStatus) => void = () => undefined;
    const remove = jest.fn();
    jest.spyOn(AppState, 'addEventListener').mockImplementation((_type, listener) => {
      onChange = listener;
      return { remove };
    });
    AppState.currentState = 'active';

    const { result, unmount } = await renderHook(() => useAppState());
    expect(result.current).toBe('active');

    await act(() => {
      AppState.currentState = 'background';
      onChange('background');
    });
    expect(result.current).toBe('background');

    await unmount();
    expect(remove).toHaveBeenCalled();
  });
});
