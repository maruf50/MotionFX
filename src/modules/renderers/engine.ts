import { Layer } from '@/types/motion';
import { getLayerTransformAtTime, getLayerWorldTransformAtTime } from '../keyframes/evaluator';
import { renderShapeLayer } from './shapes';
import { renderTextLayer } from './text';
import { renderImageLayer } from './media';
import { getBranchEndpoints } from './branching';

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
    const family = layer.fontFamily ? `"${layer.fontFamily}", ` : '';
    const weight = layer.fontWeight || 'bold';
    const style = layer.fontStyle === 'italic' ? 'italic ' : '';
    ctx.font = `${style}${weight} ${fontSize}px ${family}"Geist", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    const metrics = ctx.measureText(layer.text || 'TEXT');
    return {
      width: Math.max(80, metrics.width),
      height: fontSize * 1.25,
    };
  }
  if (layer.shapeType === 'line') {
    return {
      width: layer.width || 200,
      height: Math.max(16, layer.borderWidth * 2),
    };
  }
  if (layer.shapeType === 'bar') {
    if (layer.barShape === 'radial') {
      const sz = Math.max(layer.width || 140, layer.height || 140);
      return { width: sz, height: sz };
    }
    return {
      width: layer.width || 260,
      height: layer.height || 36,
    };
  }
  if (layer.shapeType === 'branching') {
    const totalW = (layer.branchTrunkLength || 50) + (layer.branchLength || 130) + (layer.branchEndSize || 8) * 2;
    const totalH = (layer.branchSpread || 140) + (layer.branchEndSize || 8) * 2;
    return {
      width: Math.max(layer.width || 260, totalW),
      height: Math.max(layer.height || 160, totalH),
    };
  }
  if (layer.shapeType === 'pathFollower') {
    if (layer.pathPoints && layer.pathPoints.length >= 2) {
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      layer.pathPoints.forEach(p => {
        minX = Math.min(minX, p.x, p.cp1x ?? p.x, p.cp2x ?? p.x);
        minY = Math.min(minY, p.y, p.cp1y ?? p.y, p.cp2y ?? p.y);
        maxX = Math.max(maxX, p.x, p.cp1x ?? p.x, p.cp2x ?? p.x);
        maxY = Math.max(maxY, p.y, p.cp1y ?? p.y, p.cp2y ?? p.y);
      });
      const pad = (layer.followerSize || 22) * 2;
      return {
        width: Math.max(80, (maxX - minX) + pad),
        height: Math.max(60, (maxY - minY) + pad),
      };
    }
    return {
      width: layer.width || 340,
      height: layer.height || 160,
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

    // Use hierarchical world transform
    const tr = getLayerWorldTransformAtTime(layer, layers, time);
    if (tr.opacity <= 0.001) continue;

    ctx.save();
    ctx.translate(tr.x, tr.y);
    ctx.rotate((tr.rotation * Math.PI) / 180);
    ctx.globalAlpha = tr.opacity;

    if (layer.type === 'shape') {
      renderShapeLayer(ctx, layer, time, options.onImageLoad, tr);
    } else if (layer.type === 'text') {
      ctx.save();
      ctx.scale(tr.scaleX, tr.scaleY);
      renderTextLayer(ctx, layer, time, totalDuration, tr);
      ctx.restore();
    } else if (layer.type === 'image') {
      renderImageLayer(ctx, layer, time, options.onImageLoad, tr);
    }

    ctx.restore();
  }

  // 4. Draw Selection Gizmo Outline if a layer is selected and gizmos are visible
  if (!options.hideSelectionGizmo && options.selectedLayerId) {
    const selected = layers.find(l => l.id === options.selectedLayerId);
    if (selected && selected.visible) {
      const tr = getLayerWorldTransformAtTime(selected, layers, time);
      const dims = getLayerDimensions(ctx, selected);
      const pad = 8;
      const hw = (dims.width * Math.abs(tr.scaleX)) / 2 + pad;
      const hh = (dims.height * Math.abs(tr.scaleY)) / 2 + pad;

      ctx.save();
      ctx.translate(tr.x, tr.y);
      ctx.rotate((tr.rotation * Math.PI) / 180);

      // Dashed bounding rectangle (crisp 1:1 pixel scale, never stretched or thickened)
      ctx.strokeStyle = '#6366f1';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 4]);
      ctx.strokeRect(-hw, -hh, hw * 2, hh * 2);
      ctx.setLineDash([]);

      // 1. Rotation Stem Line and Rotation Handle Knob (Above top edge)
      const rotStemLength = 26;
      const rotY = -hh - rotStemLength;

      ctx.strokeStyle = '#818cf8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, -hh);
      ctx.lineTo(0, rotY);
      ctx.stroke();

      // Rotation Knob Circle (true circle of constant radius)
      const rRad = 6;
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#4f46e5';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, rotY, rRad, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Rotation Knob Center Accent
      ctx.fillStyle = '#6366f1';
      ctx.beginPath();
      ctx.arc(0, rotY, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // 2. Eight Scale Handles (4 Corners + 4 Edge Midpoints, true 10x10 px squares)
      const hs = 5; // handle half-size
      const scaleHandles = [
        // Corners
        { x: -hw, y: -hh, isCorner: true },
        { x: hw, y: -hh, isCorner: true },
        { x: hw, y: hh, isCorner: true },
        { x: -hw, y: hh, isCorner: true },
        // Edges
        { x: 0, y: -hh, isCorner: false },
        { x: hw, y: 0, isCorner: false },
        { x: 0, y: hh, isCorner: false },
        { x: -hw, y: 0, isCorner: false },
      ];

      scaleHandles.forEach(({ x, y, isCorner }) => {
        ctx.fillStyle = isCorner ? '#ffffff' : '#e0e7ff';
        ctx.strokeStyle = isCorner ? '#4338ca' : '#6366f1';
        ctx.lineWidth = 1.5;
        ctx.fillRect(x - hs, y - hs, hs * 2, hs * 2);
        ctx.strokeRect(x - hs, y - hs, hs * 2, hs * 2);
      });

      // 3. Center Anchor Indicator
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.stroke();

      // If path follower, render interactive anchor points & control handles
      if (selected.shapeType === 'pathFollower' && selected.pathPoints) {
        selected.pathPoints.forEach((p) => {
          const px = p.x * tr.scaleX;
          const py = p.y * tr.scaleY;
          // cp1 line & handle
          if (p.cp1x !== undefined && p.cp1y !== undefined) {
            const cp1x = p.cp1x * tr.scaleX;
            const cp1y = p.cp1y * tr.scaleY;
            ctx.strokeStyle = 'rgba(236, 72, 153, 0.7)';
            ctx.lineWidth = 1;
            ctx.setLineDash([2, 2]);
            ctx.beginPath();
            ctx.moveTo(px, py);
            ctx.lineTo(cp1x, cp1y);
            ctx.stroke();

            ctx.fillStyle = '#ec4899';
            ctx.setLineDash([]);
            const chs = 3.5;
            ctx.fillRect(cp1x - chs, cp1y - chs, chs * 2, chs * 2);
          }
          // cp2 line & handle
          if (p.cp2x !== undefined && p.cp2y !== undefined) {
            const cp2x = p.cp2x * tr.scaleX;
            const cp2y = p.cp2y * tr.scaleY;
            ctx.strokeStyle = 'rgba(236, 72, 153, 0.7)';
            ctx.lineWidth = 1;
            ctx.setLineDash([2, 2]);
            ctx.beginPath();
            ctx.moveTo(px, py);
            ctx.lineTo(cp2x, cp2y);
            ctx.stroke();

            ctx.fillStyle = '#ec4899';
            ctx.setLineDash([]);
            const chs = 3.5;
            ctx.fillRect(cp2x - chs, cp2y - chs, chs * 2, chs * 2);
          }

          // Anchor point circle
          ctx.setLineDash([]);
          ctx.fillStyle = '#06b6d4';
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          const arcR = 5;
          ctx.beginPath();
          ctx.arc(px, py, arcR, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        });
      }

      // If branching, render interactive draggable endpoint handles
      if (selected.shapeType === 'branching') {
        const endpoints = getBranchEndpoints(selected);
        endpoints.forEach((ep) => {
          const epx = ep.x * tr.scaleX;
          const epy = ep.y * tr.scaleY;
          ctx.setLineDash([]);
          ctx.fillStyle = '#a855f7';
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          const arcR = 5.5;
          ctx.beginPath();
          ctx.arc(epx, epy, arcR, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        });
      }

      ctx.restore();
    }
  }
}
