'use client';

import React from 'react';
import { Shapes, PenTool, RotateCcw, Check } from 'lucide-react';
import { useMotion } from '@/context/MotionContext';
import { BorderStyle } from '@/types/motion';
import { ColorPickerWithAlpha } from './ColorPickerWithAlpha';

export function ShapeStyleSection() {
  const { selectedLayer, updateLayer } = useMotion();

  if (!selectedLayer || selectedLayer.type === 'text') return null;

  const isCustomPen = selectedLayer.shapeType === 'custom';
  const pointCount = selectedLayer.pathPoints?.length ?? 0;

  return (
    <div className="bg-[#1a1a1e] p-2.5 rounded border border-[#28282e] space-y-2.5">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
        <Shapes className="w-3 h-3 text-purple-400" />
        Appearance & Borders
      </span>

      {/* Custom Vector Pen Tool Controls if layer is a custom shape */}
      {isCustomPen && (
        <div className="p-2 rounded bg-purple-950/20 border border-purple-500/40 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-purple-200 flex items-center gap-1.5">
              <PenTool className="w-3.5 h-3.5 text-purple-400" />
              Pen Tool Canvas Editing
            </span>
            <span className="text-[10px] font-mono text-purple-300 bg-purple-900/60 px-1.5 py-0.5 rounded border border-purple-700/50">
              {pointCount} POINTS
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => updateLayer(selectedLayer.id, { isPenEditing: !selectedLayer.isPenEditing })}
              className={`py-1 px-2 rounded text-[10px] font-medium flex items-center justify-center gap-1 transition cursor-pointer border ${
                selectedLayer.isPenEditing
                  ? 'bg-purple-600/40 text-purple-200 border-purple-500 shadow-sm'
                  : 'bg-[#141418] text-zinc-400 border-[#2a2a34] hover:text-white'
              }`}
            >
              <PenTool className="w-3 h-3" />
              <span>{selectedLayer.isPenEditing ? 'Pen Mode Active' : 'Edit Vertices'}</span>
            </button>

            <button
              type="button"
              onClick={() => updateLayer(selectedLayer.id, { pathClosed: selectedLayer.pathClosed === false })}
              className={`py-1 px-2 rounded text-[10px] font-medium flex items-center justify-center gap-1 transition cursor-pointer border ${
                selectedLayer.pathClosed !== false
                  ? 'bg-purple-600/30 text-purple-200 border-purple-500/50'
                  : 'bg-[#141418] text-zinc-400 border-[#2a2a34] hover:text-white'
              }`}
            >
              <Check className="w-3 h-3" />
              <span>{selectedLayer.pathClosed !== false ? 'Closed Path' : 'Open Path'}</span>
            </button>
          </div>

          <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-0.5">
            <span>Click canvas to add points; drag handles to bend curve</span>
            <button
              type="button"
              onClick={() =>
                updateLayer(selectedLayer.id, {
                  pathPoints: [
                    { x: -50, y: 35 },
                    { x: 0, y: -45, cp1x: -30, cp1y: -45, cp2x: -15, cp2y: -45 },
                    { x: 50, y: 35, cp1x: 15, cp1y: -45, cp2x: 30, cp2y: 35 },
                  ],
                })
              }
              className="text-zinc-400 hover:text-zinc-200 flex items-center gap-1 cursor-pointer"
              title="Reset to default triangle spline"
            >
              <RotateCcw className="w-2.5 h-2.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      )}

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

      {/* Fill & Stroke Colors with Alpha Transparency */}
      <div className="space-y-2">
        <ColorPickerWithAlpha
          label="Fill Color & Alpha"
          color={selectedLayer.fill}
          onChange={(newFill) => updateLayer(selectedLayer.id, { fill: newFill })}
        />

        <ColorPickerWithAlpha
          label="Stroke Color & Alpha"
          color={selectedLayer.stroke}
          onChange={(newStroke) => updateLayer(selectedLayer.id, { stroke: newStroke })}
        />
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
          <label className="text-[11px] text-zinc-400 block mb-1">Border Thickness (px)</label>
          <div className="relative flex items-center">
            <input
              type="number"
              min="0"
              step="1"
              value={selectedLayer.borderWidth}
              onChange={(e) =>
                updateLayer(selectedLayer.id, { borderWidth: Math.max(0, parseFloat(e.target.value) || 0) })
              }
              className="w-full bg-[#121214] border border-[#2c2c32] focus:border-purple-500 rounded px-2 py-1 pr-7 text-xs font-mono text-white outline-none"
              placeholder="0"
            />
            <span className="absolute right-2 text-[10px] font-mono text-zinc-500 pointer-events-none">
              px
            </span>
          </div>
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
