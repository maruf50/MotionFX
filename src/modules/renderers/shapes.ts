import { Layer } from '@/types/motion';

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
  cornerRadius = 0
) {
  const vertices: { x: number; y: number }[] = [];
  const totalVertices = innerR ? points * 2 : points;
  const step = Math.PI / points;

  for (let i = 0; i < totalVertices; i++) {
    const r = innerR ? (i % 2 === 0 ? outerR : innerR) : outerR;
    const angle = (i * (innerR ? step : step * 2)) - Math.PI / 2;
    vertices.push({
      x: cx + Math.cos(angle) * r,
      y: cy + Math.sin(angle) * r,
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
    const cr = Math.min(cornerRadius * 0.4, outerR * 0.35);
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
 */
export function renderShapeLayer(
  ctx: CanvasRenderingContext2D,
  layer: Layer,
  time: number
) {
  const shape = layer.shapeType || 'rect';
  const hw = layer.width / 2;
  const hh = layer.height / 2;

  applyStrokeStyle(ctx, layer, time);

  if (shape === 'rect') {
    drawRoundedRect(ctx, -hw, -hh, layer.width, layer.height, layer.borderRadius);
  } else if (shape === 'circle') {
    ctx.beginPath();
    ctx.ellipse(0, 0, hw, hh, 0, 0, Math.PI * 2);
    ctx.closePath();
  } else if (shape === 'pill') {
    const r = Math.min(hw, hh);
    drawRoundedRect(ctx, -hw, -hh, layer.width, layer.height, r);
  } else if (shape === 'star') {
    const points = layer.sides || 5;
    drawPolygonOrStar(ctx, 0, 0, points, hw, hw * 0.44, layer.borderRadius);
  } else if (shape === 'polygon') {
    const sides = layer.sides || 6;
    drawPolygonOrStar(ctx, 0, 0, sides, hw, null, layer.borderRadius);
  }

  // Fill
  if (layer.fill && layer.fill !== 'transparent') {
    ctx.fillStyle = layer.fill;
    ctx.fill();
  }

  // Border / Stroke
  if (layer.borderWidth > 0 && layer.borderStyle !== 'none' && layer.stroke) {
    ctx.lineWidth = layer.borderWidth;
    ctx.strokeStyle = layer.stroke;
    ctx.stroke();
  }
}
