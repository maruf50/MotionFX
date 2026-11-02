export interface StickerPreset {
  id: string;
  name: string;
  emoji: string;
  category: 'popular' | 'badge' | 'reaction' | 'tech';
  dataUrl: string;
}

export function svgToDataUrl(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg.trim())}`;
}

export function createEmojiSticker(
  emoji: string,
  shape: 'circle' | 'squircle' | 'hexagon' | 'transparent' = 'squircle',
  bg1 = '#4f46e5',
  bg2 = '#7c3aed',
  stroke = '#a5b4fc'
): string {
  let shapeSvg = '';
  if (shape === 'circle') {
    shapeSvg = `<circle cx="60" cy="60" r="54" fill="url(#dynGrad)" stroke="${stroke}" stroke-width="4"/>`;
  } else if (shape === 'squircle') {
    shapeSvg = `<rect x="8" y="8" width="104" height="104" rx="28" fill="url(#dynGrad)" stroke="${stroke}" stroke-width="4"/>`;
  } else if (shape === 'hexagon') {
    shapeSvg = `<polygon points="60,6 112,35 112,85 60,114 8,85 8,35" fill="url(#dynGrad)" stroke="${stroke}" stroke-width="4"/>`;
  }

  const defs =
    shape !== 'transparent'
      ? `<defs>
          <linearGradient id="dynGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="${bg1}" />
            <stop offset="100%" stop-color="${bg2}" />
          </linearGradient>
        </defs>`
      : '';

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="240" height="240">
    ${defs}
    ${shapeSvg}
    <text x="60" y="76" font-size="54" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif">${emoji}</text>
  </svg>`;

  return svgToDataUrl(svg);
}

