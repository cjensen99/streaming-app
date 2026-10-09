import type { ReactNode } from 'react';
import { FocusRoot } from '../../focus/FocusRoot';

/**
 * Renders components inside a focus root, as screens do (`render(ui, { wrapper: InFocusRoot })`).
 * TV components need one; on phones it renders just the children.
 */
export function InFocusRoot({ children }: { children: ReactNode }) {
  return <FocusRoot active>{children}</FocusRoot>;
}
