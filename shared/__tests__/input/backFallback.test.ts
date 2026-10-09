import { describe, expect, it, jest } from '@jest/globals';
import { handleBack } from '../../input/backFallback';

describe('handleBack', () => {
  it('goes back a screen when there is one', () => {
    const goBack = jest.fn();

    expect(handleBack({ canGoBack: () => true, goBack })).toBe('handled');
    expect(goBack).toHaveBeenCalledTimes(1);
  });

  it('leaves Back on the top screen to the platform', () => {
    const goBack = jest.fn();

    expect(handleBack({ canGoBack: () => false, goBack })).toBe('pass');
    expect(goBack).not.toHaveBeenCalled();
  });
});
