import type { ReactNode } from 'react';
import Svg, { Circle, Path } from 'react-native-svg';
import { colors } from './colors';

export type IconName = 'alert' | 'offline' | 'play' | 'pause' | 'plus' | 'check' | 'back';

/**
 * 24×24 icons drawn in the icon's colour (`currentColor`): outlines, except `play` and `pause`,
 * which are filled. Add icons here as screens need them.
 */
const ICONS: Record<IconName, ReactNode> = {
  alert: (
    <>
      <Circle cx={12} cy={12} r={10} />
      <Path d="M12 7v6" />
      <Circle cx={12} cy={16.5} r={0.5} />
    </>
  ),
  offline: (
    <>
      <Path d="M2 8.8a14 14 0 0 1 20 0" />
      <Path d="M5.3 12.3a9.5 9.5 0 0 1 13.4 0" />
      <Path d="M8.6 15.8a5 5 0 0 1 6.8 0" />
      <Circle cx={12} cy={19.5} r={0.5} />
      <Path d="M3 3l18 18" />
    </>
  ),
  play: <Path d="M7 4.5v15l12.5-7.5z" fill="currentColor" />,
  pause: <Path d="M7 5h3v14H7zM14 5h3v14h-3z" fill="currentColor" />,
  plus: <Path d="M12 5v14M5 12h14" />,
  check: <Path d="M5 12.5l4.5 4.5L19 7" />,
  back: <Path d="M19 12H5M11 6l-6 6 6 6" />,
};

export interface IconProps {
  name: IconName;
  size: number;
  color?: string;
  testID?: string;
}

/** A decorative icon: hidden from screen readers, so the text next to it must carry the meaning. */
export function Icon({ name, size, color = colors.icon, testID }: IconProps) {
  return (
    <Svg
      testID={testID}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      color={color}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      accessible={false}
      importantForAccessibility="no-hide-descendants"
    >
      {ICONS[name]}
    </Svg>
  );
}
