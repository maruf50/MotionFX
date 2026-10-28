import { Layer, BranchCurvature, BranchDirection, BranchEndShape } from '@/types/motion';
import { applyStrokeStyle } from './shapes';

/**
 * Draws an end marker at (x, y) with rotation angle.
 */
function drawEndMarker(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  angle: number,
  shape: BranchEndShape,
  size: number,
  color: string,
  strokeColor: string,
  alpha = 1.0
) {
  if (shape === 'none' || alpha <= 0.01) return;

  ctx.save();
  ctx.globalAlpha = (ctx.globalAlpha || 1.0) * alpha;
  ctx.translate(x, y);
  ctx.rotate(angle);

  ctx.fillStyle = color;
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 2;

  if (shape === 'circle') {
    ctx.beginPath();
    ctx.arc(0, 0, size, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else if (shape === 'dot') {
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.7, 0, Math.PI * 2);
    ctx.fill();
  } else if (shape === 'square') {
    ctx.beginPath();
    ctx.rect(-size * 0.7, -size * 0.7, size * 1.4, size * 1.4);
    ctx.fill();
    ctx.stroke();
  } else if (shape === 'arrow') {
    const s = size * 1.3;
    ctx.beginPath();
    ctx.moveTo(s, 0);
    ctx.lineTo(-s * 0.7, -s * 0.7);
    ctx.lineTo(-s * 0.3, 0);
    ctx.lineTo(-s * 0.7, s * 0.7);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * Computes or retrieves local-space endpoints for all branches of the layer.
 * This is used both for rendering and for interactive canvas dragging handles.
 */
export function getBranchEndpoints(layer: Layer): Array<{ x: number; y: number }> {
  const branchCount = Math.max(1, Math.min(24, layer.branchCount ?? 4));
  const branchLength = layer.branchLength ?? 130;
  const branchSpread = layer.branchSpread ?? 130;
  const branchPosition = layer.branchPosition ?? 0;
  const trunkLength = layer.branchTrunkLength ?? 50;
  const direction: BranchDirection = layer.branchDirection || 'right';

  // If layer already has custom endpoints matching branch count, return them
  if (layer.branchEndpoints && layer.branchEndpoints.length === branchCount) {
    return layer.branchEndpoints;
  }

  const endpoints: Array<{ x: number; y: number }> = [];

  if (direction === 'radial') {
    const centerRadius = Math.max(4, (layer.branchEndSize ?? 8) * 1.2);
    const angleStep = (Math.PI * 2) / branchCount;
    const startAngleOffset = (branchPosition / 100) * Math.PI;

    for (let i = 0; i < branchCount; i++) {
      if (layer.branchEndpoints && layer.branchEndpoints[i]) {
        endpoints.push(layer.branchEndpoints[i]);
      } else {
        const angle = startAngleOffset + i * angleStep;
        endpoints.push({
          x: Math.round(Math.cos(angle) * (centerRadius + branchLength)),
          y: Math.round(Math.sin(angle) * (centerRadius + branchLength)),
        });
      }
    }
    return endpoints;
  }

  // Linear directions: 'right', 'left', 'up', 'down'
  const totalW = trunkLength + branchLength;
  const startX = -totalW / 2;
  const splitX = startX + trunkLength + branchPosition;
  const endX = splitX + branchLength;
  const halfSpread = branchSpread / 2;

  let rot = 0;
  if (direction === 'left') rot = Math.PI;
  else if (direction === 'down') rot = Math.PI / 2;
  else if (direction === 'up') rot = -Math.PI / 2;

  const cos = Math.cos(rot);
  const sin = Math.sin(rot);

  for (let i = 0; i < branchCount; i++) {
    if (layer.branchEndpoints && layer.branchEndpoints[i]) {
      endpoints.push(layer.branchEndpoints[i]);
    } else {
      const t = branchCount === 1 ? 0.5 : i / (branchCount - 1);
      const rawY = -halfSpread + t * branchSpread;
      const rawX = endX;
      endpoints.push({
        x: Math.round(rawX * cos - rawY * sin),
        y: Math.round(rawX * sin + rawY * cos),
      });
    }
  }

  return endpoints;
}

/**
 * Returns trunk start and split points in layer local coordinates.
 */
export function getBranchTrunkPoints(layer: Layer): {
  start: { x: number; y: number };
  split: { x: number; y: number };
} {
  const branchLength = layer.branchLength ?? 130;
  const branchPosition = layer.branchPosition ?? 0;
  const trunkLength = layer.branchTrunkLength ?? 50;
  const direction: BranchDirection = layer.branchDirection || 'right';

  if (direction === 'radial') {
    return {
      start: { x: 0, y: 0 },
      split: { x: 0, y: 0 },
    };
  }

  const totalW = trunkLength + branchLength;
  const startX = -totalW / 2;
  const splitX = startX + trunkLength + branchPosition;

  let rot = 0;
  if (direction === 'left') rot = Math.PI;
  else if (direction === 'down') rot = Math.PI / 2;
  else if (direction === 'up') rot = -Math.PI / 2;

  const cos = Math.cos(rot);
  const sin = Math.sin(rot);

  return {
    start: {
      x: Math.round(startX * cos),
      y: Math.round(startX * sin),
    },
    split: {
      x: Math.round(splitX * cos),
      y: Math.round(splitX * sin),
    },
  };
}

/**
 * Main renderer for Branching shapes.
 * Supports:
 * - Animated branch growth where end points move smoothly from base to end
 * - Manual endpoint positioning with cursor on canvas
 * - Dynamic branch count and breathing length animation
 * - Custom curvature (Bézier, Straight, Stepped) and tip markers
 */
export function renderBranchingShape(
  ctx: CanvasRenderingContext2D,
  layer: Layer,
  time: number,
  tr?: { scaleX: number; scaleY: number }
) {
  let branchCount = Math.max(1, Math.min(24, layer.branchCount ?? 4));
  let branchLength = layer.branchLength ?? 130;
  const curvature: BranchCurvature = layer.branchCurvature || 'curved';
  const direction: BranchDirection = layer.branchDirection || 'right';
  const endShape: BranchEndShape = layer.branchEndShape || 'circle';
  const endSize = layer.branchEndSize ?? 8;
  const avgScale = (Math.abs(tr?.scaleX ?? 1) + Math.abs(tr?.scaleY ?? 1)) / 2 || 1;

  // 1. Dynamic property animations if enabled
  if (layer.branchAnimateCount) {
    const cycle = (time * 0.8) % 2;
    const progress = cycle < 1 ? cycle : 2 - cycle;
    branchCount = Math.max(1, Math.round(1 + (branchCount - 1) * progress));
  }
  if (layer.branchAnimateLength) {
    const pulse = 0.75 + 0.25 * Math.sin(time * 2.5);
    branchLength = Math.round(branchLength * pulse);
  }

  // 2. Growth Animation Calculation (Endpoints move from base to end)
  let growth = 1.0;
  const isAnimated = layer.branchAnimated !== false;

  if (isAnimated) {
    const duration = Math.max(0.5, layer.branchAnimDuration ?? 2.5);
    const loop = layer.branchAnimLoop || 'loop';
    const cycleTime = time % duration;
    const t = cycleTime / duration;

    if (loop === 'pingpong') {
      growth = t < 0.5 ? t * 2 : (1 - t) * 2;
    } else if (loop === 'once') {
      growth = Math.min(1.0, time / duration);
    } else {
      // Default 'loop': grows out smoothly over 80% of cycle, pauses at full extension, then restarts
      growth = t < 0.8 ? t / 0.8 : 1.0;
    }
  } else if (typeof layer.branchGrowth === 'number') {
    growth = Math.max(0, Math.min(1, layer.branchGrowth));
  }

  // Cubic ease-out for organic spring growth
  const easedGrowth = Math.max(0.001, 1 - Math.pow(1 - growth, 3));

  const strokeColor = layer.stroke || layer.fill || '#6366f1';
  const fillColor = layer.fill || strokeColor;
  const strokeWidth = Math.max(1.5, (layer.borderWidth || 3) / avgScale);

  ctx.save();
  applyStrokeStyle(ctx, layer, time);
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = strokeWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const trunk = getBranchTrunkPoints({ ...layer, branchLength });
  const endpoints = getBranchEndpoints({ ...layer, branchCount, branchLength });

  // 3. Draw Trunk (Base)
  if (direction !== 'radial') {
    ctx.beginPath();
    ctx.moveTo(trunk.start.x, trunk.start.y);
    ctx.lineTo(trunk.split.x, trunk.split.y);
    ctx.stroke();

    // Trunk base root node
    ctx.fillStyle = fillColor;
    ctx.beginPath();
    ctx.arc(trunk.start.x, trunk.start.y, Math.max(3, endSize * 0.85), 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else {
    // Radial central hub
    ctx.fillStyle = fillColor;
    ctx.beginPath();
    ctx.arc(0, 0, Math.max(4, endSize * 1.2), 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // 4. Draw Branches growing from split point to endpoints
  const splitPt = trunk.split;

  for (let i = 0; i < branchCount; i++) {
    const targetEnd = endpoints[i] || { x: splitPt.x + 80, y: splitPt.y };

    // Current tip position animated from split base to target endpoint
    const curEndX = splitPt.x + (targetEnd.x - splitPt.x) * easedGrowth;
    const curEndY = splitPt.y + (targetEnd.y - splitPt.y) * easedGrowth;

    ctx.beginPath();
    ctx.moveTo(splitPt.x, splitPt.y);

    if (direction === 'radial') {
      if (curvature === 'curved') {
        const angle = Math.atan2(targetEnd.y, targetEnd.x);
        const midR = Math.hypot(curEndX, curEndY) * 0.5;
        const cpX = Math.cos(angle + 0.35) * midR;
        const cpY = Math.sin(angle + 0.35) * midR;
        ctx.quadraticCurveTo(cpX, cpY, curEndX, curEndY);
      } else {
        ctx.lineTo(curEndX, curEndY);
      }
    } else {
      if (curvature === 'curved') {
        const cp1X = splitPt.x + (curEndX - splitPt.x) * 0.45;
        const cp1Y = splitPt.y;
        const cp2X = splitPt.x + (curEndX - splitPt.x) * 0.55;
        const cp2Y = curEndY;
        ctx.bezierCurveTo(cp1X, cp1Y, cp2X, cp2Y, curEndX, curEndY);
      } else if (curvature === 'stepped') {
        const midX = splitPt.x + (curEndX - splitPt.x) * 0.4;
        ctx.lineTo(midX, splitPt.y);
        ctx.lineTo(midX, curEndY);
        ctx.lineTo(curEndX, curEndY);
      } else {
        ctx.lineTo(curEndX, curEndY);
      }
    }
    ctx.stroke();

    // 5. Draw End Marker traveling from base to tip
    const markerAngle = Math.atan2(curEndY - splitPt.y, curEndX - splitPt.x);
    const markerAlpha = Math.min(1.0, easedGrowth / 0.15); // smoothly materializes as it emerges
    drawEndMarker(
      ctx,
      curEndX,
      curEndY,
      markerAngle,
      endShape,
      endSize,
      fillColor,
      strokeColor,
      markerAlpha
    );
  }

  ctx.restore();
}
