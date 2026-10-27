'use client';

import React from 'react';
import {
  ArrowUp,
  ArrowDown,
  Copy,
  Trash2,
  Eye,
  EyeOff,
  Square,
  Circle,
  Star,
  Hexagon,
  Minus,
  Type,
  Image as ImageIcon,
} from 'lucide-react';
import { useMotion } from '@/context/MotionContext';
import { Layer } from '@/types/motion';
import { countTotalKeyframes } from '@/modules/keyframes/evaluator';

export function LayersStackPanel() {
  const {
    layers,
    selectedLayerId,
    selectLayer,
    reorderLayer,
    duplicateLayer,
    deleteLayer,
    toggleLayerVisibility,
  } = useMotion();

  const getLayerIcon = (layer: Layer) => {
    if (layer.type === 'text') return <Type className="w-3.5 h-3.5 text-sky-400" />;
    if (layer.type === 'image') return <ImageIcon className="w-3.5 h-3.5 text-purple-400" />;
    if (layer.shapeType === 'rect') return <Square className="w-3.5 h-3.5 text-indigo-400" />;
    if (layer.shapeType === 'circle') return <Circle className="w-3.5 h-3.5 text-pink-400" />;
    if (layer.shapeType === 'star') return <Star className="w-3.5 h-3.5 text-amber-400" />;
    if (layer.shapeType === 'polygon') return <Hexagon className="w-3.5 h-3.5 text-emerald-400" />;
    return <Minus className="w-3.5 h-3.5 text-violet-400 rotate-45" />;
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Header with Layer Actions */}
      <div className="px-3 py-2 bg-[#090a0f]/60 border-b border-[#1e2130] flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Scene Layers ({layers.length})
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => selectedLayerId && reorderLayer(selectedLayerId, 'up')}
            disabled={!selectedLayerId}
            title="Move Layer Up"
            className="p-1 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 rounded hover:bg-[#1e2130] text-xs cursor-pointer"
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => selectedLayerId && reorderLayer(selectedLayerId, 'down')}
            disabled={!selectedLayerId}
            title="Move Layer Down"
            className="p-1 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 rounded hover:bg-[#1e2130] text-xs cursor-pointer"
          >
            <ArrowDown className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => selectedLayerId && duplicateLayer(selectedLayerId)}
            disabled={!selectedLayerId}
            title="Duplicate Layer"
            className="p-1 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 rounded hover:bg-[#1e2130] text-xs cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => selectedLayerId && deleteLayer(selectedLayerId)}
            disabled={!selectedLayerId}
            title="Delete Layer"
            className="p-1 text-slate-400 hover:text-red-400 disabled:opacity-30 disabled:hover:text-slate-400 rounded hover:bg-[#1e2130] text-xs cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Layers List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {layers.length === 0 ? (
          <div className="text-xs text-slate-500 text-center py-8">
            No layers in scene. Add elements above or load a template!
          </div>
        ) : (
          layers.map((layer) => {
            const isSelected = layer.id === selectedLayerId;
            const kfCount = countTotalKeyframes(layer);

            return (
              <div
                key={layer.id}
                onClick={() => selectLayer(layer.id)}
                className={`group flex items-center justify-between px-2.5 py-2 rounded-lg cursor-pointer border transition ${
                  isSelected
                    ? 'bg-indigo-600/20 border-indigo-500/60 text-white shadow-sm shadow-indigo-500/10'
                    : 'bg-[#171925]/70 border-transparent hover:bg-[#1e2130] text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="shrink-0">{getLayerIcon(layer)}</span>
                  <span className="text-xs font-medium truncate">{layer.name}</span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span
                    className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#090a0f] text-slate-400"
                    title={`${kfCount} Keyframes on this layer`}
                  >
                    {kfCount}♦
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLayerVisibility(layer.id);
                    }}
                    className="text-xs p-1 text-slate-400 hover:text-white cursor-pointer"
                    title={layer.visible ? 'Hide Layer' : 'Show Layer'}
                  >
                    {layer.visible ? (
                      <Eye className="w-3.5 h-3.5" />
                    ) : (
                      <EyeOff className="w-3.5 h-3.5 text-slate-600" />
                    )}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
