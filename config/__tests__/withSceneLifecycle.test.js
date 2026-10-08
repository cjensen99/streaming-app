// @ts-check
/// <reference types="node" />
// Unit tests for the UIScene config plugin, against copies of Expo's real native templates
// (fixtures/). Run with `npm test -w config` (Node's built-in test runner).
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { describe, it } = require('node:test');
const {
  addSceneSupportToAppDelegate,
  SCENE_DELEGATE_SOURCE,
  SCENE_MANIFEST,
} = require('../expo/plugins/withSceneLifecycle');

/** @param {string} name */
const fixture = (name) => fs.readFileSync(path.join(__dirname, 'fixtures', name), 'utf8');

describe('addSceneSupportToAppDelegate', () => {
  const sdk57 = fixture('AppDelegate.sdk57.swift');

  it('makes the SDK 57 AppDelegate provide the factory instead of creating the window', () => {
    const result = addSceneSupportToAppDelegate(sdk57);

    assert.match(result, /class AppDelegate: ExpoAppDelegate, ExpoReactNativeFactoryProvider \{/);
    assert.doesNotMatch(result, /window = UIWindow\(/);
    assert.doesNotMatch(result, /startReactNative\(/);
    assert.match(result, /started by `SceneDelegate`/);
  });

  it('leaves the rest of the AppDelegate unchanged', () => {
    const result = addSceneSupportToAppDelegate(sdk57);

    // The factory is still created in didFinishLaunching, and link handling is untouched
    // (SDK 57's scene delegate de-duplicates links for older app delegates).
    assert.match(result, /let factory = ExpoReactNativeFactory\(delegate: delegate\)/);
    assert.match(result, /reactNativeFactory = factory/);
    assert.match(result, /RCTLinkingManager\.application\(app, open: url, options: options\)/);
    assert.match(result, /class ReactNativeDelegate: ExpoReactNativeFactoryDelegate \{/);
  });

  it('is idempotent, so prebuild without --clean is safe', () => {
    const once = addSceneSupportToAppDelegate(sdk57);

    assert.equal(addSceneSupportToAppDelegate(once), once);
  });

  it('leaves an SDK 58 AppDelegate (which already adopts UIScene) unchanged', () => {
    const sdk58 = fixture('AppDelegate.sdk58.swift');

    assert.equal(addSceneSupportToAppDelegate(sdk58), sdk58);
  });

  it('fails loudly when the template does not look like SDK 57', () => {
    const changed = sdk57.replace(
      /window = UIWindow\(frame: UIScreen\.main\.bounds\)/,
      'window = nil',
    );

    assert.throws(() => addSceneSupportToAppDelegate(changed), /doesn't match the Expo SDK 57/);
  });
});

describe('scene declarations', () => {
  it('writes the same SceneDelegate.swift as the Expo SDK 58 template', () => {
    assert.equal(SCENE_DELEGATE_SOURCE, fixture('SceneDelegate.sdk58.swift'));
  });

  it('declares SceneDelegate as the app scene delegate in Info.plist', () => {
    const [scene] = SCENE_MANIFEST.UISceneConfigurations.UIWindowSceneSessionRoleApplication;

    assert.equal(SCENE_MANIFEST.UIApplicationSupportsMultipleScenes, false);
    assert.equal(scene?.UISceneDelegateClassName, '$(PRODUCT_MODULE_NAME).SceneDelegate');
  });
});
