import { Layer, GraphDataItem } from '@/types/motion';
import { getInterpolatedValue } from '../keyframes/evaluator';
import { resolveColorOrGradient } from './gradients';

const DEFAULT_PALETTE = ['#6366f1', '#8b5cf6', '#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#06b6d4'];

/**
 * Renders high-precision animated graphs (Pie/Donut, Column, Bar, Line, Area, Combo).
 * Driven by keyframable `graphProgress` (0 to 100%).
 */
export function renderGraphShape(
  ctx: CanvasRenderingContext2D,
  layer: Layer,
  time: number
) {
  const w = Math.max(40, layer.width || 320);
  const h = Math.max(40, layer.height || 220);

  const rawProgress = getInterpolatedValue(layer, 'graphProgress', time);
  const progress = Math.max(0, Math.min(100, rawProgress)) / 100; // 0.0 to 1.0

  const data: GraphDataItem[] =
    layer.graphData && layer.graphData.length > 0
      ? layer.graphData
      : [
          { id: '1', label: 'Mon', value: 45, color: '#6366f1', secondaryValue: 20 },
          { id: '2', label: 'Tue', value: 78, color: '#8b5cf6', secondaryValue: 35 },
          { id: '3', label: 'Wed', value: 60, color: '#ec4899', secondaryValue: 50 },
          { id: '4', label: 'Thu', value: 92, color: '#3b82f6', secondaryValue: 65 },
          { id: '5', label: 'Fri', value: 110, color: '#10b981', secondaryValue: 85 },
        ];

  const graphType = layer.graphType || 'column';
  const showLabels = layer.graphShowLabels ?? true;
  const showValues = layer.graphShowValues ?? true;
  const showGrid = layer.graphShowGrid ?? true;
  const showAxes = layer.graphShowAxes ?? true;
  const showDots = layer.graphShowDots ?? true;
  const dotSize = layer.graphDotSize ?? 4.5;
  const lineWidth = layer.graphLineWidth ?? 3;
  const barRadius = layer.graphBarRadius ?? 6;
  const barSpacing = layer.graphBarSpacing ?? 10;
  const donutHole = Math.max(0, Math.min(85, layer.graphDonutHole ?? 45)) / 100;
  const gridColor = layer.graphGridColor || 'rgba(255, 255, 255, 0.08)';
  const axisColor = layer.graphAxisColor || 'rgba(255, 255, 255, 0.22)';
  const textColor = layer.graphTextColor || '#d4d4d8';

  // Optional background card styling if explicitly activated
  if (layer.graphShowCard) {
    if (layer.fill && layer.fill !== 'transparent') {
      ctx.save();
      ctx.fillStyle = resolveColorOrGradient(ctx, layer.fill, -w / 2, -h / 2, w, h);
      const r = layer.borderRadius ?? 12;
      if (typeof ctx.roundRect === 'function') {
        ctx.beginPath();
        ctx.roundRect(-w / 2, -h / 2, w, h, r);
        ctx.fill();
      } else {
        ctx.fillRect(-w / 2, -h / 2, w, h);
      }
      ctx.restore();
    }

    if (layer.borderWidth && layer.borderWidth > 0 && layer.stroke && layer.stroke !== 'transparent') {
      ctx.save();
      ctx.strokeStyle = resolveColorOrGradient(ctx, layer.stroke, -w / 2, -h / 2, w, h);
      ctx.lineWidth = layer.borderWidth;
      const r = layer.borderRadius ?? 12;
      if (typeof ctx.roundRect === 'function') {
        ctx.beginPath();
        ctx.roundRect(-w / 2, -h / 2, w, h, r);
        ctx.stroke();
      } else {
        ctx.strokeRect(-w / 2, -h / 2, w, h);
      }
      ctx.restore();
    }
  }

  // 1. PIE / DONUT GRAPH
  if (graphType === 'pie') {
    renderPieGraph(ctx, data, w, h, progress, donutHole, showLabels, showValues, textColor);
    return;
  }

  // Common bounds for 2D cartesian plots (Column, Bar, Line, Area, Combo)
  const isHorizontalBar = graphType === 'bar';
  const padLeft = isHorizontalBar ? 46 : 38;
  const padBottom = isHorizontalBar ? 22 : 30;
  const padTop = 22;
  const padRight = 18;

  const left = -w / 2 + padLeft;
  const right = w / 2 - padRight;
  const top = -h / 2 + padTop;
  const bottom = h / 2 - padBottom;
  const plotW = Math.max(20, right - left);
  const plotH = Math.max(20, bottom - top);

  const maxVal = Math.max(1, ...data.map((d) => d.value)) * 1.15;
  const maxSecVal = Math.max(1, ...data.map((d) => d.secondaryValue ?? d.value)) * 1.15;

  // Background Grid Lines
  if (showGrid) {
    ctx.save();
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);

    const gridSteps = 4;
    for (let i = 0; i <= gridSteps; i++) {
      if (isHorizontalBar) {
        // Vertical grid lines
        const gx = left + (plotW / gridSteps) * i;
        ctx.beginPath();
        ctx.moveTo(gx, top);
        ctx.lineTo(gx, bottom);
        ctx.stroke();
      } else {
        // Horizontal grid lines
        const gy = bottom - (plotH / gridSteps) * i;
        ctx.beginPath();
        ctx.moveTo(left, gy);
        ctx.lineTo(right, gy);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  // Axes lines
  if (showAxes) {
    ctx.save();
    ctx.strokeStyle = axisColor;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(left, top);
    ctx.lineTo(left, bottom);
    ctx.lineTo(right, bottom);
    ctx.stroke();
    ctx.restore();
  }

  // 2. HORIZONTAL BAR GRAPH
  if (graphType === 'bar') {
    renderBarGraph(
      ctx, data, left, top, plotW, plotH, maxVal, progress,
      barSpacing, barRadius, showLabels, showValues, textColor
    );
    return;
  }

  // 3. VERTICAL COLUMN GRAPH
  if (graphType === 'column') {
    renderColumnGraph(
      ctx, data, left, bottom, plotW, plotH, maxVal, progress,
      barSpacing, barRadius, showLabels, showValues, textColor
    );
    return;
  }

  // 4. LINE & AREA GRAPH
  if (graphType === 'line' || graphType === 'area') {
    renderLineAreaGraph(
      ctx, data, left, top, bottom, plotW, plotH, maxVal, progress,
      graphType === 'area', layer.graphLineCurvature || 'smooth',
      lineWidth, showDots, dotSize, showLabels, showValues, textColor
    );
    return;
  }

  // 5. COMBO GRAPH (Column + Line)
  if (graphType === 'combo') {
    renderComboGraph(
      ctx, data, left, top, bottom, plotW, plotH, maxVal, maxSecVal, progress,
      barSpacing, barRadius, layer.graphLineCurvature || 'smooth',
      lineWidth, showDots, dotSize, showLabels, showValues, textColor
    );
  }
}

/**
 * Draws rounded top/right rectangle on canvas.
 */
function drawBarCapsule(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number,
  horizontal: boolean
) {
  if (w <= 0 || h <= 0) return;
  const r = Math.min(radius, horizontal ? h / 2 : w / 2);
  ctx.beginPath();
  if (horizontal) {
    // Round right end
    ctx.moveTo(x, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x, y + h);
    ctx.closePath();
  } else {
    // Round top end
    ctx.moveTo(x, y + h);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h);
    ctx.closePath();
  }
  ctx.fill();
}

/**
 * Renders Vertical Column Graph.
 */
function renderColumnGraph(
  ctx: CanvasRenderingContext2D,
  data: GraphDataItem[],
  left: number,
  bottom: number,
  plotW: number,
  plotH: number,
  maxVal: number,
  progress: number,
  spacing: number,
  radius: number,
  showLabels: boolean,
  showValues: boolean,
  textColor: string
) {
  const n = data.length;
  if (n === 0) return;
  const totalGaps = (n - 1) * spacing;
  const colW = Math.max(6, (plotW - totalGaps) / n);

  data.forEach((d, i) => {
    const itemColor = d.color || DEFAULT_PALETTE[i % DEFAULT_PALETTE.length];
    const targetH = (d.value / maxVal) * plotH;
    const currentH = Math.max(1, targetH * progress);
    const x = left + i * (colW + spacing);
    const y = bottom - currentH;

    // Draw Column Bar
    ctx.save();
    ctx.fillStyle = resolveColorOrGradient(ctx, itemColor, x, y, colW, currentH);
    drawBarCapsule(ctx, x, y, colW, currentH, radius, false);
    ctx.restore();

    // Value on top of column
    if (showValues && progress > 0.15) {
      ctx.save();
      ctx.fillStyle = textColor;
      ctx.font = '600 10px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      const animVal = Math.round(d.value * progress);
      ctx.fillText(`${animVal}`, x + colW / 2, y - 3);
      ctx.restore();
    }

    // Label below X-axis
    if (showLabels) {
      ctx.save();
      ctx.fillStyle = textColor;
      ctx.font = '500 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(d.label, x + colW / 2, bottom + 6);
      ctx.restore();
    }
  });
}

/**
 * Renders Horizontal Bar Graph.
 */
function renderBarGraph(
  ctx: CanvasRenderingContext2D,
  data: GraphDataItem[],
  left: number,
  top: number,
  plotW: number,
  plotH: number,
  maxVal: number,
  progress: number,
  spacing: number,
  radius: number,
  showLabels: boolean,
  showValues: boolean,
  textColor: string
) {
  const n = data.length;
  if (n === 0) return;
  const totalGaps = (n - 1) * spacing;
  const barH = Math.max(6, (plotH - totalGaps) / n);

  data.forEach((d, i) => {
    const itemColor = d.color || DEFAULT_PALETTE[i % DEFAULT_PALETTE.length];
    const targetW = (d.value / maxVal) * plotW;
    const currentW = Math.max(1, targetW * progress);
    const y = top + i * (barH + spacing);

    // Draw Horizontal Bar
    ctx.save();
    ctx.fillStyle = resolveColorOrGradient(ctx, itemColor, left, y, currentW, barH);
    drawBarCapsule(ctx, left, y, currentW, barH, radius, true);
    ctx.restore();

    // Value to right of bar
    if (showValues && progress > 0.15) {
      ctx.save();
      ctx.fillStyle = textColor;
      ctx.font = '600 10px monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      const animVal = Math.round(d.value * progress);
      ctx.fillText(`${animVal}`, left + currentW + 5, y + barH / 2);
      ctx.restore();
    }

    // Label to left of Y-axis
    if (showLabels) {
      ctx.save();
      ctx.fillStyle = textColor;
      ctx.font = '500 10px sans-serif';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(d.label, left - 6, y + barH / 2);
      ctx.restore();
    }
  });
}

/**
 * Renders Line and Area Graphs.
 */
function renderLineAreaGraph(
  ctx: CanvasRenderingContext2D,
  data: GraphDataItem[],
  left: number,
  top: number,
  bottom: number,
  plotW: number,
  plotH: number,
  maxVal: number,
  progress: number,
  isArea: boolean,
  curvature: 'straight' | 'smooth' | 'step',
  lineWidth: number,
  showDots: boolean,
  dotSize: number,
  showLabels: boolean,
  showValues: boolean,
  textColor: string
) {
  const n = data.length;
  if (n === 0) return;

  const points = data.map((d, i) => {
    const x = left + (n === 1 ? plotW / 2 : (i / (n - 1)) * plotW);
    const targetY = bottom - (d.value / maxVal) * plotH;
    return { x, y: targetY, origY: targetY, item: d, i };
  });

  const primaryColor = data[0]?.color || '#6366f1';
  // Compute left-to-right growth sweep position based on progress
  const currentX = left + plotW * progress;

  // Clip Line and Area so they grow smoothly from left to right (0 position to end)
  if (points.length > 1 && progress > 0.001) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(left - 4, top - 20, Math.max(0, currentX - left + 6), plotH + 40);
    ctx.clip();

    // Area under curve with gradient fill
    if (isArea) {
      const grad = ctx.createLinearGradient(0, top, 0, bottom);
      grad.addColorStop(0, primaryColor + '99'); // ~60% alpha
      grad.addColorStop(1, primaryColor + '05'); // ~2% alpha
      ctx.fillStyle = grad;

      ctx.beginPath();
      ctx.moveTo(points[0].x, bottom);
      ctx.lineTo(points[0].x, points[0].y);

      if (curvature === 'smooth') {
        for (let i = 0; i < points.length - 1; i++) {
          const p0 = points[i];
          const p1 = points[i + 1];
          const cpx = (p0.x + p1.x) / 2;
          ctx.bezierCurveTo(cpx, p0.y, cpx, p1.y, p1.x, p1.y);
        }
      } else if (curvature === 'step') {
        for (let i = 0; i < points.length - 1; i++) {
          const p0 = points[i];
          const p1 = points[i + 1];
          ctx.lineTo(p1.x, p0.y);
          ctx.lineTo(p1.x, p1.y);
        }
      } else {
        for (let i = 1; i < points.length; i++) {
          ctx.lineTo(points[i].x, points[i].y);
        }
      }

      ctx.lineTo(points[points.length - 1].x, bottom);
      ctx.closePath();
      ctx.fill();
    }

    // Draw Line Stroke
    ctx.strokeStyle = primaryColor;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);

    if (curvature === 'smooth') {
      for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[i];
        const p1 = points[i + 1];
        const cpx = (p0.x + p1.x) / 2;
        ctx.bezierCurveTo(cpx, p0.y, cpx, p1.y, p1.x, p1.y);
      }
    } else if (curvature === 'step') {
      for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[i];
        const p1 = points[i + 1];
        ctx.lineTo(p1.x, p0.y);
        ctx.lineTo(p1.x, p1.y);
      }
    } else {
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
    }

    ctx.stroke();
    ctx.restore();
  }

  // Draw Dots and Values as line progresses across X
  points.forEach((pt) => {
    const dotColor = pt.item.color || primaryColor;
    const isReached = currentX >= pt.x - 2;

    if (showDots && isReached) {
      const popAge = Math.min(1, Math.max(0, (currentX - (pt.x - 2)) / 16));
      ctx.save();
      ctx.globalAlpha = popAge;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, dotSize * (0.6 + 0.4 * popAge), 0, Math.PI * 2);
      ctx.fillStyle = dotColor;
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();
    }

    if (showValues && isReached) {
      const popAge = Math.min(1, Math.max(0, (currentX - (pt.x - 2)) / 16));
      ctx.save();
      ctx.globalAlpha = popAge;
      ctx.fillStyle = textColor;
      ctx.font = '600 10px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(`${pt.item.value}`, pt.x, pt.y - (dotSize + 3));
      ctx.restore();
    }

    if (showLabels) {
      ctx.save();
      ctx.fillStyle = textColor;
      ctx.font = '500 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(pt.item.label, pt.x, bottom + 6);
      ctx.restore();
    }
  });
}

