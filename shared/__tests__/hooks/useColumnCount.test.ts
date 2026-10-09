import { describe, expect, it } from '@jest/globals';
import { columnCount } from '../../hooks/useColumnCount';

describe('columnCount', () => {
  it('fits as many columns as the width allows, from 1 up to the maximum', () => {
    expect(columnCount(450, 200, 2)).toBe(2);
    expect(columnCount(1000, 200, 2)).toBe(2);
    expect(columnCount(399, 200, 2)).toBe(1);
    expect(columnCount(50, 200, 2)).toBe(1);
  });
});
