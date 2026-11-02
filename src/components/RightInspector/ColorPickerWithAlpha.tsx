'use client';

import React, { useState, useMemo } from 'react';
import { isGradient, parseLinearGradient } from '@/modules/renderers/gradients';
import { ArrowRight, ArrowDownRight, ArrowDown, ArrowUp, Sparkles } from 'lucide-react';

interface ColorPickerWithAlphaProps {
  label: string;
  color?: string;
  onChange: (color: string) => void;
  className?: string;
  showPresets?: boolean;
  allowGradient?: boolean;
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

const GRADIENT_PRESETS = [
  { name: 'Neon Purple', value: 'linear-gradient(135deg, #6366f1, #a855f7)' },
  { name: 'Sunset Bloom', value: 'linear-gradient(135deg, #f97316, #ec4899)' },
  { name: 'Ocean Cyan', value: 'linear-gradient(135deg, #06b6d4, #3b82f6)' },
  { name: 'Emerald', value: 'linear-gradient(135deg, #10b981, #06b6d4)' },
  { name: 'Cyberpunk', value: 'linear-gradient(135deg, #ec4899, #8b5cf6)' },
  { name: 'Fire Flame', value: 'linear-gradient(135deg, #ef4444, #f59e0b)' },
  { name: 'Midnight', value: 'linear-gradient(135deg, #1e1b4b, #4338ca)' },
  { name: 'Rose Gold', value: 'linear-gradient(135deg, #f43f5e, #fbbf24)' },
  { name: 'Matrix', value: 'linear-gradient(135deg, #22c55e, #059669)' },
  { name: 'Silver Glow', value: 'linear-gradient(135deg, #94a3b8, #e2e8f0)' },
];

const SOLID_PALETTE = [
  '#ffffff',
  '#94a3b8',
  '#6366f1',
  '#8b5cf6',
  '#ec4899',
  '#f43f5e',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#06b6d4',
  '#3b82f6',
  '#18181b',
];

export function ColorPickerWithAlpha({
  label,
  color = '#ffffff',
  onChange,
  className = '',
  showPresets = true,
  allowGradient = true,
}: ColorPickerWithAlphaProps) {
  const isGrad = useMemo(() => isGradient(color), [color]);
  const [mode, setMode] = useState<'solid' | 'gradient'>(isGrad ? 'gradient' : 'solid');

  // Keep internal mode in sync if external color changes between solid and gradient
  React.useEffect(() => {
    if (isGrad && mode !== 'gradient') {
      setMode('gradient');
    } else if (!isGrad && mode !== 'solid') {
      setMode('solid');
    }
  }, [isGrad]);

  // Gradient state parsing
  const parsedGrad = useMemo(() => {
    if (!isGrad) return null;
    return parseLinearGradient(color);
  }, [color, isGrad]);

  const gradAngle = parsedGrad?.angleDeg ?? 135;
  const gradColor1 = parsedGrad?.stops[0]?.color ?? '#6366f1';
  const gradColor2 = parsedGrad?.stops[1]?.color ?? (parsedGrad?.stops[0]?.color ? '#ec4899' : '#a855f7');

  const { hex: hex1, alpha: alpha1 } = useMemo(() => parseColorAndAlpha(gradColor1), [gradColor1]);
  const { hex: hex2, alpha: alpha2 } = useMemo(() => parseColorAndAlpha(gradColor2), [gradColor2]);

  // Solid state parsing
  const { hex: solidHex, alpha: solidAlpha } = useMemo(
    () => parseColorAndAlpha(isGrad ? gradColor1 : color),
    [color, isGrad, gradColor1]
  );

  const handleSolidHexChange = (newHex: string) => {
    onChange(formatColorWithAlpha(newHex, solidAlpha));
  };

  const handleSolidAlphaChange = (newAlpha: number) => {
    onChange(formatColorWithAlpha(solidHex, newAlpha));
  };

  const handleSwitchToGradient = () => {
    setMode('gradient');
    const start = color && !isGradient(color) && color !== 'transparent' ? color : '#6366f1';
    const end = '#ec4899';
    onChange(`linear-gradient(135deg, ${start}, ${end})`);
  };

  const handleSwitchToSolid = () => {
    setMode('solid');
    if (isGrad) {
      onChange(gradColor1);
    }
  };

  const updateGradient = (angle: number, c1: string, c2: string) => {
    onChange(`linear-gradient(${angle}deg, ${c1}, ${c2})`);
  };

  return (
    <div className={`bg-[#121214] p-2.5 rounded-lg border border-[#2c2c32] space-y-2 ${className}`}>
      {/* Top Header: Label, Mode Switchers, and Swatch */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold text-zinc-200">{label}</span>

        <div className="flex items-center gap-1.5">
          {allowGradient && (
            <div className="flex items-center bg-[#18181e] p-0.5 rounded border border-[#2a2a34] text-[9px] font-medium">
              <button
                type="button"
                onClick={handleSwitchToSolid}
                className={`px-1.5 py-0.5 rounded transition cursor-pointer ${
                  mode === 'solid'
                    ? 'bg-purple-600 text-white font-semibold shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Solid
              </button>
              <button
                type="button"
                onClick={handleSwitchToGradient}
                className={`px-1.5 py-0.5 rounded transition cursor-pointer flex items-center gap-0.5 ${
                  mode === 'gradient'
                    ? 'bg-purple-600 text-white font-semibold shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Sparkles className="w-2.5 h-2.5" />
                Gradient
              </button>
            </div>
          )}

          {/* Checkerboard Swatch Preview */}
          <div
            className="relative w-6 h-6 rounded border border-white/20 overflow-hidden shadow-inner flex-shrink-0"
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
                background: color === 'transparent' ? 'transparent' : color,
              }}
            />
            {mode === 'solid' && (
              <input
                type="color"
                value={solidHex}
                onChange={(e) => handleSolidHexChange(e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                title="Click to pick base RGB color"
              />
            )}
          </div>
        </div>
      </div>

      {/* ================= SOLID COLOR MODE ================= */}
      {mode === 'solid' && (
        <div className="space-y-2">
          {/* Hex + Alpha Readout */}
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center bg-[#18181e] border border-[#2b2b36] rounded px-2 py-1">
              <span className="text-[10px] text-zinc-500 font-mono mr-1">HEX</span>
              <input
                type="text"
                value={solidHex.toUpperCase()}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val.startsWith('#') || val.length <= 7) {
                    handleSolidHexChange(val.startsWith('#') ? val : `#${val}`);
                  }
                }}
                className="w-full bg-transparent text-white font-mono text-[10px] outline-none"
              />
            </div>
            <div className="flex items-center bg-[#18181e] border border-[#2b2b36] rounded px-2 py-1 min-w-[62px]">
              <span className="text-[10px] text-zinc-500 font-mono mr-1">A</span>
              <span className="text-[10px] font-mono text-purple-300">{solidAlpha}%</span>
            </div>
          </div>

          {/* Alpha Transparency Slider */}
          <div>
            <div className="flex justify-between text-[9px] text-zinc-400 mb-0.5">
              <span>Opacity / Transparency</span>
              <span className="font-mono text-zinc-300">{solidAlpha === 0 ? 'Clear (0%)' : `${solidAlpha}%`}</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={solidAlpha}
              onChange={(e) => handleSolidAlphaChange(parseInt(e.target.value, 10))}
              className="w-full accent-purple-500 cursor-pointer h-1.5 bg-[#202026] rounded appearance-none"
            />
          </div>

          {/* Quick Palette Swatches */}
          {showPresets && (
            <div className="grid grid-cols-6 gap-1 pt-0.5">
              {SOLID_PALETTE.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => onChange(formatColorWithAlpha(c, solidAlpha))}
                  className={`h-4 rounded border transition cursor-pointer ${
                    solidHex.toLowerCase() === c.toLowerCase()
                      ? 'border-purple-400 scale-105 shadow-sm ring-1 ring-purple-400'
                      : 'border-white/10 hover:border-white/40'
                  }`}
                  style={{ backgroundColor: c }}
                  title={c}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= GRADIENT MODE ================= */}
      {mode === 'gradient' && (
        <div className="space-y-2.5 pt-0.5">
          {/* Dual Color Stops Controls */}
          <div className="grid grid-cols-2 gap-2">
            {/* Color Stop 1 */}
            <div className="bg-[#18181e] p-1.5 rounded border border-[#2a2a34] space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[9px] text-zinc-400 font-medium">Start</span>
                <span className="text-[8px] font-mono text-purple-300">{alpha1}%</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div
                  className="relative w-5 h-5 rounded border border-white/20 overflow-hidden flex-shrink-0 cursor-pointer"
                  style={{ backgroundColor: hex1 }}
                >
                  <input
                    type="color"
                    value={hex1}
                    onChange={(e) => {
                      const updated1 = formatColorWithAlpha(e.target.value, alpha1);
                      updateGradient(gradAngle, updated1, gradColor2);
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={alpha1}
                  onChange={(e) => {
                    const updated1 = formatColorWithAlpha(hex1, parseInt(e.target.value, 10));
                    updateGradient(gradAngle, updated1, gradColor2);
                  }}
                  className="w-full accent-purple-500 cursor-pointer h-1 bg-[#24242e] rounded appearance-none"
                  title="Start opacity"
                />
              </div>
            </div>

            {/* Color Stop 2 */}
            <div className="bg-[#18181e] p-1.5 rounded border border-[#2a2a34] space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[9px] text-zinc-400 font-medium">End</span>
                <span className="text-[8px] font-mono text-purple-300">{alpha2}%</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div
                  className="relative w-5 h-5 rounded border border-white/20 overflow-hidden flex-shrink-0 cursor-pointer"
                  style={{ backgroundColor: hex2 }}
                >
                  <input
                    type="color"
                    value={hex2}
                    onChange={(e) => {
                      const updated2 = formatColorWithAlpha(e.target.value, alpha2);
                      updateGradient(gradAngle, gradColor1, updated2);
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={alpha2}
                  onChange={(e) => {
                    const updated2 = formatColorWithAlpha(hex2, parseInt(e.target.value, 10));
                    updateGradient(gradAngle, gradColor1, updated2);
                  }}
                  className="w-full accent-purple-500 cursor-pointer h-1 bg-[#24242e] rounded appearance-none"
                  title="End opacity"
                />
              </div>
            </div>
          </div>

          {/* Angle / Direction Selector */}
          <div>
            <div className="flex items-center justify-between text-[9px] text-zinc-400 mb-1">
              <span>Angle / Direction</span>
              <span className="font-mono text-purple-300">{gradAngle}°</span>
            </div>
            <div className="grid grid-cols-5 gap-1">
              {[
                { angle: 0, label: '0°', icon: <ArrowUp className="w-2.5 h-2.5" /> },
                { angle: 45, label: '45°', icon: <ArrowUp className="w-2.5 h-2.5 rotate-45" /> },
                { angle: 90, label: '90°', icon: <ArrowRight className="w-2.5 h-2.5" /> },
                { angle: 135, label: '135°', icon: <ArrowDownRight className="w-2.5 h-2.5" /> },
                { angle: 180, label: '180°', icon: <ArrowDown className="w-2.5 h-2.5" /> },
              ].map((dir) => (
                <button
                  key={dir.angle}
                  type="button"
                  onClick={() => updateGradient(dir.angle, gradColor1, gradColor2)}
                  className={`py-1 rounded text-[8px] font-mono transition border flex items-center justify-center gap-0.5 cursor-pointer ${
                    gradAngle === dir.angle
                      ? 'bg-purple-600/30 text-purple-200 border-purple-500/70 font-bold shadow-sm'
                      : 'bg-[#18181e] text-zinc-400 border-[#282834] hover:bg-[#20202a] hover:text-zinc-200'
                  }`}
                >
                  {dir.icon}
                  <span>{dir.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Curated Gradient Presets */}
          {showPresets && (
            <div className="space-y-1">
              <span className="text-[9px] text-zinc-400 block font-medium">Gradient Presets</span>
              <div className="grid grid-cols-5 gap-1">
                {GRADIENT_PRESETS.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => onChange(p.value)}
                    className="h-5 rounded border border-white/10 hover:border-white/50 transition cursor-pointer hover:scale-105 shadow-sm"
                    style={{ background: p.value }}
                    title={p.name}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
