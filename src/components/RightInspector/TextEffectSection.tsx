'use client';

import React from 'react';
import { Wand2 } from 'lucide-react';
import { useMotion } from '@/context/MotionContext';
import { TextEffect } from '@/types/motion';

export function TextEffectSection() {
  const { selectedLayer, updateLayer } = useMotion();

  if (!selectedLayer || selectedLayer.type !== 'text') return null;

  return (
    <div className="bg-[#171925] p-3 rounded-xl border border-[#1e2130] space-y-3">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-sky-300 flex items-center gap-1.5">
        <Wand2 className="w-3 h-3 text-sky-400" />
        Kinetic Text & Effects
      </span>

      {/* Text String */}
      <div>
        <label className="text-[11px] text-slate-400 block mb-1">Text Content</label>
        <input
          type="text"
          value={selectedLayer.text || ''}
          onChange={(e) => updateLayer(selectedLayer.id, { text: e.target.value })}
          className="w-full bg-[#090a0f] border border-[#2b2f44] focus:border-indigo-500 rounded-md px-2 py-1 text-xs font-sans text-white outline-none"
        />
      </div>

      {/* Font Size & Text Color */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[11px] text-slate-400 block mb-1">Font Size</label>
          <input
            type="number"
            min="12"
            max="180"
            step="2"
            value={selectedLayer.fontSize || 48}
            onChange={(e) =>
              updateLayer(selectedLayer.id, { fontSize: parseInt(e.target.value, 10) || 36 })
            }
            className="w-full bg-[#090a0f] border border-[#2b2f44] focus:border-indigo-500 rounded-md px-2 py-1 text-xs font-mono text-white outline-none"
          />
        </div>

        <div>
          <label className="text-[11px] text-slate-400 block mb-1">Text Color</label>
          <input
            type="color"
            value={selectedLayer.fill || '#ffffff'}
            onChange={(e) => updateLayer(selectedLayer.id, { fill: e.target.value })}
            className="w-full h-7 rounded cursor-pointer bg-[#090a0f] border border-[#2b2f44] px-1"
          />
        </div>
      </div>

      {/* Kinetic Text Effect Dropdown */}
      <div>
        <label className="text-[11px] text-slate-400 block mb-1">Kinetic Motion Effect</label>
        <select
          value={selectedLayer.textEffect || 'none'}
          onChange={(e) =>
            updateLayer(selectedLayer.id, { textEffect: e.target.value as TextEffect })
          }
          className="w-full bg-[#090a0f] border border-[#2b2f44] focus:border-indigo-500 rounded-md px-2 py-1 text-xs font-sans text-white outline-none cursor-pointer"
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
          <label className="text-[11px] text-slate-400 block mb-1">Morph Target Phrase</label>
          <input
            type="text"
            value={selectedLayer.morphTarget || ''}
            onChange={(e) => updateLayer(selectedLayer.id, { morphTarget: e.target.value })}
            placeholder="Target word or phrase..."
            className="w-full bg-[#090a0f] border border-[#2b2f44] focus:border-indigo-500 rounded-md px-2 py-1 text-xs font-sans text-white outline-none"
          />
        </div>
      )}
    </div>
  );
}
