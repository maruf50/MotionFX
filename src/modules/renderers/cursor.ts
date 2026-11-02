import { Layer } from '@/types/motion';
import { getInterpolatedValue } from '../keyframes/evaluator';
import { buildSampledPath, getPointAtProgress } from './pathFollower';

/**
 * Draws standard vector cursor shapes.
 */
function drawCursorGlyph(ctx: CanvasRenderingContext2D, type: string, size: number, color: string) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 1.5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const s = size;

  if (type === 'hand') {
    // Hand / Finger pointer cursor
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -s * 0.45);
    ctx.arc(s * 0.1, -s * 0.45, s * 0.1, Math.PI, 0, false);
    ctx.lineTo(s * 0.2, -s * 0.15);
    ctx.lineTo(s * 0.35, -s * 0.15);
    ctx.arc(s * 0.45, -s * 0.15, s * 0.1, Math.PI, 0, false);
    ctx.lineTo(s * 0.55, 0);
    ctx.lineTo(s * 0.55, s * 0.35);
    ctx.arc(s * 0.3, s * 0.35, s * 0.25, 0, Math.PI, false);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (type === 'crosshair') {
    // Crosshair cursor
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.45, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-s * 0.65, 0);
    ctx.lineTo(s * 0.65, 0);
    ctx.moveTo(0, -s * 0.65);
    ctx.lineTo(0, s * 0.65);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, 2, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  } else if (type === 'beam') {
    // I-Beam text caret
    ctx.beginPath();
    ctx.moveTo(-s * 0.35, -s * 0.5);
    ctx.lineTo(s * 0.35, -s * 0.5);
    ctx.moveTo(0, -s * 0.5);
    ctx.lineTo(0, s * 0.5);
    ctx.moveTo(-s * 0.35, s * 0.5);
    ctx.lineTo(s * 0.35, s * 0.5);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.stroke();
  } else if (type === 'glowDot') {
    // Laser glow dot
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.35, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 12;
    ctx.fill();
  } else {
    // Default 'pointer' angled cursor
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, s * 0.95);
    ctx.lineTo(s * 0.3, s * 0.7);
    ctx.lineTo(s * 0.55, s * 1.15);
    ctx.lineTo(s * 0.72, s * 1.05);
    ctx.lineTo(s * 0.46, s * 0.62);
    ctx.lineTo(s * 0.88, s * 0.62);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * Parses user-specified click timestamps like "0.8, 1.8, 2.8" and determines click state.
 */
function evaluateClickState(
  layer: Layer,
  time: number,
  clickInterval: number
): { isClicking: boolean; clickP: number } {
  const safeTime = Math.max(0, time);
  const clickTimesStr = layer.cursorClickTimes?.trim();
  const clickDuration = 0.35; // 350ms click animation window

  if (clickTimesStr) {
    const times = clickTimesStr
      .split(',')
      .map((t) => parseFloat(t.trim()))
      .filter((n) => !isNaN(n));

    for (const tClick of times) {
      if (safeTime >= tClick && safeTime < tClick + clickDuration) {
        const clickP = Math.max(0, Math.min(1, (safeTime - tClick) / clickDuration));
        return { isClicking: true, clickP };
      }
    }
    return { isClicking: false, clickP: 0 };
  }

  // Periodic fallback with guaranteed non-negative modulo
  const safeInterval = Math.max(0.2, clickInterval);
  const clickPhase = (((safeTime % safeInterval) + safeInterval) % safeInterval) / safeInterval;
  const isClicking = clickPhase < 0.22;
  const clickP = isClicking ? Math.max(0, Math.min(1, clickPhase / 0.22)) : 0;
  return { isClicking, clickP };
}

/**
 * Renders an animated, customizable motion cursor.
 * Features path flight, custom bezier tracks, click ripples, tactile press recoil, and blink modes.
 */
