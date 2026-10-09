import type { InputAdapter } from './InputAdapter';

/**
 * Platforms without a remote implementation yet. The TV app builds for Android
 * (`remoteAdapter.android.ts`) and tvOS (`remoteAdapter.ios.ts`); a web-TV build adds
 * `remoteAdapter.web.ts` with its own key-code map. This file is what TypeScript checks the
 * import against, and what any other platform would get: no input.
 */
export const remoteAdapter: InputAdapter = {
  start: () => () => undefined,
};
