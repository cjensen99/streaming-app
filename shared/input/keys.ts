/**
 * The app's keys. Every platform adapter turns its own events (tvOS remote, Android TV / Fire TV
 * remote, Android Back, later a web-TV keyboard) into these, so nothing past the adapter knows
 * which platform a press came from.
 */
export type AppKey = 'up' | 'down' | 'left' | 'right' | 'select' | 'back' | 'playPause';

export interface InputEvent {
  key: AppKey;
}

/** `handled` stops the press; `pass` hands it to the next layer (then the fallback). */
export type InputResult = 'handled' | 'pass';

export type InputHandler = (event: InputEvent) => InputResult;

/** Sends a press into the app; returns whether something handled it. */
export type Dispatch = (event: InputEvent) => InputResult;
