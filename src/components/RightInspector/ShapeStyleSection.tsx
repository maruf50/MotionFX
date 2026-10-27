'use client';

import React from 'react';
import { Shapes } from 'lucide-react';
import { useMotion } from '@/context/MotionContext';
import { BorderStyle } from '@/types/motion';

export function ShapeStyleSection() {
  const { selectedLayer, updateLayer } = useMotion();

  if (!selectedLayer || selectedLayer.type === 'text') return null;

  return (
    <div className="bg-[#1a1a1e] p-2.5 rounded border border-[#28282e] space-y-2.5">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
        <Shapes className="w-3 h-3 text-purple-400" />
        Appearance & Borders
      </span>

      {/* Width & Height */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[11px] text-zinc-400 block mb-1">Width (px)</label>
          <input
            type="number"
            min="1"
            max="7680"
            value={selectedLayer.width}
            onChange={(e) =>
              updateLayer(selectedLayer.id, { width: parseFloat(e.target.value) || 20 })
            }
            className="w-full bg-[#121214] border border-[#2c2c32] focus:border-purple-500 rounded px-2 py-1 text-xs font-mono text-white outline-none"
          />
        </div>
        <div>
          <label className="text-[11px] text-zinc-400 block mb-1">Height (px)</label>
          <input
            type="number"
            min="1"
            max="4320"
            value={selectedLayer.height}
            onChange={(e) =>
              updateLayer(selectedLayer.id, { height: parseFloat(e.target.value) || 20 })
            }
            className="w-full bg-[#121214] border border-[#2c2c32] focus:border-purple-500 rounded px-2 py-1 text-xs font-mono text-white outline-none"
          />
        </div>
      </div>

      {/* Polygon Sides / Star Points */}
      {(selectedLayer.shapeType === 'star' || selectedLayer.shapeType === 'polygon') && (
        <div>
          <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
            <span>Points / Sides</span>
            <span className="font-mono text-white">{selectedLayer.sides || 5}</span>
          </div>
          <input
            type="range"
            min="3"
            max="12"
            step="1"
            value={selectedLayer.sides || 5}
            onChange={(e) =>
              updateLayer(selectedLayer.id, { sides: parseInt(e.target.value, 10) })
            }
            className="w-full accent-purple-500 cursor-pointer"
          />
        </div>
      )}

      {/* Fill & Stroke Colors */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-[#121214] p-1.5 rounded border border-[#2c2c32] flex items-center justify-between">
          <span className="text-[11px] text-zinc-300">Fill</span>
          <input
            type="color"
            value={selectedLayer.fill}
            onChange={(e) => updateLayer(selectedLayer.id, { fill: e.target.value })}
            className="w-5 h-5 rounded cursor-pointer bg-transparent border-0"
          />
        </div>

        <div className="bg-[#121214] p-1.5 rounded border border-[#2c2c32] flex items-center justify-between">
          <span className="text-[11px] text-zinc-300">Stroke</span>
          <input
            type="color"
            value={selectedLayer.stroke}
            onChange={(e) => updateLayer(selectedLayer.id, { stroke: e.target.value })}
            className="w-5 h-5 rounded cursor-pointer bg-transparent border-0"
          />
        </div>
      </div>

      {/* Round Borders (Border Radius) */}
      <div>
        <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
          <span>Round Borders (Radius)</span>
          <span className="font-mono text-purple-300">{selectedLayer.borderRadius}px</span>
        </div>
        <input
          type="range"
          min="0"
          max="500"
          step="1"
          value={selectedLayer.borderRadius}
          onChange={(e) =>
            updateLayer(selectedLayer.id, { borderRadius: parseInt(e.target.value, 10) })
          }
          className="w-full accent-purple-500 cursor-pointer"
        />
      </div>

      {/* Border Width & Style */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[11px] text-zinc-400 block mb-1">Border Width</label>
          <input
            type="number"
            min="0"
            max="200"
            value={selectedLayer.borderWidth}
            onChange={(e) =>
              updateLayer(selectedLayer.id, { borderWidth: parseFloat(e.target.value) || 0 })
            }
            className="w-full bg-[#121214] border border-[#2c2c32] focus:border-purple-500 rounded px-2 py-1 text-xs font-mono text-white outline-none"
          />
        </div>

        <div>
          <label className="text-[11px] text-zinc-400 block mb-1">Border Style</label>
          <select
            value={selectedLayer.borderStyle}
            onChange={(e) =>
              updateLayer(selectedLayer.id, { borderStyle: e.target.value as BorderStyle })
            }
            className="w-full bg-[#121214] border border-[#2c2c32] focus:border-purple-500 rounded px-2 py-1 text-xs font-sans text-white outline-none cursor-pointer"
          >
            <option value="solid">Solid</option>
            <option value="dashed">Dashed</option>
            <option value="dotted">Dotted</option>
            <option value="none">None</option>
          </select>
        </div>
      </div>

      {/* Marching Ants / Animated Flow */}
      <div className="flex items-center justify-between pt-0.5">
        <span className="text-[11px] text-zinc-300">Animate Dotted / Dashed Flow</span>
        <input
          type="checkbox"
          checked={selectedLayer.animateDash}
          onChange={(e) => updateLayer(selectedLayer.id, { animateDash: e.target.checked })}
          className="rounded accent-purple-500 cursor-pointer"
        />
      </div>
    </div>
  );
}
