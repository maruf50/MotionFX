'use client';

import React from 'react';
import { Shapes } from 'lucide-react';
import { useMotion } from '@/context/MotionContext';
import { BorderStyle } from '@/types/motion';

export function ShapeStyleSection() {
  const { selectedLayer, updateLayer } = useMotion();

  if (!selectedLayer || selectedLayer.type === 'text') return null;

  return (
    <div className="bg-[#171925] p-3 rounded-xl border border-[#1e2130] space-y-3">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-pink-300 flex items-center gap-1.5">
        <Shapes className="w-3 h-3 text-pink-400" />
        Appearance & Borders
      </span>

      {/* Width & Height */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[11px] text-slate-400 block mb-1">Width (px)</label>
          <input
            type="number"
            min="10"
            max="1200"
            value={selectedLayer.width}
            onChange={(e) =>
              updateLayer(selectedLayer.id, { width: parseFloat(e.target.value) || 20 })
            }
            className="w-full bg-[#090a0f] border border-[#2b2f44] focus:border-indigo-500 rounded-md px-2 py-1 text-xs font-mono text-white outline-none"
          />
        </div>
        <div>
          <label className="text-[11px] text-slate-400 block mb-1">Height (px)</label>
          <input
            type="number"
            min="10"
            max="1200"
            value={selectedLayer.height}
            onChange={(e) =>
              updateLayer(selectedLayer.id, { height: parseFloat(e.target.value) || 20 })
            }
            className="w-full bg-[#090a0f] border border-[#2b2f44] focus:border-indigo-500 rounded-md px-2 py-1 text-xs font-mono text-white outline-none"
          />
        </div>
      </div>

      {/* Polygon Sides / Star Points */}
      {(selectedLayer.shapeType === 'star' || selectedLayer.shapeType === 'polygon') && (
        <div>
          <div className="flex justify-between text-[11px] text-slate-400 mb-1">
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
            className="w-full accent-indigo-500 cursor-pointer"
          />
        </div>
      )}

      {/* Fill & Stroke Colors */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-[#090a0f] p-2 rounded-lg border border-[#2b2f44] flex items-center justify-between">
          <span className="text-[11px] text-slate-300">Fill</span>
          <input
            type="color"
            value={selectedLayer.fill}
            onChange={(e) => updateLayer(selectedLayer.id, { fill: e.target.value })}
            className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
          />
        </div>

        <div className="bg-[#090a0f] p-2 rounded-lg border border-[#2b2f44] flex items-center justify-between">
          <span className="text-[11px] text-slate-300">Stroke</span>
          <input
            type="color"
            value={selectedLayer.stroke}
            onChange={(e) => updateLayer(selectedLayer.id, { stroke: e.target.value })}
            className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
          />
        </div>
      </div>

      {/* Round Borders (Border Radius) */}
      <div>
        <div className="flex justify-between text-[11px] text-slate-400 mb-1">
          <span>Round Borders (Radius)</span>
          <span className="font-mono text-indigo-300">{selectedLayer.borderRadius}px</span>
        </div>
        <input
          type="range"
          min="0"
          max="150"
          step="1"
          value={selectedLayer.borderRadius}
          onChange={(e) =>
            updateLayer(selectedLayer.id, { borderRadius: parseInt(e.target.value, 10) })
          }
          className="w-full accent-indigo-500 cursor-pointer"
        />
      </div>

      {/* Border Width & Style */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[11px] text-slate-400 block mb-1">Border Width</label>
          <input
            type="number"
            min="0"
            max="40"
            value={selectedLayer.borderWidth}
            onChange={(e) =>
              updateLayer(selectedLayer.id, { borderWidth: parseFloat(e.target.value) || 0 })
            }
            className="w-full bg-[#090a0f] border border-[#2b2f44] focus:border-indigo-500 rounded-md px-2 py-1 text-xs font-mono text-white outline-none"
          />
        </div>

        <div>
          <label className="text-[11px] text-slate-400 block mb-1">Border Style</label>
          <select
            value={selectedLayer.borderStyle}
            onChange={(e) =>
              updateLayer(selectedLayer.id, { borderStyle: e.target.value as BorderStyle })
            }
            className="w-full bg-[#090a0f] border border-[#2b2f44] focus:border-indigo-500 rounded-md px-2 py-1 text-xs font-sans text-white outline-none cursor-pointer"
          >
            <option value="solid">Solid</option>
            <option value="dashed">Dashed</option>
            <option value="dotted">Dotted</option>
            <option value="none">None</option>
          </select>
        </div>
      </div>

      {/* Marching Ants / Animated Flow */}
      <div className="flex items-center justify-between pt-1">
        <span className="text-[11px] text-slate-300">Animate Dotted / Dashed Flow</span>
        <input
          type="checkbox"
          checked={selectedLayer.animateDash}
          onChange={(e) => updateLayer(selectedLayer.id, { animateDash: e.target.checked })}
          className="rounded accent-indigo-500 cursor-pointer"
        />
      </div>
    </div>
  );
}