export const STICKER_PRESETS: StickerPreset[] = [
  {
    id: 'rocket',
    name: 'Rocket',
    emoji: '🚀',
    category: 'popular',
    dataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="240" height="240">
        <defs>
          <radialGradient id="rGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#4f46e5" />
            <stop offset="100%" stop-color="#312e81" />
          </radialGradient>
        </defs>
        <circle cx="60" cy="60" r="54" fill="url(#rGrad)" stroke="#a5b4fc" stroke-width="4" stroke-dasharray="6 3"/>
        <text x="60" y="78" font-size="56" text-anchor="middle" font-family="sans-serif">🚀</text>
      </svg>
    `),
  },
  {
    id: 'sparkles',
    name: 'Magic Sparkle',
    emoji: '✨',
    category: 'popular',
    dataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="240" height="240">
        <defs>
          <linearGradient id="spkGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#db2777" />
            <stop offset="100%" stop-color="#701a75" />
          </linearGradient>
        </defs>
        <rect x="10" y="10" width="100" height="100" rx="30" fill="url(#spkGrad)" stroke="#f472b6" stroke-width="4"/>
        <text x="60" y="78" font-size="56" text-anchor="middle" font-family="sans-serif">✨</text>
      </svg>
    `),
  },
  {
    id: 'crown',
    name: 'Crown',
    emoji: '👑',
    category: 'badge',
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
    category: 'popular',
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
    category: 'popular',
    dataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="240" height="240">
        <circle cx="60" cy="60" r="54" fill="#7f1d1d" stroke="#f87171" stroke-width="4"/>
        <text x="60" y="78" font-size="56" text-anchor="middle" font-family="sans-serif">🔥</text>
      </svg>
    `),
  },
  {
    id: 'diamond',
    name: 'Diamond',
    emoji: '💎',
    category: 'badge',
    dataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="240" height="240">
        <rect x="12" y="12" width="96" height="96" rx="22" fill="#0c4a6e" stroke="#38bdf8" stroke-width="4" stroke-dasharray="8 4"/>
        <text x="60" y="78" font-size="54" text-anchor="middle" font-family="sans-serif">💎</text>
      </svg>
    `),
  },
  {
    id: 'star',
    name: 'Super Star',
    emoji: '⭐',
    category: 'badge',
    dataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="240" height="240">
        <circle cx="60" cy="60" r="54" fill="#854d0e" stroke="#facc15" stroke-width="4"/>
        <text x="60" y="78" font-size="56" text-anchor="middle" font-family="sans-serif">⭐</text>
      </svg>
    `),
  },
  {
    id: 'target',
    name: 'Bullseye',
    emoji: '🎯',
    category: 'badge',
    dataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="240" height="240">
        <circle cx="60" cy="60" r="54" fill="#881337" stroke="#fb7185" stroke-width="4"/>
        <text x="60" y="78" font-size="56" text-anchor="middle" font-family="sans-serif">🎯</text>
      </svg>
    `),
  },
  {
    id: 'bulb',
    name: 'Idea Light',
    emoji: '💡',
    category: 'reaction',
    dataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="240" height="240">
        <rect x="10" y="10" width="100" height="100" rx="28" fill="#422006" stroke="#fde047" stroke-width="4"/>
        <text x="60" y="78" font-size="56" text-anchor="middle" font-family="sans-serif">💡</text>
      </svg>
    `),
  },
  {
    id: 'trophy',
    name: 'Champion Cup',
    emoji: '🏆',
    category: 'badge',
    dataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="240" height="240">
        <circle cx="60" cy="60" r="54" fill="#713f12" stroke="#f59e0b" stroke-width="4"/>
        <text x="60" y="78" font-size="56" text-anchor="middle" font-family="sans-serif">🏆</text>
      </svg>
    `),
  },
  {
    id: 'heart',
    name: 'Heart Glow',
    emoji: '❤️',
    category: 'reaction',
    dataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="240" height="240">
        <circle cx="60" cy="60" r="54" fill="#831843" stroke="#f43f5e" stroke-width="4"/>
        <text x="60" y="78" font-size="56" text-anchor="middle" font-family="sans-serif">❤️</text>
      </svg>
    `),
  },
  {
    id: 'check',
    name: 'Verified Badge',
    emoji: '✅',
    category: 'badge',
    dataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="240" height="240">
        <rect x="12" y="12" width="96" height="96" rx="24" fill="#064e3b" stroke="#10b981" stroke-width="4"/>
        <text x="60" y="78" font-size="54" text-anchor="middle" font-family="sans-serif">✅</text>
      </svg>
    `),
  },
  {
    id: 'bell',
    name: 'Notice Bell',
    emoji: '🔔',
    category: 'reaction',
    dataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="240" height="240">
        <circle cx="60" cy="60" r="54" fill="#1e1b4b" stroke="#818cf8" stroke-width="4"/>
        <text x="60" y="78" font-size="56" text-anchor="middle" font-family="sans-serif">🔔</text>
      </svg>
    `),
  },
  {
    id: 'party',
    name: 'Celebration',
    emoji: '🎉',
    category: 'reaction',
    dataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="240" height="240">
        <circle cx="60" cy="60" r="54" fill="#581c87" stroke="#c084fc" stroke-width="4"/>
        <text x="60" y="78" font-size="56" text-anchor="middle" font-family="sans-serif">🎉</text>
      </svg>
    `),
  },
  {
    id: 'shield',
    name: 'Security Shield',
    emoji: '🛡️',
    category: 'tech',
    dataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="240" height="240">
        <polygon points="60,6 112,35 112,85 60,114 8,85 8,35" fill="#1e293b" stroke="#38bdf8" stroke-width="4"/>
        <text x="60" y="78" font-size="56" text-anchor="middle" font-family="sans-serif">🛡️</text>
      </svg>
    `),
  },
  {
    id: 'robot',
    name: 'Cyber Bot',
    emoji: '🤖',
    category: 'tech',
    dataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="240" height="240">
        <rect x="10" y="10" width="100" height="100" rx="26" fill="#18181b" stroke="#a1a1aa" stroke-width="4"/>
        <text x="60" y="78" font-size="56" text-anchor="middle" font-family="sans-serif">🤖</text>
      </svg>
    `),
  },
  {
    id: 'trend',
    name: 'Growth Trend',
    emoji: '📈',
    category: 'tech',
    dataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="240" height="240">
        <circle cx="60" cy="60" r="54" fill="#042f2e" stroke="#14b8a6" stroke-width="4"/>
        <text x="60" y="78" font-size="56" text-anchor="middle" font-family="sans-serif">📈</text>
      </svg>
    `),
  },
  {
    id: 'game',
    name: 'Retro Game',
    emoji: '👾',
    category: 'tech',
    dataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="240" height="240">
        <circle cx="60" cy="60" r="54" fill="#3b0764" stroke="#d8b4fe" stroke-width="4"/>
        <text x="60" y="78" font-size="56" text-anchor="middle" font-family="sans-serif">👾</text>
      </svg>
    `),
  },
];