/**
 * Renders Combo Graph (Columns for primary value, Line for secondary value).
 */
function renderComboGraph(
  ctx: CanvasRenderingContext2D,
  data: GraphDataItem[],
  left: number,
  top: number,
  bottom: number,
  plotW: number,
  plotH: number,
  maxVal: number,
  maxSecVal: number,
  progress: number,
  spacing: number,
  radius: number,
  curvature: 'straight' | 'smooth' | 'step',
  lineWidth: number,
  showDots: boolean,
  dotSize: number,
  showLabels: boolean,
  showValues: boolean,
  textColor: string
) {
  // First render columns
  renderColumnGraph(
    ctx, data, left, bottom, plotW, plotH, maxVal, progress,
    spacing, radius, showLabels, false, textColor
  );

  // Overlay secondary line chart
  const n = data.length;
  if (n === 0) return;
  const colW = (plotW - (n - 1) * spacing) / n;

  const linePoints = data.map((d, i) => {
    const x = left + i * (colW + spacing) + colW / 2;
    const secVal = d.secondaryValue ?? d.value * 0.6;
    const targetY = bottom - (secVal / maxSecVal) * plotH;
    return { x, y: targetY, secVal };
  });

  const lineColor = '#f59e0b'; // Amber highlight for combo line
  const currentLineX = left + plotW * progress;

  if (progress > 0.001) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(left - 4, top - 20, Math.max(0, currentLineX - left + 6), plotH + 40);
    ctx.clip();

    ctx.strokeStyle = lineColor;
    ctx.lineWidth = lineWidth + 0.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(linePoints[0].x, linePoints[0].y);

    if (curvature === 'smooth') {
      for (let i = 0; i < linePoints.length - 1; i++) {
        const p0 = linePoints[i];
        const p1 = linePoints[i + 1];
        const cpx = (p0.x + p1.x) / 2;
        ctx.bezierCurveTo(cpx, p0.y, cpx, p1.y, p1.x, p1.y);
      }
    } else {
      for (let i = 1; i < linePoints.length; i++) {
        ctx.lineTo(linePoints[i].x, linePoints[i].y);
      }
    }
    ctx.stroke();
    ctx.restore();
  }

  // Draw Dots on line
  linePoints.forEach((pt) => {
    if (showDots && currentLineX >= pt.x - 2) {
      const popAge = Math.min(1, Math.max(0, (currentLineX - (pt.x - 2)) / 16));
      ctx.save();
      ctx.globalAlpha = popAge;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, dotSize * (0.6 + 0.4 * popAge), 0, Math.PI * 2);
      ctx.fillStyle = lineColor;
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();
    }

    if (showValues && progress > 0.2) {
      ctx.save();
      ctx.fillStyle = lineColor;
      ctx.font = '600 9px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(`${Math.round(pt.secVal * progress)}`, pt.x, pt.y - 6);
      ctx.restore();
    }
  });
}

