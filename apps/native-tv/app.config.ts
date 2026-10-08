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
  bundleId: `${brand.bundleIdBase}.tv`,
});

export default ({ config, projectRoot }: ConfigContext): ExpoConfig => ({
  ...config,
  name,
  slug: 'streamshelf-tv',
  scheme: 'streamshelf-tv',
  version: '1.0.0',
  orientation: 'landscape',
  userInterfaceStyle: 'dark',
  icon: assetPath(projectRoot, 'icon.png'),
  backgroundColor: brand.colors.background,
  ios: {
    bundleIdentifier: bundleId,
    infoPlist: iosInfoPlist(),
  },
  android: {
    package: bundleId,
    adaptiveIcon: androidAdaptiveIcon(projectRoot),
  },
  plugins: [
    // Must run before the common plugins: it switches the native projects to TV.
    [
      '@react-native-tvos/config-tv',
      {
        isTV: true,
        // Fire TV ignores the banner; its launcher art comes from the Amazon store listing.
        androidTVBanner: assetPath(projectRoot, 'tv/android-tv-banner.png'),
        appleTVImages: {
          icon: assetPath(projectRoot, 'tv/tvos-icon-1280x768.png'),
          iconSmall: assetPath(projectRoot, 'tv/tvos-icon-small-400x240.png'),
          iconSmall2x: assetPath(projectRoot, 'tv/tvos-icon-small-800x480.png'),
          topShelf: assetPath(projectRoot, 'tv/tvos-top-shelf-1920x720.png'),
          topShelf2x: assetPath(projectRoot, 'tv/tvos-top-shelf-3840x1440.png'),
          topShelfWide: assetPath(projectRoot, 'tv/tvos-top-shelf-wide-2320x720.png'),
          topShelfWide2x: assetPath(projectRoot, 'tv/tvos-top-shelf-wide-4640x1440.png'),
        },
      },
    ],
    ...commonPlugins(projectRoot, { splashImageWidth: 400 }),
  ],
  extra: { variant },
});
