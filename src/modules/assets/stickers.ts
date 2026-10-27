export interface StickerPreset {
  id: string;
  name: string;
  emoji: string;
  dataUrl: string;
}

function svgToDataUrl(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export const STICKER_PRESETS: StickerPreset[] = [
  {
    id: 'rocket',
    name: 'Rocket',
    emoji: '🚀',
    dataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="240" height="240">
        <defs>
          <radialGradient id="rGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#4f46e5" />
            <stop offset="100%" stop-color="#312e81" />
          </radialGradient>
        </defs>
        <circle cx="60" cy="60" r="54" fill="url(#rGrad)" stroke="#a5b4fc" stroke-width="4" stroke-dasharray="6 3"/>
        <text x="60" y="78" font-size="58" text-anchor="middle" font-family="sans-serif">🚀</text>
      </svg>
    `),
  },
  {
    id: 'sparkles',
    name: 'Magic Sparkle',
    emoji: '✨',
    dataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="240" height="240">
        <defs>
          <linearGradient id="spkGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#db2777" />
            <stop offset="100%" stop-color="#701a75" />
          </linearGradient>
        </defs>
        <rect x="10" y="10" width="100" height="100" rx="30" fill="url(#spkGrad)" stroke="#f472b6" stroke-width="4"/>
        <text x="60" y="78" font-size="58" text-anchor="middle" font-family="sans-serif">✨</text>
      </svg>
    `),
  },
  {
    id: 'crown',
    name: 'VIP Crown',
    emoji: '👑',
    dataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="240" height="240">
        <circle cx="60" cy="60" r="54" fill="#78350f" stroke="#fbbf24" stroke-width="4"/>
        <text x="60" y="78" font-size="56" text-anchor="middle" font-family="sans-serif">👑</text>
      </svg>
    `),
  },
  {
    id: 'lightning',
    name: 'Bolt Power',
    emoji: '⚡',
    dataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="240" height="240">
        <polygon points="60,6 112,35 112,85 60,114 8,85 8,35" fill="#064e3b" stroke="#34d399" stroke-width="4"/>
        <text x="60" y="78" font-size="56" text-anchor="middle" font-family="sans-serif">⚡</text>
      </svg>
    `),
  },
  {
    id: 'fire',
    name: 'Flame Hot',
    emoji: '🔥',
    dataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="240" height="240">
        <circle cx="60" cy="60" r="54" fill="#7f1d1d" stroke="#f87171" stroke-width="4"/>
        <text x="60" y="78" font-size="56" text-anchor="middle" font-family="sans-serif">🔥</text>
      </svg>
    `),
  },
  {
    id: 'diamond',
    name: 'Diamond Pro',
    emoji: '💎',
    dataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="240" height="240">
        <rect x="12" y="12" width="96" height="96" rx="22" fill="#0c4a6e" stroke="#38bdf8" stroke-width="4" stroke-dasharray="8 4"/>
        <text x="60" y="78" font-size="54" text-anchor="middle" font-family="sans-serif">💎</text>
      </svg>
    `),
  },
];
