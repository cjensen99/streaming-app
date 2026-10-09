import { DefaultFocus as SpatialDefaultFocus } from 'react-tv-space-navigation';
import type { DefaultFocusProps } from './types';

/** Elements inside take focus when their screen opens (TVs). */
export function DefaultFocus({ enabled = true, children }: DefaultFocusProps) {
  return <SpatialDefaultFocus enable={enabled}>{children}</SpatialDefaultFocus>;
}
