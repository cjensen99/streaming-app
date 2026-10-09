import type { InputResult } from './keys';

export interface BackTarget {
  canGoBack(): boolean;
  goBack(): void;
}

/**
 * What Back does when no layer handled it: go back a screen, or on the top screen `pass`, so the
 * platform does its default (Android and Android TV leave the app; tvOS never gets here at the
 * top, because the Menu button is handed to the system).
 */
export function handleBack(target: BackTarget): InputResult {
  if (!target.canGoBack()) return 'pass';
  target.goBack();
  return 'handled';
}
