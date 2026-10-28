import { Layer, PathPoint, FollowerType } from '@/types/motion';
import { drawPolygonOrStar } from './shapes';

// Image cache for follower images
const imageCache: Record<string, HTMLImageElement> = {};

/**
 * Standard path presets that users can immediately pick.
 */
export const PATH_PRESETS: Record<string, PathPoint[]> = {
  wave: [
    { x: -160, y: 40, cp1x: -110, cp1y: -60, cp2x: -50, cp2y: -60 },
    { x: 0, y: 0, cp1x: 50, cp1y: 60, cp2x: 110, cp2y: 60 },
    { x: 160, y: -40 },
  ],
  sCurve: [
    { x: -150, y: 60, cp1x: -90, cp1y: 60, cp2x: -30, cp2y: -60 },
    { x: 0, y: -60, cp1x: 30, cp1y: -60, cp2x: 90, cp2y: 60 },
    { x: 150, y: 60 },
  ],
  loop: [
    { x: -160, y: 40, cp1x: -70, cp1y: 40, cp2x: -20, cp2y: -80 },
    { x: 0, y: -80, cp1x: 30, cp1y: -80, cp2x: 70, cp2y: 80 },
    { x: 0, y: 70, cp1x: -50, cp1y: 60, cp2x: 60, cp2y: -40 },
    { x: 160, y: -40 },
  ],
  arc: [
    { x: -160, y: 50, cp1x: -90, cp1y: -80, cp2x: 90, cp2y: -80 },
    { x: 160, y: 50 },
  ],
  zigzag: [
    { x: -160, y: 40 },
    { x: -80, y: -40 },
    { x: 0, y: 40 },
    { x: 80, y: -40 },
    { x: 160, y: 40 },
  ],
  spiral: [
    { x: 140, y: 0, cp1x: 140, cp1y: 77, cp2x: 77, cp2y: 140 },
    { x: 0, y: 140, cp1x: -66, cp1y: 140, cp2x: -120, cp2y: 66 },
    { x: -120, y: 0, cp1x: -120, cp1y: -55, cp2x: -55, cp2y: -100 },
    { x: 0, y: -100, cp1x: 44, cp1y: -100, cp2x: 80, cp2y: -44 },
    { x: 80, y: 0, cp1x: 80, cp1y: 33, cp2x: 33, cp2y: 60 },
    { x: 0, y: 60, cp1x: -22, cp1y: 60, cp2x: -40, cp2y: 22 },
    { x: -40, y: 0 },
  ],
  circle: [
    { x: 0, y: -75, cp1x: 41.4, cp1y: -75, cp2x: 75, cp2y: -41.4 },
    { x: 75, y: 0, cp1x: 75, cp1y: 41.4, cp2x: 41.4, cp2y: 75 },
    { x: 0, y: 75, cp1x: -41.4, cp1y: 75, cp2x: -75, cp2y: 41.4 },
    { x: -75, y: 0, cp1x: -75, cp1y: -41.4, cp2x: -41.4, cp2y: -75 },
    { x: 0, y: -75 },
  ],
  rect: [
    { x: -110, y: -65 },
    { x: 110, y: -65 },
    { x: 110, y: 65 },
    { x: -110, y: 65 },
    { x: -110, y: -65 },
  ],
  poly: [
    { x: 0, y: -80 },
    { x: 76, y: -25 },
    { x: 47, y: 65 },
    { x: -47, y: 65 },
    { x: -76, y: -25 },
    { x: 0, y: -80 },
  ],
};

export const DEFAULT_PATH_POINTS: PathPoint[] = PATH_PRESETS.wave;

export interface PathSample {
  x: number;
  y: number;
  angle: number; // tangent angle in radians
  distance: number;
}

/**
 * Evaluates points and uniform arc-length distance table for a multi-segment curve.
 */
