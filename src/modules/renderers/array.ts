import { Layer, ArrayElementItem, ArrayItemShape } from '@/types/motion';
import { drawRoundedRect } from './shapes';
import { getInterpolatedValue } from '../keyframes/evaluator';

const VIBRANT_PALETTE = [
  '#6366f1',
  '#ec4899',
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#8b5cf6',
  '#06b6d4',
  '#f43f5e',
  '#14b8a6',
  '#eab308',
];

const imageCache = new Map<string, HTMLImageElement>();

/**
 * Draws a geometric shape centered at (0, 0).
 */
function drawItemShape(
  ctx: CanvasRenderingContext2D,
  shape: ArrayItemShape,
  hs: number,
  color: string,
  borderWidth: number,
  borderColor?: string
) {
  const itemSize = hs * 2;
  ctx.fillStyle = color;

  if (shape === 'circle') {
    ctx.beginPath();
    ctx.arc(0, 0, hs, 0, Math.PI * 2);
    ctx.fill();
    if (borderWidth > 0 && borderColor) {
      ctx.lineWidth = borderWidth;
      ctx.strokeStyle = borderColor;
      ctx.stroke();
    }
  } else if (shape === 'square') {
    ctx.fillRect(-hs, -hs, itemSize, itemSize);
    if (borderWidth > 0 && borderColor) {
      ctx.lineWidth = borderWidth;
      ctx.strokeStyle = borderColor;
      ctx.strokeRect(-hs, -hs, itemSize, itemSize);
    }
  } else if (shape === 'rounded') {
    const r = Math.round(itemSize * 0.28);
    drawRoundedRect(ctx, -hs, -hs, itemSize, itemSize, r);
    ctx.fill();
    if (borderWidth > 0 && borderColor) {
      ctx.lineWidth = borderWidth;
      ctx.strokeStyle = borderColor;
      ctx.stroke();
    }
  } else if (shape === 'dot') {
    ctx.beginPath();
    ctx.arc(0, 0, Math.max(2, hs * 0.55), 0, Math.PI * 2);
    ctx.fill();
    if (borderWidth > 0 && borderColor) {
      ctx.lineWidth = borderWidth;
      ctx.strokeStyle = borderColor;
      ctx.stroke();
    }
  } else if (shape === 'ring') {
    const strokeW = borderWidth > 0 ? borderWidth : Math.max(2, itemSize * 0.18);
    ctx.beginPath();
    ctx.arc(0, 0, Math.max(1, hs - strokeW / 2), 0, Math.PI * 2);
    ctx.lineWidth = strokeW;
    ctx.strokeStyle = borderColor || color;
    ctx.stroke();
  } else if (shape === 'star') {
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const outerAngle = (i * Math.PI * 2) / 5 - Math.PI / 2;
      const innerAngle = outerAngle + Math.PI / 5;
      const ox = Math.cos(outerAngle) * hs;
      const oy = Math.sin(outerAngle) * hs;
      const ix = Math.cos(innerAngle) * (hs * 0.44);
      const iy = Math.sin(innerAngle) * (hs * 0.44);
      if (i === 0) ctx.moveTo(ox, oy);
      else ctx.lineTo(ox, oy);
      ctx.lineTo(ix, iy);
    }
    ctx.closePath();
    ctx.fill();
    if (borderWidth > 0 && borderColor) {
      ctx.lineWidth = borderWidth;
      ctx.strokeStyle = borderColor;
      ctx.stroke();
    }
  } else if (shape === 'triangle') {
    ctx.beginPath();
    ctx.moveTo(0, -hs);
    ctx.lineTo(hs * 0.88, hs * 0.7);
    ctx.lineTo(-hs * 0.88, hs * 0.7);
    ctx.closePath();
    ctx.fill();
    if (borderWidth > 0 && borderColor) {
      ctx.lineWidth = borderWidth;
      ctx.strokeStyle = borderColor;
      ctx.stroke();
    }
  } else if (shape === 'diamond') {
    ctx.beginPath();
    ctx.moveTo(0, -hs);
    ctx.lineTo(hs * 0.82, 0);
    ctx.lineTo(0, hs);
    ctx.lineTo(-hs * 0.82, 0);
    ctx.closePath();
    ctx.fill();
    if (borderWidth > 0 && borderColor) {
      ctx.lineWidth = borderWidth;
      ctx.strokeStyle = borderColor;
      ctx.stroke();
    }
  } else if (shape === 'hexagon') {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI * 2) / 6;
      const x = Math.cos(angle) * hs;
      const y = Math.sin(angle) * hs;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    if (borderWidth > 0 && borderColor) {
      ctx.lineWidth = borderWidth;
      ctx.strokeStyle = borderColor;
      ctx.stroke();
    }
  }
}

/**
 * Draws a single element item (shape, text, icon, image) in an array cell.
 */
