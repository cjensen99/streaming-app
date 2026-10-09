import { QueryClient, onlineManager } from '@tanstack/react-query';
import { subscribeToOnlineStatus } from '../utils/network';
import type { ApiError } from './client';

declare module '@tanstack/react-query' {
  interface Register {
    // Query functions only throw ApiError (see client.ts), so errors are typed as such.
    defaultError: ApiError;
  }
}

/**
 * Channel data is downloaded once per launch and kept in memory for the whole session; nothing
 * is cached between launches. Without a connection the app shows a full-screen "not connected"
 * state instead.
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Fetched once per launch: never refetched automatically (focus, reconnect, remount).
        staleTime: Infinity,
        // Kept for the whole session, so leaving Home and coming back never re-downloads.
        gcTime: Infinity,
        // api/client.ts already retries network errors once.
        retry: false,
      },
    },
  });
}

/** The app's single QueryClient. Tests create their own with `createQueryClient()`. */
export const queryClient = createQueryClient();

/**
 * Tells React Query whether the device is online. While offline, queries that haven't loaded yet
 * wait instead of failing, and start by themselves as soon as a connection appears. Call once at
 * startup.
 */
export function connectOnlineManager(): void {
  onlineManager.setEventListener((setOnline) => subscribeToOnlineStatus(setOnline));
}