export function buildSampledPath(points: PathPoint[], numSamples = 200): PathSample[] {
  if (!points || points.length < 2) {
    return [
      { x: -100, y: 0, angle: 0, distance: 0 },
      { x: 100, y: 0, angle: 0, distance: 200 },
    ];
  }

  const rawSamples: { x: number; y: number }[] = [];
  const segments = points.length - 1;
  const samplesPerSegment = Math.max(10, Math.floor(numSamples / segments));

  for (let s = 0; s < segments; s++) {
    const p0 = points[s];
    const p1 = points[s + 1];

    const cp1x = p0.cp1x !== undefined ? p0.cp1x : p0.x + (p1.x - p0.x) / 3;
    const cp1y = p0.cp1y !== undefined ? p0.cp1y : p0.y + (p1.y - p0.y) / 3;
    const cp2x = p0.cp2x !== undefined ? p0.cp2x : p1.x - (p1.x - p0.x) / 3;
    const cp2y = p0.cp2y !== undefined ? p0.cp2y : p1.y - (p1.y - p0.y) / 3;

    for (let i = 0; i < samplesPerSegment; i++) {
      const t = i / samplesPerSegment;
      const mt = 1 - t;
      const mt2 = mt * mt;
      const t2 = t * t;

      const x =
        mt2 * mt * p0.x +
        3 * mt2 * t * cp1x +
        3 * mt * t2 * cp2x +
        t2 * t * p1.x;
      const y =
        mt2 * mt * p0.y +
        3 * mt2 * t * cp1y +
        3 * mt * t2 * cp2y +
        t2 * t * p1.y;

      rawSamples.push({ x, y });
    }
  }

  // Add final point
  const last = points[points.length - 1];
  rawSamples.push({ x: last.x, y: last.y });

  // Compute cumulative distances and tangent angles
  const sampledPath: PathSample[] = [];
  let totalDistance = 0;

  for (let i = 0; i < rawSamples.length; i++) {
    if (i === 0) {
      sampledPath.push({ x: rawSamples[0].x, y: rawSamples[0].y, angle: 0, distance: 0 });
    } else {
      const prev = rawSamples[i - 1];
      const curr = rawSamples[i];
      const dx = curr.x - prev.x;
      const dy = curr.y - prev.y;
      const dist = Math.hypot(dx, dy);
      totalDistance += dist;
      const angle = Math.atan2(dy, dx);
      sampledPath.push({ x: curr.x, y: curr.y, angle, distance: totalDistance });
    }
  }

  // Fix first sample's angle to match second sample
  if (sampledPath.length > 1) {
    sampledPath[0].angle = sampledPath[1].angle;
  }

  return sampledPath;
}

/**
 * Interpolates (x, y, angle) at progress u in [0, 1] using uniform arc length.
 */
