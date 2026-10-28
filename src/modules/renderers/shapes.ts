import { Layer } from '@/types/motion';
import { renderBarShape } from './bar';
import { renderBranchingShape } from './branching';
import { renderPathFollower } from './pathFollower';

/**
 * Applies stroke styles (solid, dashed, dotted) and marching ants offset.
 */
export function applyStrokeStyle(
  ctx: CanvasRenderingContext2D,
  layer: Layer,
  time: number
) {
  if (layer.borderStyle === 'dashed') {
    ctx.setLineDash([layer.borderWidth * 3, layer.borderWidth * 2]);
    if (layer.animateDash) {
      ctx.lineDashOffset = -time * 50;
    } else {
      ctx.lineDashOffset = 0;
    }
  } else if (layer.borderStyle === 'dotted') {
    ctx.setLineDash([layer.borderWidth, layer.borderWidth * 2.2]);
    ctx.lineCap = 'round';
    if (layer.animateDash) {
      ctx.lineDashOffset = -time * 40;
    } else {
      ctx.lineDashOffset = 0;
    }
  } else {
    ctx.setLineDash([]);
  }
}

/**
 * Draws rounded rectangle path.
 */
export function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const maxR = Math.min(Math.abs(w), Math.abs(h)) / 2;
  const radius = Math.min(Math.max(0, r), maxR);
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, w, h, radius);
  } else {
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + w - radius, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
    ctx.lineTo(x + w, y + h - radius);
    ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
    ctx.lineTo(x + radius, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
  }
  ctx.closePath();
}

/**
 * Draws polygon or star with optional rounded vertices.
 */
export function drawPolygonOrStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  points: number,
  outerR: number,
  innerR: number | null,
  cornerRadius = 0,
  scaleX = 1,
  scaleY = 1
) {
  const vertices: { x: number; y: number }[] = [];
  const totalVertices = innerR ? points * 2 : points;
  const step = Math.PI / points;

  for (let i = 0; i < totalVertices; i++) {
    const r = innerR ? (i % 2 === 0 ? outerR : innerR) : outerR;
    const angle = (i * (innerR ? step : step * 2)) - Math.PI / 2;
    vertices.push({
      x: cx + Math.cos(angle) * r * scaleX,
      y: cy + Math.sin(angle) * r * scaleY,
    });
  }

  ctx.beginPath();
  if (cornerRadius <= 1) {
    vertices.forEach((v, idx) => {
      if (idx === 0) ctx.moveTo(v.x, v.y);
      else ctx.lineTo(v.x, v.y);
    });
    ctx.closePath();
  } else {
    const minScale = Math.min(Math.abs(scaleX), Math.abs(scaleY)) || 1;
    const cr = Math.min(cornerRadius * 0.4, outerR * minScale * 0.35);
    for (let i = 0; i < vertices.length; i++) {
      const p0 = vertices[(i - 1 + vertices.length) % vertices.length];
      const p1 = vertices[i];
      const p2 = vertices[(i + 1) % vertices.length];
      if (i === 0) {
        const midX = (p0.x + p1.x) / 2;
        const midY = (p0.y + p1.y) / 2;
        ctx.moveTo(midX, midY);
      }
      ctx.arcTo(p1.x, p1.y, p2.x, p2.y, cr);
    }
    ctx.closePath();
  }
}

/**
 * Main dispatcher to render any shape layer.
 * Shapes are rendered with scaled dimensions in unscaled context
 * so that border stroke widths remain constant (non-scaling stroke).
 */
export function renderShapeLayer(
  ctx: CanvasRenderingContext2D,
  layer: Layer,
  time: number,
  onImageLoad?: () => void,
  tr?: { scaleX: number; scaleY: number }
) {
  const shape = layer.shapeType || 'rect';

  const sx = tr ? tr.scaleX : 1;
  const sy = tr ? tr.scaleY : 1;
  const absSx = Math.max(0.0001, Math.abs(sx));
  const absSy = Math.max(0.0001, Math.abs(sy));

  // Special Shapes
  if (shape === 'bar') {
    ctx.save();
    ctx.scale(sx, sy);
    renderBarShape(ctx, layer, time, tr);
    ctx.restore();
    return;
  }
  if (shape === 'branching') {
    ctx.save();
    ctx.scale(sx, sy);
    renderBranchingShape(ctx, layer, time, tr);
    ctx.restore();
    return;
  }
  if (shape === 'pathFollower') {
    ctx.save();
    ctx.scale(sx, sy);
    renderPathFollower(ctx, layer, time, onImageLoad);
    ctx.restore();
    return;
  }

  // Geometric shapes (rect, circle, pill, star, polygon, line, custom)
  ctx.save();
  if (sx < 0 || sy < 0) {
    ctx.scale(Math.sign(sx), Math.sign(sy));
  }

  const w = layer.width * absSx;
  const h = layer.height * absSy;
  const hw = w / 2;
  const hh = h / 2;

  applyStrokeStyle(ctx, layer, time);

  if (shape === 'custom' && layer.pathData) {
    try {
      const path = new Path2D(layer.pathData);
      ctx.save();
      ctx.scale(absSx, absSy);
      if (layer.fill && layer.fill !== 'transparent') {
        ctx.fillStyle = layer.fill;
        ctx.fill(path);
      }
      if (layer.borderWidth > 0 && layer.borderStyle !== 'none' && layer.stroke) {
        const avgScale = (absSx + absSy) / 2 || 1;
        ctx.lineWidth = layer.borderWidth / avgScale;
        ctx.strokeStyle = layer.stroke;
        ctx.stroke(path);
      }
      ctx.restore();
      ctx.restore();
      return;
    } catch (e) {
      console.warn('Error rendering custom Path2D shape:', e);
    }
  }

  if (shape === 'line') {
    ctx.beginPath();
    ctx.moveTo(-hw, 0);
    ctx.lineTo(hw, 0);
    const strokeW = Math.max(1, layer.borderWidth || 3);
    ctx.lineWidth = strokeW;
    ctx.strokeStyle = layer.stroke || layer.fill || '#ffffff';
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.restore();
    return;
  }

  if (shape === 'rect') {
    drawRoundedRect(ctx, -hw, -hh, w, h, layer.borderRadius);
  } else if (shape === 'circle') {
    ctx.beginPath();
    ctx.ellipse(0, 0, hw, hh, 0, 0, Math.PI * 2);
    ctx.closePath();
  } else if (shape === 'pill') {
    const r = Math.min(hw, hh);
    drawRoundedRect(ctx, -hw, -hh, w, h, r);
  } else if (shape === 'star') {
    const points = layer.sides || 5;
    drawPolygonOrStar(ctx, 0, 0, points, layer.width / 2, (layer.width / 2) * 0.44, layer.borderRadius, absSx, absSy);
  } else if (shape === 'polygon') {
    const sides = layer.sides || 6;
    drawPolygonOrStar(ctx, 0, 0, sides, layer.width / 2, null, layer.borderRadius, absSx, absSy);
  }

  // Fill
  if (layer.fill && layer.fill !== 'transparent') {
    ctx.fillStyle = layer.fill;
    ctx.fill();
  }

  // Border / Stroke (Guaranteed non-scaling stroke width)
  if (layer.borderWidth > 0 && layer.borderStyle !== 'none' && layer.stroke) {
    ctx.lineWidth = layer.borderWidth;
    ctx.strokeStyle = layer.stroke;
    ctx.stroke();
  }

  ctx.restore();
}
