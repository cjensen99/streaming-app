import type { Metrics, TypeSize } from './metrics.types';
import { scale } from './scale';

// TV sizes, in 1920×1080 design pixels.

const type = (fontSize: number, lineHeight: number): TypeSize => ({
  fontSize: scale(fontSize),
  lineHeight: scale(lineHeight),
});

const tile = {
  width: scale(384),
  height: scale(216), // 16:9
  gap: scale(32),
  logoPadding: scale(32),
  labelGap: scale(12),
  iconSize: scale(48),
};
const caption = type(24, 30);

export const metrics: Metrics = {
  spacing: { xs: scale(8), sm: scale(16), md: scale(24), lg: scale(40), xl: scale(64) },
  radius: { sm: scale(8), md: scale(12) },
  type: { title: type(56, 68), heading: type(36, 44), body: type(28, 36), caption },
  // About 5% of each edge: the action-safe area for TVs that overscan.
  screen: { paddingHorizontal: scale(96), paddingVertical: scale(54) },
  tile,
  rail: { titleGap: scale(16), bodyHeight: tile.height + tile.labelGap + caption.lineHeight },
  // Sized so the whole Detail page fits a 1080p screen without scrolling.
  detail: { artworkWidth: scale(480), artworkPadding: scale(40), factColumnMinWidth: scale(420) },
  button: { height: scale(72), paddingHorizontal: scale(40), iconSize: scale(32), gap: scale(16) },
  player: { centerIcon: scale(144), centerButton: scale(208), backButton: scale(80) },
  stateIcon: scale(96),
  stateMaxWidth: scale(960),
  focusBorderWidth: scale(6),
};
