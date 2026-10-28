'use client';

import React from 'react';
import { Sliders, MousePointer, Layers } from 'lucide-react';
import { useMotion } from '@/context/MotionContext';
import { TransformSection } from './TransformSection';
import { ParentHierarchySection } from './ParentHierarchySection';
import { ShapeStyleSection } from './ShapeStyleSection';
import { BarInspectorSection } from './BarInspectorSection';
import { BranchingInspectorSection } from './BranchingInspectorSection';
import { PathFollowerInspectorSection } from './PathFollowerInspectorSection';
import { TextEffectSection } from './TextEffectSection';
import { MultiSelectSection } from './MultiSelectSection';

export function RightInspector() {
  const { selectedLayer, selectedLayerIds, updateLayer } = useMotion();

  const isMultiSelect = selectedLayerIds.length > 1;

  return (
    <aside className="w-80 bg-[#161619] border-l border-[#242428] flex flex-col shrink-0 z-20 overflow-hidden">
      {/* Inspector Header */}
      <div className="px-4 py-2 border-b border-[#242428] flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isMultiSelect ? (
            <Layers className="w-3.5 h-3.5 text-purple-400" />
          ) : (
            <Sliders className="w-3.5 h-3.5 text-purple-400" />
          )}
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
            {isMultiSelect ? `Selection (${selectedLayerIds.length})` : 'Inspector'}
          </span>
        </div>
        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#1c1c20] text-zinc-400 border border-[#28282e]">
          {isMultiSelect
            ? `${selectedLayerIds.length} ITEMS`
            : selectedLayer
            ? selectedLayer.type === 'shape'
              ? selectedLayer.shapeType?.toUpperCase() || 'SHAPE'
              : selectedLayer.type.toUpperCase()
            : 'NONE'}
        </span>
      </div>

      {/* Content */}
      {isMultiSelect ? (
        <div className="flex-1 overflow-y-auto p-3">
          <MultiSelectSection />
        </div>
      ) : !selectedLayer ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-zinc-500">
          <MousePointer className="w-8 h-8 mb-2 text-[#2a2a30]" />
          <p className="text-xs text-zinc-400">
            Select a layer on the canvas or layer stack to edit properties, borders, effects, and keyframes.
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {/* Layer Name Input */}
          <div className="bg-[#1a1a1e] p-2.5 rounded border border-[#28282e] flex items-center justify-between gap-2">
            <label className="text-[11px] text-zinc-400 shrink-0">Layer Name</label>
            <input
              type="text"
              value={selectedLayer.name}
              onChange={(e) => updateLayer(selectedLayer.id, { name: e.target.value })}
              className="w-full bg-[#121214] border border-[#2c2c32] focus:border-purple-500 rounded px-2 py-1 text-xs font-sans text-white outline-none text-right"
            />
          </div>

          {/* Hierarchy & Parenting */}
          <ParentHierarchySection />

          {/* Transform & Keyframable Props */}
          <TransformSection />

          {/* Specialized Sections according to shape type */}
          {selectedLayer.shapeType === 'bar' && <BarInspectorSection />}
          {selectedLayer.shapeType === 'branching' && <BranchingInspectorSection />}
          {selectedLayer.shapeType === 'pathFollower' && <PathFollowerInspectorSection />}

          {/* Standard Shape & Border Section (for standard shapes) */}
          {selectedLayer.type === 'shape' &&
            selectedLayer.shapeType !== 'bar' &&
            selectedLayer.shapeType !== 'branching' &&
            selectedLayer.shapeType !== 'pathFollower' && <ShapeStyleSection />}

          {/* Kinetic Text & Effects Section */}
          <TextEffectSection />
        </div>
      )}
    </aside>
  );
}
