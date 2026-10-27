'use client';

import React from 'react';
import { Wand2 } from 'lucide-react';
import { useMotion } from '@/context/MotionContext';
import { TextEffect } from '@/types/motion';

export function TextEffectSection() {
  const { selectedLayer, updateLayer } = useMotion();

  if (!selectedLayer || selectedLayer.type !== 'text') return null;

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

      {/* Font Size & Text Color */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[11px] text-zinc-400">Font Size</label>
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              min="8"
              max="500"
              step="2"
              value={selectedLayer.fontSize || 48}
              onChange={(e) =>
                updateLayer(selectedLayer.id, { fontSize: parseInt(e.target.value, 10) || 36 })
              }
              className="w-16 bg-[#121214] border border-[#2c2c32] focus:border-purple-500 rounded px-2 py-0.5 text-xs font-mono text-white outline-none text-right"
            />
            <span className="text-[11px] text-zinc-400">px</span>
          </div>
        </div>

        <input
          type="range"
          min="8"
          max="500"
          step="2"
          value={selectedLayer.fontSize || 48}
          onChange={(e) =>
            updateLayer(selectedLayer.id, { fontSize: parseInt(e.target.value, 10) || 36 })
          }
          className="w-full accent-purple-500 cursor-pointer"
        />

        {/* Text Color */}
        <div className="flex items-center justify-between pt-0.5">
          <label className="text-[11px] text-zinc-400">Text Color</label>
          <input
            type="color"
            value={selectedLayer.fill || '#ffffff'}
            onChange={(e) => updateLayer(selectedLayer.id, { fill: e.target.value })}
            className="w-6 h-6 rounded cursor-pointer bg-[#121214] border border-[#2c2c32] p-0.5"
          />
        </div>
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
    </div>
  );
}
