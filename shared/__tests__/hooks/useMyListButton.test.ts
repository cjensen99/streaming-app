import { beforeEach, describe, expect, it } from '@jest/globals';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, renderHook } from '@testing-library/react-native';
import { useMyListButton } from '../../hooks/useMyListButton';
import { MY_LIST_LIMIT, useMyListStore } from '../../state/myListStore';

beforeEach(async () => {
  useMyListStore.setState({ entries: [], hydrated: true });
  await AsyncStorage.clear();
});

describe('useMyListButton', () => {
  it('adds the channel, then removes it', async () => {
    const { result } = await renderHook(() => useMyListButton('A.us'));
    expect(result.current.isSaved).toBe(false);

    await act(() => result.current.toggle());
    expect(result.current.isSaved).toBe(true);

    await act(() => result.current.toggle());
    expect(result.current.isSaved).toBe(false);
  });

  it(`reports a full list at ${MY_LIST_LIMIT} channels, and does not add more`, async () => {
    useMyListStore.setState({
      entries: Array.from({ length: MY_LIST_LIMIT }, (_, i) => ({ id: `C${i}.us`, addedAt: i })),
    });
    const { result } = await renderHook(() => useMyListButton('New.us'));

    expect(result.current.isFull).toBe(true);
    await act(() => result.current.toggle());
    expect(result.current.isSaved).toBe(false);
    expect(useMyListStore.getState().entries).toHaveLength(MY_LIST_LIMIT);
  });

  it("does not re-render another channel's button when one channel is toggled", async () => {
    let renders = 0;
    await renderHook(() => {
      renders++;
      return useMyListButton('B.us');
    });
    const { result: a } = await renderHook(() => useMyListButton('A.us'));
    const rendersBefore = renders;

    await act(() => a.current.toggle());
    await act(() => a.current.toggle());

    expect(renders).toBe(rendersBefore);
  });

  it('keeps the same toggle function between renders', async () => {
    const { result, rerender } = await renderHook(() => useMyListButton('A.us'));
    const firstToggle = result.current.toggle;

    await rerender({});

    expect(result.current.toggle).toBe(firstToggle);
  });
});
