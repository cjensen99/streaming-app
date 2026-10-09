import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { CancelledError } from '@tanstack/react-query';
import { ApiError } from '../../api/client';
import { asApiErrors } from '../../api/queries';
import { logger } from '../../utils/logger';

beforeEach(() => {
  jest.spyOn(logger, 'error').mockImplementation(() => undefined);
});

describe('asApiErrors', () => {
  it('passes results through', async () => {
    await expect(asApiErrors(() => Promise.resolve(42))).resolves.toBe(42);
  });

  it('passes ApiErrors through unchanged', async () => {
    const error = new ApiError('timeout', 'slow');
    await expect(asApiErrors(() => Promise.reject(error))).rejects.toBe(error);
  });

  it('turns an unexpected error (a bug) into a parse ApiError, and logs it', async () => {
    const bug = new TypeError("Cannot read properties of undefined (reading 'id')");

    const failure = await asApiErrors(() => Promise.reject(bug)).catch((e: unknown) => e);

    expect(failure).toBeInstanceOf(ApiError);
    expect(failure).toMatchObject({ kind: 'parse', message: bug.message });
    expect(logger.error).toHaveBeenCalledWith('Unexpected error while loading channel data', bug);
  });

  it("leaves React Query's own cancellation alone", async () => {
    const cancelled = new CancelledError();
    await expect(asApiErrors(() => Promise.reject(cancelled))).rejects.toBe(cancelled);
  });
});
