/**
 * Drop-in <picture> wrapper that hands the browser AVIF → WebP → original
 * paths for any /images/foo.jpg URL. Assumes the build step has produced
 * sibling .avif and .webp files (see scripts/optimize-images.mjs).
 *
 * For the LCP hero image, pass `priority` to opt out of lazy-loading and
 * mark it as fetchpriority=high.
 */
const swapExt = (src, ext) => src.replace(/\.(jpe?g|png)$/i, `.${ext}`);

const buildSrcSet = (src, widths, ext) => {
  if (!widths || widths.length === 0) return swapExt(src, ext);
  const dir = src.slice(0, src.lastIndexOf('/') + 1);
  const file = src.slice(src.lastIndexOf('/') + 1);
  const base = file.replace(/\.(jpe?g|png)$/i, '');
  return widths.map((w) => `${dir}${base}-${w}.${ext} ${w}w`).join(', ');
};

const OptimizedImage = ({
  src,
  alt,
  className,
  sizes,
  widths,
  priority = false,
  imgClassName,
  pictureClassName,
  ...rest
}) => {
  const responsive = Array.isArray(widths) && widths.length > 0;

  return (
    <picture className={pictureClassName}>
      <source
        type="image/avif"
        srcSet={responsive ? buildSrcSet(src, widths, 'avif') : swapExt(src, 'avif')}
        sizes={sizes}
      />
      <source
        type="image/webp"
        srcSet={responsive ? buildSrcSet(src, widths, 'webp') : swapExt(src, 'webp')}
        sizes={sizes}
      />
      <img
        src={src}
        srcSet={responsive ? buildSrcSet(src, widths, 'jpg') : undefined}
        sizes={sizes}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        fetchPriority={priority ? 'high' : 'auto'}
        className={imgClassName ?? className}
        {...rest}
      />
    </picture>
  );
};

export default OptimizedImage;
