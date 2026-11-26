import siteImages from 'site-images';
import { isUnpicCompatible, unpicOptimizer, astroAssetsOptimizer } from './images-optimization';
import type { ImageMetadata } from 'astro';
import type { MetaDataOpenGraph } from '#types/metadata.types';
import type { ImagesOptimizer } from './images-optimization';

type OptimizedImage = Awaited<ReturnType<ImagesOptimizer>>[0];

/** */
export const fetchLocalImages = async () => siteImages;

/** */
export const findImage = async (
  imagePath?: string | ImageMetadata | null
): Promise<string | ImageMetadata | undefined | null> => {
  // Not string
  if (typeof imagePath !== 'string') {
    return imagePath;
  }

  // Absolute paths
  if (
    imagePath.startsWith('http://') ||
    imagePath.startsWith('https://') ||
    imagePath.startsWith('/')
  ) {
    return imagePath;
  }

  // Relative paths or not "~/assets/"
  if (!imagePath.startsWith('~/assets/images')) {
    return imagePath;
  }

  const images = await fetchLocalImages();
  const key = imagePath.replace('~/', '/src/');

  return typeof images[key] === 'function' ? (await images[key]()).default : null;
};

/** */
export const adaptOpenGraphImages = async (
  openGraph: MetaDataOpenGraph = {},
  astroSite: URL | undefined = new URL('')
): Promise<MetaDataOpenGraph> => {
  if (!openGraph?.images?.length) {
    return openGraph;
  }

  const images = openGraph.images;
  const defaultWidth = 1200;
  const defaultHeight = 626;

  const adaptedImages = await Promise.all(
    images.map(async (image) => {
      if (image?.url) {
        const resolvedImage = (await findImage(image.url)) as ImageMetadata | string | undefined;
        if (!resolvedImage) {
          return {
            ...image,
            url: '',
          };
        }

        let _image: OptimizedImage | undefined = undefined;

        if (typeof resolvedImage === 'string') {
          // Handle external URLs with unpic
          if (
            (resolvedImage.startsWith('http://') || resolvedImage.startsWith('https://')) &&
            isUnpicCompatible(resolvedImage)
          ) {
            _image = (
              await unpicOptimizer(
                resolvedImage,
                [defaultWidth],
                defaultWidth,
                defaultHeight,
                'jpg'
              )
            )[0];
          } else {
            // Public folder images or external URLs without unpic support
            // Return as-is with default dimensions, converted to absolute URL
            return {
              ...image,
              url: resolvedImage.startsWith('/')
                ? String(new URL(resolvedImage, astroSite))
                : resolvedImage,
              width: image.width || defaultWidth,
              height: image.height || defaultHeight,
            };
          }
        } else if (resolvedImage) {
          // ImageMetadata from ~/assets/ - optimize it
          const dimensions =
            resolvedImage.width <= defaultWidth
              ? [resolvedImage.width, resolvedImage.height]
              : [defaultWidth, defaultHeight];
          _image = (
            await astroAssetsOptimizer(
              resolvedImage,
              [dimensions[0]],
              dimensions[0],
              dimensions[1],
              'jpg'
            )
          )[0];
        }

        if (typeof _image === 'object') {
          return {
            ...image,
            url:
              'src' in _image && typeof _image.src === 'string'
                ? String(new URL(_image.src, astroSite))
                : '',
            width: 'width' in _image && typeof _image.width === 'number' ? _image.width : undefined,
            height:
              'height' in _image && typeof _image.height === 'number' ? _image.height : undefined,
          };
        }
        return {
          ...image,
          url: '',
        };
      }

      return {
        url: '',
      };
    })
  );

  return { ...openGraph, ...(adaptedImages ? { images: adaptedImages } : {}) };
};
