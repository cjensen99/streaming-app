import { jest } from '@jest/globals';
import { View } from 'react-native';
import type { ImageProps } from '../../ui/Image';

/**
 * Stands in for `ui/Image` (expo-image is native). Counts renders, so tests can check that
 * memoised tiles don't re-render, and exposes `onError` through `fireEvent(image, 'error')`.
 * Use with `jest.mock('../../ui/Image', () => jest.requireActual<object>('../helpers/mockImage'))`.
 */
export const imageRenders = jest.fn<(uri: string) => void>();

export function Image({ uri, testID, onError }: ImageProps) {
  imageRenders(uri);
  // `View` has no `onError` prop; spread it in so `fireEvent(image, 'error')` can find it.
  return <View testID={testID} {...{ onError }} />;
}
