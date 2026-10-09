import { type QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { createQueryClient } from '../../api/queryClient';

/** Every client created by a test, so `cleanupQueryClients` can stop their requests. */
const clients = new Set<QueryClient>();

/**
 * A fresh QueryClient (the app's defaults) and a wrapper for
 * `renderHook` / `render`, so no test shares cached data with another.
 */
export function createQueryWrapper() {
  const client = createQueryClient();
  clients.add(client);
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return { client, wrapper };
}

/**
 * Cancels in-flight requests and clears every test client. Runs after each test (see
 * `setupAfterEnv.ts`): queries fetched with `fetchQuery` have no observers, so unmounting alone
 * doesn't cancel them, and a pending request would keep its timeout timer alive (and Jest from
 * exiting).
 */
export async function cleanupQueryClients() {
  for (const client of clients) {
    await client.cancelQueries();
    client.clear();
  }
  clients.clear();
}
