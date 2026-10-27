import { Layer } from '@/types/motion';
import { Easings } from '../easing/easings';

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*<>[]{}';

/**
 * Renders kinetic text layers with various motion effects.
 */
export function renderTextLayer(
  ctx: CanvasRenderingContext2D,
  layer: Layer,
  time: number,
  totalDuration: number
) {
  const fontSize = layer.fontSize || 48;
  const str = layer.text || 'TEXT';
  const effect = layer.textEffect || 'none';

  ctx.font = `800 ${fontSize}px var(--font-geist-sans), "Space Grotesk", "Inter", -apple-system, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = layer.fill || '#ffffff';

  if (effect === 'none') {
    ctx.fillText(str, 0, 0);
    if (layer.borderWidth > 0 && layer.borderStyle !== 'none' && layer.stroke) {
      ctx.lineWidth = layer.borderWidth;
      ctx.strokeStyle = layer.stroke;
      ctx.strokeText(str, 0, 0);
    }
    return;
  }

  if (effect === 'typewriter') {
    // Reveal letters progressively across the first 60% of timeline
    const typeProgress = Math.min(1, time / (totalDuration * 0.6));
    const charCount = Math.floor(typeProgress * str.length);
    const visibleSub = str.substring(0, charCount);
    const showCursor = Math.floor(time * 3.5) % 2 === 0;

    ctx.fillText(visibleSub + (showCursor ? '▍' : ' '), 0, 0);
    return;
  }

  if (effect === 'morph') {
    // Cyber Glitch / Scramble Morph between initial text and target word
    const target = layer.morphTarget || 'FUTURE MOTION';
    const maxLen = Math.max(str.length, target.length);
    const morphStart = 0.6;
    const morphDuration = Math.min(2.5, totalDuration * 0.55);
    const morphProgress = Math.max(0, Math.min(1, (time - morphStart) / morphDuration));

    let displayStr = '';
    for (let i = 0; i < maxLen; i++) {
      const c1 = str[i] || ' ';
      const c2 = target[i] || ' ';
      const charThreshold = i / maxLen;

      if (morphProgress < charThreshold) {
        displayStr += c1;
      } else if (morphProgress > charThreshold + 0.25) {
        displayStr += c2;
      } else {
        // Scramble phase
        const randIdx = Math.floor((time * 30 + i * 13) % GLYPHS.length);
        displayStr += GLYPHS[randIdx];
      }
    }

    ctx.fillText(displayStr.trim(), 0, 0);
    return;
  }

  if (effect === 'wave') {
    // Per-letter undulating sine wave
    const totalW = ctx.measureText(str).width;
    let curX = -totalW / 2;
    ctx.textAlign = 'left';

    for (let i = 0; i < str.length; i++) {
      const ch = str[i];
      const cw = ctx.measureText(ch).width;
      const yOffset = Math.sin(time * 6 + i * 0.5) * (fontSize * 0.22);
      ctx.fillText(ch, curX, yOffset);
      curX += cw;
    }
    return;
  }

  if (effect === 'cascade') {
    // Staggered letter pop-in with bouncy backOut easing
    const totalW = ctx.measureText(str).width;
    let curX = -totalW / 2;
    ctx.textAlign = 'left';

    for (let i = 0; i < str.length; i++) {
      const ch = str[i];
      const cw = ctx.measureText(ch).width;
      const delay = i * 0.06;
      const localP = Math.max(0, Math.min(1, (time - delay) / 0.45));
      const s = Easings.backOut(localP);

      ctx.save();
      ctx.translate(curX + cw / 2, (1 - s) * 25);
      ctx.scale(s, s);
      ctx.globalAlpha *= localP;
      ctx.textAlign = 'center';
      ctx.fillText(ch, 0, 0);
      ctx.restore();

      curX += cw;
    }
    return;
  }

  if (effect === 'neonPulse') {
    // Glowing neon outline with pulsating intensity
    const pulse = (Math.sin(time * 5) + 1) / 2; // 0 to 1
    ctx.save();
    ctx.shadowColor = layer.stroke || '#ec4899';
    ctx.shadowBlur = 10 + pulse * 20;
    ctx.fillText(str, 0, 0);
    ctx.lineWidth = 2 + pulse * 2;
    ctx.strokeStyle = layer.stroke || '#f472b6';
    ctx.strokeText(str, 0, 0);
    ctx.restore();
  }
}
