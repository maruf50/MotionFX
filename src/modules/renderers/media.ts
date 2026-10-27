import { Layer } from '@/types/motion';
import { drawRoundedRect, applyStrokeStyle } from './shapes';

// Cache loaded HTMLImageElement instances to avoid reloading frames
const imageCache: Map<string, HTMLImageElement> = new Map();

export function getImageFromCache(src: string, onLoaded?: () => void): HTMLImageElement | null {
  if (!src) return null;
  if (imageCache.has(src)) {
    const cached = imageCache.get(src)!;
    return cached;
  }

  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = src;
  img.onload = () => {
    imageCache.set(src, img);
    if (onLoaded) onLoaded();
  };
  imageCache.set(src, img);
  return img;
}

/**
 * Renders an image or PNG layer on the canvas with optional rounded borders and stroke.
 */
export function renderImageLayer(
  ctx: CanvasRenderingContext2D,
  layer: Layer,
  time: number,
  onImageLoad?: () => void
) {
  if (!layer.imageSrc) return;
  const img = getImageFromCache(layer.imageSrc, onImageLoad);
  if (!img || !img.complete || img.naturalWidth === 0) return;

  const hw = layer.width / 2;
  const hh = layer.height / 2;

  ctx.save();
  // Clip with rounded borders if specified
  if (layer.borderRadius > 0) {
    drawRoundedRect(ctx, -hw, -hh, layer.width, layer.height, layer.borderRadius);
    ctx.clip();
  }

  ctx.drawImage(img, -hw, -hh, layer.width, layer.height);
  ctx.restore();

  // Draw border outline if configured
  if (layer.borderWidth > 0 && layer.borderStyle !== 'none' && layer.stroke) {
    applyStrokeStyle(ctx, layer, time);
    drawRoundedRect(ctx, -hw, -hh, layer.width, layer.height, layer.borderRadius);
    ctx.lineWidth = layer.borderWidth;
    ctx.strokeStyle = layer.stroke;
    ctx.stroke();
  }
}
