import { useMyListStore } from '../state/myListStore';

/**
 * Whether the saved My List has been read from storage. Subscribes to that one flag only, so
 * callers that just need to know (e.g. the splash screen) don't re-render on every list change.
 */
export function useIsMyListLoaded(): boolean {
  return useMyListStore((state) => state.hydrated);
}
