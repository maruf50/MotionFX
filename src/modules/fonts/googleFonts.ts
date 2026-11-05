export interface GoogleFont {
  name: string;
  category: 'sans-serif' | 'serif' | 'display' | 'monospace' | 'handwriting';
  weights: number[];
  popular?: boolean;
}

export const GOOGLE_FONTS_CATALOG: GoogleFont[] = [
  // Modern & Clean Sans-Serif
  { name: 'Inter', category: 'sans-serif', weights: [300, 400, 500, 600, 700, 800, 900], popular: true },
  { name: 'Roboto', category: 'sans-serif', weights: [300, 400, 500, 700, 900], popular: true },
  { name: 'Montserrat', category: 'sans-serif', weights: [300, 400, 500, 600, 700, 800, 900], popular: true },
  { name: 'Poppins', category: 'sans-serif', weights: [300, 400, 500, 600, 700, 800], popular: true },
  { name: 'Outfit', category: 'sans-serif', weights: [300, 400, 500, 600, 700, 800], popular: true },
  { name: 'Space Grotesk', category: 'sans-serif', weights: [300, 400, 500, 600, 700], popular: true },
  { name: 'Plus Jakarta Sans', category: 'sans-serif', weights: [400, 500, 600, 700, 800], popular: true },
  { name: 'Open Sans', category: 'sans-serif', weights: [300, 400, 600, 700] },
  { name: 'Lato', category: 'sans-serif', weights: [300, 400, 700, 900] },
  { name: 'Oswald', category: 'sans-serif', weights: [400, 500, 600, 700], popular: true },
  { name: 'Raleway', category: 'sans-serif', weights: [300, 400, 600, 700, 800] },
  { name: 'Work Sans', category: 'sans-serif', weights: [300, 400, 600, 700] },

  // Bold & Kinetic Display
  { name: 'Bebas Neue', category: 'display', weights: [400], popular: true },
  { name: 'Anton', category: 'display', weights: [400], popular: true },
  { name: 'Syne', category: 'display', weights: [400, 600, 700, 800], popular: true },
  { name: 'Righteous', category: 'display', weights: [400], popular: true },
  { name: 'Russo One', category: 'display', weights: [400] },
  { name: 'Bangers', category: 'display', weights: [400] },
  { name: 'Audiowide', category: 'display', weights: [400], popular: true },
  { name: 'Orbitron', category: 'display', weights: [400, 600, 700, 900], popular: true },
  { name: 'Black Han Sans', category: 'display', weights: [400] },

  // Elegant Serif
  { name: 'Playfair Display', category: 'serif', weights: [400, 600, 700, 800, 900], popular: true },
  { name: 'Cinzel', category: 'serif', weights: [400, 600, 700, 900], popular: true },
  { name: 'Merriweather', category: 'serif', weights: [300, 400, 700, 900] },
  { name: 'Lora', category: 'serif', weights: [400, 500, 600, 700] },
  { name: 'Cormorant Garamond', category: 'serif', weights: [400, 600, 700] },
  { name: 'DM Serif Display', category: 'serif', weights: [400], popular: true },
  { name: 'Prata', category: 'serif', weights: [400] },

  // Developer & Cyber Monospace
  { name: 'Fira Code', category: 'monospace', weights: [300, 400, 500, 600, 700], popular: true },
  { name: 'JetBrains Mono', category: 'monospace', weights: [300, 400, 500, 600, 700, 800], popular: true },
  { name: 'Space Mono', category: 'monospace', weights: [400, 700] },
  { name: 'VT323', category: 'monospace', weights: [400] },

  // Signature & Creative Script
  { name: 'Pacifico', category: 'handwriting', weights: [400], popular: true },
  { name: 'Dancing Script', category: 'handwriting', weights: [400, 600, 700], popular: true },
  { name: 'Caveat', category: 'handwriting', weights: [400, 600, 700], popular: true },
  { name: 'Great Vibes', category: 'handwriting', weights: [400] },
  { name: 'Satisfy', category: 'handwriting', weights: [400] },
];

