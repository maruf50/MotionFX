import { Layer } from '@/types/motion';
import { getInterpolatedValue } from '../keyframes/evaluator';

/**
 * Applies a top-level canvas post-processing filter to a layer rendering block.
 * Uses hardware-accelerated 2D canvas operations, sub-strip slicing, and procedural noise.
 */
export function applyLayerFilter(
  mainCtx: CanvasRenderingContext2D,
  layer: Layer,
  time: number,
  renderContent: (ctx: CanvasRenderingContext2D) => void
) {
  if (!layer.filterType || layer.filterType === 'none') {
    renderContent(mainCtx);
    return;
  }

  const rawIntensity = getInterpolatedValue(layer, 'filterIntensity', time);
  const intensity = Math.max(0, Math.min(100, rawIntensity)) / 100; // 0.0 to 1.0

  if (intensity <= 0.001) {
    renderContent(mainCtx);
    return;
  }

  const fType = layer.filterType;
  const baseAlpha = mainCtx.globalAlpha;

  // 1. Blur Filter
  if (fType === 'blur') {
    const maxRadius = layer.filterBlurRadius ?? 20;
    const blurPx = Math.max(0, maxRadius * intensity);
    mainCtx.save();
    mainCtx.filter = `blur(${blurPx.toFixed(1)}px)`;
    renderContent(mainCtx);
    mainCtx.restore();
    return;
  }

  // 2. Black and White Filter
  if (fType === 'blackAndWhite') {
    const contrast = layer.filterBwContrast ?? 100;
    mainCtx.save();
    mainCtx.filter = `grayscale(${Math.round(intensity * 100)}%) contrast(${contrast}%)`;
    renderContent(mainCtx);
    mainCtx.restore();
    return;
  }

  // 2. Glow Filter
  if (fType === 'glow') {
    const glowColor = layer.filterGlowColor || layer.fill || '#a855f7';
    const radius = (layer.filterGlowRadius || 24) * intensity;

    mainCtx.save();
    // Pass 1: Soft diffuse glow
    mainCtx.shadowColor = glowColor;
    mainCtx.shadowBlur = radius;
    renderContent(mainCtx);

    // Pass 2: High intensity bloom pass
    if (intensity > 0.4) {
      mainCtx.shadowBlur = radius * 1.6;
      renderContent(mainCtx);
    }
    mainCtx.restore();
    return;
  }

  // For complex spatial deform filters (wave, glitch, noise, shatter, wobble),
  // render to an offscreen buffer canvas then composite with mathematical displacement.
  const padding = 120;
  const rawW = Math.max(160, layer.width || 200) + padding * 2;
  const rawH = Math.max(160, layer.height || 200) + padding * 2;

  const offscreen = document.createElement('canvas');
  offscreen.width = Math.ceil(rawW);
  offscreen.height = Math.ceil(rawH);
  const offCtx = offscreen.getContext('2d');
  if (!offCtx) {
    renderContent(mainCtx);
    return;
  }

  // Render layer content centered in offscreen buffer
  offCtx.save();
  offCtx.translate(rawW / 2, rawH / 2);
  renderContent(offCtx);
  offCtx.restore();

  // 3. Wave Filter (sine wave strip slicing)
  if (fType === 'wave') {
    const slices = 24;
    const sliceH = rawH / slices;
    const freq = (layer.filterWaveFrequency || 6) * 0.025;
    const amp = (layer.filterWaveAmplitude || 16) * intensity;
    const speed = layer.filterWaveSpeed || 4;

    mainCtx.save();
    for (let i = 0; i < slices; i++) {
      const sy = i * sliceH;
      const xOffset = Math.sin(sy * freq + time * speed) * amp;
      mainCtx.drawImage(
        offscreen,
        0, sy, rawW, sliceH,
        -rawW / 2 + xOffset, -rawH / 2 + sy, rawW, sliceH
      );
    }
    mainCtx.restore();
    return;
  }

  // 4. Glitch Filter (chromatic aberration & slice jitter)
  if (fType === 'glitch') {
    const numSlices = layer.filterGlitchSlices || 10;
    const sliceH = rawH / numSlices;
    const maxShift = (layer.filterGlitchAmount || 18) * intensity;
    const speed = layer.filterGlitchSpeed || 14;

    mainCtx.save();
    for (let i = 0; i < numSlices; i++) {
      const sy = i * sliceH;
      // Procedural pseudo-random jitter for this slice
      const noise = Math.sin(time * speed + i * 29.3) * Math.cos(time * (speed * 0.7) + i * 11.7);
      const isGlitching = Math.abs(noise) > 0.35;
      const shiftX = isGlitching ? noise * maxShift : 0;

      // Draw chromatic red channel offset if glitching
      if (isGlitching && intensity > 0.3) {
        mainCtx.save();
        mainCtx.globalAlpha = baseAlpha * 0.5 * intensity;
        mainCtx.drawImage(
          offscreen,
          0, sy, rawW, sliceH,
          -rawW / 2 + shiftX * 1.5, -rawH / 2 + sy, rawW, sliceH
        );
        mainCtx.restore();
      }

      mainCtx.drawImage(
        offscreen,
        0, sy, rawW, sliceH,
        -rawW / 2 + shiftX, -rawH / 2 + sy, rawW, sliceH
      );
    }
    mainCtx.restore();
    return;
  }

  // 5. Wobble Filter (organic jelly bounce / skew)
  if (fType === 'wobble') {
    const speed = layer.filterWobbleSpeed || 6;
    const amount = (layer.filterWobbleAmount || 12) * intensity;
    const rot = Math.sin(time * speed) * (amount * 0.015);
    const scaleX = 1 + Math.sin(time * (speed * 1.4)) * (amount * 0.012);
    const scaleY = 1 + Math.cos(time * (speed * 1.4)) * (amount * 0.012);

    mainCtx.save();
    mainCtx.rotate(rot);
    mainCtx.scale(scaleX, scaleY);
    mainCtx.drawImage(offscreen, -rawW / 2, -rawH / 2);
    mainCtx.restore();
    return;
  }

  // 6. Shatter Filter (fragmented geometric shards dispersing from center)
  if (fType === 'shatter') {
    const cols = 4;
    const rows = 4;
    const pieceW = rawW / cols;
    const pieceH = rawH / rows;
    const spread = (layer.filterShatterSpread || 60) * intensity;

    mainCtx.save();
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const sx = c * pieceW;
        const sy = r * pieceH;
        // Vector from center of buffer
        const pcx = sx + pieceW / 2 - rawW / 2;
        const pcy = sy + pieceH / 2 - rawH / 2;
        const dist = Math.hypot(pcx, pcy) || 1;
        const dirX = pcx / dist;
        const dirY = pcy / dist;

        const pieceOffset = spread * (1 + ((r * cols + c) % 3) * 0.4);
        const rot = (r * cols + c - 8) * 0.15 * intensity;

        mainCtx.save();
        mainCtx.translate(pcx + dirX * pieceOffset, pcy + dirY * pieceOffset);
        mainCtx.rotate(rot);
        mainCtx.globalAlpha = baseAlpha * Math.max(0, 1 - intensity * 0.4);
        mainCtx.drawImage(
          offscreen,
          sx, sy, pieceW, pieceH,
          -pieceW / 2, -pieceH / 2, pieceW, pieceH
        );
        mainCtx.restore();
      }
    }
    mainCtx.restore();
    return;
  }

  // 7. Noise Filter (cinematic film grain overlay)
  if (fType === 'noise') {
    mainCtx.save();
    mainCtx.drawImage(offscreen, -rawW / 2, -rawH / 2);

    // Overlay randomized noise speckles
    const density = Math.round((layer.filterNoiseDensity || 50) * 1.5 * intensity);
    const bw = rawW - padding * 2;
    const bh = rawH - padding * 2;
    const isColor = Boolean(layer.filterNoiseColor);

    mainCtx.save();
    mainCtx.globalAlpha = baseAlpha * 0.25 * intensity;
    for (let i = 0; i < density; i++) {
      const rx = (Math.sin(time * 80 + i * 43.1) * 0.5 + 0.5) * bw - bw / 2;
      const ry = (Math.cos(time * 95 + i * 67.3) * 0.5 + 0.5) * bh - bh / 2;
      const sz = ((i % 3) + 1) * 1.2;

      mainCtx.fillStyle = isColor
        ? i % 3 === 0
          ? '#ff0055'
          : i % 3 === 1
          ? '#00e5ff'
          : '#ffe600'
        : i % 2 === 0
        ? '#ffffff'
        : '#000000';
      mainCtx.fillRect(rx, ry, sz, sz);
    }
    mainCtx.restore();
    mainCtx.restore();
    return;
  }

  // Default fallback
  mainCtx.drawImage(offscreen, -rawW / 2, -rawH / 2);
}

