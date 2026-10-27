import { Layer } from '@/types/motion';
import { getLayerTransformAtTime } from '../keyframes/evaluator';
import { renderShapeLayer } from './shapes';
import { renderTextLayer } from './text';
import { renderImageLayer } from './media';

export interface RenderOptions {
  canvasBg: string;
  showGuides: boolean;
  selectedLayerId: string | null;
  hideSelectionGizmo?: boolean;
  onImageLoad?: () => void;
}

/**
 * Returns estimated width and height of any layer for bounding box calculation.
 */
export function getLayerDimensions(
  ctx: CanvasRenderingContext2D,
  layer: Layer
): { width: number; height: number } {
  if (layer.type === 'text') {
    const fontSize = layer.fontSize || 48;
    ctx.font = `800 ${fontSize}px var(--font-geist-sans), "Space Grotesk", sans-serif`;
    const metrics = ctx.measureText(layer.text || 'TEXT');
    return {
      width: Math.max(80, metrics.width),
      height: fontSize * 1.25,
    };
  }
  return {
    width: layer.width || 120,
    height: layer.height || 120,
  };
}

/**
 * Main engine render function.
 */
export function renderSceneAtTime(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  layers: Layer[],
  time: number,
  totalDuration: number,
  options: RenderOptions
) {
  // 1. Background
  ctx.save();
  ctx.fillStyle = options.canvasBg || '#090b10';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // 2. Subtle Studio Grid & Center Marks if enabled & not exporting
  if (options.showGuides && !options.hideSelectionGizmo) {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    const step = 50;
    for (let x = step; x < canvasWidth; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvasHeight);
      ctx.stroke();
    }
    for (let y = step; y < canvasHeight; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvasWidth, y);
      ctx.stroke();
    }

    // Center crosshair guides
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.2)';
    ctx.beginPath();
    ctx.moveTo(canvasWidth / 2, 0);
    ctx.lineTo(canvasWidth / 2, canvasHeight);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, canvasHeight / 2);
    ctx.lineTo(canvasWidth, canvasHeight / 2);
    ctx.stroke();
  }
  ctx.restore();

  // 3. Render Layers from bottom of stack to top (reverse array so index 0 is foreground)
  for (let i = layers.length - 1; i >= 0; i--) {
    const layer = layers[i];
    if (!layer.visible) continue;

    const tr = getLayerTransformAtTime(layer, time);
    if (tr.opacity <= 0.001) continue;

    ctx.save();
    ctx.translate(tr.x, tr.y);
    ctx.rotate((tr.rotation * Math.PI) / 180);
    ctx.scale(tr.scaleX, tr.scaleY);
    ctx.globalAlpha = tr.opacity;

    if (layer.type === 'shape') {
      renderShapeLayer(ctx, layer, time);
    } else if (layer.type === 'text') {
      renderTextLayer(ctx, layer, time, totalDuration);
    } else if (layer.type === 'image') {
      renderImageLayer(ctx, layer, time, options.onImageLoad);
    }

    ctx.restore();
  }

  // 4. Draw Selection Gizmo Outline if a layer is selected and gizmos are visible
  if (!options.hideSelectionGizmo && options.selectedLayerId) {
    const selected = layers.find(l => l.id === options.selectedLayerId);
    if (selected && selected.visible) {
      const tr = getLayerTransformAtTime(selected, time);
      const dims = getLayerDimensions(ctx, selected);
      const hw = dims.width / 2 + 8;
      const hh = dims.height / 2 + 8;

      ctx.save();
      ctx.translate(tr.x, tr.y);
      ctx.rotate((tr.rotation * Math.PI) / 180);
      ctx.scale(tr.scaleX, tr.scaleY);

      // Dashed bounding rectangle
      ctx.strokeStyle = '#6366f1';
      ctx.lineWidth = 1.5 / Math.max(0.2, Math.abs(tr.scaleX));
      ctx.setLineDash([5, 4]);
      ctx.strokeRect(-hw, -hh, hw * 2, hh * 2);

      // Corner handles
      ctx.setLineDash([]);
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#4338ca';
      const hs = 5 / Math.max(0.2, Math.abs(tr.scaleX));
      [
        [-hw, -hh],
        [hw, -hh],
        [hw, hh],
        [-hw, hh],
      ].forEach(([cx, cy]) => {
        ctx.fillRect(cx - hs, cy - hs, hs * 2, hs * 2);
        ctx.strokeRect(cx - hs, cy - hs, hs * 2, hs * 2);
      });

      // Center anchor indicator
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(0, 0, 3 / Math.max(0.2, Math.abs(tr.scaleX)), 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }
}
