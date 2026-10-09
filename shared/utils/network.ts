import NetInfo, { type NetInfoState } from '@react-native-community/netinfo';

/**
 * Connectivity, wrapping NetInfo. This is the only module that imports NetInfo (enforced by
 * ESLint); React Query's online manager and `useIsOnline` build on it.
 */

/**
 * Online whenever a network is connected (`null` while NetInfo is still checking counts as
 * online, so there's no offline flash at launch).
 *
 * `isInternetReachable` is deliberately ignored: it comes from the OS's own connectivity check,
 * which wrongly reports "unreachable" on some working networks (e.g. the Android TV emulator,
 * filtered networks, devices that use a different check). Treating that as offline would pause
 * every request. If the internet really is unreachable, requests fail fast and the error UI
 * explains it.
 */
export function isOnlineState(state: Pick<NetInfoState, 'isConnected'>): boolean {
  return state.isConnected !== false;
}

/**
 * Calls `listener` with the current status (immediately if NetInfo already knows it, otherwise
 * as soon as its first check finishes), then on every change.
 *
 * @returns A function that stops listening.
 */
export function subscribeToOnlineStatus(listener: (online: boolean) => void): () => void {
  return NetInfo.addEventListener((state) => listener(isOnlineState(state)));
}
