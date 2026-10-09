import type { AppErrorKind } from '../types/errors';
import { logger } from '../utils/logger';

/**
 * HTTP for the API layer. Every failure becomes an `ApiError` (one of the app's `AppError`
 * kinds), so React Query, hooks and screens never handle raw exceptions.
 *
 * Network failures, timeouts and 5xx responses are retried once after a short delay; other
 * failures (404, other 4xx, unparseable JSON) are not, because retrying can't fix them.
 * React Query's own retries are turned off (see `queryClient.ts`) so requests aren't retried twice.
 */

export class ApiError extends Error {
  constructor(
    readonly kind: AppErrorKind,
    message: string,
    /** Whether trying again could succeed (network blip, timeout, 5xx). */
    readonly retryable = false,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export interface RequestOptions {
  /** Cancels the request (React Query passes one to every query function). */
  signal?: AbortSignal;
  /** Limit for one attempt, including downloading the body. */
  timeoutMs?: number;
}

/** Generous: the largest playlist is ~700 KB, and TV boxes are often on slow Wi-Fi. */
const DEFAULT_TIMEOUT_MS = 20_000;
const RETRY_DELAY_MS = 1_000;

/** Waits `ms`, or less if the request is cancelled meanwhile. */
function wait(ms: number, signal: AbortSignal | undefined): Promise<void> {
  return new Promise((resolve) => {
    if (signal?.aborted) return resolve();
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener(
      'abort',
      () => {
        clearTimeout(timer);
        resolve();
      },
      { once: true },
    );
  });
}

/** One attempt: request plus body, under a single timeout. */
async function attempt(url: string, signal: AbortSignal | undefined, timeoutMs: number) {
  // An abort that happened before we start won't fire its event again, so check it up front.
  if (signal?.aborted) throw new ApiError('network', `Cancelled: ${url}`);
  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);
  const forwardAbort = () => controller.abort();
  signal?.addEventListener('abort', forwardAbort);

  try {
    const response = await fetch(url, { signal: controller.signal });
    if (response.status === 404) throw new ApiError('notFound', `Not found: ${url}`);
    if (response.status >= 500) {
      throw new ApiError('network', `Server error ${response.status}: ${url}`, true);
    }
    if (!response.ok) throw new ApiError('network', `HTTP ${response.status}: ${url}`);
    return await response.text();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (timedOut) throw new ApiError('timeout', `Timed out after ${timeoutMs} ms: ${url}`, true);
    if (signal?.aborted) throw new ApiError('network', `Cancelled: ${url}`);
    throw new ApiError('network', `Network request failed: ${url}`, true);
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', forwardAbort);
  }
}

/** Downloads a text resource (e.g. an M3U playlist). */
export async function fetchText(url: string, options: RequestOptions = {}): Promise<string> {
  const { signal, timeoutMs = DEFAULT_TIMEOUT_MS } = options;
  logger.debug(`GET ${url}`);
  try {
    return await attempt(url, signal, timeoutMs);
  } catch (error) {
    if (!(error instanceof ApiError) || !error.retryable || signal?.aborted) throw error;
    logger.warn(`${error.message}; retrying once`);
    await wait(RETRY_DELAY_MS, signal);
    return attempt(url, signal, timeoutMs); // cancelled during the wait → throws "Cancelled"
  }
}

/** Downloads and parses a JSON resource. The result is `unknown`: validate it before use. */
export async function fetchJson(url: string, options: RequestOptions = {}): Promise<unknown> {
  const text = await fetchText(url, options);
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new ApiError('parse', `Invalid JSON: ${url}`);
  }
}
