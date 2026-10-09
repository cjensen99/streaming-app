import { Dimensions } from 'react-native';
import { metrics } from '../ui/metrics';

/** Distance from one tile's start to the next: every tile has the same fixed width. */
export const RAIL_ITEM_LENGTH = metrics.tile.width + metrics.tile.gap;

/** Tiles that fit across the screen (the last one partly), so a rail renders no more at first. */
export const RAIL_VISIBLE_TILES = Math.ceil(Dimensions.get('window').width / RAIL_ITEM_LENGTH);