function renderArrayElement(
  ctx: CanvasRenderingContext2D,
  elem: ArrayElementItem,
  baseSize: number,
  fallbackColor: string,
  layerBorderW: number,
  layerBorderColor?: string,
  onImageLoad?: () => void
) {
  const sizeRatio = elem.sizeRatio ?? 1.0;
  const itemSize = Math.max(4, baseSize * sizeRatio);
  const hs = Math.max(2, itemSize / 2);
  const color = elem.color || fallbackColor;
  const borderW = elem.borderWidth ?? layerBorderW;
  const borderCol = elem.borderColor ?? layerBorderColor;

  if (elem.kind === 'shape') {
    drawItemShape(ctx, elem.shape || 'circle', hs, color, borderW, borderCol);
  } else if (elem.kind === 'text') {
    const textStr = elem.text || 'FX';
    const fontSize = elem.fontSize || Math.max(10, Math.round(itemSize * 0.6));

    // Optional badge background
    if (elem.color && elem.color !== 'transparent') {
      ctx.fillStyle = elem.color;
      drawRoundedRect(ctx, -hs, -hs, itemSize, itemSize, Math.round(itemSize * 0.25));
      ctx.fill();
      if (borderW > 0 && borderCol) {
        ctx.lineWidth = borderW;
        ctx.strokeStyle = borderCol;
        ctx.stroke();
      }
    }

    ctx.fillStyle = elem.textColor || '#ffffff';
    ctx.font = `bold ${fontSize}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(textStr, 0, 1);
  } else if (elem.kind === 'icon') {
    const iconStr = elem.icon || '⚡';
    const fontSize = Math.max(10, Math.round(itemSize * 0.8));

    // Optional backdrop
    if (elem.color && elem.color !== 'transparent') {
      ctx.fillStyle = elem.color;
      ctx.beginPath();
      ctx.arc(0, 0, hs, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.font = `${fontSize}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(iconStr, 0, 1);
  } else if (elem.kind === 'image' && elem.imageSrc) {
    let img = imageCache.get(elem.imageSrc);
    if (!img) {
      img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = elem.imageSrc;
      img.onload = () => {
        if (onImageLoad) onImageLoad();
      };
      imageCache.set(elem.imageSrc, img);
    }

    if (img.complete && img.naturalWidth > 0) {
      ctx.save();
      const r = Math.round(itemSize * 0.22);
      drawRoundedRect(ctx, -hs, -hs, itemSize, itemSize, r);
      ctx.clip();
      ctx.drawImage(img, -hs, -hs, itemSize, itemSize);
      ctx.restore();

      if (borderW > 0 && borderCol) {
        ctx.lineWidth = borderW;
        ctx.strokeStyle = borderCol;
        drawRoundedRect(ctx, -hs, -hs, itemSize, itemSize, r);
        ctx.stroke();
      }
    } else {
      // Placeholder while loading
      ctx.fillStyle = color;
      drawRoundedRect(ctx, -hs, -hs, itemSize, itemSize, 4);
      ctx.fill();
    }
  }
}

/**
 * Deterministic pseudo-random number generator for grid cell variations.
 */
