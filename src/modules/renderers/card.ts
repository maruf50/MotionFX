import { Layer, CardShape, CardItem } from '@/types/motion';
import { drawRoundedRect } from './shapes';
import { getInterpolatedValue } from '../keyframes/evaluator';

const imageCache = new Map<string, HTMLImageElement>();

function getImage(src?: string | null, onImageLoad?: () => void): HTMLImageElement | null {
  if (!src) return null;
  let img = imageCache.get(src);
  if (!img) {
    img = new Image();
    img.src = src;
    img.onload = () => onImageLoad?.();
    imageCache.set(src, img);
  }
  return img.complete && img.naturalWidth > 0 ? img : null;
}

function drawChamferRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  c: number
) {
  const chamfer = Math.max(2, Math.min(w * 0.4, h * 0.4, c));
  ctx.beginPath();
  ctx.moveTo(x + chamfer, y);
  ctx.lineTo(x + w - chamfer, y);
  ctx.lineTo(x + w, y + chamfer);
  ctx.lineTo(x + w, y + h - chamfer);
  ctx.lineTo(x + w - chamfer, y + h);
  ctx.lineTo(x + chamfer, y + h);
  ctx.lineTo(x, y + h - chamfer);
  ctx.lineTo(x, y + chamfer);
  ctx.closePath();
}

function drawCardPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  shape: CardShape,
  radius: number
) {
  if (shape === 'chamfer') {
    drawChamferRect(ctx, x, y, w, h, radius || 14);
  } else if (shape === 'rect') {
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.closePath();
  } else if (shape === 'pill') {
    drawRoundedRect(ctx, x, y, w, h, h / 2);
  } else {
    // 'rounded' or 'glass'
    drawRoundedRect(ctx, x, y, w, h, radius);
  }
}

/**
 * Renders an animated Card Stack with customizable cards, layer system,
 * shapes (rounded, chamfer, rect, pill, glass), borders, custom images,
 * and keyframe-aware opacity animation.
 */
