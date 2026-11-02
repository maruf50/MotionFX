import { Layer, PathPoint } from '@/types/motion';
import { getInterpolatedValue } from '../keyframes/evaluator';

interface Point {
  x: number;
  y: number;
}

/**
 * Samples points along a cubic bezier spline defined by pathPoints.
 */
function sampleBezierPointsFromPathPoints(pathPoints: PathPoint[], segments = 100): Point[] {
  const pts: Point[] = [];
  if (pathPoints.length < 2) return pts;
  const count = pathPoints.length;
  const segsPerCurve = Math.max(10, Math.floor(segments / (count - 1)));

  for (let i = 0; i < count - 1; i++) {
    const p1 = pathPoints[i];
    const p2 = pathPoints[i + 1];
    const cp1x = p1.cp1x ?? p1.x + (p2.x - p1.x) * 0.33;
    const cp1y = p1.cp1y ?? p1.y + (p2.y - p1.y) * 0.33;
    const cp2x = p2.cp2x ?? p1.x + (p2.x - p1.x) * 0.67;
    const cp2y = p2.cp2y ?? p1.y + (p2.y - p1.y) * 0.67;

    for (let s = 0; s <= segsPerCurve; s++) {
      if (i > 0 && s === 0) continue;
      const t = s / segsPerCurve;
      const u = 1 - t;
      const tt = t * t;
      const uu = u * u;
      const uuu = uu * u;
      const ttt = tt * t;

      const x = uuu * p1.x + 3 * uu * t * cp1x + 3 * u * tt * cp2x + ttt * p2.x;
      const y = uuu * p1.y + 3 * uu * t * cp1y + 3 * u * tt * cp2y + ttt * p2.y;
      pts.push({ x, y });
    }
  }
  return pts;
}

/**
 * Evaluates points along predefined paths or custom bezier curves.
 */
function samplePathPoints(layer: Layer, w: number, h: number, segments = 100): Point[] {
  if (layer.pathDrawType === 'custom' && layer.pathPoints && layer.pathPoints.length >= 2) {
    return sampleBezierPointsFromPathPoints(layer.pathPoints, segments);
  }

  const type = layer.pathDrawType || 'wave';
  const pts: Point[] = [];
  const hw = w / 2;
  const hh = h / 2;

  if (type === 'wave') {
    // Sine wave
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const x = -hw + t * w;
      const y = Math.sin(t * Math.PI * 4) * (hh * 0.75);
      pts.push({ x, y });
    }
  } else if (type === 'arc') {
    // Smooth convex arch
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const x = -hw + t * w;
      const y = hh * 0.7 - Math.sin(t * Math.PI) * (hh * 1.4);
      pts.push({ x, y });
    }
  } else if (type === 'spiral') {
    // Archimedean spiral
    const maxTheta = Math.PI * 5;
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const theta = t * maxTheta;
      const r = t * Math.min(hw, hh);
      pts.push({ x: Math.cos(theta) * r, y: Math.sin(theta) * r });
    }
  } else if (type === 'infinity') {
    // Lemniscate of Bernoulli (figure-8)
    for (let i = 0; i <= segments; i++) {
      const t = (i / segments) * Math.PI * 2;
      const scale = hw / (1 + Math.sin(t) * Math.sin(t));
      const x = scale * Math.cos(t);
      const y = scale * Math.sin(t) * Math.cos(t) * 1.3;
      pts.push({ x, y });
    }
  } else {
    // 'straight'
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      pts.push({ x: -hw + t * w, y: (t - 0.5) * (hh * 0.5) });
    }
  }

  return pts;
}

/**
 * Calculates cumulative arc length for path point interpolation.
 */
function getPathLengths(pts: Point[]): { total: number; cumulative: number[] } {
  const cumulative = [0];
  let total = 0;
  for (let i = 1; i < pts.length; i++) {
    const d = Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
    total += d;
    cumulative.push(total);
  }
  return { total, cumulative };
}