export function renderCursorShape(
  ctx: CanvasRenderingContext2D,
  layer: Layer,
  time: number,
  tr?: { scaleX: number; scaleY: number }
) {
  const cursorType = layer.cursorType || 'pointer';
  const color = layer.cursorColor || layer.fill || '#ffffff';
  const size = Math.max(12, layer.cursorSize ?? 24);
  const pathMode = layer.cursorPathMode || 'customPath';
  const duration = Math.max(0.5, layer.cursorPathDuration ?? 2.5);
  const clickAnim = layer.cursorClickAnim || 'ripple';
  const clickInterval = Math.max(0.5, layer.cursorClickInterval ?? 2.0);
  const isBlinking = layer.cursorBlinking ?? false;
  const blinkRate = Math.max(0.2, layer.cursorBlinkRate ?? 1.5);
  const showTrail = layer.cursorTrail ?? true;
  const showFlightPath = layer.showCursorPath ?? true;
  const pathTrackColor = layer.cursorPathColor || 'rgba(168, 85, 247, 0.4)';
  const orientToMotion = layer.cursorOrientToMotion ?? false;

  // Handle blink mode (on/off visibility toggle)
  if (isBlinking) {
    const isVisible = Math.sin(time * Math.PI * 2 * blinkRate) > 0;
    if (!isVisible) return;
  }

  // Calculate local path flight position & tangent motion angle
  let posX = 0;
  let posY = 0;
  let motionAngle = 0;

  // Keyframed progress or normalized cyclic progress
  let progress = 0;
  if (layer.keyframes?.cursorProgress?.length) {
    const rawVal = getInterpolatedValue(layer, 'cursorProgress', time);
    progress = Math.min(1, Math.max(0, rawVal / 100));
  } else {
    progress = (time % duration) / duration;
  }

  if (pathMode === 'customPath' && layer.pathPoints && layer.pathPoints.length >= 2) {
    const sampledPath = buildSampledPath(layer.pathPoints);

    // Draw visible flight path track guide if enabled
    if (showFlightPath) {
      ctx.save();
      ctx.beginPath();
      sampledPath.forEach((pt, idx) => {
        if (idx === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      });
      ctx.strokeStyle = pathTrackColor;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.restore();
    }

    const pt = getPointAtProgress(sampledPath, progress);
    posX = pt.x;
    posY = pt.y;
    motionAngle = pt.angle;
  } else if (pathMode === 'orbit') {
    const rx = layer.width * 0.38;
    const ry = layer.height * 0.28;

    if (showFlightPath) {
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
      ctx.strokeStyle = pathTrackColor;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.restore();
    }

    const angle = (time / duration) * Math.PI * 2;
    posX = Math.cos(angle) * rx;
    posY = Math.sin(angle) * ry;
    // Tangent angle along ellipse
    motionAngle = Math.atan2(Math.cos(angle) * ry, -Math.sin(angle) * rx);
  } else if (pathMode === 'linear') {
    const p = (time % duration) / duration;
    const ease = (Math.sin(p * Math.PI - Math.PI / 2) + 1) / 2;
    const startX = -layer.width * 0.4;
    const endX = layer.width * 0.4;
    const startY = -layer.height * 0.3;
    const endY = layer.height * 0.3;

    if (showFlightPath) {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.strokeStyle = pathTrackColor;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.restore();
    }

    posX = startX + ease * (endX - startX);
    posY = startY + ease * (endY - startY);
    motionAngle = Math.atan2(endY - startY, endX - startX);
  } else if (pathMode === 'float') {
    posX = Math.sin(time * 2.2) * 20;
    posY = Math.cos(time * 1.8) * 14;
    motionAngle = Math.atan2(
      -Math.sin(time * 1.8) * 14 * 1.8,
      Math.cos(time * 2.2) * 20 * 2.2
    );
  }

  // Click Animation: evaluate click state (either explicit timestamps or periodic)
  const { isClicking, clickP } = evaluateClickState(layer, time, clickInterval);

  ctx.save();
  ctx.translate(posX, posY);

  // Apply orient-to-motion angle if enabled
  if (orientToMotion) {
    // For standard pointer, tip is at -135deg / top-left, so offset by 135deg (3*PI/4) or PI/2 for forward flight
    const rotationOffset = cursorType === 'pointer' ? (Math.PI / 2 + Math.PI / 8) : 0;
    ctx.rotate(motionAngle + rotationOffset);
  }

  // Draw Click Ripple Wave expanding from tip
  if (isClicking && clickAnim === 'ripple') {
    const rippleRadius = Math.max(0.1, clickP * size * 1.7);
    const rippleAlpha = Math.max(0, Math.min(1, (1 - clickP) * 0.8));

    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, rippleRadius, 0, Math.PI * 2);
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 2.5;
    ctx.globalAlpha = rippleAlpha;
    ctx.stroke();

    // Inner secondary pulse
    const innerRadius = Math.max(0.1, rippleRadius * 0.55);
    ctx.beginPath();
    ctx.arc(0, 0, innerRadius, 0, Math.PI * 2);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = rippleAlpha * 0.8;
    ctx.stroke();
    ctx.restore();
  }

  // Draw Sparkle Burst on click
  if (isClicking && clickAnim === 'burst') {
    ctx.save();
    const burstDist = Math.max(0.1, clickP * (size * 1.3));
    const burstAlpha = Math.max(0, Math.min(1, 1 - clickP));
    ctx.fillStyle = '#f59e0b';
    ctx.globalAlpha = burstAlpha;

    for (let b = 0; b < 6; b++) {
      const a = (b * Math.PI * 2) / 6;
      ctx.beginPath();
      ctx.arc(Math.cos(a) * burstDist, Math.sin(a) * burstDist, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // Optional Ghost Motion Trail behind cursor
  if (showTrail) {
    ctx.save();
    ctx.globalAlpha = 0.25;
    ctx.translate(-size * 0.22, -size * 0.22);
    drawCursorGlyph(ctx, cursorType, size * 0.88, color);
    ctx.restore();
  }

  // Apply Tactile Click Press scale recoil
  if (isClicking && clickAnim === 'press') {
    const pressScale = 0.82 + 0.18 * clickP;
    ctx.scale(pressScale, pressScale);
  }

  // Draw Main Cursor Glyph
  drawCursorGlyph(ctx, cursorType, size, color);

  ctx.restore();
}
