import { describe, expect, it, jest } from '@jest/globals';
import { FocusRail } from '../../focus/FocusRail';
import { isPhoneBuild } from '../helpers/formFactor';

// Every test runs in two projects; this checks each one really resolves files like its app.
describe('platform file resolution', () => {
  it('uses the phone files in the phone build and the TV files in the TV build', () => {
    const phoneRail = jest.requireActual<{ FocusRail: unknown }>(
      '../../focus/FocusRail.mobile.tsx',
    );
    const tvRail = jest.requireActual<{ FocusRail: unknown }>('../../focus/FocusRail.tsx');

    expect(FocusRail).toBe(isPhoneBuild ? phoneRail.FocusRail : tvRail.FocusRail);
    expect(phoneRail.FocusRail).not.toBe(tvRail.FocusRail);
  });
});
