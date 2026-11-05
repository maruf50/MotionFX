import { Layer } from '@/types/motion';
import { Easings } from '../easing/easings';
import { loadGoogleFont, buildCanvasFontString } from '../fonts/googleFonts';
import { getInterpolatedValue } from '../keyframes/evaluator';
import { resolveColorOrGradient } from './gradients';

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*<>[]{}';

/**
 * Renders kinetic text layers with various motion effects, Google Fonts,
 * and keyframable animation progress (0-100%) and animation speed.
 */
export function renderTextLayer(
  ctx: CanvasRenderingContext2D,
  layer: Layer,
  time: number,
  totalDuration: number,
  tr?: { scaleX: number; scaleY: number }
) {
  if (layer.fontFamily) {
    loadGoogleFont(layer.fontFamily);
  }

  const fontSize = layer.fontSize || 48;
  const str = layer.text || 'TEXT';
  const effect = layer.textEffect || 'none';
  const speed = Math.max(0.1, Math.min(10, layer.textSpeed || 1.0));

  // Keyframable text animation progress (0 to 100%)
  const hasTextKf = Boolean(layer.keyframes?.textProgress && layer.keyframes.textProgress.length > 0);
  const rawProgress = getInterpolatedValue(layer, 'textProgress', time);
  const animProgress = Math.max(0, Math.min(1, rawProgress / 100));

  // Determine effective progress 'p' (0.0 to 1.0)
  // 1) If keyframed on textProgress: always use animProgress evaluated at time.
  // 2) If not keyframed:
  //    - If the user explicitly adjusted the slider (< 100 or manual setting), directly follow animProgress.
  //    - If textProgress is 100 (default) and time > 0 for a motion effect, preview auto-play based on speed.
  //    - Otherwise (or for 'none'), use animProgress.
  let p = animProgress;
  if (!hasTextKf) {
    if (layer.textProgress !== undefined && layer.textProgress < 100) {
      p = animProgress;
    } else if (effect !== 'none' && time > 0) {
      const effectDuration = Math.min(totalDuration * 0.6, 2.0 / speed);
      p = Math.min(1, Math.max(0, (time * speed) / (effectDuration || 2.0)));
    } else {
      p = animProgress;
    }
  }

  ctx.font = buildCanvasFontString(layer.fontFamily, fontSize, layer.fontWeight, layer.fontStyle);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const estWidth = Math.max(40, ctx.measureText(str).width);
  ctx.fillStyle = resolveColorOrGradient(
    ctx,
    layer.fill || '#ffffff',
    -estWidth / 2,
    -fontSize / 2,
    estWidth,
    fontSize
  );

  const drawStrokeIfEnabled = (textToStroke: string, ox = 0, oy = 0) => {
    if (layer.borderWidth > 0 && layer.borderStyle !== 'none' && layer.stroke) {
      const avgScale = (Math.abs(tr?.scaleX ?? 1) + Math.abs(tr?.scaleY ?? 1)) / 2 || 1;
      ctx.lineWidth = layer.borderWidth / avgScale;
      ctx.strokeStyle = resolveColorOrGradient(
        ctx,
        layer.stroke,
        -estWidth / 2,
        -fontSize / 2,
        estWidth,
        fontSize
      );
      ctx.strokeText(textToStroke, ox, oy);
    }
  };

  if (effect === 'none') {
    const charCount = p >= 1 ? str.length : Math.ceil(p * str.length);
    const displayStr = str.substring(0, charCount);
    ctx.fillText(displayStr, 0, 0);
    drawStrokeIfEnabled(displayStr);
    return;
  }

  if (effect === 'typewriter') {
    // Reveal letters progressively based on progress & speed
    const charCount = p >= 1 ? str.length : Math.floor(p * str.length);
    const visibleSub = str.substring(0, charCount);
    const showCursor = p < 1 && Math.floor(time * 3.5 * speed) % 2 === 0;
    const fullText = visibleSub + (showCursor ? '▍' : '');

    ctx.fillText(fullText, 0, 0);
    drawStrokeIfEnabled(fullText);
    return;
  }

  if (effect === 'morph') {
    // Cyber Glitch / Scramble Morph between initial text and target word
    const target = layer.morphTarget || 'FUTURE MOTION';
    const maxLen = Math.max(str.length, target.length);
    const morphProgress = p;

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
        // Scramble phase with speed-scaled jitter
        const randIdx = Math.floor((time * 30 * speed + i * 13) % GLYPHS.length);
        displayStr += GLYPHS[randIdx];
      }
    }

    const outputStr = displayStr.trim();
    ctx.fillText(outputStr, 0, 0);
    drawStrokeIfEnabled(outputStr);
    return;
  }

  if (effect === 'wave') {
    // Per-letter undulating sine wave modulated by progress & speed
    const waveIntensity = p;
    const totalW = ctx.measureText(str).width;
    let curX = -totalW / 2;
    ctx.textAlign = 'left';

    for (let i = 0; i < str.length; i++) {
      const ch = str[i];
      const cw = ctx.measureText(ch).width;
      const yOffset = Math.sin(time * 6 * speed + i * 0.5) * (fontSize * 0.22) * waveIntensity;
      ctx.fillText(ch, curX, yOffset);
      if (layer.borderWidth > 0 && layer.borderStyle !== 'none' && layer.stroke) {
        const avgScale = (Math.abs(tr?.scaleX ?? 1) + Math.abs(tr?.scaleY ?? 1)) / 2 || 1;
        ctx.lineWidth = layer.borderWidth / avgScale;
        ctx.strokeStyle = resolveColorOrGradient(
          ctx,
          layer.stroke,
          -estWidth / 2,
          -fontSize / 2,
          estWidth,
          fontSize
        );
        ctx.strokeText(ch, curX, yOffset);
      }
      curX += cw;
    }
    return;
  }

  if (effect === 'cascade') {
    // Staggered letter pop-in with bouncy backOut easing driven by progress
    const totalW = ctx.measureText(str).width;
    let curX = -totalW / 2;
    ctx.textAlign = 'left';

    const charStep = 1 / Math.max(1, str.length);

    for (let i = 0; i < str.length; i++) {
      const ch = str[i];
      const cw = ctx.measureText(ch).width;
      const charStart = i * charStep * 0.7;
      const localP = Math.max(0, Math.min(1, (p - charStart) / 0.3));
      const s = Easings.backOut(localP);

      ctx.save();
      ctx.translate(curX + cw / 2, (1 - s) * 25);
      ctx.scale(s, s);
      ctx.globalAlpha *= localP;
      ctx.textAlign = 'center';
      ctx.fillText(ch, 0, 0);
      if (layer.borderWidth > 0 && layer.borderStyle !== 'none' && layer.stroke) {
        const avgScale = (Math.abs(tr?.scaleX ?? 1) + Math.abs(tr?.scaleY ?? 1)) / 2 || 1;
        ctx.lineWidth = layer.borderWidth / avgScale;
        ctx.strokeStyle = resolveColorOrGradient(
          ctx,
          layer.stroke,
          -estWidth / 2,
          -fontSize / 2,
          estWidth,
          fontSize
        );
        ctx.strokeText(ch, 0, 0);
      }
      ctx.restore();

      curX += cw;
    }
    return;
  }

  if (effect === 'neonPulse') {
    // Glowing neon outline with pulsating intensity modulated by progress and speed
    const pulse = (Math.sin(time * 5 * speed) + 1) / 2; // 0 to 1
    const pulseIntensity = p;

    ctx.save();
    ctx.shadowColor = layer.stroke || '#ec4899';
    ctx.shadowBlur = (10 + pulse * 20) * pulseIntensity;
    ctx.fillText(str, 0, 0);
    ctx.lineWidth = 2 + pulse * 2;
    ctx.strokeStyle = layer.stroke || '#f472b6';
    ctx.strokeText(str, 0, 0);
    ctx.restore();
  }
}
