/**
 * The failures the app knows how to present. `api/client.ts` (Phase 4) converts every thrown
 * error into one of these, so screens and hooks never handle raw exceptions.
 */
export type AppError =
  /** No connection, DNS failure, connection reset, or a 5xx response. */
  | { kind: 'network'; message: string }
  /** The request exceeded its time limit. */
  | { kind: 'timeout'; message: string }
  /** The response wasn't the expected M3U/JSON shape. */
  | { kind: 'parse'; message: string }
  /** A 404, or an id that doesn't exist (e.g. a stale Detail link). */
  | { kind: 'notFound'; message: string };

export type AppErrorKind = AppError['kind'];
