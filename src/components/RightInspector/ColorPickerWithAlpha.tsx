'use client';

import React, { useMemo } from 'react';

interface ColorPickerWithAlphaProps {
  label: string;
  color?: string;
  onChange: (color: string) => void;
  className?: string;
  showPresets?: boolean;
}

/**
 * Parses any color format (hex, rgba, rgb, transparent) into 6-digit hex and alpha percentage (0-100).
 */
export function parseColorAndAlpha(input: string = '#ffffff'): { hex: string; alpha: number } {
  if (!input || input === 'transparent') {
    return { hex: '#000000', alpha: 0 };
  }
  const str = input.trim();

  // rgba(r, g, b, a) or rgb(r, g, b)
  const rgbaMatch = str.match(/rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?\s*\)/i);
  if (rgbaMatch) {
    const r = Math.min(255, parseInt(rgbaMatch[1], 10));
    const g = Math.min(255, parseInt(rgbaMatch[2], 10));
    const b = Math.min(255, parseInt(rgbaMatch[3], 10));
    const a = rgbaMatch[4] !== undefined ? Math.max(0, Math.min(1, parseFloat(rgbaMatch[4]))) : 1;
    const toHex = (n: number) => n.toString(16).padStart(2, '0');
    return {
      hex: `#${toHex(r)}${toHex(g)}${toHex(b)}`,
      alpha: Math.round(a * 100),
    };
  }

  // 8-digit hex #rrggbbaa
  if (str.startsWith('#') && str.length === 9) {
    const r = str.slice(1, 3);
    const g = str.slice(3, 5);
    const b = str.slice(5, 7);
    const aHex = str.slice(7, 9);
    const a = parseInt(aHex, 16) / 255;
    return {
      hex: `#${r}${g}${b}`,
      alpha: Math.round(a * 100),
    };
  }

  // 6-digit hex #rrggbb
  if (str.startsWith('#') && str.length === 7) {
    return { hex: str, alpha: 100 };
  }

  // 3-digit hex #rgb
  if (str.startsWith('#') && str.length === 4) {
    const r = str[1] + str[1];
    const g = str[2] + str[2];
    const b = str[3] + str[3];
    return { hex: `#${r}${g}${b}`, alpha: 100 };
  }

  return { hex: str.startsWith('#') ? str : '#ffffff', alpha: 100 };
}

/**
 * Combines a hex color and alpha percentage into rgba(r, g, b, a) or hex / transparent.
 */
export function formatColorWithAlpha(hex: string, alphaPct: number): string {
  const safeAlpha = Math.max(0, Math.min(100, Math.round(alphaPct)));
  if (safeAlpha === 0) return 'transparent';

  let cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map((c) => c + c).join('');
  }
  if (cleanHex.length >= 6) {
    const r = parseInt(cleanHex.slice(0, 2), 16) || 0;
    const g = parseInt(cleanHex.slice(2, 4), 16) || 0;
    const b = parseInt(cleanHex.slice(4, 6), 16) || 0;
    if (safeAlpha === 100) {
      return `#${cleanHex.slice(0, 6)}`;
    }
    const a = Number((safeAlpha / 100).toFixed(2));
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }
  return hex;
}

export function ColorPickerWithAlpha({
  label,
  color = '#ffffff',
  onChange,
  className = '',
  showPresets = true,
}: ColorPickerWithAlphaProps) {
  const { hex, alpha } = useMemo(() => parseColorAndAlpha(color), [color]);

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHex = e.target.value;
    onChange(formatColorWithAlpha(newHex, alpha));
  };

  const handleAlphaChange = (val: number) => {
    onChange(formatColorWithAlpha(hex, val));
  };

  return (
    <div className={`bg-[#121214] p-2 rounded border border-[#2c2c32] space-y-1.5 ${className}`}>
      {/* Top Row: Label, Swatch, and Alpha Badge */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium text-zinc-300">{label}</span>
        <div className="flex items-center gap-2">
          {/* Transparency checkerboard background + Color preview */}
          <div
            className="relative w-6 h-6 rounded border border-white/20 overflow-hidden cursor-pointer shadow-inner"
            style={{
              backgroundImage:
                'linear-gradient(45deg, #2a2a30 25%, transparent 25%), linear-gradient(-45deg, #2a2a30 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #2a2a30 75%), linear-gradient(-45deg, transparent 75%, #2a2a30 75%)',
              backgroundSize: '8px 8px',
              backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px',
            }}
          >
            <div
              className="absolute inset-0"
              style={{
                backgroundColor: color === 'transparent' ? 'transparent' : color,
              }}
            />
            <input
              type="color"
              value={hex}
              onChange={handleHexChange}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              title="Click to pick base RGB color"
            />
          </div>
          <span className="text-[10px] font-mono text-purple-300 bg-purple-950/50 px-1 py-0.5 rounded border border-purple-800/40">
            {alpha}%
          </span>
        </div>
      </div>

      {/* Alpha Slider */}
      <div>
        <div className="flex justify-between text-[9px] text-zinc-400 mb-0.5">
          <span>Alpha (Transparency)</span>
          <span className="font-mono text-zinc-300">{alpha === 0 ? 'Clear (0%)' : `${alpha}%`}</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          step="1"
          value={alpha}
          onChange={(e) => handleAlphaChange(parseInt(e.target.value, 10))}
          className="w-full accent-purple-500 cursor-pointer h-1.5 bg-[#202026] rounded appearance-none"
        />
      </div>

      {/* Quick Alpha Presets */}
      {showPresets && (
        <div className="grid grid-cols-5 gap-1 pt-0.5">
          {[
            { val: 0, label: '0%' },
            { val: 25, label: '25%' },
            { val: 50, label: '50%' },
            { val: 75, label: '75%' },
            { val: 100, label: '100%' },
          ].map((p) => (
            <button
              key={p.val}
              type="button"
              onClick={() => handleAlphaChange(p.val)}
              className={`py-0.5 rounded text-[8px] font-mono transition border ${
                alpha === p.val
                  ? 'bg-purple-600/30 text-purple-200 border-purple-500/60 font-bold'
                  : 'bg-[#18181c] text-zinc-400 border-[#282830] hover:bg-[#22222a] hover:text-zinc-200'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

