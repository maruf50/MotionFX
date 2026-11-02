/**
 * Universal Gradient Support for MotionFX Canvas Engine
 * Handles parsing CSS linear and radial gradients and generating native CanvasGradient instances.
 */

export interface ParsedGradientStop {
  color: string;
  offset: number;
}

export interface ParsedGradient {
  type: 'linear' | 'radial';
  angleDeg: number;
  stops: ParsedGradientStop[];
}

/**
 * Checks if a given string represents a CSS gradient.
 */
export function isGradient(color?: string | null): boolean {
  if (!color || typeof color !== 'string') return false;
  const s = color.trim().toLowerCase();
  return s.startsWith('linear-gradient(') || s.startsWith('radial-gradient(');
}

/**
 * Splits gradient argument list while respecting nested parentheses like rgba(...)
 */
function splitGradientArgs(inner: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = '';

  for (let i = 0; i < inner.length; i++) {
    const char = inner[i];
    if (char === '(') depth++;
    else if (char === ')') depth--;

    if (char === ',' && depth === 0) {
      parts.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  if (current.trim()) {
    parts.push(current.trim());
  }

  return parts;
}

/**
 * Parses CSS linear-gradient string into angle and color stops.
 */
export function parseLinearGradient(cssGradient: string): ParsedGradient | null {
  if (!cssGradient || typeof cssGradient !== 'string') return null;
  const trimmed = cssGradient.trim();
  const isRadial = trimmed.toLowerCase().startsWith('radial-gradient(');
  const isLinear = trimmed.toLowerCase().startsWith('linear-gradient(');

  if (!isLinear && !isRadial) return null;

  const firstParen = trimmed.indexOf('(');
  const lastParen = trimmed.lastIndexOf(')');
  if (firstParen === -1 || lastParen <= firstParen) return null;

  const inner = trimmed.substring(firstParen + 1, lastParen);
  const args = splitGradientArgs(inner);
  if (args.length === 0) return null;

  let angleDeg = 135; // Default pleasing diagonal
  let stopArgs = args;

  if (isLinear) {
    const first = args[0].toLowerCase().trim();
    if (first.endsWith('deg')) {
      angleDeg = parseFloat(first);
      stopArgs = args.slice(1);
    } else if (first.startsWith('to ')) {
      if (first === 'to right') angleDeg = 90;
      else if (first === 'to bottom') angleDeg = 180;
      else if (first === 'to left') angleDeg = 270;
      else if (first === 'to top') angleDeg = 0;
      else if (first.includes('bottom') && first.includes('right')) angleDeg = 135;
      else if (first.includes('bottom') && first.includes('left')) angleDeg = 225;
      else if (first.includes('top') && first.includes('right')) angleDeg = 45;
      else if (first.includes('top') && first.includes('left')) angleDeg = 315;
      stopArgs = args.slice(1);
    }
  } else {
    // Radial gradient
    if (args[0].toLowerCase().includes('circle') || args[0].toLowerCase().includes('ellipse')) {
      stopArgs = args.slice(1);
    }
  }

  if (stopArgs.length === 0) return null;

  // Parse color stops
  const stops: ParsedGradientStop[] = [];
  const rawStops: { color: string; offset?: number }[] = [];

  for (const stopStr of stopArgs) {
    const lastSpace = stopStr.lastIndexOf(' ');
    if (lastSpace > 0) {
      const maybeOffset = stopStr.substring(lastSpace + 1).trim();
      const maybeColor = stopStr.substring(0, lastSpace).trim();
      if (maybeOffset.endsWith('%')) {
        const pct = parseFloat(maybeOffset) / 100;
        rawStops.push({ color: maybeColor, offset: Math.max(0, Math.min(1, pct)) });
        continue;
      } else if (!isNaN(Number(maybeOffset))) {
        rawStops.push({ color: maybeColor, offset: Math.max(0, Math.min(1, Number(maybeOffset))) });
        continue;
      }
    }
    rawStops.push({ color: stopStr.trim() });
  }

  // Distribute unassigned offsets
  for (let i = 0; i < rawStops.length; i++) {
    const item = rawStops[i];
    let offset = item.offset;
    if (offset === undefined) {
      if (rawStops.length === 1) {
        offset = 0;
      } else {
        offset = i / (rawStops.length - 1);
      }
    }
    stops.push({ color: item.color, offset: Math.max(0, Math.min(1, offset)) });
  }

  return {
    type: isRadial ? 'radial' : 'linear',
    angleDeg,
    stops,
  };
}

/**
 * Resolves any color string: if it is a CSS gradient, creates and returns a CanvasGradient.
 * Otherwise returns the solid color string as-is.
 */
export function resolveColorOrGradient(
  ctx: CanvasRenderingContext2D,
  color: string | undefined | null,
  x: number,
  y: number,
  w: number,
  h: number
): string | CanvasGradient {
  if (!color || color === 'transparent') return 'transparent';
  if (!isGradient(color)) return color;

  try {
    const parsed = parseLinearGradient(color);
    if (!parsed || parsed.stops.length === 0) return color;

    const safeW = Math.max(1, Math.abs(w));
    const safeH = Math.max(1, Math.abs(h));

    if (parsed.type === 'radial') {
      const cx = x + safeW / 2;
      const cy = y + safeH / 2;
      const r = Math.max(safeW, safeH) / 2;
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      for (const stop of parsed.stops) {
        grad.addColorStop(stop.offset, stop.color);
      }
      return grad;
    }

    // Linear gradient
    const cx = x + safeW / 2;
    const cy = y + safeH / 2;
    const rad = ((parsed.angleDeg - 90) * Math.PI) / 180;
    const halfDiag = (Math.abs(safeW * Math.cos(rad)) + Math.abs(safeH * Math.sin(rad))) / 2;

    const x0 = cx - Math.cos(rad) * halfDiag;
    const y0 = cy - Math.sin(rad) * halfDiag;
    const x1 = cx + Math.cos(rad) * halfDiag;
    const y1 = cy + Math.sin(rad) * halfDiag;

    const grad = ctx.createLinearGradient(x0, y0, x1, y1);
    for (const stop of parsed.stops) {
      grad.addColorStop(stop.offset, stop.color);
    }
    return grad;
  } catch (err) {
    console.warn('Failed to resolve canvas gradient, falling back:', err);
    return color;
  }
}

