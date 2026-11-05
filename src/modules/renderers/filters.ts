import { Layer, LayerFilterItem, LayerFilterType } from '@/types/motion';
import { getInterpolatedValue } from '../keyframes/evaluator';

/**
 * Normalizes and extracts active filter items for a layer at the given timestamp.
 * Supports both modern multi-filter FX stack (layer.filters) and legacy single filter properties.
 */
export function getActiveFilters(layer: Layer, time: number): LayerFilterItem[] {
  if (layer.filters && Array.isArray(layer.filters) && layer.filters.length > 0) {
    return layer.filters.filter(
      (f) => f.enabled !== false && f.type !== 'none' && (f.intensity ?? 100) > 0
    );
  }

  // Legacy single filter properties fallback
  if (layer.filterType && layer.filterType !== 'none') {
    const rawIntensity = getInterpolatedValue(layer, 'filterIntensity', time);
    const intensity = Math.max(0, Math.min(100, rawIntensity));
    if (intensity <= 0.001) return [];

    return [
      {
        id: 'legacy_filter',
        type: layer.filterType,
        enabled: true,
        intensity,
        blurRadius: layer.filterBlurRadius,
        glowColor: layer.filterGlowColor,
        glowRadius: layer.filterGlowRadius,
        waveFrequency: layer.filterWaveFrequency,
        waveAmplitude: layer.filterWaveAmplitude,
        waveSpeed: layer.filterWaveSpeed,
        bwContrast: layer.filterBwContrast,
        glitchAmount: layer.filterGlitchAmount,
        glitchSlices: layer.filterGlitchSlices,
        glitchSpeed: layer.filterGlitchSpeed,
        noiseDensity: layer.filterNoiseDensity,
        noiseColor: layer.filterNoiseColor,
        shatterPieces: layer.filterShatterPieces,
        shatterSpread: layer.filterShatterSpread,
        wobbleAmount: layer.filterWobbleAmount,
        wobbleSpeed: layer.filterWobbleSpeed,
      },
    ];
  }

  return [];
}

/**
 * Applies a single filter pass from a source renderer to a target canvas context.
 */
