import type { FocusRootProps } from './types';

/** Phones have no focus system: touch only. */
export function FocusRoot({ children }: FocusRootProps) {
  return children;
}