/**
 * Renders Path Draw & Kinetic Text along path.
 * Supports line write-on animation, laser beam comets, dash flow, pulse glows, and kinetic text.
 */
export function renderPathDrawShape(
  ctx: CanvasRenderingContext2D,
  layer: Layer,
  time: number,
  tr?: { scaleX: number; scaleY: number }
) {
  const w = Math.max(60, layer.width || 320);
  const h = Math.max(40, layer.height || 140);
  const strokeW = Math.max(1, layer.pathDrawStrokeWidth ?? 4);
  const strokeColor = layer.pathDrawColor || layer.stroke || '#8b5cf6';
  const isDashed = layer.pathDrawDashed ?? false;
  const showArrow = layer.pathDrawArrow ?? true;
  const duration = Math.max(0.5, layer.pathDrawDuration ?? 2.5);
  const loopMode = layer.pathDrawLoop || 'loop';
  const animStyle = layer.pathAnimStyle || 'writeOn';
  const text = layer.pathDrawText || '';
  const textAnim = layer.pathDrawTextAnimation || 'reveal';
  const fontSize = Math.max(10, layer.pathDrawTextFontSize ?? 13);
  const textColor = layer.pathDrawTextColor || '#ffffff';

  // Keyframeable progress (0-100) or automatic time-based progress
  let progress = 1.0;
  if (layer.keyframes?.pathDrawProgress?.length) {
    progress = Math.max(0, Math.min(100, getInterpolatedValue(layer, 'pathDrawProgress', time))) / 100;
  } else if (layer.pathDrawAnimated ?? true) {
    if (loopMode === 'loop') {
      progress = (time % duration) / duration;
    } else if (loopMode === 'pingpong') {
      const p2 = (time % (duration * 2)) / duration;
      progress = p2 > 1 ? 2 - p2 : p2;
    } else {
      progress = Math.min(1, time / duration);
    }
  }

  const allPts = samplePathPoints(layer, w, h, 100);
  if (allPts.length < 2) return;

  const { total, cumulative } = getPathLengths(allPts);

  ctx.save();

  // Background Guide Track (subtle faint trace of full path)
  ctx.beginPath();
  ctx.moveTo(allPts[0].x, allPts[0].y);
  for (let i = 1; i < allPts.length; i++) {
    ctx.lineTo(allPts[i].x, allPts[i].y);
  }
  ctx.lineWidth = Math.max(1, strokeW * 0.4);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.stroke();

  // 1. Draw Path with Selected Animation Style
  if (animStyle === 'laserBeam') {
    // Traveling laser comet
    const headLen = total * 0.35;
    const headEnd = (progress * (total + headLen)) % (total + headLen);
    const headStart = Math.max(0, headEnd - headLen);

    ctx.beginPath();
    let started = false;
    for (let i = 0; i < allPts.length; i++) {
      const d = cumulative[i];
      if (d >= headStart && d <= headEnd) {
        if (!started) {
          ctx.moveTo(allPts[i].x, allPts[i].y);
          started = true;
        } else {
          ctx.lineTo(allPts[i].x, allPts[i].y);
        }
      }
    }
    ctx.lineWidth = strokeW;
    ctx.strokeStyle = strokeColor;
    ctx.lineCap = 'round';
    ctx.shadowColor = strokeColor;
    ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.shadowBlur = 0;
  } else if (animStyle === 'dashFlow') {
    // Traveling dashed line
    ctx.beginPath();
    ctx.moveTo(allPts[0].x, allPts[0].y);
    for (let i = 1; i < allPts.length; i++) {
      ctx.lineTo(allPts[i].x, allPts[i].y);
    }
    ctx.lineWidth = strokeW;
    ctx.strokeStyle = strokeColor;
    ctx.setLineDash([strokeW * 3, strokeW * 2]);
    ctx.lineDashOffset = -time * 60;
    ctx.stroke();
  } else if (animStyle === 'pulseGlow') {
    // Pulsing glow wave
    const pulseAlpha = 0.5 + 0.5 * Math.sin(time * 6);
    ctx.beginPath();
    ctx.moveTo(allPts[0].x, allPts[0].y);
    for (let i = 1; i < allPts.length; i++) {
      ctx.lineTo(allPts[i].x, allPts[i].y);
    }
    ctx.lineWidth = strokeW;
    ctx.strokeStyle = strokeColor;
    ctx.globalAlpha = pulseAlpha;
    ctx.shadowColor = strokeColor;
    ctx.shadowBlur = 14;
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  } else {
    // Default 'writeOn' stroke from start to activeLength
    const activeLength = total * Math.max(0.001, progress);

    ctx.beginPath();
    ctx.moveTo(allPts[0].x, allPts[0].y);

    let currentDist = 0;
    let tipPt = allPts[0];
    let prevPt = allPts[0];

    for (let i = 1; i < allPts.length; i++) {
      const segDist = cumulative[i] - cumulative[i - 1];
      if (currentDist + segDist <= activeLength) {
        ctx.lineTo(allPts[i].x, allPts[i].y);
        currentDist += segDist;
        prevPt = tipPt;
        tipPt = allPts[i];
      } else {
        const rem = activeLength - currentDist;
        const ratio = segDist > 0 ? rem / segDist : 0;
        const finalX = allPts[i - 1].x + (allPts[i].x - allPts[i - 1].x) * ratio;
        const finalY = allPts[i - 1].y + (allPts[i].y - allPts[i - 1].y) * ratio;
        ctx.lineTo(finalX, finalY);
        prevPt = tipPt;
        tipPt = { x: finalX, y: finalY };
        break;
      }
    }

    ctx.lineWidth = strokeW;
    ctx.strokeStyle = strokeColor;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (isDashed) {
      ctx.setLineDash([strokeW * 2.5, strokeW * 1.5]);
    } else {
      ctx.setLineDash([]);
    }

    ctx.stroke();

    // Arrowhead at the tip
    if (showArrow && progress > 0.05) {
      const angle = Math.atan2(tipPt.y - prevPt.y, tipPt.x - prevPt.x);
      const arrowLen = Math.max(8, strokeW * 2.5);

      ctx.save();
      ctx.translate(tipPt.x, tipPt.y);
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-arrowLen, -arrowLen * 0.55);
      ctx.lineTo(-arrowLen * 0.7, 0);
      ctx.lineTo(-arrowLen, arrowLen * 0.55);
      ctx.closePath();
      ctx.fillStyle = strokeColor;
      ctx.fill();
      ctx.restore();
    }
  }

  // 2. Kinetic Text above / along path
  if (text.trim().length > 0) {
    ctx.font = `600 ${fontSize}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillStyle = textColor;

    const chars = text.split('');
    const charCount = chars.length;

    for (let c = 0; c < charCount; c++) {
      const charRatio = c / (charCount - 1 || 1);

      if (textAnim === 'reveal' && charRatio > progress) {
        continue;
      }
      if (textAnim === 'typewriter') {
        const typeProgress = (time % duration) / duration;
        if (charRatio > typeProgress) continue;
      }

      let charDistRatio = charRatio;
      if (textAnim === 'travel') {
        charDistRatio = (charRatio + time * 0.25) % 1;
      }

      const targetLen = total * charDistRatio;
      let pIdx = cumulative.findIndex((d) => d >= targetLen);
      if (pIdx === -1) pIdx = allPts.length - 1;
      const pt = allPts[pIdx] || allPts[0];

      let textOffsetY = -strokeW - 6;
      if (textAnim === 'wave') {
        textOffsetY += Math.sin(time * 6 + c * 0.6) * 6;
      }

      ctx.save();
      ctx.translate(pt.x, pt.y + textOffsetY);
      ctx.fillText(chars[c], 0, 0);
      ctx.restore();
    }
  }

  ctx.restore();
}
