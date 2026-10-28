import { Layer } from '@/types/motion';
import { drawRoundedRect, applyStrokeStyle } from './shapes';

/**
 * Renders the Bar shape (Horizontal, Vertical, Radial Gauge, Pill).
 * Allows full control of percentage (0-100%), bar shape, track color,
 * fill color, and percentage label.
 */
export function renderBarShape(
  ctx: CanvasRenderingContext2D,
  layer: Layer,
  time: number,
  tr?: { scaleX: number; scaleY: number }
) {
  const percentage = Math.max(0, Math.min(100, layer.barPercentage ?? 75));
  const barShape = layer.barShape || 'horizontal';
  const hw = layer.width / 2;
  const hh = layer.height / 2;
  const avgScale = (Math.abs(tr?.scaleX ?? 1) + Math.abs(tr?.scaleY ?? 1)) / 2 || 1;

  const trackColor = layer.barTrackColor || 'rgba(255, 255, 255, 0.12)';
  const fillColor = layer.barFillColor || layer.fill || '#6366f1';
  const showLabel = layer.barShowLabel ?? true;
  const labelColor = layer.barLabelColor || '#ffffff';
  const fontSize =
    typeof layer.barFontSize === 'number' && layer.barFontSize > 0
      ? layer.barFontSize
      : Math.max(10, Math.round(Math.min(layer.width, layer.height) * 0.45));
  const thickness = layer.barThickness || Math.max(8, Math.min(layer.width, layer.height) * 0.22);

  ctx.save();
  applyStrokeStyle(ctx, layer, time);

  if (barShape === 'radial') {
    // Radial Circular Ring / Gauge
    const radius = Math.max(10, Math.min(hw, hh) - thickness / 2 - (layer.borderWidth || 0));
    const startAngle = -Math.PI / 2; // top 12 o'clock
    const sweepAngle = (percentage / 100) * (Math.PI * 2);

    // 1. Background full circle track
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.lineWidth = thickness;
    ctx.strokeStyle = trackColor;
    ctx.lineCap = 'round';
    ctx.stroke();

    // 2. Foreground filled arc
    if (percentage > 0.5) {
      ctx.beginPath();
      ctx.arc(0, 0, radius, startAngle, startAngle + sweepAngle, false);
      ctx.lineWidth = thickness;
      ctx.strokeStyle = fillColor;
      ctx.lineCap = 'round';
      ctx.stroke();
    }

    // Optional border stroke around track
    if (layer.borderWidth > 0 && layer.borderStyle !== 'none' && layer.stroke) {
      ctx.beginPath();
      ctx.arc(0, 0, radius + thickness / 2, 0, Math.PI * 2);
      ctx.arc(0, 0, Math.max(2, radius - thickness / 2), 0, Math.PI * 2);
      ctx.lineWidth = layer.borderWidth / avgScale;
      ctx.strokeStyle = layer.stroke;
      ctx.stroke();
    }

    // Centered percentage label
    if (showLabel) {
      ctx.fillStyle = labelColor;
      ctx.font = `bold ${fontSize}px "Geist", "Inter", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${Math.round(percentage)}%`, 0, 0);
    }
  } else if (barShape === 'vertical') {
    // Vertical Bar (fills bottom to top)
    const radius = Math.min(layer.borderRadius ?? 8, hw);

    // 1. Background Track
    ctx.fillStyle = trackColor;
    drawRoundedRect(ctx, -hw, -hh, layer.width, layer.height, radius);
    ctx.fill();

    // 2. Filled Portion from Bottom Up
    if (percentage > 0) {
      const fillHeight = (layer.height * percentage) / 100;
      const fillY = hh - fillHeight;

      ctx.save();
      // Clip to rounded background so inner fill doesn't poke out
      drawRoundedRect(ctx, -hw, -hh, layer.width, layer.height, radius);
      ctx.clip();

      ctx.fillStyle = fillColor;
      drawRoundedRect(ctx, -hw, fillY, layer.width, fillHeight, radius);
      ctx.fill();

      // Top glowing highlight rim on fill
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.fillRect(-hw, fillY, layer.width, Math.min(3, fillHeight));
      ctx.restore();
    }

    // 3. Border (non-scaling)
    if (layer.borderWidth > 0 && layer.borderStyle !== 'none' && layer.stroke) {
      ctx.lineWidth = layer.borderWidth / avgScale;
      ctx.strokeStyle = layer.stroke;
      drawRoundedRect(ctx, -hw, -hh, layer.width, layer.height, radius);
      ctx.stroke();
    }

    // 4. Label
    if (showLabel) {
      ctx.fillStyle = labelColor;
      ctx.font = `bold ${fontSize}px "Geist", "Inter", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${Math.round(percentage)}%`, 0, 0);
    }
  } else {
    // Horizontal or Pill Bar (fills left to right)
    const isPill = barShape === 'pill';
    const radius = isPill ? hh : Math.min(layer.borderRadius ?? 12, hh);

    // 1. Background Track
    ctx.fillStyle = trackColor;
    drawRoundedRect(ctx, -hw, -hh, layer.width, layer.height, radius);
    ctx.fill();

    // 2. Filled Progress from Left to Right
    if (percentage > 0) {
      const fillWidth = (layer.width * percentage) / 100;

      ctx.save();
      // Clip to rounded shape
      drawRoundedRect(ctx, -hw, -hh, layer.width, layer.height, radius);
      ctx.clip();

      ctx.fillStyle = fillColor;
      drawRoundedRect(ctx, -hw, -hh, fillWidth, layer.height, radius);
      ctx.fill();

      // Right edge highlight line
      ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.fillRect(-hw + fillWidth - 2, -hh, 2, layer.height);
      ctx.restore();
    }

    // 3. Border (non-scaling)
    if (layer.borderWidth > 0 && layer.borderStyle !== 'none' && layer.stroke) {
      ctx.lineWidth = layer.borderWidth / avgScale;
      ctx.strokeStyle = layer.stroke;
      drawRoundedRect(ctx, -hw, -hh, layer.width, layer.height, radius);
      ctx.stroke();
    }

    // 4. Label
    if (showLabel) {
      ctx.fillStyle = labelColor;
      ctx.font = `bold ${fontSize}px "Geist", "Inter", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${Math.round(percentage)}%`, 0, 0);
    }
  }

  ctx.restore();
}
