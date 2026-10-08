import NetInfo, { type NetInfoState } from '@react-native-community/netinfo';

/**
 * Connectivity, wrapping NetInfo. This is the only module that imports NetInfo (enforced by
 * ESLint); React Query's online manager (Phase 4) and `useIsOnline` build on it.
 */

/**
 * Online unless NetInfo knows otherwise. Both fields are `null` while NetInfo is still
 * checking; treating that as online avoids flashing an offline notice at launch.
 */
export function isOnlineState(
  state: Pick<NetInfoState, 'isConnected' | 'isInternetReachable'>,
): boolean {
  return state.isConnected !== false && state.isInternetReachable !== false;
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
