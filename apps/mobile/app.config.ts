import type { ConfigContext, ExpoConfig } from 'expo/config';
import brand from '@app/config/brand.json';
import {
  androidAdaptiveIcon,
  assetPath,
  commonPlugins,
  iosInfoPlist,
} from '@app/config/expo/policy';
import { variantIdentity } from '@app/config/variant';

const { variant, name, bundleId } = variantIdentity({
  name: brand.name,
  bundleId: brand.bundleIdBase,
});

export default ({ config, projectRoot }: ConfigContext): ExpoConfig => ({
  ...config,
  name,
  slug: 'streamshelf',
  scheme: 'streamshelf',
  version: '1.0.0',
  // Menus are portrait-only and the player (Phase 11) is landscape-only, so every orientation
  // stays allowed here and the app locks it at runtime: iOS starts in portrait through the
  // expo-screen-orientation plugin below, and App.tsx locks portrait on both platforms.
  orientation: 'default',
  userInterfaceStyle: 'dark',
  icon: assetPath(projectRoot, 'icon.png'),
  backgroundColor: brand.colors.background,
  ios: {
    bundleIdentifier: bundleId,
    supportsTablet: true,
    infoPlist: iosInfoPlist(),
  },
  android: {
    package: bundleId,
    adaptiveIcon: androidAdaptiveIcon(projectRoot),
    // Back is handled by the input dispatcher (Phase 8), not the predictive-back animation.
    predictiveBackGestureEnabled: false,
  },
  plugins: [
    ...commonPlugins(projectRoot, { splashImageWidth: 200 }),
    ['expo-screen-orientation', { initialOrientation: 'PORTRAIT_UP' }],
  ],
  extra: { variant },
});