export const FONT_CATEGORIES = [
  { id: 'all', label: 'All Fonts' },
  { id: 'sans-serif', label: 'Sans Serif' },
  { id: 'display', label: 'Display' },
  { id: 'serif', label: 'Serif' },
  { id: 'monospace', label: 'Monospace' },
  { id: 'handwriting', label: 'Script' },
] as const;

export type FontCategoryId = (typeof FONT_CATEGORIES)[number]['id'];

const loadedFontLinks = new Set<string>();
const loadedFontFaces = new Set<string>();
const inFlightFontPromises = new Map<string, Promise<void>>();

/**
 * Returns generic platform fallback font stack tailored to font category.
 */
export function getCategoryFallback(category?: string): string {
  switch (category) {
    case 'serif':
      return 'Georgia, "Times New Roman", Times, serif';
    case 'display':
      return 'Impact, "Arial Black", "Trebuchet MS", sans-serif';
    case 'monospace':
      return '"Courier New", Courier, monospace';
    case 'handwriting':
      return 'cursive, "Brush Script MT", sans-serif';
    case 'sans-serif':
    default:
      return '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  }
}

/**
 * Returns category-tailored fallback for a given font family.
 */
export function getFontFallback(fontFamily?: string): string {
  if (!fontFamily) return getCategoryFallback('sans-serif');
  const fontMeta = GOOGLE_FONTS_CATALOG.find(
    (f) => f.name.toLowerCase() === fontFamily.trim().toLowerCase()
  );
  return getCategoryFallback(fontMeta?.category);
}

/**
 * Normalizes font weight so Canvas doesn't fall back when requested weight
 * (like 'bold' on Bebas Neue or Pacifico) does not exist in the font face.
 */
export function getEffectiveFontWeight(
  fontFamily?: string,
  requestedWeight?: string | number
): string {
  if (!fontFamily) return String(requestedWeight || 'bold');
  const fontMeta = GOOGLE_FONTS_CATALOG.find(
    (f) => f.name.toLowerCase() === fontFamily.trim().toLowerCase()
  );
  if (!fontMeta || !Array.isArray(fontMeta.weights) || fontMeta.weights.length === 0) {
    return String(requestedWeight || 'bold');
  }

  // Single-weight fonts (e.g. 400 for Bebas Neue, Pacifico, Anton, etc.)
  if (fontMeta.weights.length === 1) {
    return 'normal';
  }

  let target = 400;
  if (typeof requestedWeight === 'number') {
    target = requestedWeight;
  } else if (requestedWeight === 'bold') {
    target = 700;
  } else if (requestedWeight === 'normal') {
    target = 400;
  } else {
    target = parseInt(String(requestedWeight), 10) || 400;
  }

  let closest = fontMeta.weights[0];
  let minDiff = Math.abs(closest - target);
  for (const w of fontMeta.weights) {
    const diff = Math.abs(w - target);
    if (diff < minDiff) {
      minDiff = diff;
      closest = w;
    }
  }

  return String(closest);
}

/**
 * Builds the exact CSS font string for Canvas Rendering Context,
 * guaranteeing accurate weights and distinct category fallbacks.
 */
export function buildCanvasFontString(
  fontFamily: string | undefined,
  fontSize: number,
  fontWeight: string | number | undefined,
  fontStyle: string | undefined
): string {
  const effectiveWeight = getEffectiveFontWeight(fontFamily, fontWeight);
  const styleStr = fontStyle === 'italic' ? 'italic ' : '';
  const cleanFamily = fontFamily?.trim();
  const fallback = getFontFallback(cleanFamily);

  if (!cleanFamily || cleanFamily === 'sans-serif' || cleanFamily === 'system-ui') {
    return `${styleStr}${effectiveWeight} ${fontSize}px ${fallback}`;
  }

  return `${styleStr}${effectiveWeight} ${fontSize}px "${cleanFamily}", ${fallback}`;
}

/**
 * Formulates the exact Google Fonts CSS2 URL for a given font family,
 * avoiding unsupported weight/axis ranges that trigger HTTP 400 Bad Request.
 */
export function getGoogleFontUrl(fontFamily: string): string {
  const cleanFamily = fontFamily.trim();
  const fontMeta = GOOGLE_FONTS_CATALOG.find(
    (f) => f.name.toLowerCase() === cleanFamily.toLowerCase()
  );
  const encodedName = cleanFamily.replace(/\s+/g, '+');

  if (fontMeta && fontMeta.weights.length > 1) {
    return `https://fonts.googleapis.com/css2?family=${encodedName}:wght@${fontMeta.weights.join(';')}&display=swap`;
  }
  return `https://fonts.googleapis.com/css2?family=${encodedName}&display=swap`;
}

/**
 * Dynamically injects Google Font link tag and notifies canvas when loaded.
 * Safely caches completed fonts to guarantee zero infinite render loops.
 */
export function loadGoogleFont(fontFamily: string): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();

  const cleanFamily = fontFamily.trim();
  if (!cleanFamily || cleanFamily === 'system-ui' || cleanFamily === 'sans-serif') {
    return Promise.resolve();
  }

  const cacheKey = cleanFamily.toLowerCase();

  // If already loaded and ready, immediately resolve with zero DOM work or event dispatching
  if (loadedFontFaces.has(cacheKey)) {
    return Promise.resolve();
  }

  // If already in flight, reuse existing promise
  const existingPromise = inFlightFontPromises.get(cacheKey);
  if (existingPromise) {
    return existingPromise;
  }

  const fontId = `google-font-${cacheKey.replace(/[^a-z0-9]/g, '-')}`;

  const loadPromise = new Promise<void>((resolve) => {
    let resolved = false;
    const notifyDone = () => {
      if (resolved) return;
      resolved = true;
      loadedFontFaces.add(cacheKey);
      inFlightFontPromises.delete(cacheKey);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('motionfx-font-loaded', { detail: { fontFamily: cleanFamily } })
        );
      }
      resolve();
    };

    if (!loadedFontLinks.has(fontId) && !document.getElementById(fontId)) {
      loadedFontLinks.add(fontId);
      const link = document.createElement('link');
      link.id = fontId;
      link.rel = 'stylesheet';
      link.href = getGoogleFontUrl(cleanFamily);
      link.onload = () => {
        // When CSS stylesheet is loaded, also test document.fonts if available
        if (typeof document !== 'undefined' && 'fonts' in document) {
          const effectiveWeight = getEffectiveFontWeight(cleanFamily, 'normal');
          (document as any).fonts
            .load(`${effectiveWeight} 48px "${cleanFamily}"`)
            .then(notifyDone)
            .catch(notifyDone);
        } else {
          notifyDone();
        }
      };
      link.onerror = () => {
        // Fall back gracefully
        notifyDone();
      };
      document.head.appendChild(link);
    } else {
      // Stylesheet already in document: wait for fonts.load
      if (typeof document !== 'undefined' && 'fonts' in document) {
        const effectiveWeight = getEffectiveFontWeight(cleanFamily, 'normal');
        (document as any).fonts
          .load(`${effectiveWeight} 48px "${cleanFamily}"`)
          .then(notifyDone)
          .catch(notifyDone);
      } else {
        notifyDone();
      }
    }
  });

  inFlightFontPromises.set(cacheKey, loadPromise);
  return loadPromise;
}

/**
 * Preloads the top popular Google fonts in background.
 */
export function preloadPopularFonts() {
  if (typeof window === 'undefined') return;
  GOOGLE_FONTS_CATALOG.forEach((f) => {
    if (!loadedFontFaces.has(f.name.toLowerCase())) {
      loadGoogleFont(f.name);
    }
  });
}
