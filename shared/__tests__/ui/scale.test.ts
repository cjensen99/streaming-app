import { describe, expect, it, jest } from '@jest/globals';
import type * as TvScale from '../../ui/scale';
import type * as MobileScale from '../../ui/scale.mobile';

// Each project resolves `../../ui/scale` to its own file, so load both by their full names.
const tv = jest.requireActual<typeof TvScale>('../../ui/scale.ts');
const mobile = jest.requireActual<typeof MobileScale>('../../ui/scale.mobile.ts');

describe('TV scale (1920×1080 design)', () => {
  it('is 1:1 on tvOS (1920×1080 points)', () => {
    expect(tv.createScale(1920, 1080)(100)).toBe(100);
  });

  it('halves sizes on Android TV and Fire TV (960×540 dp)', () => {
    expect(tv.createScale(960, 540)(100)).toBe(50);
  });

  it('scales by one factor, the smaller ratio, on a window that is not 16:9', () => {
    expect(tv.createScale(2560, 1080)(100)).toBe(100);
    expect(tv.createScale(960, 1080)(100)).toBe(50);
  });

  it('falls back to the design size when the window reports no size', () => {
    expect(tv.createScale(0, 0)(100)).toBe(100);
    expect(tv.createScale(Number.NaN, 1080)(100)).toBe(100);
  });
});

describe('phone scale (390-wide design)', () => {
  it('is 1:1 on a 390-wide phone', () => {
    expect(mobile.createScale(390, 844)(100)).toBe(100);
  });

  it('uses the short side, so rotation does not change sizes', () => {
    expect(mobile.createScale(844, 390)(100)).toBe(100);
  });

  it('nudges sizes for small and large phones, within limits', () => {
    expect(mobile.createScale(429, 926)(100)).toBe(110);
    expect(mobile.createScale(320, 568)(100)).toBe(85);
    expect(mobile.createScale(1024, 1366)(100)).toBe(120);
  });

  it('falls back to the design size when the window reports no size', () => {
    expect(mobile.createScale(0, 0)(100)).toBe(100);
  });
});
