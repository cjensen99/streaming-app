import { useEffect, useState } from 'react';
import { subscribeToOnlineStatus } from '../utils/network';

/**
 * Whether the device is online. Starts as `true` (NetInfo reports the real status almost
 * immediately) so screens don't flash an offline notice at launch.
 */
export function useIsOnline(): boolean {
  const [online, setOnline] = useState(true);
  useEffect(() => subscribeToOnlineStatus(setOnline), []);
  return online;
}