export function renderCardShape(
  ctx: CanvasRenderingContext2D,
  layer: Layer,
  time: number,
  onImageLoad?: () => void,
  tr?: { scaleX?: number; scaleY?: number; opacity?: number }
) {
  const cardW = Math.max(80, layer.width || 240);
  const cardH = Math.max(60, layer.height || 150);
  const animType = layer.cardAnimType || 'fan';
  const duration = Math.max(1, layer.cardAnimDuration ?? 3.0);
  const spread = layer.cardSpread ?? 24;
  const loopMode = layer.cardAnimLoop || 'loop';
  const globalRadius = Math.max(2, layer.cardBorderRadius ?? 16);
  const globalColor = layer.cardColor || '#181822';
  const globalShape: CardShape = layer.cardShape || 'rounded';

  // Use card items if defined in layer system; otherwise generate virtual cards
  const hasItems = Array.isArray(layer.cardItems) && layer.cardItems.length > 0;
  const count = hasItems
    ? layer.cardItems!.length
    : Math.max(2, Math.min(8, layer.cardCount ?? 3));

  // Compute normalized animation progress 0 -> 1 (driven by keyframes if set, otherwise time cycle)
  const hasKf = (layer.keyframes?.cardProgress?.length ?? 0) > 0;
  let progress = 0;
  if (hasKf) {
    progress = Math.max(0, Math.min(100, getInterpolatedValue(layer, 'cardProgress', time))) / 100;
  } else if (loopMode === 'loop') {
    progress = (time % duration) / duration;
  } else if (loopMode === 'pingpong') {
    const p2 = (time % (duration * 2)) / duration;
    progress = p2 > 1 ? 2 - p2 : p2;
  } else {
    progress = Math.min(1, time / duration);
  }

  // Smooth sinusoidal motion factor
  const easeFactor = (Math.sin(progress * Math.PI * 2 - Math.PI / 2) + 1) / 2;

  // IMPORTANT: Respect layer transform opacity so keyframing opacity works properly
  const layerOpacity = tr?.opacity !== undefined ? tr.opacity : 1;

  ctx.save();

  // Render cards from back (last index) to front (index 0)
  for (let i = count - 1; i >= 0; i--) {
    ctx.save();

    let offsetX = 0;
    let offsetY = 0;
    let rot = 0;
    let scale = 1;
    let alpha = 1;

    if (animType === 'fan') {
      const centeredIdx = i - (count - 1) / 2;
      rot = (centeredIdx * (spread * 0.4) * (0.3 + 0.7 * easeFactor) * Math.PI) / 180;
      offsetX = centeredIdx * spread * easeFactor * 1.3;
      offsetY = Math.abs(centeredIdx) * (spread * 0.4) * easeFactor - (count - 1 - i) * 6;
      scale = 1 - (count - 1 - i) * 0.04;
    } else if (animType === 'swipe') {
      if (i === 0) {
        const swipeProgress = (progress * 2) % 1;
        offsetX = swipeProgress * (cardW * 1.3);
        rot = (swipeProgress * 18 * Math.PI) / 180;
        alpha = Math.max(0, 1 - swipeProgress * 1.2);
      } else {
        offsetY = -(i * 12) * (1 - easeFactor * 0.2);
        scale = 1 - i * 0.05;
      }
    } else if (animType === 'stackShift') {
      const shiftP = (progress + i / count) % 1;
      offsetY = Math.sin(shiftP * Math.PI * 2) * spread;
      offsetX = Math.cos(shiftP * Math.PI * 2) * (spread * 0.5);
      scale = 0.94 + 0.06 * Math.sin(shiftP * Math.PI * 2);
    } else if (animType === 'cascade') {
      offsetX = (count - 1 - i) * (spread * 0.8) * easeFactor;
      offsetY = (count - 1 - i) * spread * easeFactor;
      scale = 1 - (count - 1 - i) * 0.05;
    } else if (animType === 'flip') {
      rot = Math.sin(progress * Math.PI * 2) * 0.12 * (i === 0 ? 1 : 0.5);
      scale = 1 - (count - 1 - i) * 0.05;
      offsetY = -(count - 1 - i) * 8;
    } else {
      // 'float'
      offsetY = -(count - 1 - i) * 10 + Math.sin(progress * Math.PI * 2 + i) * 8;
      scale = 1 - (count - 1 - i) * 0.04;
    }

    ctx.translate(offsetX, offsetY);
    ctx.rotate(rot);
    ctx.scale(scale, scale);

    // Multiply card alpha by layer opacity to honor keyframed opacity
    ctx.globalAlpha = Math.max(0, Math.min(1, alpha * layerOpacity));

    // Resolve per-card properties from CardItem (layer system) or layer defaults
    const item: Partial<CardItem> = hasItems && layer.cardItems![i] ? layer.cardItems![i] : {};
    const cardShape = item.shape || globalShape;
    const cardRadius = item.borderRadius ?? globalRadius;
    const itemColor = item.color || globalColor;
    const itemGradEnd = item.gradientEnd || (i === 0 ? '#1f1b2e' : '#14141e');
    const title = item.title || (i === 0 ? layer.cardTitle || 'Motion Card' : `Card ${i + 1}`);
    const subtitle = item.subtitle || (i === 0 ? layer.cardSubtitle || '' : '');
    const badge = item.badge || (i === 0 ? layer.cardBadge || '' : '');
    const imageSrc = item.imageSrc || (i === 0 ? layer.cardImageSrc : null);

    const hw = cardW / 2;
    const hh = cardH / 2;

    // Card drop shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
    ctx.shadowBlur = 18;
    ctx.shadowOffsetY = 8;

    // 1. Draw Card Shape Path
    drawCardPath(ctx, -hw, -hh, cardW, cardH, cardShape, cardRadius);

    // 2. Fill with Gradient or Glass
    if (cardShape === 'glass') {
      ctx.fillStyle = i === 0 ? 'rgba(255, 255, 255, 0.09)' : 'rgba(255, 255, 255, 0.04)';
      ctx.fill();

      // Specular sheen
      ctx.save();
      drawCardPath(ctx, -hw, -hh, cardW, cardH, cardShape, cardRadius);
      ctx.clip();
      const glassGrad = ctx.createLinearGradient(-hw, -hh, -hw, 0);
      glassGrad.addColorStop(0, 'rgba(255, 255, 255, 0.22)');
      glassGrad.addColorStop(1, 'rgba(255, 255, 255, 0.02)');
      ctx.fillStyle = glassGrad;
      ctx.fillRect(-hw, -hh, cardW, cardH * 0.5);
      ctx.restore();
    } else {
      const cardGrad = ctx.createLinearGradient(-hw, -hh, hw, hh);
      if (i === 0) {
        cardGrad.addColorStop(0, itemColor);
        cardGrad.addColorStop(1, itemGradEnd);
      } else {
        const dim = Math.max(0.3, 1 - i * 0.16);
        cardGrad.addColorStop(0, `rgba(28, 28, 40, ${dim})`);
        cardGrad.addColorStop(1, `rgba(16, 16, 24, ${dim})`);
      }
      ctx.fillStyle = cardGrad;
      ctx.fill();
    }

    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    // 3. Card Image Background or Hero (if image is card background)
    const imgObj = getImage(imageSrc, onImageLoad);
    if (imgObj) {
      ctx.save();
      drawCardPath(ctx, -hw, -hh, cardW, cardH, cardShape, cardRadius);
      ctx.clip();

      // If full card image or hero thumbnail
      if (cardH > 100 && cardW > 100) {
        ctx.globalAlpha = (i === 0 ? 0.35 : 0.18) * layerOpacity;
        ctx.drawImage(imgObj, -hw, -hh, cardW, cardH);
      }
      ctx.restore();
    }

    // 4. Card Border Stroke
    const bWidth = item.borderWidth ?? layer.cardBorderWidth ?? (i === 0 ? 1.5 : 1);
    const bColor =
      item.borderColor ||
      layer.cardBorderColor ||
      (i === 0 ? 'rgba(168, 85, 247, 0.6)' : 'rgba(255, 255, 255, 0.12)');
    const bStyle = layer.cardBorderStyle || 'solid';

    if (bWidth > 0) {
      ctx.save();
      drawCardPath(ctx, -hw, -hh, cardW, cardH, cardShape, cardRadius);
      if (bStyle === 'dashed') {
        ctx.setLineDash([6, 4]);
      } else if (bStyle === 'dotted') {
        ctx.setLineDash([2, 3]);
      }
      ctx.lineWidth = bWidth;
      ctx.strokeStyle = bColor;
      ctx.stroke();
      ctx.restore();
    }

    // 5. Card Content (Front or specified cards)
    if (i === 0 || hasItems) {
      // Badge Pill
      if (badge) {
        ctx.save();
        ctx.translate(-hw + 16, -hh + 16);
        drawRoundedRect(ctx, 0, 0, Math.min(84, cardW * 0.35), 20, 10);
        ctx.fillStyle = 'rgba(147, 51, 234, 0.28)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(168, 85, 247, 0.65)';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = '#e9d5ff';
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(badge, Math.min(84, cardW * 0.35) / 2, 10);
        ctx.restore();
      }

      // Card Image Thumbnail (if not full background)
      let textLeft = -hw + 18;
      if (imgObj) {
        const imgSize = Math.max(28, Math.min(cardH - 40, 52));
        ctx.save();
        drawRoundedRect(ctx, -hw + 16, -hh + 42, imgSize, imgSize, 8);
        ctx.clip();
        ctx.drawImage(imgObj, -hw + 16, -hh + 42, imgSize, imgSize);
        ctx.restore();

        ctx.save();
        drawRoundedRect(ctx, -hw + 16, -hh + 42, imgSize, imgSize, 8);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();

        textLeft = -hw + 24 + imgSize;
      }

      // Title
      if (title) {
        ctx.fillStyle = item.textColor || '#ffffff';
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(title, textLeft, -hh + 44);
      }

      // Subtitle
      if (subtitle) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(subtitle, textLeft, -hh + 66);
      }

      // Decorative bottom accent line
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.45)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-hw + 18, hh - 16);
      ctx.lineTo(hw - 18, hh - 16);
      ctx.stroke();
    }

    ctx.restore();
  }

  ctx.restore();
}
