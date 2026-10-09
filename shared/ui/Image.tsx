import { Image as ExpoImage, type ImageProps as ExpoImageProps } from 'expo-image';

export interface ImageProps extends Omit<ExpoImageProps, 'source' | 'contentFit'> {
  uri: string;
  /** How the image fills its box. Defaults to `contain` (the whole image, never cropped). */
  contentFit?: ExpoImageProps['contentFit'];
}

/** A remote image (expo-image: memory + disk cache, decoded off the JS thread). */
export function Image({ uri, contentFit = 'contain', transition = 150, ...props }: ImageProps) {
  return <ExpoImage {...props} source={{ uri }} contentFit={contentFit} transition={transition} />;
}
