import { Layer, CardShape, CardItem, CardImageMask, CardAnimType } from '@/types/motion';
import { drawRoundedRect } from './shapes';
import { getInterpolatedValue } from '../keyframes/evaluator';
import { resolveColorOrGradient, isGradient } from './gradients';

const imageCache = new Map<string, HTMLImageElement>();

function getImage(src?: string | null, onImageLoad?: () => void): HTMLImageElement | null {
  if (!src || typeof src !== 'string' || !src.trim()) return null;
  let img = imageCache.get(src);
  if (!img) {
    try {
      img = new Image();
      img.onload = () => onImageLoad?.();
      img.onerror = () => {
        imageCache.delete(src);
      };
      img.src = src;
      imageCache.set(src, img);
    } catch {
      return null;
    }
  }
  return img && img.complete && img.naturalWidth > 0 && img.naturalHeight > 0 ? img : null;
}

/**
 * Draws a continuous-curvature smoothed rectangle (Squircle) using cubic bezier curves.
 */
export function drawSquircle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const hw = w / 2;
  const hh = h / 2;
  const cx = x + hw;
  const cy = y + hh;
  // Corner offset scaled with radius
  const corner = Math.min(hw * 0.9, hh * 0.9, Math.max(4, r * 1.15));
  const k = 0.55228475; // Bezier control handle fraction

  ctx.beginPath();
  ctx.moveTo(cx - hw + corner, cy - hh);
  ctx.lineTo(cx + hw - corner, cy - hh);
  ctx.bezierCurveTo(
    cx + hw - corner * (1 - k),
    cy - hh,
    cx + hw,
    cy - hh + corner * (1 - k),
    cx + hw,
    cy - hh + corner
  );
  ctx.lineTo(cx + hw, cy + hh - corner);
  ctx.bezierCurveTo(
    cx + hw,
    cy + hh - corner * (1 - k),
    cx + hw - corner * (1 - k),
    cy + hh,
    cx + hw - corner,
    cy + hh
  );
  ctx.lineTo(cx - hw + corner, cy + hh);
  ctx.bezierCurveTo(
    cx - hw + corner * (1 - k),
    cy + hh,
    cx - hw,
    cy + hh - corner * (1 - k),
    cx - hw,
    cy + hh - corner
  );
  ctx.lineTo(cx - hw, cy - hh + corner);
  ctx.bezierCurveTo(
    cx - hw,
    cy - hh + corner * (1 - k),
    cx - hw + corner * (1 - k),
    cy - hh,
    cx - hw + corner,
    cy - hh
  );
  ctx.closePath();
}

export function drawChamferRect(
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

export function drawTriangle(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.beginPath();
  ctx.moveTo(x + w / 2, y);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x, y + h);
  ctx.closePath();
}

export function drawStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  spikes: number = 5,
  outerRadius: number = 40,
  innerRadius: number = 20
) {
  let rot = (Math.PI / 2) * 3;
  let x = cx;
  let y = cy;
  const step = Math.PI / spikes;

  ctx.beginPath();
  ctx.moveTo(cx, cy - outerRadius);
  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius;
    y = cy + Math.sin(rot) * outerRadius;
    ctx.lineTo(x, y);
    rot += step;

    x = cx + Math.cos(rot) * innerRadius;
    y = cy + Math.sin(rot) * innerRadius;
    ctx.lineTo(x, y);
    rot += step;
  }
  ctx.lineTo(cx, cy - outerRadius);
  ctx.closePath();
}

export function drawHexagon(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  const cx = x + w / 2;
  const cy = y + h / 2;
  const rx = w / 2;
  const ry = h / 2;
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3 - Math.PI / 6;
    const px = cx + rx * Math.cos(angle);
    const py = cy + ry * Math.sin(angle);
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

/**
 * Draws the outline path for a card based on its shape type.
 */
export function drawCardPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  shape: CardShape,
  radius: number
) {
  if (shape === 'squircle') {
    drawSquircle(ctx, x, y, w, h, radius || 22);
  } else if (shape === 'chamfer') {
    drawChamferRect(ctx, x, y, w, h, radius || 14);
  } else if (shape === 'rect') {
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.closePath();
  } else if (shape === 'circle') {
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
    ctx.closePath();
  } else if (shape === 'pill') {
    drawRoundedRect(ctx, x, y, w, h, Math.min(w, h) / 2);
  } else if (shape === 'triangle') {
    drawTriangle(ctx, x, y, w, h);
  } else if (shape === 'star') {
    const minDim = Math.min(w, h);
    drawStar(ctx, x + w / 2, y + h / 2, 5, minDim / 2, minDim / 4);
  } else if (shape === 'hexagon') {
    drawHexagon(ctx, x, y, w, h);
  } else {
    // 'rounded' or 'glass'
    drawRoundedRect(ctx, x, y, w, h, radius || 18);
  }
}

