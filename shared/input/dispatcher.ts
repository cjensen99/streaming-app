import type { Dispatch, InputHandler, InputResult } from './keys';

export interface InputDispatcher {
  /**
   * Adds a layer above the others (newest first, e.g. a prompt over a screen). Returns a function
   * that removes it.
   */
  addLayer(handler: InputHandler): () => void;
  /** Handles presses no layer handled (Back navigation). There's one at a time. */
  setFallback(handler: InputHandler | null): void;
  /** Offers a press to each layer, newest first, then to the fallback. */
  dispatch: Dispatch;
}

/** The app's single route for key presses. Plain TypeScript, so it runs and tests anywhere. */
export function createInputDispatcher(): InputDispatcher {
  const layers: InputHandler[] = [];
  let fallback: InputHandler | null = null;

  return {
    addLayer(handler) {
      layers.push(handler);
      return () => {
        const index = layers.lastIndexOf(handler);
        if (index !== -1) layers.splice(index, 1);
      };
    },
    setFallback(handler) {
      fallback = handler;
    },
    dispatch(event): InputResult {
      // A copy, so a layer that removes itself while handling doesn't skip the next one.
      for (const layer of [...layers].reverse()) {
        if (layer(event) === 'handled') return 'handled';
      }
      return fallback?.(event) ?? 'pass';
    },
  };
}
