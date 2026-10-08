import Constants from 'expo-constants';
import { logger } from './logger';

/** Mirrors `@app/config/variant.js`, which sets `extra.variant` in each app's config. */
export type AppVariant = 'development' | 'preview' | 'production';

function isAppVariant(value: unknown): value is AppVariant {
  return value === 'development' || value === 'preview' || value === 'production';
}

function readVariant(): AppVariant {
  // `unknown`: Expo types `extra` values as `any`.
  const value: unknown = Constants.expoConfig?.extra?.variant;
  if (isAppVariant(value)) return value;
  logger.warn(`Missing or unknown build variant "${String(value)}"; assuming development`);
  return 'development';
}

/** Facts about this build, fixed at launch. */
export const env = {
  /** Which build this is: `development`, `preview` or `production` (`APP_VARIANT`). */
  variant: readVariant(),
  /** True in development bundles (Metro dev mode), false in release builds. */
  isDev: __DEV__,
} as const;
