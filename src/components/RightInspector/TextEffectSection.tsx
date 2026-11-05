'use client';

import React from 'react';
import { Wand2, Diamond, Play, Zap } from 'lucide-react';
import { useMotion } from '@/context/MotionContext';
import { TextEffect } from '@/types/motion';
import { GoogleFontPicker } from '@/components/common/GoogleFontPicker';
import { ColorPickerWithAlpha } from './ColorPickerWithAlpha';
import { getInterpolatedValue, hasKeyframeAtTime } from '@/modules/keyframes/evaluator';

export function TextEffectSection() {
  const {
    selectedLayer,
    updateLayer,
    currentTime,
    setAnimPropValue,
    toggleKeyframe,
    addStartAndEndKeyframes,
  } = useMotion();

  if (!selectedLayer || selectedLayer.type !== 'text') return null;

  const progress = getInterpolatedValue(selectedLayer, 'textProgress', currentTime);
  const hasKf = hasKeyframeAtTime(selectedLayer, 'textProgress', currentTime);

  return (
    <div className="bg-[#1a1a1e] p-2.5 rounded border border-[#28282e] space-y-2.5">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
        <Wand2 className="w-3 h-3 text-purple-400" />
        Kinetic Text & Effects
      </span>

      {/* Text String */}
      <div>
        <label className="text-[11px] text-zinc-400 block mb-1">Text Content</label>
        <input
          type="text"
          value={selectedLayer.text || ''}
          onChange={(e) => updateLayer(selectedLayer.id, { text: e.target.value })}
          className="w-full bg-[#121214] border border-[#2c2c32] focus:border-purple-500 rounded px-2 py-1 text-xs font-sans text-white outline-none"
        />
      </div>

      {/* Google Font Picker */}
      <div>
        <label className="text-[11px] text-zinc-400 block mb-1">Google Font</label>
        <GoogleFontPicker
          value={selectedLayer.fontFamily || 'Inter'}
          onChange={(fontFamily) => updateLayer(selectedLayer.id, { fontFamily })}
        />
      </div>

      {/* Font Weight & Style */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[11px] text-zinc-400 block mb-1">Font Weight</label>
          <select
            value={selectedLayer.fontWeight || 'bold'}
            onChange={(e) => updateLayer(selectedLayer.id, { fontWeight: e.target.value })}
            className="w-full bg-[#121214] border border-[#2c2c32] focus:border-purple-500 rounded px-2 py-1 text-xs text-white outline-none cursor-pointer"
          >
            <option value="300">Light (300)</option>
            <option value="normal">Regular (400)</option>
            <option value="500">Medium (500)</option>
            <option value="600">SemiBold (600)</option>
            <option value="bold">Bold (700)</option>
            <option value="800">ExtraBold (800)</option>
            <option value="900">Black (900)</option>
          </select>
        </div>
        <div>
          <label className="text-[11px] text-zinc-400 block mb-1">Font Style</label>
          <select
            value={selectedLayer.fontStyle || 'normal'}
            onChange={(e) =>
              updateLayer(selectedLayer.id, {
                fontStyle: e.target.value as 'normal' | 'italic',
              })
            }
            className="w-full bg-[#121214] border border-[#2c2c32] focus:border-purple-500 rounded px-2 py-1 text-xs text-white outline-none cursor-pointer"
          >
            <option value="normal">Normal</option>
            <option value="italic">Italic</option>
          </select>
        </div>
      </div>

      {/* Font Size & Text Color */}
      <div className="space-y-2">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[11px] text-zinc-400 font-medium">Font Size</label>
            <div className="flex items-center gap-1">
              {[24, 48, 72, 120, 200].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => updateLayer(selectedLayer.id, { fontSize: s })}
                  className={`px-1.5 py-0.5 rounded text-[9px] font-mono border transition cursor-pointer ${
                    (selectedLayer.fontSize || 48) === s
                      ? 'bg-purple-600/30 text-purple-200 border-purple-500/60 font-semibold'
                      : 'bg-[#121214] text-zinc-400 border-[#2c2c32] hover:bg-[#1e1e24] hover:text-white'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="relative flex items-center">
            <input
              type="number"
              min="1"
              step="1"
              value={selectedLayer.fontSize || 48}
              onChange={(e) =>
                updateLayer(selectedLayer.id, { fontSize: Math.max(1, parseInt(e.target.value, 10) || 12) })
              }
              className="w-full bg-[#121214] border border-[#2c2c32] focus:border-purple-500 rounded px-2.5 py-1.5 pr-8 text-xs font-mono text-white outline-none"
              placeholder="Enter font size (px)"
            />
            <span className="absolute right-2.5 text-[10px] font-mono text-zinc-500 pointer-events-none">
              px
            </span>
          </div>
        </div>

        {/* Text Color & Alpha */}
        <ColorPickerWithAlpha
          label="Text Color & Alpha"
          color={selectedLayer.fill || '#ffffff'}
          onChange={(newColor) => updateLayer(selectedLayer.id, { fill: newColor })}
        />
      </div>

      {/* Kinetic Text Effect Dropdown */}
      <div>
        <label className="text-[11px] text-zinc-400 block mb-1">Kinetic Motion Effect</label>
        <select
          value={selectedLayer.textEffect || 'none'}
          onChange={(e) =>
            updateLayer(selectedLayer.id, { textEffect: e.target.value as TextEffect })
          }
          className="w-full bg-[#121214] border border-[#2c2c32] focus:border-purple-500 rounded px-2 py-1 text-xs font-sans text-white outline-none cursor-pointer"
        >
          <option value="none">None (Standard Display)</option>
          <option value="typewriter">Typewriter + Blinking Cursor</option>
          <option value="morph">Cyber Morph / Glitch Scramble</option>
          <option value="wave">Sine Wave Per-Character Dance</option>
          <option value="cascade">Letter Pop Cascade (Overshoot)</option>
          <option value="neonPulse">Glowing Neon Pulsar</option>
        </select>
      </div>

      {/* Morph Target Phrase */}
      {selectedLayer.textEffect === 'morph' && (
        <div>
          <label className="text-[11px] text-zinc-400 block mb-1">Morph Target Phrase</label>
          <input
            type="text"
            value={selectedLayer.morphTarget || ''}
            onChange={(e) => updateLayer(selectedLayer.id, { morphTarget: e.target.value })}
            placeholder="Target word or phrase..."
            className="w-full bg-[#121214] border border-[#2c2c32] focus:border-purple-500 rounded px-2 py-1 text-xs font-sans text-white outline-none"
          />
        </div>
      )}

      {/* Animation Speed */}
      <div className="pt-2 border-t border-[#28282e] space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Zap className="w-3 h-3 text-amber-400" />
            <span className="text-[11px] font-semibold text-zinc-300">Animation Speed</span>
          </div>
          <span className="text-[11px] font-mono text-purple-300 bg-purple-900/40 border border-purple-500/30 px-1.5 py-0.5 rounded">
            {(selectedLayer.textSpeed || 1.0).toFixed(1)}x
          </span>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="range"
            min="0.25"
            max="3.0"
            step="0.05"
            value={selectedLayer.textSpeed || 1.0}
            onChange={(e) => {
              const val = Math.max(0.25, Math.min(3.0, parseFloat(e.target.value) || 1.0));
              updateLayer(selectedLayer.id, { textSpeed: Math.round(val * 100) / 100 });
            }}
            className="w-full accent-purple-500 cursor-pointer h-1.5 bg-[#25252e] rounded"
          />
        </div>

        {/* Speed preset chips */}
        <div className="grid grid-cols-5 gap-1">
          {[0.5, 1.0, 1.5, 2.0, 3.0].map((spd) => {
            const isActive = Math.abs((selectedLayer.textSpeed || 1.0) - spd) < 0.05;
            return (
              <button
                key={spd}
                type="button"
                onClick={() => updateLayer(selectedLayer.id, { textSpeed: spd })}
                className={`px-1 py-0.5 rounded text-[10px] font-mono transition cursor-pointer text-center ${
                  isActive
                    ? 'bg-purple-600 text-white font-bold'
                    : 'bg-[#202026] text-zinc-400 hover:text-white'
                }`}
              >
                {spd}x
              </button>
            );
          })}
        </div>
      </div>

      {/* Keyframable Text Animation Progress (0% to 100%) */}
      <div className="pt-2 border-t border-[#28282e] space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-zinc-300">Animation Progress</span>
            <button
              type="button"
              onClick={() => toggleKeyframe(selectedLayer.id, 'textProgress')}
              className={`p-0.5 rounded transition cursor-pointer ${
                hasKf
                  ? 'text-purple-400 hover:text-purple-300'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
              title={hasKf ? 'Keyframe set at playhead (click to remove)' : 'Add keyframe at playhead'}
            >
              <Diamond className={`w-3 h-3 ${hasKf ? 'fill-purple-400' : ''}`} />
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              const speed = selectedLayer.textSpeed || 1.0;
              const kfDuration = Math.round((2.0 / speed) * 100) / 100;
              addStartAndEndKeyframes(selectedLayer.id, 'textProgress', 0, 100, kfDuration);
            }}
            className="text-[10px] px-2 py-0.5 rounded bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 transition cursor-pointer flex items-center gap-1"
            title={`Create 0% -> 100% keyframe animation across ${Math.round((2.0 / (selectedLayer.textSpeed || 1.0)) * 10) / 10}s`}
          >
            <Play className="w-2.5 h-2.5 fill-current" />
            0% → 100%
          </button>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={Math.round(progress)}
            onChange={(e) => {
              const val = Math.max(0, Math.min(100, parseFloat(e.target.value) || 0));
              setAnimPropValue(selectedLayer.id, 'textProgress', val);
              updateLayer(selectedLayer.id, { textProgress: val });
            }}
            className="w-full accent-purple-500 cursor-pointer h-1.5 bg-[#25252e] rounded"
          />
          <span className="text-[11px] font-mono text-zinc-300 w-10 text-right shrink-0">
            {Math.round(progress)}%
          </span>
        </div>

        <div className="grid grid-cols-3 gap-1">
          {[0, 50, 100].map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => {
                setAnimPropValue(selectedLayer.id, 'textProgress', preset);
                updateLayer(selectedLayer.id, { textProgress: preset });
              }}
              className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition cursor-pointer ${
                Math.round(progress) === preset
                  ? 'bg-purple-600 text-white font-bold'
                  : 'bg-[#202026] text-zinc-400 hover:text-white'
              }`}
            >
              {preset}%
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
