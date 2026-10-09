import type { DefaultFocusProps } from './types';

/** Phones have no focus system. */
export function DefaultFocus({ children }: DefaultFocusProps) {
  return children;
}
