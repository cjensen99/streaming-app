import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { ApiError, fetchJson, fetchText } from '../../api/client';
import { logger } from '../../utils/logger';
import { mockFetch } from '../helpers/mockFetch';

const URL = 'https://example.com/data';

beforeEach(() => {
  jest.spyOn(logger, 'warn').mockImplementation(() => undefined);
  jest.spyOn(logger, 'debug').mockImplementation(() => undefined);
});
afterEach(() => {
  jest.useRealTimers();
});

async function expectApiError(promise: Promise<unknown>, kind: ApiError['kind']) {
  const error = await promise.then(
    () => undefined,
    (e: unknown) => e,
  );
  expect(error).toBeInstanceOf(ApiError);
  expect((error as ApiError).kind).toBe(kind);
}

describe('fetchText', () => {
  it('returns the body of a successful response', async () => {
    mockFetch({ [URL]: 'hello' });
    await expect(fetchText(URL)).resolves.toBe('hello');
  });

  it('maps 404 to notFound, without retrying', async () => {
    const requests = mockFetch({ [URL]: { status: 404 } });
    await expectApiError(fetchText(URL), 'notFound');
    expect(requests(URL)).toBe(1);
  });

  it('does not retry other 4xx responses', async () => {
    const requests = mockFetch({ [URL]: { status: 403 } });
    await expectApiError(fetchText(URL), 'network');
    expect(requests(URL)).toBe(1);
  });

  it('retries a network failure once, then gives up', async () => {
    const requests = mockFetch({ [URL]: { networkError: true } });
    await expectApiError(fetchText(URL), 'network');
    expect(requests(URL)).toBe(2);
  });

  it('retries a 5xx once and succeeds if the retry does', async () => {
    let calls = 0;
    jest.spyOn(globalThis, 'fetch').mockImplementation(() => {
      calls++;
      return Promise.resolve(new Response('ok', { status: calls === 1 ? 503 : 200 }));
    });
    await expect(fetchText(URL)).resolves.toBe('ok');
    expect(calls).toBe(2);
  });

  it('times out a request that never answers', async () => {
    jest.useFakeTimers();
    jest.spyOn(globalThis, 'fetch').mockImplementation(
      (_input, init) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => reject(new Error('aborted')));
        }),
    );
    const assertion = expectApiError(fetchText(URL, { timeoutMs: 1_000 }), 'timeout');
    await jest.advanceTimersByTimeAsync(1_000); // first attempt times out
    await jest.advanceTimersByTimeAsync(1_000); // retry delay
    await jest.advanceTimersByTimeAsync(1_000); // second attempt times out
    await assertion;
  });
});

describe('cancellation', () => {
  it('does not start a request whose signal is already cancelled', async () => {
    const requests = mockFetch({ [URL]: 'hello' });
    const controller = new AbortController();
    controller.abort();

    await expectApiError(fetchText(URL, { signal: controller.signal }), 'network');
    expect(requests(URL)).toBe(0);
  });
});

describe('fetchJson', () => {
  it('parses JSON', async () => {
    mockFetch({ [URL]: '[1,2]' });
    await expect(fetchJson(URL)).resolves.toEqual([1, 2]);
  });

  it('maps invalid JSON to a parse error', async () => {
    mockFetch({ [URL]: '<html>' });
    await expectApiError(fetchJson(URL), 'parse');
  });
});
