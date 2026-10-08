// @ts-check
/// <reference types="node" />
/**
 * Expo config plugin: adopt the UIScene life cycle on iOS and tvOS.
 *
 * Why: apps built with the iOS/tvOS 27 SDK (Xcode 27) are terminated at launch unless they use
 * UIScene. Expo SDK 57 ships the runtime pieces (`ExpoAppSceneDelegate`,
 * `ExpoReactNativeFactoryProvider`), but its prebuild template still uses the app-delegate-only
 * life cycle. Expo SDK 58's template adopts UIScene; this plugin applies that template change to
 * SDK 57 projects.
 *
 * Remove this plugin when upgrading to Expo SDK 58+ (its template already does all of this).
 *
 * Changes to the generated `ios/` project:
 *  1. Info.plist  — declare a single window scene handled by `SceneDelegate`.
 *  2. SceneDelegate.swift — an empty subclass of Expo's `ExpoAppSceneDelegate`, which creates the
 *     window, starts React Native in it, and forwards scene events (URLs, activities, app state)
 *     to the app delegate and Expo modules.
 *  3. AppDelegate.swift — conform to `ExpoReactNativeFactoryProvider` (so the scene delegate can
 *     reach the React Native factory) and stop creating its own window.
 */
const fs = require('fs');
const path = require('path');
const {
  IOSConfig,
  withAppDelegate,
  withInfoPlist,
  withXcodeProject,
} = require('expo/config-plugins');

const PLUGIN = 'withSceneLifecycle';
const SCENE_DELEGATE_FILE = 'SceneDelegate.swift';

// Identical to the file in Expo SDK 58's template.
const SCENE_DELEGATE_SOURCE = `internal import Expo

@objc(SceneDelegate)
class SceneDelegate: ExpoAppSceneDelegate {
  // Extension point for config plugins.
}
`;

// SDK 57 template: the window is created and React Native started in didFinishLaunching.
// Under UIScene, ExpoAppSceneDelegate does both once the scene connects.
const APP_DELEGATE_CLASS = 'class AppDelegate: ExpoAppDelegate {';
const APP_DELEGATE_CLASS_WITH_PROVIDER =
  'class AppDelegate: ExpoAppDelegate, ExpoReactNativeFactoryProvider {';
const APP_DELEGATE_WINDOW_BLOCK =
  /#if os\(iOS\) \|\| os\(tvOS\)\n\s*window = UIWindow\(frame: UIScreen\.main\.bounds\)\n[\s\S]*?#endif\n/;
const APP_DELEGATE_WINDOW_REPLACEMENT =
  '    // The window is created and React Native is started by `SceneDelegate` (UIScene life cycle).\n';

/** @type {import('expo/config-plugins').ConfigPlugin} */
const withSceneManifest = (config) =>
  withInfoPlist(config, (cfg) => {
    cfg.modResults.UIApplicationSceneManifest = {
      UIApplicationSupportsMultipleScenes: false,
      UISceneConfigurations: {
        UIWindowSceneSessionRoleApplication: [
          {
            UISceneConfigurationName: 'Default Configuration',
            UISceneDelegateClassName: '$(PRODUCT_MODULE_NAME).SceneDelegate',
          },
        ],
      },
    };
    return cfg;
  });

/** @type {import('expo/config-plugins').ConfigPlugin} */
const withSceneDelegateFile = (config) =>
  withXcodeProject(config, (cfg) => {
    const { platformProjectRoot, projectName } = cfg.modRequest;
    if (!projectName) throw new Error(`${PLUGIN}: could not determine the iOS project name.`);

    fs.writeFileSync(
      path.join(platformProjectRoot, projectName, SCENE_DELEGATE_FILE),
      SCENE_DELEGATE_SOURCE,
    );
    // Adds the file to the app target's sources; skips it if it's already there.
    IOSConfig.XcodeUtils.addBuildSourceFileToGroup({
      filepath: `${projectName}/${SCENE_DELEGATE_FILE}`,
      groupName: projectName,
      project: cfg.modResults,
    });
    return cfg;
  });

/** @type {import('expo/config-plugins').ConfigPlugin} */
const withAppDelegateSceneSupport = (config) =>
  withAppDelegate(config, (cfg) => {
    if (cfg.modResults.language !== 'swift') {
      throw new Error(`${PLUGIN}: expected a Swift AppDelegate, got ${cfg.modResults.language}.`);
    }
    let src = cfg.modResults.contents;

    // Already applied (e.g. `expo prebuild` without --clean) or the template already adopts it.
    if (src.includes('ExpoReactNativeFactoryProvider')) return cfg;

    // Fail loudly if the template changed, rather than generating an app that crashes at launch.
    if (!src.includes(APP_DELEGATE_CLASS) || !APP_DELEGATE_WINDOW_BLOCK.test(src)) {
      throw new Error(
        `${PLUGIN}: AppDelegate.swift doesn't match the Expo SDK 57 template. ` +
          'If you upgraded to Expo SDK 58+, remove this plugin; otherwise update it.',
      );
    }
    src = src.replace(APP_DELEGATE_CLASS, APP_DELEGATE_CLASS_WITH_PROVIDER);
    src = src.replace(APP_DELEGATE_WINDOW_BLOCK, APP_DELEGATE_WINDOW_REPLACEMENT);

    cfg.modResults.contents = src;
    return cfg;
  });

/** @type {import('expo/config-plugins').ConfigPlugin} */
const withSceneLifecycle = (config) =>
  withAppDelegateSceneSupport(withSceneDelegateFile(withSceneManifest(config)));

module.exports = withSceneLifecycle;
