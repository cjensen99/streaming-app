import type { FocusProviderProps } from './types';

/** Phones have no focus system: touch only. */
export function FocusProvider({ children }: FocusProviderProps) {
  return children;
}
