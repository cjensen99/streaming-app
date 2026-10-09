import type { Metrics, TypeSize } from './metrics.types';
import { scale } from './scale.mobile';

// Phone sizes, in 390-wide design units.

const type = (fontSize: number, lineHeight: number): TypeSize => ({
  fontSize: scale(fontSize),
  lineHeight: scale(lineHeight),
});

const tile = {
  width: scale(160),
  height: scale(90), // 16:9
  gap: scale(12),
  logoPadding: scale(14),
  labelGap: scale(6),
  iconSize: scale(28),
};
const caption = type(13, 18);

export const metrics: Metrics = {
  spacing: { xs: scale(4), sm: scale(8), md: scale(12), lg: scale(20), xl: scale(32) },
  radius: { sm: scale(6), md: scale(10) },
  type: { title: type(28, 34), heading: type(20, 26), body: type(16, 22), caption },
  screen: { paddingHorizontal: scale(16), paddingVertical: scale(16) },
  tile,
  rail: { titleGap: scale(10), bodyHeight: tile.height + tile.labelGap + caption.lineHeight },
  detail: { artworkWidth: '100%', artworkPadding: scale(28), factColumnMinWidth: scale(160) },
  button: { height: scale(48), paddingHorizontal: scale(20), iconSize: scale(20), gap: scale(8) },
  stateIcon: scale(56),
  stateMaxWidth: scale(340),
  // Phones show focus only for hardware keyboards; keep the outline thin.
  focusBorderWidth: 2,
};