/**
 * Draws image inside a masked geometry within the card.
 */
function drawMaskedImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  mask: CardImageMask,
  cardX: number,
  cardY: number,
  cardW: number,
  cardH: number,
  cardShape: CardShape,
  cardRadius: number,
  opacity: number = 1
) {
  if (!img || !img.complete || img.naturalWidth <= 0 || img.naturalHeight <= 0) return;
  if (cardW <= 0 || cardH <= 0) return;

  try {
    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, opacity));

    if (mask === 'circle') {
      const size = Math.min(cardW, cardH) * 0.72;
      if (size > 0) {
        const cx = cardX + cardW / 2;
        const cy = cardY + cardH / 2;
        ctx.beginPath();
        ctx.arc(cx, cy, size / 2, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(img, cx - size / 2, cy - size / 2, size, size);
        ctx.restore();

        // Circle border accent
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, size / 2, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();
      } else {
        ctx.restore();
      }
      return;
    }

    if (mask === 'triangle') {
      const sizeW = cardW * 0.75;
      const sizeH = cardH * 0.75;
      if (sizeW > 0 && sizeH > 0) {
        const mx = cardX + (cardW - sizeW) / 2;
        const my = cardY + (cardH - sizeH) / 2;
        ctx.beginPath();
        drawTriangle(ctx, mx, my, sizeW, sizeH);
        ctx.clip();
        ctx.drawImage(img, mx, my, sizeW, sizeH);
      }
      ctx.restore();
      return;
    }

    if (mask === 'star') {
      const minDim = Math.min(cardW, cardH) * 0.75;
      if (minDim > 0) {
        const cx = cardX + cardW / 2;
        const cy = cardY + cardH / 2;
        drawStar(ctx, cx, cy, 5, minDim / 2, minDim / 4);
        ctx.clip();
        ctx.drawImage(img, cx - minDim / 2, cy - minDim / 2, minDim, minDim);
      }
      ctx.restore();
      return;
    }

    if (mask === 'hexagon') {
      const sizeW = cardW * 0.75;
      const sizeH = cardH * 0.75;
      if (sizeW > 0 && sizeH > 0) {
        const mx = cardX + (cardW - sizeW) / 2;
        const my = cardY + (cardH - sizeH) / 2;
        drawHexagon(ctx, mx, my, sizeW, sizeH);
        ctx.clip();
        ctx.drawImage(img, mx, my, sizeW, sizeH);
      }
      ctx.restore();
      return;
    }

    if (mask === 'squircle') {
      const sizeW = cardW * 0.82;
      const sizeH = cardH * 0.82;
      if (sizeW > 0 && sizeH > 0) {
        const mx = cardX + (cardW - sizeW) / 2;
        const my = cardY + (cardH - sizeH) / 2;
        drawSquircle(ctx, mx, my, sizeW, sizeH, cardRadius * 0.8);
        ctx.clip();
        ctx.drawImage(img, mx, my, sizeW, sizeH);
      }
      ctx.restore();
      return;
    }

    if (mask === 'rect') {
      const sizeW = cardW * 0.82;
      const sizeH = cardH * 0.82;
      if (sizeW > 0 && sizeH > 0) {
        const mx = cardX + (cardW - sizeW) / 2;
        const my = cardY + (cardH - sizeH) / 2;
        ctx.beginPath();
        ctx.rect(mx, my, sizeW, sizeH);
        ctx.clip();
        ctx.drawImage(img, mx, my, sizeW, sizeH);
      }
      ctx.restore();
      return;
    }

    // Default: Full bleed mask honoring the outer card shape
    drawCardPath(ctx, cardX, cardY, cardW, cardH, cardShape, cardRadius);
    ctx.clip();
    ctx.drawImage(img, cardX, cardY, cardW, cardH);
    ctx.restore();
  } catch (err) {
    ctx.restore();
    console.warn('drawMaskedImage error caught:', err);
  }
}

/**
 * Renders an animated Card Stack with clean smoothed-out rectangle / squircle geometry,
 * custom card shapes, image masking (circle, rect, triangle, star, hexagon),
 * full keyframe-able 0-100% animation slider (`cardProgress`), and animation presets:
 * - circularArray: Cards distributed in a rotating circular ring
 * - linearArray: Cards aligned in a clean horizontal/vertical row
 * - fallingStack: Cards cascading/dropping into a stack from above
 * - stackSpread: Cards spreading out dynamically from center
 * - queue: Perspective queue sliding forward
 * - stack: Classic layered 3D depth stack
 */
