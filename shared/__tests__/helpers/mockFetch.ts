import { jest } from '@jest/globals';
import { readFileSync } from 'fs';
import path from 'path';

/** Reads a file from `__tests__/fixtures/`. */
export const fixture = (name: string) =>
  readFileSync(path.join(__dirname, '..', 'fixtures', name), 'utf8');

/**
 * A response for one URL: a body (status 200), another status, a network failure, or `pending`:
 * no answer at all (the request stays in flight until it's cancelled), to test loading states.
 */
export type MockRoute =
  string | { status: number; body?: string } | { networkError: true } | { pending: true };

/** The URL of a `fetch` input (string, URL or Request). */
export const requestUrl = (input: RequestInfo | URL) =>
  typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;

/**
 * Replaces global `fetch` with one that answers from `routes` (by exact URL). Unknown URLs fail
 * the test loudly. Returns a function counting the requests made for a URL.
 */
export function mockFetch(routes: Record<string, MockRoute>) {
  const spy = jest.spyOn(globalThis, 'fetch').mockImplementation((input, init) => {
    const url = requestUrl(input);
    const route = routes[url];
    if (route === undefined) return Promise.reject(new Error(`Unexpected request: ${url}`));
    if (typeof route === 'object' && 'networkError' in route) {
      return Promise.reject(new TypeError('Network request failed'));
    }
    if (typeof route === 'object' && 'pending' in route) {
      return new Promise<Response>((_, reject) =>
        init?.signal?.addEventListener('abort', () => reject(new Error('Aborted'))),
      );
    }
    const { status, body } = typeof route === 'string' ? { status: 200, body: route } : route;
    return Promise.resolve(new Response(body ?? '', { status }));
  });
  return (url: string) => spy.mock.calls.filter(([input]) => requestUrl(input) === url).length;
}