function applySingleFilterPass(
  targetCtx: CanvasRenderingContext2D,
  filter: LayerFilterItem,
  layer: Layer,
  time: number,
  renderSource: (ctx: CanvasRenderingContext2D) => void
) {
  const intensity = Math.max(0, Math.min(100, filter.intensity ?? 100)) / 100;
  if (intensity <= 0.001 || filter.type === 'none') {
    renderSource(targetCtx);
    return;
  }

  const fType = filter.type;
  const baseAlpha = targetCtx.globalAlpha;

  // 1. Blur Filter
  if (fType === 'blur') {
    const maxRadius = filter.blurRadius ?? layer.filterBlurRadius ?? 20;
    const blurPx = Math.max(0, maxRadius * intensity);
    targetCtx.save();
    const existing = targetCtx.filter && targetCtx.filter !== 'none' ? targetCtx.filter + ' ' : '';
    targetCtx.filter = `${existing}blur(${blurPx.toFixed(1)}px)`;
    renderSource(targetCtx);
    targetCtx.restore();
    return;
  }

  // 2. Black and White Filter
  if (fType === 'blackAndWhite') {
    const contrast = filter.bwContrast ?? layer.filterBwContrast ?? 100;
    targetCtx.save();
    const existing = targetCtx.filter && targetCtx.filter !== 'none' ? targetCtx.filter + ' ' : '';
    targetCtx.filter = `${existing}grayscale(${Math.round(intensity * 100)}%) contrast(${contrast}%)`;
    renderSource(targetCtx);
    targetCtx.restore();
    return;
  }

  // 3. Glow Filter
  if (fType === 'glow') {
    const glowColor = filter.glowColor || layer.filterGlowColor || layer.fill || '#a855f7';
    const radius = (filter.glowRadius ?? layer.filterGlowRadius ?? 24) * intensity;

    targetCtx.save();
    // Pass 1: Soft diffuse glow
    targetCtx.shadowColor = glowColor;
    targetCtx.shadowBlur = radius;
    renderSource(targetCtx);

    // Pass 2: High intensity bloom pass
    if (intensity > 0.4) {
      targetCtx.shadowBlur = radius * 1.6;
      renderSource(targetCtx);
    }
    targetCtx.restore();
    return;
  }

  // For complex spatial deform filters (wave, glitch, noise, shatter, wobble),
  // render to an offscreen buffer canvas then composite with mathematical displacement.
  if (typeof document === 'undefined') {
    renderSource(targetCtx);
    return;
  }

  const padding = 120;
  const rawW = Math.max(160, layer.width || 200) + padding * 2;
  const rawH = Math.max(160, layer.height || 200) + padding * 2;

  const offscreen = document.createElement('canvas');
  offscreen.width = Math.ceil(rawW);
  offscreen.height = Math.ceil(rawH);
  const offCtx = offscreen.getContext('2d');
  if (!offCtx) {
    renderSource(targetCtx);
    return;
  }

  // Render previous pass centered in offscreen buffer
  offCtx.save();
  offCtx.translate(rawW / 2, rawH / 2);
  renderSource(offCtx);
  offCtx.restore();

  // 4. Wave Filter (sine wave strip slicing)
  if (fType === 'wave') {
    const slices = 24;
    const sliceH = rawH / slices;
    const freq = (filter.waveFrequency ?? layer.filterWaveFrequency ?? 6) * 0.025;
    const amp = (filter.waveAmplitude ?? layer.filterWaveAmplitude ?? 16) * intensity;
    const speed = filter.waveSpeed ?? layer.filterWaveSpeed ?? 4;

    targetCtx.save();
    for (let i = 0; i < slices; i++) {
      const sy = i * sliceH;
      const xOffset = Math.sin(sy * freq + time * speed) * amp;
      targetCtx.drawImage(
        offscreen,
        0, sy, rawW, sliceH,
        -rawW / 2 + xOffset, -rawH / 2 + sy, rawW, sliceH
      );
    }
    targetCtx.restore();
    return;
  }

  // 5. Glitch Filter (chromatic aberration & slice jitter)
  if (fType === 'glitch') {
    const numSlices = filter.glitchSlices ?? layer.filterGlitchSlices ?? 10;
    const sliceH = rawH / numSlices;
    const maxShift = (filter.glitchAmount ?? layer.filterGlitchAmount ?? 18) * intensity;
    const speed = filter.glitchSpeed ?? layer.filterGlitchSpeed ?? 14;

    targetCtx.save();
    for (let i = 0; i < numSlices; i++) {
      const sy = i * sliceH;
      const noise = Math.sin(time * speed + i * 29.3) * Math.cos(time * (speed * 0.7) + i * 11.7);
      const isGlitching = Math.abs(noise) > 0.35;
      const shiftX = isGlitching ? noise * maxShift : 0;

      // Draw chromatic red channel offset if glitching
      if (isGlitching && intensity > 0.3) {
        targetCtx.save();
        targetCtx.globalAlpha = baseAlpha * 0.5 * intensity;
        targetCtx.drawImage(
          offscreen,
          0, sy, rawW, sliceH,
          -rawW / 2 + shiftX * 1.5, -rawH / 2 + sy, rawW, sliceH
        );
        targetCtx.restore();
      }

      targetCtx.drawImage(
        offscreen,
        0, sy, rawW, sliceH,
        -rawW / 2 + shiftX, -rawH / 2 + sy, rawW, sliceH
      );
    }
    targetCtx.restore();
    return;
  }

  // 6. Wobble Filter (organic jelly bounce / skew)
  if (fType === 'wobble') {
    const speed = filter.wobbleSpeed ?? layer.filterWobbleSpeed ?? 6;
    const amount = (filter.wobbleAmount ?? layer.filterWobbleAmount ?? 12) * intensity;
    const rot = Math.sin(time * speed) * (amount * 0.015);
    const scaleX = 1 + Math.sin(time * (speed * 1.4)) * (amount * 0.012);
    const scaleY = 1 + Math.cos(time * (speed * 1.4)) * (amount * 0.012);

    targetCtx.save();
    targetCtx.rotate(rot);
    targetCtx.scale(scaleX, scaleY);
    targetCtx.drawImage(offscreen, -rawW / 2, -rawH / 2);
    targetCtx.restore();
    return;
  }

  // 7. Shatter Filter (fragmented geometric shards dispersing from center)
  if (fType === 'shatter') {
    const cols = 4;
    const rows = 4;
    const pieceW = rawW / cols;
    const pieceH = rawH / rows;
    const spread = (filter.shatterSpread ?? layer.filterShatterSpread ?? 60) * intensity;

    targetCtx.save();
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const sx = c * pieceW;
        const sy = r * pieceH;
        const pcx = sx + pieceW / 2 - rawW / 2;
        const pcy = sy + pieceH / 2 - rawH / 2;
        const dist = Math.hypot(pcx, pcy) || 1;
        const dirX = pcx / dist;
        const dirY = pcy / dist;

        const pieceOffset = spread * (1 + ((r * cols + c) % 3) * 0.4);
        const rot = (r * cols + c - 8) * 0.15 * intensity;

        targetCtx.save();
        targetCtx.translate(pcx + dirX * pieceOffset, pcy + dirY * pieceOffset);
        targetCtx.rotate(rot);
        targetCtx.globalAlpha = baseAlpha * Math.max(0, 1 - intensity * 0.4);
        targetCtx.drawImage(
          offscreen,
          sx, sy, pieceW, pieceH,
          -pieceW / 2, -pieceH / 2, pieceW, pieceH
        );
        targetCtx.restore();
      }
    }
    targetCtx.restore();
    return;
  }

  // 8. Noise Filter (cinematic film grain overlay)
  if (fType === 'noise') {
    targetCtx.save();
    targetCtx.drawImage(offscreen, -rawW / 2, -rawH / 2);

    const density = Math.round((filter.noiseDensity ?? layer.filterNoiseDensity ?? 50) * 1.5 * intensity);
    const bw = rawW - padding * 2;
    const bh = rawH - padding * 2;
    const isColor = Boolean(filter.noiseColor ?? layer.filterNoiseColor);

    targetCtx.save();
    targetCtx.globalAlpha = baseAlpha * 0.25 * intensity;
    for (let i = 0; i < density; i++) {
      const rx = (Math.sin(time * 80 + i * 43.1) * 0.5 + 0.5) * bw - bw / 2;
      const ry = (Math.cos(time * 95 + i * 67.3) * 0.5 + 0.5) * bh - bh / 2;
      const sz = ((i % 3) + 1) * 1.2;

      targetCtx.fillStyle = isColor
        ? i % 3 === 0
          ? '#ff0055'
          : i % 3 === 1
          ? '#00e5ff'
          : '#ffe600'
        : i % 2 === 0
        ? '#ffffff'
        : '#000000';
      targetCtx.fillRect(rx, ry, sz, sz);
    }
    targetCtx.restore();
    targetCtx.restore();
    return;
  }

  // Fallback
  targetCtx.drawImage(offscreen, -rawW / 2, -rawH / 2);
}

/**
 * Applies a top-level canvas post-processing filter pipeline to a layer rendering block.
 * Executes multiple layered filter effects in sequence (FX Stack).
 */
export function applyLayerFilter(
  mainCtx: CanvasRenderingContext2D,
  layer: Layer,
  time: number,
  renderContent: (ctx: CanvasRenderingContext2D) => void
) {
  const activeFilters = getActiveFilters(layer, time);

  if (activeFilters.length === 0) {
    renderContent(mainCtx);
    return;
  }

  // Recursive composition from filter 0 to filter N - 1
  function executePass(target: CanvasRenderingContext2D, index: number) {
    if (index < 0) {
      renderContent(target);
      return;
    }
    const currentFilter = activeFilters[index];
    applySingleFilterPass(target, currentFilter, layer, time, (src) => {
      executePass(src, index - 1);
    });
  }

  executePass(mainCtx, activeFilters.length - 1);
}
