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

/**
 * Dynamically injects Google Font link tag and waits for browser font loading.
 */
export function loadGoogleFont(fontFamily: string): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();

  const cleanFamily = fontFamily.trim();
  if (!cleanFamily || cleanFamily === 'system-ui' || cleanFamily === 'sans-serif') {
    return Promise.resolve();
  }

  const fontId = `google-font-${cleanFamily.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

  if (!loadedFontLinks.has(fontId) && !document.getElementById(fontId)) {
    loadedFontLinks.add(fontId);
    const link = document.createElement('link');
    link.id = fontId;
    link.rel = 'stylesheet';
    const encodedName = cleanFamily.replace(/\s+/g, '+');
    link.href = `https://fonts.googleapis.com/css2?family=${encodedName}:ital,wght@0,300..900;1,300..900&display=swap`;
    document.head.appendChild(link);
  }

  if (typeof document !== 'undefined' && 'fonts' in document) {
    return (document as any).fonts.ready.then(() => {});
  }

  return Promise.resolve();
}

/**
 * Preloads the top popular Google fonts in background.
 */
export function preloadPopularFonts() {
  if (typeof window === 'undefined') return;
  const popular = GOOGLE_FONTS_CATALOG.filter((f) => f.popular).slice(0, 10);
  popular.forEach((f) => loadGoogleFont(f.name));
}
