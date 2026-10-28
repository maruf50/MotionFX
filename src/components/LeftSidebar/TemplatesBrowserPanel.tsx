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
  FolderPlus,
  Layers,
} from 'lucide-react';
import { TEMPLATES } from '@/modules/templates';
import { Layer } from '@/types/motion';
import { useMotion } from '@/context/MotionContext';

export function TemplatesBrowserPanel() {
  const { importTemplateLayer, importTemplateAsGroup, importAllTemplatesAsGroups } = useMotion();
  const [expandedTemplateId, setExpandedTemplateId] = useState<string | null>('bento-grid');

  const getLayerIcon = (layer: Layer) => {
    if (layer.type === 'text') return <Type className="w-3.5 h-3.5 text-zinc-300" />;
    if (layer.type === 'image') return <ImageIcon className="w-3.5 h-3.5 text-zinc-300" />;
    if (layer.shapeType === 'line') return <Minus className="w-3.5 h-3.5 text-zinc-300" />;
    if (layer.shapeType === 'circle') return <Circle className="w-3.5 h-3.5 text-zinc-300" />;
    if (layer.shapeType === 'star') return <Star className="w-3.5 h-3.5 text-zinc-300" />;
    if (layer.shapeType === 'polygon') return <Hexagon className="w-3.5 h-3.5 text-zinc-300" />;
    return <Square className="w-3.5 h-3.5 text-zinc-300" />;
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden select-none">
      {/* Header */}
      <div className="px-3 py-2 bg-[#121214] border-b border-[#242428] flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
            Templates Library
          </span>
        </div>
        <button
          onClick={importAllTemplatesAsGroups}
          className="text-[10px] font-semibold px-2 py-0.5 rounded bg-purple-900/30 hover:bg-purple-600/40 text-purple-300 border border-purple-500/40 transition flex items-center gap-1 cursor-pointer"
          title="Add all templates as individual parent groups to the active scene"
        >
          <FolderPlus className="w-3 h-3 text-purple-300" />
          <span>Add All as Groups</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {TEMPLATES.map((tmpl) => {
          const isExpanded = expandedTemplateId === tmpl.id;
          // Generate layers for preview & dragging
          const templateLayers = tmpl.createLayers();

          return (
            <div
              key={tmpl.id}
              className="rounded border border-[#28282e] bg-[#1a1a1e] overflow-hidden transition"
            >
              {/* Template Card Accordion Header */}
              <div
                onClick={() => setExpandedTemplateId(isExpanded ? null : tmpl.id)}
                className="px-3 py-2 flex items-center justify-between cursor-pointer hover:bg-[#222227] transition"
              >
                <div className="min-w-0 pr-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-zinc-200 truncate">
                      {tmpl.name}
                    </span>
                    {tmpl.badge && (
                      <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-purple-950/60 text-purple-300 border border-purple-700/50">
                        {tmpl.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-zinc-400 line-clamp-1 mt-0.5">
                    {templateLayers.length} animatable layers • {tmpl.duration}s
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      importTemplateAsGroup(tmpl.id);
                    }}
                    className="px-2 py-0.5 rounded bg-purple-900/40 hover:bg-purple-600 text-[10px] font-medium text-purple-200 hover:text-white border border-purple-500/50 transition cursor-pointer flex items-center gap-1"
                    title={`Add ${tmpl.name} as a single organized group layer to scene`}
                  >
                    <FolderPlus className="w-3 h-3" />
                    <span>Add as Group</span>
                  </button>
                  {isExpanded ? (
                    <ChevronDown className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                  )}
                </div>
              </div>

              {/* Draggable Layers List */}
              {isExpanded && (
                <div className="px-2 pb-2 pt-1 border-t border-[#242428] space-y-1 bg-[#131316]">
                  <div className="text-[10px] text-zinc-400 px-1 py-0.5 flex items-center justify-between">
                    <span>Drag layer or click + :</span>
                    <button
                      type="button"
                      onClick={() => importTemplateAsGroup(tmpl.id)}
                      className="text-[9px] font-medium text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer"
                    >
                      <Layers className="w-2.5 h-2.5" />
                      <span>Insert All as Group</span>
                    </button>
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
                      className="group flex items-center justify-between px-2 py-1 rounded bg-[#1c1c20] hover:bg-purple-950/30 border border-[#26262c] hover:border-purple-500/50 cursor-grab active:cursor-grabbing transition"
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <GripVertical className="w-3 h-3 text-zinc-500 group-hover:text-purple-400 shrink-0" />
                        <span className="shrink-0">{getLayerIcon(layer)}</span>
                        <span className="text-xs text-zinc-300 group-hover:text-white truncate">
                          {layer.name}
                        </span>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          importTemplateLayer(layer);
                        }}
                        className="p-1 rounded bg-[#24242a] hover:bg-purple-600 text-zinc-300 hover:text-white transition cursor-pointer"
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
