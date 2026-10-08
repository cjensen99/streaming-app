// @ts-check
/// <reference types="node" />
/**
 * Expo config shared by every native app. Each app's `app.config.ts` keeps its identity (name,
 * bundle ID, orientation, TV plugin) and takes the pieces that must stay identical from here.
 */
const path = require('path');
const brand = require('../brand.json');

/** @typedef {import('expo/config').ExpoConfig} ExpoConfig */

const ASSETS_DIR = path.resolve(__dirname, '../../assets');

/**
 * A file in the repo's `assets/` folder, as a path relative to the app's project root (the form
 * Expo expects in app config).
 *
 * @param {string} projectRoot From the app config's `ConfigContext`.
 * @param {string} file Path inside `assets/`, e.g. `icon.png` or `tv/android-tv-banner.png`.
 */
function assetPath(projectRoot, file) {
  return path.relative(projectRoot, path.join(ASSETS_DIR, file));
}

/**
 * iOS/tvOS `Info.plist` entries. Setting `NSAppTransportSecurity` replaces Expo's default
 * dictionary, so its keys are repeated here.
 *
 * @returns {NonNullable<NonNullable<ExpoConfig['ios']>['infoPlist']>}
 */
function iosInfoPlist() {
  return {
    NSAppTransportSecurity: {
      NSAllowsArbitraryLoads: false,
      // Lets dev builds on a device reach Metro over the LAN.
      NSAllowsLocalNetworking: true,
      // Many iptv-org streams are plain http://. Allow cleartext for media only, not API calls.
      NSAllowsArbitraryLoadsForMedia: true,
    },
  };
}

/**
 * Android adaptive launcher icon (phones and Android TV's app list).
 *
 * @param {string} projectRoot
 * @returns {NonNullable<NonNullable<ExpoConfig['android']>['adaptiveIcon']>}
 */
function androidAdaptiveIcon(projectRoot) {
  return {
    foregroundImage: assetPath(projectRoot, 'android-icon-foreground.png'),
    backgroundImage: assetPath(projectRoot, 'android-icon-background.png'),
    monochromeImage: assetPath(projectRoot, 'android-icon-monochrome.png'),
    backgroundColor: brand.colors.iconBackground,
  };
}

/**
 * Config plugins every native app uses. Platform-specific plugins that must run first (e.g.
 * `@react-native-tvos/config-tv`) go before these in the app's own list.
 *
 * @param {string} projectRoot
 * @param {{ splashImageWidth: number }} options Splash logo width in points.
 * @returns {NonNullable<ExpoConfig['plugins']>}
 */
function commonPlugins(projectRoot, { splashImageWidth }) {
  return [
    'expo-dev-client',
    // UIScene life cycle for iOS/tvOS 27; remove on Expo SDK 58+ (see the plugin's header).
    '@app/config/expo/plugins/withSceneLifecycle',
    'expo-image',
    'expo-status-bar',
    [
      'expo-splash-screen',
      {
        image: assetPath(projectRoot, 'splash-icon.png'),
        imageWidth: splashImageWidth,
        backgroundColor: brand.colors.background,
      },
    ],
    [
      'expo-build-properties',
      // Android has no media-only cleartext switch; see README → Decisions.
      { android: { usesCleartextTraffic: true } },
    ],
  ];
}

module.exports = { assetPath, iosInfoPlist, androidAdaptiveIcon, commonPlugins };
