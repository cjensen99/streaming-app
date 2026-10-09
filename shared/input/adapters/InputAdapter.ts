import type { Dispatch } from '../keys';

/**
 * The shared interface every platform's input implements. An adapter turns that platform's
 * native events (remote event names, key codes, the Back button) into `AppKey` presses with its
 * own key map, and sends them to the dispatcher. Past the adapter, nothing knows which device a
 * press came from.
 *
 * Platform versions live side by side with the same exports (`remoteAdapter.android.ts`,
 * `remoteAdapter.ios.ts`, later `remoteAdapter.web.ts`); each app passes the one it needs to
 * `AppShell`. A Back press that comes back `pass` gets the platform's default (Android leaves
 * the app).
 */
export interface InputAdapter {
  /** Starts sending presses to `dispatch`. Returns a function that stops. */
  start(dispatch: Dispatch): () => void;
  /**
   * Called whenever the navigation changes: whether there's a screen to go back to. Only
   * platforms that need it implement it (tvOS hands the Menu button to the system on the top
   * screen).
   */
  setCanGoBack?(canGoBack: boolean): void;
}