function pseudoRandom(seed: number): number {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

/**
 * Renders the Array / Grid Matrix animation.
 * Spawns items in a grid layout with various spring pop-up, wave, ripple, drop and cascade animations.
 * Supports custom element layers (shapes, texts, icons, images), borders, and size/rotation variations.
 */
export function renderArrayShape(
  ctx: CanvasRenderingContext2D,
  layer: Layer,
  time: number,
  onImageLoad?: () => void,
  tr?: { scaleX: number; scaleY: number }
) {
  const safeTime = Math.max(0, time);
  const rows = Math.max(1, Math.min(24, layer.arrayRows ?? 4));
  const cols = Math.max(1, Math.min(24, layer.arrayCols ?? 5));
  const gap = Math.max(1, layer.arrayGap ?? 14);
  const itemSize = Math.max(6, layer.arrayItemSize ?? 22);
  const shape = layer.arrayShape || 'circle';
  const animType = layer.arrayAnimType || 'pop';
  const duration = Math.max(0.5, layer.arrayAnimDuration ?? 2.5);
  const stagger = Math.max(0.01, layer.arrayAnimStagger ?? 0.08);
  const loopMode = layer.arrayAnimLoop || 'loop';
  const isRandomColor = layer.arrayRandomColor ?? false;
  const customEmoji = layer.arrayCustomEmoji || '⚡';
  const baseColor = layer.fill || '#6366f1';

  // Border & Size options
  const borderWidth = layer.arrayItemBorderWidth ?? layer.borderWidth ?? 0;
  const borderColor = layer.arrayItemBorderColor || layer.stroke || '#ffffff';
  const randomSize = layer.arrayRandomSize ?? false;
  const sizeVariance = Math.max(0.05, Math.min(0.8, layer.arraySizeVariance ?? 0.35));
  const randomRot = layer.arrayRandomRotation ?? false;
  const baseRotation = ((layer.arrayItemRotation ?? 0) * Math.PI) / 180;

  // Custom element layers pool
  const elements = layer.arrayElements && layer.arrayElements.length > 0 ? layer.arrayElements : null;
  const spawnMode = layer.arrayElementSpawnMode || 'cycle';

  // Keyframeable progress (0-100) or automatic time-based cycle
  const manualProgress = layer.keyframes?.arrayProgress?.length
    ? getInterpolatedValue(layer, 'arrayProgress', safeTime) / 100
    : null;

  // Compute local cycle time
  let localT = safeTime;
  if (manualProgress === null) {
    if (loopMode === 'loop') {
      localT = ((safeTime % duration) + duration) % duration;
    } else if (loopMode === 'pingpong') {
      const cycle = ((safeTime % (duration * 2)) + duration * 2) % (duration * 2);
      localT = cycle > duration ? duration * 2 - cycle : cycle;
    } else {
      localT = Math.min(duration, safeTime);
    }
  }

  const totalW = cols * itemSize + (cols - 1) * gap;
  const totalH = rows * itemSize + (rows - 1) * gap;
  const startX = -totalW / 2 + itemSize / 2;
  const startY = -totalH / 2 + itemSize / 2;
  const midR = (rows - 1) / 2;
  const midC = (cols - 1) / 2;

  ctx.save();

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const idx = r * cols + c;
      const x = startX + c * (itemSize + gap);
      const y = startY + r * (itemSize + gap);

      // Compute delay for this cell based on animation type
      let cellDelay = 0;
      if (animType === 'wave') {
        cellDelay = (r + c) * stagger;
      } else if (animType === 'ripple') {
        const dist = Math.hypot(r - midR, c - midC);
        cellDelay = dist * (stagger * 1.5);
      } else if (animType === 'drop') {
        cellDelay = (r * 0.4 + c * 0.1) * stagger * 5;
      } else {
        // 'pop', 'fade', 'snake'
        cellDelay = idx * stagger;
      }

      // Calculate item normalized progress (0 to 1)
      let itemP = 0;
      if (manualProgress !== null) {
        const cellThreshold = idx / (rows * cols);
        itemP = Math.max(0, Math.min(1, (manualProgress - cellThreshold * 0.5) / 0.5));
      } else {
        const elapsed = localT - cellDelay;
        const itemDuration = Math.max(0.2, duration * 0.35);
        if (elapsed > 0) {
          itemP = Math.min(1, elapsed / itemDuration);
        }
      }

      if (itemP <= 0) continue;

      // Color selection
      const color = isRandomColor
        ? VIBRANT_PALETTE[idx % VIBRANT_PALETTE.length]
        : baseColor;

      // Deterministic Random Size Variation
      let cellScale = 1.0;
      if (randomSize) {
        const randS = pseudoRandom(idx * 7 + 13);
        cellScale = 1.0 + (randS * 2 - 1) * sizeVariance;
      }

      // Deterministic Random Rotation
      let cellRot = baseRotation;
      if (randomRot) {
        const randR = pseudoRandom(idx * 17 + 29);
        cellRot += randR * Math.PI * 2;
      }

      ctx.save();
      ctx.translate(x, y);

      // Apply cell rotation
      if (cellRot !== 0) {
        ctx.rotate(cellRot);
      }

      // Apply animation scale / fade transforms
      if (animType === 'pop') {
        // Elastic spring overshoot pop
        const scale =
          itemP < 0.7
            ? (itemP / 0.7) * 1.18
            : 1.18 - ((itemP - 0.7) / 0.3) * 0.18;
        ctx.scale(scale * cellScale, scale * cellScale);
        ctx.globalAlpha = Math.min(1, itemP * 2);
      } else if (animType === 'fade') {
        ctx.scale(cellScale, cellScale);
        ctx.globalAlpha = itemP;
      } else if (animType === 'drop') {
        const dropOffset = (1 - itemP) * 35;
        ctx.translate(0, -dropOffset);
        ctx.scale(cellScale, cellScale);
        ctx.globalAlpha = itemP;
      } else if (animType === 'wave' || animType === 'ripple') {
        const waveScale = (0.4 + 0.6 * itemP) * cellScale;
        ctx.scale(waveScale, waveScale);
        ctx.globalAlpha = Math.min(1, itemP * 1.5);
      } else {
        ctx.scale(itemP * cellScale, itemP * cellScale);
        ctx.globalAlpha = itemP;
      }

      // Render custom element layer if configured in pool
      if (elements && elements.length > 0) {
        let elemIdx = 0;
        if (spawnMode === 'random') {
          const randElem = pseudoRandom(idx * 31 + 47);
          elemIdx = Math.floor(randElem * elements.length);
        } else {
          elemIdx = idx % elements.length;
        }
        const activeElem = elements[elemIdx] || elements[0];
        renderArrayElement(
          ctx,
          activeElem,
          itemSize,
          color,
          borderWidth,
          borderColor,
          onImageLoad
        );
      } else {
        // Render single shape/emoji mode
        const hs = Math.max(1, itemSize / 2);
        if (shape === 'emoji') {
          ctx.font = `${Math.round(itemSize * 0.85)}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(customEmoji, 0, 1);
        } else {
          drawItemShape(ctx, shape, hs, color, borderWidth, borderColor);
        }
      }

      ctx.restore();
    }
  }

  ctx.restore();
}
