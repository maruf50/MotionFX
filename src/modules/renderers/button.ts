import { Layer, ButtonIcon } from '@/types/motion';
import { drawRoundedRect } from './shapes';
import { getInterpolatedValue } from '../keyframes/evaluator';
import { resolveColorOrGradient } from './gradients';

/**
 * Draws chamfered (angled / cut) corners on a rectangle.
 */
function drawChamferRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  chamfer: number
) {
  const c = Math.min(Math.min(w, h) / 3, Math.max(0, chamfer));
  ctx.beginPath();
  ctx.moveTo(x + c, y);
  ctx.lineTo(x + w - c, y);
  ctx.lineTo(x + w, y + c);
  ctx.lineTo(x + w, y + h - c);
  ctx.lineTo(x + w - c, y + h);
  ctx.lineTo(x + c, y + h);
  ctx.lineTo(x, y + h - c);
  ctx.lineTo(x, y + c);
  ctx.closePath();
}

/**
 * Draws vector button icons or custom emojis.
 */
function drawButtonIcon(
  ctx: CanvasRenderingContext2D,
  icon: ButtonIcon,
  size: number,
  color: string,
  customEmoji?: string
) {
  if (icon === 'none') return;

  ctx.save();
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const hs = Math.max(1, size / 2);

  if (icon === 'plus') {
    ctx.beginPath();
    ctx.moveTo(0, -hs);
    ctx.lineTo(0, hs);
    ctx.moveTo(-hs, 0);
    ctx.lineTo(hs, 0);
    ctx.stroke();
  } else if (icon === 'arrow') {
    ctx.beginPath();
    ctx.moveTo(-hs * 0.8, 0);
    ctx.lineTo(hs * 0.8, 0);
    ctx.lineTo(hs * 0.3, -hs * 0.5);
    ctx.moveTo(hs * 0.8, 0);
    ctx.lineTo(hs * 0.3, hs * 0.5);
    ctx.stroke();
  } else if (icon === 'check') {
    ctx.beginPath();
    ctx.moveTo(-hs * 0.7, 0);
    ctx.lineTo(-hs * 0.15, hs * 0.6);
    ctx.lineTo(hs * 0.8, -hs * 0.6);
    ctx.stroke();
  } else if (icon === 'play') {
    ctx.beginPath();
    ctx.moveTo(-hs * 0.45, -hs * 0.65);
    ctx.lineTo(hs * 0.65, 0);
    ctx.lineTo(-hs * 0.45, hs * 0.65);
    ctx.closePath();
    ctx.fill();
  } else if (icon === 'sparkle' || icon === 'star') {
    ctx.beginPath();
    for (let i = 0; i < 4; i++) {
      const a = (i * Math.PI * 2) / 4;
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(a) * hs, Math.sin(a) * hs);
    }
    ctx.stroke();
  } else if (icon === 'heart') {
    ctx.beginPath();
    ctx.arc(-hs * 0.35, -hs * 0.3, hs * 0.35, Math.PI, 0, false);
    ctx.arc(hs * 0.35, -hs * 0.3, hs * 0.35, Math.PI, 0, false);
    ctx.lineTo(0, hs * 0.6);
    ctx.closePath();
    ctx.fill();
  } else if (icon === 'download') {
    ctx.beginPath();
    ctx.moveTo(0, -hs * 0.7);
    ctx.lineTo(0, hs * 0.3);
    ctx.lineTo(-hs * 0.4, -hs * 0.1);
    ctx.moveTo(0, hs * 0.3);
    ctx.lineTo(hs * 0.4, -hs * 0.1);
    ctx.moveTo(-hs * 0.6, hs * 0.65);
    ctx.lineTo(hs * 0.6, hs * 0.65);
    ctx.stroke();
  } else if (icon === 'external') {
    ctx.beginPath();
    ctx.moveTo(-hs * 0.5, hs * 0.5);
    ctx.lineTo(hs * 0.5, -hs * 0.5);
    ctx.moveTo(0, -hs * 0.5);
    ctx.lineTo(hs * 0.5, -hs * 0.5);
    ctx.lineTo(hs * 0.5, 0);
    ctx.stroke();
  } else if (icon === 'cart') {
    ctx.beginPath();
    ctx.moveTo(-hs * 0.7, -hs * 0.5);
    ctx.lineTo(-hs * 0.4, -hs * 0.5);
    ctx.lineTo(-hs * 0.1, hs * 0.2);
    ctx.lineTo(hs * 0.6, hs * 0.2);
    ctx.lineTo(hs * 0.8, -hs * 0.3);
    ctx.lineTo(-hs * 0.3, -hs * 0.3);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(-hs * 0.05, hs * 0.5, 2, 0, Math.PI * 2);
    ctx.arc(hs * 0.45, hs * 0.5, 2, 0, Math.PI * 2);
    ctx.fill();
  } else if (icon === 'customEmoji') {
    ctx.font = `${Math.round(size * 0.85)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(customEmoji || '⚡', 0, 1);
  } else {
    // Default bell/dot
    ctx.beginPath();
    ctx.arc(0, 0, hs * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Renders Animated & Highly Customizable UI Buttons.
 * Supports pill, rounded squircle, sharp rectangle, chamfer cut, floating circular FAB,
 * gradient, outline, frosted glass, and toggle switches.
 */
export function renderButtonShape(
  ctx: CanvasRenderingContext2D,
  layer: Layer,
  time: number,
  tr?: { scaleX: number; scaleY: number }
) {
  const safeTime = Math.max(0, time);
  const btnStyle = layer.btnStyle || 'pill';

  let w = Math.max(40, layer.width || 160);
  let h = Math.max(28, layer.height || 48);

  // If floating circular button, force equal dimensions
  if (btnStyle === 'floating') {
    const dim = Math.max(w, h);
    w = dim;
    h = dim;
  }

  const text = layer.btnText ?? 'Button';
  const subtext = layer.btnSubtext ?? '';
  const hideText = layer.btnHideText ?? false;
  const fontSize = layer.btnFontSize ?? Math.max(11, Math.round(h * 0.33));
  const fontFamily = layer.btnFontFamily ? `"${layer.btnFontFamily}", ` : '';
  const fontWeight = layer.btnFontWeight || 'bold';
  const subtextSize = layer.btnSubtextSize ?? Math.max(8, Math.round(fontSize * 0.65));
  const icon = layer.btnIcon || 'arrow';
  const iconPos = layer.btnIconPosition || (btnStyle === 'floating' ? 'iconOnly' : 'left');
  const customEmoji = layer.btnCustomEmoji || '⚡';
  const state = layer.btnState || 'on';
  const anim = layer.btnAnimation || 'pulseGlow';
  const speed = Math.max(0.2, layer.btnAnimSpeed ?? 1.5);
  const color = layer.btnColor || layer.fill || '#6366f1';
  const onColor = layer.btnOnColor || color;
  const offColor = layer.btnOffColor || '#27272a';
  const knobColor = layer.btnKnobColor || '#ffffff';
  const gradientEnd = layer.btnGradientEnd || '#a855f7';
  const textColor = layer.btnTextColor || '#ffffff';
  const subtextColor = layer.btnSubtextColor || 'rgba(255, 255, 255, 0.65)';
  const borderWidth = layer.btnBorderWidth ?? (btnStyle === 'outline' ? 2 : layer.borderWidth ?? 1);
  const borderColor = layer.btnBorderColor || (btnStyle === 'outline' ? (state === 'off' ? offColor : onColor) : 'rgba(255, 255, 255, 0.25)');
  const borderStyle = layer.borderStyle || 'solid';
  const hasGlow = layer.btnGlow ?? false;
  const glowColor = layer.btnGlowColor || onColor;

  const hw = w / 2;
  const hh = h / 2;

  // Compute corner radius based on button style
  let radius = Math.min(hw, hh); // default pill
  if (btnStyle === 'rounded') {
    radius = Math.max(0, Math.min(hh, layer.btnBorderRadius ?? 12));
  } else if (btnStyle === 'rect') {
    radius = 0;
  } else if (btnStyle === 'floating') {
    radius = hw;
  }

  ctx.save();

  const hasButtonKf = (layer.keyframes?.buttonProgress?.length ?? 0) > 0;
  const kfFactor = hasButtonKf
    ? Math.max(0, Math.min(100, getInterpolatedValue(layer, 'buttonProgress', safeTime))) / 100
    : null;

  // Animation motion offsets / scalings (driven by keyframes if set)
  if (anim === 'bounce') {
    const bounceOffset =
      kfFactor !== null
        ? Math.sin(kfFactor * Math.PI * 4) * 6
        : Math.sin(safeTime * speed * 3) * 5;
    ctx.translate(0, bounceOffset);
  } else if (anim === 'clickPress') {
    if (kfFactor !== null) {
      const pressScale = 0.92 + 0.08 * (kfFactor < 0.5 ? 1 - kfFactor * 2 : (kfFactor - 0.5) * 2);
      ctx.scale(pressScale, pressScale);
    } else {
      const cycle = (safeTime * speed) % 2;
      if (cycle < 0.28) {
        const pressScale = 0.93 + 0.07 * (cycle / 0.28);
        ctx.scale(pressScale, pressScale);
      }
    }
  }

  // Floating Action Button or Pulse Glow Ring
  if (btnStyle === 'floating' || anim === 'pulseGlow') {
    const pulseP = kfFactor !== null ? kfFactor : (((safeTime * speed) % 1) + 1) % 1;
    const ringRadius = Math.max(0.1, radius + pulseP * 24);
    const ringAlpha = Math.max(0, Math.min(1, (1 - pulseP) * 0.55));

    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, ringRadius, 0, Math.PI * 2);
    ctx.strokeStyle = color;
    ctx.globalAlpha = ringAlpha;
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.restore();
  }

  // 1. Toggle Switch Button
  if (btnStyle === 'toggle') {
    const isChecked = state === 'on';
    const switchW = Math.max(70, w);
    const switchH = Math.max(34, h);
    const sHw = switchW / 2;
    const sHh = switchH / 2;
    const knobRadius = Math.max(2, sHh - 4);

    // Animated knob transition
    const toggleCycle = (Math.sin(safeTime * speed * 2) + 1) / 2;
    const activeFactor = layer.keyframes?.buttonProgress?.length
      ? Math.min(1, Math.max(0, getInterpolatedValue(layer, 'buttonProgress', safeTime) / 100))
      : anim === 'toggleSwitch'
      ? toggleCycle
      : isChecked
      ? 1
      : 0;

    // Background track
    drawRoundedRect(ctx, -sHw, -sHh, switchW, switchH, sHh);
    const trackColor = activeFactor > 0.5 ? onColor : offColor;
    ctx.fillStyle = trackColor;
    ctx.fill();

    ctx.strokeStyle = activeFactor > 0.5 ? onColor : 'rgba(255, 255, 255, 0.18)';
    ctx.lineWidth = Math.max(1, borderWidth);
    ctx.stroke();

    // Sliding Knob
    const minKnobX = -sHw + sHh;
    const maxKnobX = sHw - sHh;
    const knobX = minKnobX + (maxKnobX - minKnobX) * activeFactor;

    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetY = 2;

    ctx.beginPath();
    ctx.arc(knobX, 0, knobRadius, 0, Math.PI * 2);
    ctx.fillStyle = knobColor;
    ctx.fill();

    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;

    // Label below toggle
    if (!hideText && text) {
      ctx.fillStyle = textColor;
      ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(text, 0, sHh + 6);
    }

    ctx.restore();
    return;
  }

  // 2. Button Background Path (Chamfer vs Rounded)
  if (btnStyle === 'chamfer') {
    const chamferSize = Math.max(6, Math.min(hh * 0.8, layer.btnBorderRadius ?? 10));
    drawChamferRect(ctx, -hw, -hh, w, h, chamferSize);
  } else {
    drawRoundedRect(ctx, -hw, -hh, w, h, radius);
  }

  // Optional Neon Glow Shadow
  if (hasGlow) {
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 18;
  }

  const effectiveColor = state === 'off' ? offColor : onColor;

  // Background Fills (Gradient, Outline, Glass, Solid)
  if (btnStyle === 'gradient') {
    const grad = ctx.createLinearGradient(-hw, -hh, hw, hh);
    grad.addColorStop(0, state === 'off' ? offColor : color);
    grad.addColorStop(1, state === 'off' ? '#18181b' : gradientEnd);
    ctx.fillStyle = grad;
    ctx.fill();
  } else if (btnStyle === 'outline') {
    ctx.fillStyle = state === 'off' ? 'rgba(15, 15, 20, 0.7)' : 'rgba(18, 18, 24, 0.6)';
    ctx.fill();
  } else if (btnStyle === 'glass') {
    // Frosted Glassmorphism
    ctx.fillStyle = state === 'off' ? 'rgba(30, 30, 40, 0.25)' : 'rgba(255, 255, 255, 0.08)';
    ctx.fill();

    // Glass specular top sheen
    ctx.save();
    drawRoundedRect(ctx, -hw, -hh, w, h, radius);
    ctx.clip();
    const glassGrad = ctx.createLinearGradient(-hw, -hh, -hw, 0);
    glassGrad.addColorStop(0, 'rgba(255, 255, 255, 0.22)');
    glassGrad.addColorStop(1, 'rgba(255, 255, 255, 0.02)');
    ctx.fillStyle = glassGrad;
    ctx.fillRect(-hw, -hh, w, hh);
    ctx.restore();
  } else {
    // Solid / Pill / Floating / Chamfer
    ctx.fillStyle = resolveColorOrGradient(ctx, effectiveColor, -hw, -hh, w, h);
    ctx.fill();
  }

  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;

  // Button Border Stroke
  if (borderWidth > 0) {
    ctx.save();
    if (borderStyle === 'dashed') {
      ctx.setLineDash([6, 4]);
    } else if (borderStyle === 'dotted') {
      ctx.setLineDash([2, 3]);
    } else {
      ctx.setLineDash([]);
    }
    ctx.strokeStyle = resolveColorOrGradient(ctx, borderColor, -hw, -hh, w, h);
    ctx.lineWidth = borderWidth;
    ctx.stroke();
    ctx.restore();
  }

  // 3. Shimmer Reflection Light Beam Animation
  if (anim === 'shimmer') {
    const shimmerP = (((safeTime * speed * 0.8) % 1.5) - 0.25);
    const shimmerX = -hw + shimmerP * (w * 1.5);

    ctx.save();
    if (btnStyle === 'chamfer') {
      const chamferSize = Math.max(6, Math.min(hh * 0.8, layer.btnBorderRadius ?? 10));
      drawChamferRect(ctx, -hw, -hh, w, h, chamferSize);
    } else {
      drawRoundedRect(ctx, -hw, -hh, w, h, radius);
    }
    ctx.clip();

    const shimGrad = ctx.createLinearGradient(shimmerX - 30, -hh, shimmerX + 30, hh);
    shimGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
    shimGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.38)');
    shimGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.fillStyle = shimGrad;
    ctx.fillRect(shimmerX - 45, -hh, 90, h);
    ctx.restore();
  }

  // 4. Concentric Ripple Click Wave Animation
  if (anim === 'ripple') {
    const ripCycle = ((safeTime * speed) % 1.2) / 1.2;
    const ripRadius = Math.max(0.1, ripCycle * hw * 1.3);
    const ripAlpha = Math.max(0, (1 - ripCycle) * 0.4);

    ctx.save();
    if (btnStyle === 'chamfer') {
      const chamferSize = Math.max(6, Math.min(hh * 0.8, layer.btnBorderRadius ?? 10));
      drawChamferRect(ctx, -hw, -hh, w, h, chamferSize);
    } else {
      drawRoundedRect(ctx, -hw, -hh, w, h, radius);
    }
    ctx.clip();
    ctx.beginPath();
    ctx.arc(0, 0, ripRadius, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.globalAlpha = ripAlpha;
    ctx.fill();
    ctx.restore();
  }

  // 5. Button Content (Icon, Text, Subtext)
  const iconSize = Math.max(12, Math.min(22, Math.round(h * 0.38)));
  const hasIcon = icon !== 'none';

  if (btnStyle === 'floating' || iconPos === 'iconOnly' || hideText) {
    // Centered Icon Only
    if (hasIcon) {
      drawButtonIcon(
        ctx,
        icon,
        Math.round(Math.min(w, h) * 0.45),
        textColor,
        customEmoji
      );
    }
  } else {
    const hasText = !hideText && text.trim().length > 0;
    const isRightIcon = iconPos === 'right';

    ctx.save();

    // Determine font & text measurements
    ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}sans-serif`;
    const textMetrics = hasText ? ctx.measureText(text) : { width: 0 };
    const textW = textMetrics.width;

    // Total content width for balanced centering
    const iconSpacing = hasIcon && hasText ? 8 : 0;
    const totalContentW = textW + (hasIcon ? iconSize + iconSpacing : 0);
    const startContentX = -totalContentW / 2;

    let iconX = 0;
    let textX = 0;

    if (isRightIcon) {
      textX = startContentX + textW / 2;
      iconX = startContentX + textW + iconSpacing + iconSize / 2;
    } else {
      iconX = startContentX + iconSize / 2;
      textX = startContentX + iconSize + iconSpacing + textW / 2;
    }

    // Draw Icon
    if (hasIcon) {
      ctx.save();
      ctx.translate(iconX, subtext ? -3 : 0);
      drawButtonIcon(ctx, icon, iconSize, textColor, customEmoji);
      ctx.restore();
    }

    // Draw Main Text
    if (hasText) {
      ctx.fillStyle = textColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, textX, subtext ? -4 : 0);

      // Draw Subtext / Badge
      if (subtext) {
        ctx.fillStyle = subtextColor;
        ctx.font = `600 ${subtextSize}px ${fontFamily}sans-serif`;
        ctx.fillText(subtext, textX, Math.round(fontSize * 0.65));
      }
    }

    ctx.restore();
  }

  ctx.restore();
}
