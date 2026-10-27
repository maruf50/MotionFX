'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Plus,
  GripVertical,
  ChevronDown,
  ChevronRight,
  Type,
  Square,
  Circle,
  Star,
  Hexagon,
  Minus,
  Image as ImageIcon,
} from 'lucide-react';
import { TEMPLATES } from '@/modules/templates';
import { Layer } from '@/types/motion';
import { useMotion } from '@/context/MotionContext';

export function TemplatesBrowserPanel() {
  const { importTemplateLayer } = useMotion();
  const [expandedTemplateId, setExpandedTemplateId] = useState<string | null>('bento-grid');

  const getLayerIcon = (layer: Layer) => {
    if (layer.type === 'text') return <Type className="w-3.5 h-3.5 text-sky-400" />;
    if (layer.type === 'image') return <ImageIcon className="w-3.5 h-3.5 text-purple-400" />;
    if (layer.shapeType === 'line') return <Minus className="w-3.5 h-3.5 text-cyan-400" />;
    if (layer.shapeType === 'circle') return <Circle className="w-3.5 h-3.5 text-pink-400" />;
    if (layer.shapeType === 'star') return <Star className="w-3.5 h-3.5 text-amber-400" />;
    if (layer.shapeType === 'polygon') return <Hexagon className="w-3.5 h-3.5 text-emerald-400" />;
    return <Square className="w-3.5 h-3.5 text-indigo-400" />;
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden select-none">
      {/* Header */}
      <div className="px-3 py-2 bg-[#090a0f]/60 border-b border-[#1e2130] flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Template Layers Library
          </span>
        </div>
        <span className="text-[10px] text-slate-500 font-mono">Drag to Canvas</span>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {TEMPLATES.map((tmpl) => {
          const isExpanded = expandedTemplateId === tmpl.id;
          // Generate layers for preview & dragging
          const templateLayers = tmpl.createLayers();

          return (
            <div
              key={tmpl.id}
              className="rounded-lg border border-[#1e2130] bg-[#141622] overflow-hidden transition"
            >
              {/* Template Card Accordion Header */}
              <div
                onClick={() => setExpandedTemplateId(isExpanded ? null : tmpl.id)}
                className="px-3 py-2.5 flex items-center justify-between cursor-pointer hover:bg-[#1a1d2d] transition"
              >
                <div className="min-w-0 pr-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-200 truncate">
                      {tmpl.name}
                    </span>
                    {tmpl.badge && (
                      <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {tmpl.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                    {templateLayers.length} animatable layers • {tmpl.duration}s
                  </p>
                </div>
                {isExpanded ? (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                )}
              </div>

              {/* Draggable Layers List */}
              {isExpanded && (
                <div className="px-2 pb-2.5 pt-1 border-t border-[#1e2130]/80 space-y-1.5 bg-[#0e1018]">
                  <div className="text-[10px] text-slate-400 px-1 py-0.5 flex items-center justify-between">
                    <span>Drag layer to timeline/canvas:</span>
                    <span className="text-[9px] text-indigo-400">or click +</span>
                  </div>

                  {templateLayers.map((layer, idx) => (
                    <div
                      key={layer.id || idx}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('application/json', JSON.stringify(layer));
                        e.dataTransfer.setData('motionfx-template-layer', JSON.stringify(layer));
                        e.dataTransfer.effectAllowed = 'copy';
                      }}
                      className="group flex items-center justify-between px-2 py-1.5 rounded-md bg-[#161826] hover:bg-indigo-950/40 border border-[#23273a] hover:border-indigo-500/50 cursor-grab active:cursor-grabbing transition"
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <GripVertical className="w-3 h-3 text-slate-500 group-hover:text-indigo-400 shrink-0" />
                        <span className="shrink-0">{getLayerIcon(layer)}</span>
                        <span className="text-xs text-slate-300 group-hover:text-white truncate">
                          {layer.name}
                        </span>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          importTemplateLayer(layer);
                        }}
                        className="p-1 rounded bg-[#1e2130] hover:bg-indigo-600 text-slate-300 hover:text-white transition cursor-pointer"
                        title="Add layer to active timeline scene"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
