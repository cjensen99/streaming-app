import { QueryClientProvider } from '@tanstack/react-query';
import { type ReactNode, useEffect } from 'react';
import { connectOnlineManager, queryClient } from './queryClient';

/**
 * Wraps the app in React Query. Apps mount this instead of importing React Query themselves
 * (it's restricted to `shared/api/` and `shared/hooks/`).
 */
export function QueryProvider({ children }: { children: ReactNode }) {
  useEffect(() => connectOnlineManager(), []);
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