/**
 * Renders Pie and Donut Chart with radial animation.
 */
function renderPieGraph(
  ctx: CanvasRenderingContext2D,
  data: GraphDataItem[],
  w: number,
  h: number,
  progress: number,
  donutHole: number,
  showLabels: boolean,
  showValues: boolean,
  textColor: string
) {
  const total = data.reduce((acc, d) => acc + d.value, 0) || 1;
  const outerR = Math.max(20, Math.min(w, h) / 2 - 20);
  const innerR = outerR * donutHole;

  let currentAngle = -Math.PI / 2; // Start from top 12 o'clock

  data.forEach((d, i) => {
    const sliceAngle = (d.value / total) * (Math.PI * 2) * progress;
    if (sliceAngle <= 0.001) return;

    const sliceColor = d.color || DEFAULT_PALETTE[i % DEFAULT_PALETTE.length];
    const endAngle = currentAngle + sliceAngle;

    ctx.save();
    ctx.fillStyle = sliceColor;
    ctx.beginPath();
    ctx.arc(0, 0, outerR, currentAngle, endAngle, false);
    if (innerR > 0) {
      ctx.arc(0, 0, innerR, endAngle, currentAngle, true);
    } else {
      ctx.lineTo(0, 0);
    }
    ctx.closePath();
    ctx.fill();

    // Subtle slice divider stroke
    ctx.strokeStyle = 'rgba(20, 20, 24, 0.6)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    // Label & Percentage inside slice if large enough
    if ((showLabels || showValues) && progress > 0.4 && sliceAngle > 0.3) {
      const midAngle = currentAngle + sliceAngle / 2;
      const labelRadius = innerR + (outerR - innerR) * 0.55;
      const lx = Math.cos(midAngle) * labelRadius;
      const ly = Math.sin(midAngle) * labelRadius;

      ctx.save();
      ctx.fillStyle = '#ffffff';
      ctx.font = '600 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const pct = Math.round((d.value / total) * 100);
      if (showValues && showLabels) {
        ctx.fillText(`${d.label} ${pct}%`, lx, ly);
      } else if (showValues) {
        ctx.fillText(`${pct}%`, lx, ly);
      } else if (showLabels) {
        ctx.fillText(d.label, lx, ly);
      }
      ctx.restore();
    }

    currentAngle = endAngle;
  });

  // Center stat for donut
  if (donutHole > 0.3 && progress > 0.3) {
    ctx.save();
    ctx.fillStyle = textColor;
    ctx.font = '700 14px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${Math.round(total * progress)}`, 0, -2);
    ctx.font = '500 9px sans-serif';
    ctx.fillStyle = '#71717a';
    ctx.fillText('TOTAL', 0, 11);
    ctx.restore();
  }
}

