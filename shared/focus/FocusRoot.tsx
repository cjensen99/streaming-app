import { useContext, useEffect } from 'react';
import { SpatialNavigationRoot } from 'react-tv-space-navigation';
import { FocusAppContext } from './FocusProvider';
import type { FocusRootProps } from './types';

/** One screen's focus area (TVs). It takes keys only while `active` and focus is enabled. */
export function FocusRoot({ active, children }: FocusRootProps) {
  const { enabled, reclaimNativeFocus } = useContext(FocusAppContext);
  const isActive = active && enabled;

  // A screen taking over (navigation, or the connection returning) is when something natively
  // focusable may have left native focus elsewhere: make sure keys keep reaching the app.
  useEffect(() => {
    if (isActive) reclaimNativeFocus();
  }, [isActive, reclaimNativeFocus]);

  return <SpatialNavigationRoot isActive={isActive}>{children}</SpatialNavigationRoot>;
}
