import { describe, expect, it } from '@jest/globals';
import { renderHook } from '@testing-library/react-native';
import { useLatest } from '../../hooks/useLatest';

describe('useLatest', () => {
  it('returns the same ref, always holding the latest value', async () => {
    const { result, rerender } = await renderHook(
      ({ value }: { value: number }) => useLatest(value),
      { initialProps: { value: 1 } },
    );
    const firstRef = result.current;

    await rerender({ value: 2 });

    expect(result.current).toBe(firstRef);
    expect(result.current.current).toBe(2);
  });
});
