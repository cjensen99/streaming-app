import { jest } from '@jest/globals';

/**
 * Which build this Jest project resolves like: the `mobile` project picks `*.mobile.*` files
 * (phone app), the `tv` project the defaults (TV app). Detected from which `metrics` file the
 * plain import resolved to.
 */
export const isPhoneBuild =
  jest.requireActual('../../ui/metrics') === jest.requireActual('../../ui/metrics.mobile.ts');