export function renderCardShape(
  ctx: CanvasRenderingContext2D,
  layer: Layer,
  time: number,
  onImageLoad?: () => void,
  tr?: { scaleX?: number; scaleY?: number; opacity?: number }
) {
  const cardW = Math.max(40, layer.width || 240);
  const cardH = Math.max(30, layer.height || 150);
  const animType: CardAnimType = layer.cardAnimType || 'stackSpread';
  const duration = Math.max(0.5, layer.cardAnimDuration ?? 3.0);
  const spread = layer.cardSpread ?? 32;
  const loopMode = layer.cardAnimLoop || 'loop';
  const globalRadius = Math.max(2, layer.cardBorderRadius ?? 22);
  const globalColor = layer.cardColor || '#6366f1';
  const globalShape: CardShape = layer.cardShape || 'squircle';
  const showContent = layer.cardShowContent ?? false;
  const globalImageMask: CardImageMask = layer.cardImageMask || 'none';

  // Use card items if defined in layer system; otherwise generate virtual cards
  const hasItems = Array.isArray(layer.cardItems) && layer.cardItems.length > 0;
  const count = hasItems
    ? layer.cardItems!.length
    : Math.max(2, Math.min(12, layer.cardCount ?? 3));

  // Compute normalized animation progress 0 -> 1 (driven by keyframes if set, otherwise time cycle)
  const hasKf = (layer.keyframes?.cardProgress?.length ?? 0) > 0;
  let progress = 0;
  if (hasKf) {
    progress = Math.max(0, Math.min(100, getInterpolatedValue(layer, 'cardProgress', time))) / 100;
  } else if (typeof layer.cardProgress === 'number') {
    progress = Math.max(0, Math.min(100, layer.cardProgress)) / 100;
  } else if (loopMode === 'loop') {
    progress = (time % duration) / duration;
  } else if (loopMode === 'pingpong') {
    const p2 = (time % (duration * 2)) / duration;
    progress = p2 > 1 ? 2 - p2 : p2;
  } else {
    progress = Math.min(1, time / duration);
  }

  // Smooth sinusoidal motion factor for looping presets
  const easeFactor = (Math.sin(progress * Math.PI * 2 - Math.PI / 2) + 1) / 2;

  // Respect layer transform opacity so keyframing opacity works properly
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

    // ANIMATION PRESETS
    if (animType === 'circularArray') {
      // Circular array: cards arranged radially in a circular ring
      const angle = (i / count) * Math.PI * 2 + progress * Math.PI * 2;
      const radiusDist = (Math.max(cardW, cardH) * 0.75 + spread * 2.2) * Math.min(1, progress * 1.5);
      offsetX = Math.cos(angle) * radiusDist;
      offsetY = Math.sin(angle) * radiusDist;
      rot = (angle + Math.PI / 2) * Math.min(1, progress * 1.2);
      scale = 0.85 + 0.15 * Math.sin(angle);
      alpha = Math.min(1, 0.4 + 0.6 * progress);
    } else if (animType === 'linearArray') {
      // Linear array: cards expanding in a horizontal row
      const centeredIdx = i - (count - 1) / 2;
      offsetX = centeredIdx * (cardW + spread) * progress;
      offsetY = 0;
      rot = 0;
      scale = 1;
      alpha = Math.min(1, 0.4 + 0.6 * progress);
    } else if (animType === 'fallingStack') {
      // Falling stack: cards cascading / dropping in from above
      const stagger = ((count - 1 - i) / count) * 0.5;
      const t = Math.max(0, Math.min(1, (progress - stagger) / 0.5));
      const bounceDrop = (1 - t) * -380 + Math.sin(t * Math.PI) * -16 * (1 - t);
      offsetY = bounceDrop - (count - 1 - i) * 6;
      offsetX = (count - 1 - i) * 3 * (1 - t);
      rot = (1 - t) * ((i % 2 === 0 ? 1 : -1) * 6 * (Math.PI / 180));
      scale = 0.9 + 0.1 * t;
      alpha = Math.min(1, t * 1.5);
    } else if (animType === 'stackSpread' || animType === 'fan') {
      // Stack spread: cards spreading out dynamically from center
      const centeredIdx = i - (count - 1) / 2;
      offsetX = centeredIdx * (spread * 1.6) * progress;
      offsetY = Math.abs(centeredIdx) * (spread * 0.45) * progress - (count - 1 - i) * 5 * (1 - progress * 0.5);
      rot = (centeredIdx * (spread * 0.35) * progress * Math.PI) / 180;
      scale = 1 - (count - 1 - i) * 0.03 * (1 - progress);
    } else if (animType === 'queue') {
      // Queue: perspective queue sliding forward
      const qStep = (i - progress * 1.8 + count * 5) % count;
      offsetX = (qStep - (count - 1) / 2) * (spread * 0.65);
      offsetY = -qStep * (spread * 0.6);
      scale = Math.max(0.6, 1 - qStep * 0.08);
      alpha = Math.max(0.2, 1 - qStep * 0.18);
    } else if (animType === 'stack') {
      // Classic 3D depth stack
      offsetY = -(count - 1 - i) * (spread * 0.45) * progress;
      offsetX = (count - 1 - i) * (spread * 0.25) * progress;
      scale = 1 - (count - 1 - i) * 0.05 * progress;
      rot = (count - 1 - i) * 1.2 * progress * (Math.PI / 180);
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
    } else if (animType === 'cascade') {
      offsetX = (count - 1 - i) * (spread * 0.8) * progress;
      offsetY = (count - 1 - i) * spread * progress;
      scale = 1 - (count - 1 - i) * 0.05;
    } else if (animType === 'flip') {
      rot = Math.sin(progress * Math.PI * 2) * 0.12 * (i === 0 ? 1 : 0.5);
      scale = 1 - (count - 1 - i) * 0.05;
      offsetY = -(count - 1 - i) * 8;
    } else {
      // 'float' / default
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
    const itemGradEnd = item.gradientEnd || layer.cardGradientEnd || '#181826';
    const imageSrc = item.imageSrc || layer.cardImageSrc;
    const imageMask = item.imageMask || globalImageMask;

    const hw = cardW / 2;
    const hh = cardH / 2;

    // Card drop shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
    ctx.shadowBlur = 18;
    ctx.shadowOffsetY = 8;

    // 1. Draw Card Shape Path
    drawCardPath(ctx, -hw, -hh, cardW, cardH, cardShape, cardRadius);

    // 2. Fill with Color / Gradient / Glass
    if (cardShape === 'glass') {
      ctx.fillStyle = i === 0 ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.05)';
      ctx.fill();

      // Specular glass sheen
      ctx.save();
      drawCardPath(ctx, -hw, -hh, cardW, cardH, cardShape, cardRadius);
      ctx.clip();
      const glassGrad = ctx.createLinearGradient(-hw, -hh, -hw, 0);
      glassGrad.addColorStop(0, 'rgba(255, 255, 255, 0.28)');
      glassGrad.addColorStop(1, 'rgba(255, 255, 255, 0.02)');
      ctx.fillStyle = glassGrad;
      ctx.fillRect(-hw, -hh, cardW, cardH * 0.5);
      ctx.restore();
    } else if (isGradient(itemColor)) {
      ctx.fillStyle = resolveColorOrGradient(ctx, itemColor, -hw, -hh, cardW, cardH);
      ctx.fill();
    } else {
      const cardGrad = ctx.createLinearGradient(-hw, -hh, hw, hh);
      cardGrad.addColorStop(0, itemColor);
      cardGrad.addColorStop(1, itemGradEnd);
      ctx.fillStyle = cardGrad;
      ctx.fill();
    }

    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    // 3. Image with Masking
    if (imageSrc) {
      try {
        const imgObj = getImage(imageSrc, onImageLoad);
        if (imgObj) {
          drawMaskedImage(
            ctx,
            imgObj,
            imageMask,
            -hw,
            -hh,
            cardW,
            cardH,
            cardShape,
            cardRadius,
            i === 0 ? 0.95 : 0.75
          );
        }
      } catch {
        // Safe fallback
      }
    }

    // 4. Card Border Stroke
    const bWidth = item.borderWidth ?? layer.cardBorderWidth ?? 2;
    const bColor =
      item.borderColor ||
      layer.cardBorderColor ||
      (i === 0 ? 'rgba(255, 255, 255, 0.35)' : 'rgba(255, 255, 255, 0.18)');
    const bStyle = layer.cardBorderStyle || 'solid';

    if (bWidth > 0 && bStyle !== 'none') {
      ctx.save();
      drawCardPath(ctx, -hw, -hh, cardW, cardH, cardShape, cardRadius);
      if (bStyle === 'dashed') {
        ctx.setLineDash([6, 4]);
      } else if (bStyle === 'dotted') {
        ctx.setLineDash([2, 3]);
      }
      ctx.lineWidth = bWidth;
      ctx.strokeStyle = resolveColorOrGradient(ctx, bColor, -hw, -hh, cardW, cardH);
      ctx.stroke();
      ctx.restore();
    }

    // 5. Optional Mock Text & Badges (Only when cardShowContent is explicitly true)
    if (showContent && (i === 0 || hasItems)) {
      const title = item.title || layer.cardTitle || '';
      const subtitle = item.subtitle || layer.cardSubtitle || '';
      const badge = item.badge || layer.cardBadge || '';

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

      // Title & Subtitle
      if (title) {
        ctx.fillStyle = item.textColor || '#ffffff';
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(title, -hw + 18, -hh + (badge ? 44 : 22));
      }

      if (subtitle) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(subtitle, -hw + 18, -hh + (badge ? 66 : 42));
      }

      // Accent Line
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
