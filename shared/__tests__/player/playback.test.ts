import { describe, expect, it } from '@jest/globals';
import {
  initialPlayback,
  isWaiting,
  type PlaybackAction,
  type PlaybackState,
  playbackReducer,
} from '../../player/playback';

const run = (...actions: PlaybackAction[]): PlaybackState =>
  actions.reduce(playbackReducer, initialPlayback);
const failure = { type: 'error', error: { message: 'HTTP 403' } } as const;

describe('playback', () => {
  it('waits while loading, then plays once the stream is ready', () => {
    expect(isWaiting(run())).toBe(true);

    const playing = run({ type: 'ready' });

    expect(playing).toMatchObject({ phase: 'playing', paused: false });
    expect(isWaiting(playing)).toBe(false);
  });

  it('pauses and resumes only once playing', () => {
    expect(run({ type: 'togglePause' }).paused).toBe(false);
    expect(run({ type: 'ready' }, { type: 'togglePause' }).paused).toBe(true);
    expect(run({ type: 'ready' }, { type: 'togglePause' }, { type: 'togglePause' }).paused).toBe(
      false,
    );
  });

  it('waits on a stall while playing, but not while paused', () => {
    const stalled = run({ type: 'ready' }, { type: 'buffering', isBuffering: true });

    expect(isWaiting(stalled)).toBe(true);
    expect(isWaiting(playbackReducer(stalled, { type: 'togglePause' }))).toBe(false);
    expect(isWaiting(playbackReducer(stalled, { type: 'buffering', isBuffering: false }))).toBe(
      false,
    );
  });

  it('stops on an error and ignores the old player afterwards; Retry starts a fresh attempt', () => {
    const failed = run({ type: 'ready' }, { type: 'togglePause' }, failure, { type: 'ready' });

    expect(failed).toMatchObject({ phase: 'error', paused: false, error: failure.error });
    expect(isWaiting(failed)).toBe(false);
    expect(playbackReducer(failed, { type: 'togglePause' })).toBe(failed);

    expect(playbackReducer(failed, { type: 'retry' })).toEqual({ ...initialPlayback, attempt: 1 });
  });

  it('ignores Retry unless there was an error', () => {
    const playing = run({ type: 'ready' });

    expect(playbackReducer(playing, { type: 'retry' })).toBe(playing);
  });
});
