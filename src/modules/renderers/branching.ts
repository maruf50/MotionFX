import { Layer, BranchCurvature, BranchDirection, BranchEndShape } from '@/types/motion';
import { applyStrokeStyle } from './shapes';
import { getInterpolatedValue } from '../keyframes/evaluator';
import { resolveColorOrGradient } from './gradients';

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

  ctx.fillStyle = resolveColorOrGradient(ctx, color, -size, -size, size * 2, size * 2);
  ctx.strokeStyle = resolveColorOrGradient(ctx, strokeColor, -size, -size, size * 2, size * 2);
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
  const safeTime = Math.max(0, time);
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
  const hasGrowthKeyframes = Boolean(layer.keyframes?.branchGrowth?.length);
  const isAnimated = layer.branchAnimated !== false && !hasGrowthKeyframes;

  if (hasGrowthKeyframes) {
    const raw = getInterpolatedValue(layer, 'branchGrowth', safeTime);
    growth = Math.max(0, Math.min(100, raw)) / 100;
  } else if (!isAnimated) {
    const raw = layer.branchGrowth ?? 100;
    const val = raw <= 1 && raw > 0 ? raw * 100 : raw;
    growth = Math.max(0, Math.min(100, val)) / 100;
  } else {
    const duration = Math.max(0.5, layer.branchAnimDuration ?? 2.5);
    const loop = layer.branchAnimLoop || 'loop';
    const cycleTime = safeTime % duration;
    const t = cycleTime / duration;

    if (loop === 'pingpong') {
      growth = t < 0.5 ? t * 2 : (1 - t) * 2;
    } else if (loop === 'once') {
      growth = Math.min(1.0, safeTime / duration);
    } else {
      // Default 'loop': grows out smoothly over 80% of cycle, pauses at full extension, then restarts
      growth = t < 0.8 ? t / 0.8 : 1.0;
    }
  }

  const strokeColor = layer.stroke || layer.fill || '#6366f1';
  const fillColor = layer.fill || strokeColor;
  const strokeWidth = Math.max(1.5, (layer.borderWidth || 3) / avgScale);

  ctx.save();
  applyStrokeStyle(ctx, layer, safeTime);
  ctx.strokeStyle = resolveColorOrGradient(ctx, strokeColor, -layer.width / 2, -layer.height / 2, layer.width, layer.height);
  ctx.lineWidth = strokeWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const trunk = getBranchTrunkPoints({ ...layer, branchLength });
  const endpoints = getBranchEndpoints({ ...layer, branchCount, branchLength });

  const growTrunk = layer.branchGrowTrunk !== false;
  let trunkGrowth = 1.0;
  let branchLifetime = growth;

  if (direction !== 'radial') {
    if (growTrunk) {
      trunkGrowth = Math.max(0, Math.min(1, growth / 0.25));
      branchLifetime = Math.max(0, Math.min(1, (growth - 0.25) / 0.75));
    } else {
      trunkGrowth = 1.0;
      branchLifetime = growth;
    }

    // 3. Draw Trunk (Base)
    if (trunkGrowth > 0.001) {
      const curSplitX = trunk.start.x + (trunk.split.x - trunk.start.x) * trunkGrowth;
      const curSplitY = trunk.start.y + (trunk.split.y - trunk.start.y) * trunkGrowth;

      ctx.beginPath();
      ctx.moveTo(trunk.start.x, trunk.start.y);
      ctx.lineTo(curSplitX, curSplitY);
      ctx.stroke();

      // Trunk base root node
      const rootAlpha = Math.min(1.0, trunkGrowth / 0.2);
      ctx.save();
      ctx.globalAlpha = (ctx.globalAlpha || 1.0) * rootAlpha;
      ctx.fillStyle = fillColor;
      ctx.beginPath();
      ctx.arc(trunk.start.x, trunk.start.y, Math.max(3, endSize * 0.85), 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
  } else {
    // Radial central hub
    const hubGrowth = Math.max(0, Math.min(1, growth / 0.1));
    branchLifetime = Math.max(0, Math.min(1, (growth - 0.1) / 0.9));

    if (hubGrowth > 0.001) {
      ctx.save();
      ctx.globalAlpha = (ctx.globalAlpha || 1.0) * hubGrowth;
      ctx.fillStyle = fillColor;
      ctx.beginPath();
      ctx.arc(0, 0, Math.max(4, endSize * 1.2 * hubGrowth), 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
  }

  // 4. Draw Branches growing from split point to endpoints
  const splitPt = trunk.split;

  for (let i = 0; i < branchCount; i++) {
    let branchT = branchLifetime;
    if (layer.branchStagger && branchCount > 1) {
      const maxDelay = 0.35;
      const delay = (i / (branchCount - 1)) * maxDelay;
      branchT = Math.max(0, Math.min(1, (branchLifetime - delay) / (1 - maxDelay)));
    }

    if (branchT <= 0.001) continue; // Branch has not yet sprouted

    const easedGrowth = Math.max(0.001, 1 - Math.pow(1 - branchT, 3));
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
    const markerAlpha = Math.min(1.0, branchT / 0.15); // smoothly materializes as it emerges
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
