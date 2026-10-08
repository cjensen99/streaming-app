import { useLayoutEffect, useRef } from 'react';

/**
 * A ref that always holds the latest `value`. Lets long-lived callbacks (event subscriptions,
 * input handlers) read current props/state without re-subscribing on every render.
 *
 * Read `.current` inside callbacks and effects, not during render.
 */
export function useLatest<T>(value: T): { readonly current: T } {
  const ref = useRef(value);
  useLayoutEffect(() => {
    ref.current = value;
  });
  return ref;
}
