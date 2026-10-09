import { describe, expect, it, jest } from '@jest/globals';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { AccessibilityInfo } from 'react-native';
import { useReduceMotion } from '../../hooks/useReduceMotion';

describe('useReduceMotion', () => {
  it('reads the setting, then follows changes', async () => {
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(true);
    let listener: ((enabled: boolean) => void) | undefined;
    jest.spyOn(AccessibilityInfo, 'addEventListener').mockImplementation((_event, handler) => {
      listener = handler as unknown as (enabled: boolean) => void;
      return { remove: jest.fn() } as never;
    });

    const { result } = await renderHook(() => useReduceMotion());
    await waitFor(() => expect(result.current).toBe(true));

    await act(() => listener?.(false));
    expect(result.current).toBe(false);
  });

  it('stops listening on unmount', async () => {
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false);
    const remove = jest.fn();
    jest.spyOn(AccessibilityInfo, 'addEventListener').mockReturnValue({ remove } as never);

    const { unmount } = await renderHook(() => useReduceMotion());
    await unmount();

    expect(remove).toHaveBeenCalledTimes(1);
  });
});
