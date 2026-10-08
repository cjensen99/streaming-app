// @ts-check
/// <reference types="node" />
// Learn more: https://docs.expo.dev/guides/monorepos/
const { getDefaultConfig } = require('expo/metro-config');

const SOURCE_EXTS = ['ts', 'tsx', 'js', 'jsx'];

/**
 * Metro config for an app. Expo's default config already detects the npm workspace (watch
 * folders, node_modules lookup).
 *
 * Shared code is TV-first: `Foo.tsx` is the default. An app can list platform extensions that
 * override it, in priority order; e.g. `['mobile']` makes the phone app prefer `Foo.mobile.tsx`.
 *
 * @param {string} projectRoot The app's `__dirname`.
 * @param {{ platformExtensions?: string[] }} [options]
 */
function createMetroConfig(projectRoot, { platformExtensions = [] } = {}) {
  const config = getDefaultConfig(projectRoot);
  const preferred = platformExtensions.flatMap((platform) =>
    SOURCE_EXTS.map((ext) => `${platform}.${ext}`),
  );
  config.resolver.sourceExts = [...preferred, ...config.resolver.sourceExts];
  return config;
}

module.exports = { createMetroConfig };
