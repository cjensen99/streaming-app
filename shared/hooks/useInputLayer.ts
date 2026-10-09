import { useEffect } from 'react';
import type { InputHandler } from '../input/keys';
import { useInput } from './useInput';
import { useLatest } from './useLatest';

/**
 * Gets first say on key presses while mounted (and `enabled`): above every layer added before it.
 * Return `handled` to stop a press, `pass` to let the next layer (or Back navigation) have it.
 * The handler can change every render; the layer isn't re-added for it.
 */
export function useInputLayer(handler: InputHandler, { enabled = true } = {}): void {
  const { dispatcher } = useInput();
  const latestHandler = useLatest(handler);
  useEffect(() => {
    if (!enabled) return;
    return dispatcher.addLayer((event) => latestHandler.current(event));
  }, [dispatcher, enabled, latestHandler]);
}
