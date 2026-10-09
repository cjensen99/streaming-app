import { describe, expect, it } from '@jest/globals';
import { act, renderHook } from '@testing-library/react-native';
import { useIsMyListLoaded } from '../../hooks/useIsMyListLoaded';
import { useMyListStore } from '../../state/myListStore';

describe('useIsMyListLoaded', () => {
  it('follows loading, and ignores changes to the list itself', async () => {
    useMyListStore.setState({ entries: [], hydrated: false });
    let renders = 0;
    const { result } = await renderHook(() => {
      renders++;
      return useIsMyListLoaded();
    });
    expect(result.current).toBe(false);

    await act(() => useMyListStore.setState({ hydrated: true }));
    expect(result.current).toBe(true);
    const rendersAfterLoad = renders;

    await act(() => useMyListStore.getState().add('A.us'));
    expect(renders).toBe(rendersAfterLoad);
  });
});