export function getPointAtProgress(
  sampledPath: PathSample[],
  progress: number
): { x: number; y: number; angle: number } {
  if (sampledPath.length === 0) return { x: 0, y: 0, angle: 0 };
  if (sampledPath.length === 1) return sampledPath[0];

  const totalLength = sampledPath[sampledPath.length - 1].distance;
  if (totalLength <= 0.001) return sampledPath[0];

  const targetDist = Math.max(0, Math.min(1, progress)) * totalLength;

  // Binary search for segment
  let low = 0;
  let high = sampledPath.length - 1;
  while (low <= high) {
    const mid = (low + high) >> 1;
    if (sampledPath[mid].distance < targetDist) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  const idx = Math.max(0, Math.min(sampledPath.length - 2, high));
  const pA = sampledPath[idx];
  const pB = sampledPath[idx + 1];
  const segDist = pB.distance - pA.distance;
  const ratio = segDist > 0.0001 ? (targetDist - pA.distance) / segDist : 0;

  return {
    x: pA.x + (pB.x - pA.x) * ratio,
    y: pA.y + (pB.y - pA.y) * ratio,
    angle: pA.angle,
  };
}

/**
 * Draws an individual follower item.
 */
function drawFollowerItem(
  ctx: CanvasRenderingContext2D,
  type: FollowerType,
  size: number,
  color: string,
  emoji?: string,
  imageSrc?: string | null,
  onImageLoad?: () => void
) {
  const hs = size / 2;

  if (type === 'circle') {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(0, 0, hs, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = Math.max(1, size * 0.1);
    ctx.stroke();
  } else if (type === 'star') {
    ctx.fillStyle = color;
    drawPolygonOrStar(ctx, 0, 0, 5, hs, hs * 0.45);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = Math.max(1, size * 0.08);
    ctx.stroke();
  } else if (type === 'sparkle') {
    // 4-point diamond star
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, -hs * 1.2);
    ctx.quadraticCurveTo(0, 0, hs * 1.2, 0);
    ctx.quadraticCurveTo(0, 0, 0, hs * 1.2);
    ctx.quadraticCurveTo(0, 0, -hs * 1.2, 0);
    ctx.quadraticCurveTo(0, 0, 0, -hs * 1.2);
    ctx.closePath();
    ctx.fill();
  } else if (type === 'arrow') {
    // Directional chevron
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(hs * 1.2, 0);
    ctx.lineTo(-hs * 0.8, -hs * 0.8);
    ctx.lineTo(-hs * 0.3, 0);
    ctx.lineTo(-hs * 0.8, hs * 0.8);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  } else if (type === 'rect') {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(-hs, -hs * 0.6, size, size * 0.6, hs * 0.3);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  } else if (type === 'emoji') {
    ctx.font = `${Math.round(size)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(emoji || '✨', 0, 0);
  } else if (type === 'image' && imageSrc) {
    let img = imageCache[imageSrc];
    if (!img) {
      img = new Image();
      img.src = imageSrc;
      img.onload = () => {
        if (onImageLoad) onImageLoad();
      };
      imageCache[imageSrc] = img;
    }
    if (img.complete && img.naturalWidth > 0) {
      ctx.drawImage(img, -hs, -hs, size, size);
    } else {
      // Fallback while loading
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(0, 0, hs, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

/**
 * Main renderer for PathFollower ("Move Along Path").
 * Renders the guide path line, and multiple follower shapes/images
 * traveling along it with customizable fade-out at the end.
 */
export function renderPathFollower(
  ctx: CanvasRenderingContext2D,
  layer: Layer,
  time: number,
  onImageLoad?: () => void
) {
  const points = layer.pathPoints && layer.pathPoints.length >= 2 ? layer.pathPoints : DEFAULT_PATH_POINTS;
  const sampledPath = buildSampledPath(points, 200);

  const showTrack = layer.showPathTrack !== false;
  const trackColor = layer.pathTrackColor || 'rgba(99, 102, 241, 0.4)';
  const trackWidth = layer.pathTrackWidth || 2.5;
  const trackDashed = layer.pathTrackDashed ?? true;

  ctx.save();

  // 1. Draw guide path line
  if (showTrack) {
    ctx.save();
    ctx.beginPath();
    points.forEach((p, idx) => {
      if (idx === 0) {
        ctx.moveTo(p.x, p.y);
      } else {
        const prev = points[idx - 1];
        const cp1x = prev.cp1x !== undefined ? prev.cp1x : prev.x + (p.x - prev.x) / 3;
        const cp1y = prev.cp1y !== undefined ? prev.cp1y : prev.y + (p.y - prev.y) / 3;
        const cp2x = prev.cp2x !== undefined ? prev.cp2x : p.x - (p.x - prev.x) / 3;
        const cp2y = prev.cp2y !== undefined ? prev.cp2y : p.y - (p.y - prev.y) / 3;
        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p.x, p.y);
      }
    });

    ctx.strokeStyle = trackColor;
    ctx.lineWidth = trackWidth;
    ctx.lineCap = 'round';
    if (trackDashed) {
      ctx.setLineDash([6, 6]);
      if (layer.animateDash) {
        ctx.lineDashOffset = -time * 30;
      }
    } else {
      ctx.setLineDash([]);
    }
    ctx.stroke();
    ctx.restore();
  }

  // 2. Render Multiple Followers Moving Along the Path
  const followerCount = Math.max(1, Math.min(30, layer.followerCount ?? 5));
  const followerType: FollowerType = layer.followerType || 'circle';
  const followerSize = layer.followerSize ?? 22;
  const followerColor = layer.followerColor || layer.fill || '#38bdf8';
  const speed = Math.max(0.2, layer.followerSpeed ?? 3.0); // seconds per cycle
  const spacing = Math.max(0.01, Math.min(0.5, layer.followerSpacing ?? 0.14));
  const fadeStart = Math.max(0.1, Math.min(0.98, layer.followerFadeStart ?? 0.75));
  const fadeIn = layer.followerFadeIn ?? true;
  const scaleDown = layer.followerScaleDown ?? true;
  const orientToPath = layer.followerOrientToPath ?? true;

  for (let i = 0; i < followerCount; i++) {
    // Compute progress for follower i
    let progress = ((time / speed) - i * spacing) % 1;
    if (progress < 0) progress += 1;

    // Calculate fade away opacity
    let alpha = 1.0;
    if (progress >= fadeStart) {
      const fadeFraction = (progress - fadeStart) / (1.0 - fadeStart);
      alpha = Math.max(0, 1.0 - fadeFraction);
    }
    // Smooth fade in at beginning
    if (fadeIn && progress < 0.15) {
      alpha = Math.min(alpha, progress / 0.15);
    }

    if (alpha <= 0.005) continue;

    // Calculate scale factor (shrinks at end if enabled)
    let scale = 1.0;
    if (scaleDown && progress >= fadeStart) {
      const fadeFraction = (progress - fadeStart) / (1.0 - fadeStart);
      scale = Math.max(0.2, 1.0 - fadeFraction * 0.7);
    }

    const pt = getPointAtProgress(sampledPath, progress);

    ctx.save();
    ctx.translate(pt.x, pt.y);
    if (orientToPath) {
      ctx.rotate(pt.angle);
    }
    ctx.scale(scale, scale);
    ctx.globalAlpha = (ctx.globalAlpha || 1.0) * alpha;

    drawFollowerItem(
      ctx,
      followerType,
      followerSize,
      followerColor,
      layer.followerEmoji,
      layer.followerImageSrc,
      onImageLoad
    );

    ctx.restore();
  }

  ctx.restore();
}
