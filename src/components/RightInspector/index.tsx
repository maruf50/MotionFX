'use client';

import React from 'react';
import { Sliders, MousePointer } from 'lucide-react';
import { useMotion } from '@/context/MotionContext';
import { TransformSection } from './TransformSection';
import { ShapeStyleSection } from './ShapeStyleSection';
import { TextEffectSection } from './TextEffectSection';

export function RightInspector() {
  const { selectedLayer, updateLayer } = useMotion();

  return (
    <aside className="w-80 bg-[#11131c] border-l border-[#1e2130] flex flex-col shrink-0 z-20 overflow-hidden">
      {/* Inspector Header */}
      <div className="px-4 py-2.5 border-b border-[#1e2130] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sliders className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Inspector
          </span>
        </div>
        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#1e2130] text-slate-400">
          {selectedLayer
            ? selectedLayer.type === 'shape'
              ? selectedLayer.shapeType?.toUpperCase() || 'SHAPE'
              : selectedLayer.type.toUpperCase()
            : 'NONE'}
        </span>
      </div>

      {/* Empty State */}
      {!selectedLayer ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-500">
          <MousePointer className="w-8 h-8 mb-2 text-[#2b2f44]" />
          <p className="text-xs">
            Select a layer on the canvas or layer stack to edit properties, borders, effects, and keyframes.
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-3.5 space-y-4">
          {/* Layer Name Input */}
          <div className="bg-[#171925] p-3 rounded-xl border border-[#1e2130] flex items-center justify-between gap-2">
            <label className="text-[11px] text-slate-400 shrink-0">Layer Name</label>
            <input
              type="text"
              value={selectedLayer.name}
              onChange={(e) => updateLayer(selectedLayer.id, { name: e.target.value })}
              className="w-full bg-[#090a0f] border border-[#2b2f44] focus:border-indigo-500 rounded-md px-2 py-1 text-xs font-sans text-white outline-none text-right"
            />
          </div>

          {/* Transform & Keyframable Props */}
          <TransformSection />

          {/* Shape & Border Section */}
          <ShapeStyleSection />

          {/* Kinetic Text & Effects Section */}
          <TextEffectSection />
        </div>
      )}
    </aside>
  );
}
