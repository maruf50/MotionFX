'use client';

import React, { useState } from 'react';
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
  Folder,
  FolderOpen,
  FolderPlus,
  FolderMinus,
  GripVertical,
  Link as LinkIcon,
  RotateCcw,
  ChevronRight,
  ChevronDown,
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
    reorderLayersBatch,
    duplicateLayer,
    deleteLayer,
    toggleLayerVisibility,
    createGroup,
    ungroupLayer,
    toggleGroupExpand,
    deleteAllKeyframes,
    importTemplateLayer,
  } = useMotion();

  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const [isDropTarget, setIsDropTarget] = useState<boolean>(false);

  const selectedLayer = layers.find((l) => l.id === selectedLayerId);
  const isSelectedGroup = selectedLayer?.type === 'group';

  const getLayerIcon = (layer: Layer) => {
    if (layer.type === 'group') {
      return layer.expanded !== false ? (
        <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
      ) : (
        <Folder className="w-3.5 h-3.5 text-amber-400" />
      );
    }
    if (layer.type === 'text') return <Type className="w-3.5 h-3.5 text-sky-400" />;
    if (layer.type === 'image') return <ImageIcon className="w-3.5 h-3.5 text-purple-400" />;
    if (layer.shapeType === 'line') return <Minus className="w-3.5 h-3.5 text-cyan-400" />;
    if (layer.shapeType === 'rect') return <Square className="w-3.5 h-3.5 text-indigo-400" />;
    if (layer.shapeType === 'circle') return <Circle className="w-3.5 h-3.5 text-pink-400" />;
    if (layer.shapeType === 'star') return <Star className="w-3.5 h-3.5 text-amber-400" />;
    if (layer.shapeType === 'polygon') return <Hexagon className="w-3.5 h-3.5 text-emerald-400" />;
    return <Minus className="w-3.5 h-3.5 text-violet-400 rotate-45" />;
  };

  const handleDragStart = (e: React.DragEvent, index: number, layer: Layer) => {
    setDraggedIdx(index);
    e.dataTransfer.setData('text/plain', layer.id);
    e.dataTransfer.setData('motionfx-layer-index', index.toString());
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = e.dataTransfer.types.includes('motionfx-template-layer')
      ? 'copy'
      : 'move';
    setDragOverIdx(index);
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    setIsDropTarget(false);
    setDragOverIdx(null);

    // Check if dropping from Templates library
    const templateData = e.dataTransfer.getData('motionfx-template-layer');
    if (templateData) {
      try {
        const parsed = JSON.parse(templateData);
        if (parsed) {
          importTemplateLayer(parsed);
          return;
        }
      } catch (err) {
        console.error('Failed to parse dropped template layer:', err);
      }
    }

    // Reordering internal scene layers
    if (draggedIdx !== null && draggedIdx !== targetIndex) {
      reorderLayersBatch(draggedIdx, targetIndex);
    }
    setDraggedIdx(null);
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDropTarget(true);
      }}
      onDragLeave={() => setIsDropTarget(false)}
      onDrop={(e) => {
        if (draggedIdx === null) {
          handleDrop(e, 0);
        }
      }}
      className={`flex-1 flex flex-col min-h-0 select-none ${
        isDropTarget ? 'ring-2 ring-indigo-500/50' : ''
      }`}
    >
      {/* Header with Layer Actions */}
      <div className="px-3 py-2 bg-[#090a0f]/60 border-b border-[#1e2130] flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Scene Layers ({layers.length})
        </span>

        <div className="flex items-center gap-1">
          {/* Group / Ungroup Action */}
          {isSelectedGroup ? (
            <button
              onClick={() => selectedLayerId && ungroupLayer(selectedLayerId)}
              title="Ungroup Layer"
              className="p-1 text-amber-400 hover:text-amber-300 rounded hover:bg-[#1e2130] text-xs cursor-pointer"
            >
              <FolderMinus className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={() => selectedLayerId && createGroup('Group', [selectedLayerId])}
              disabled={!selectedLayerId}
              title="Group selected layer"
              className="p-1 text-slate-400 hover:text-amber-400 disabled:opacity-30 rounded hover:bg-[#1e2130] text-xs cursor-pointer"
            >
              <FolderPlus className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Delete All Keyframes on Selected Layer */}
          <button
            onClick={() => selectedLayerId && deleteAllKeyframes(selectedLayerId)}
            disabled={!selectedLayerId}
            title="Delete all keyframes (reset to static pose)"
            className="p-1 text-slate-400 hover:text-amber-300 disabled:opacity-30 rounded hover:bg-[#1e2130] text-xs cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

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
            No layers in scene. Add elements above or drag from Templates!
          </div>
        ) : (
          layers.map((layer, idx) => {
            const isSelected = layer.id === selectedLayerId;
            const kfCount = countTotalKeyframes(layer);
            const isGroup = layer.type === 'group';

            // Check if this layer is a child of another group or parent
            const parentLayer = layer.parentId
              ? layers.find((l) => l.id === layer.parentId)
              : null;
            const isChild = !!layer.parentId;

            // If parent group is collapsed, hide child item
            if (parentLayer && parentLayer.type === 'group' && parentLayer.expanded === false) {
              return null;
            }

            const isOverThis = dragOverIdx === idx;

            return (
              <div
                key={layer.id}
                draggable
                onDragStart={(e) => handleDragStart(e, idx, layer)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDrop={(e) => handleDrop(e, idx)}
                onClick={() => selectLayer(layer.id)}
                className={`group flex items-center justify-between px-2 py-1.5 rounded-lg cursor-pointer border transition relative ${
                  isChild ? 'ml-4' : ''
                } ${
                  isOverThis ? 'border-t-2 border-t-indigo-400' : ''
                } ${
                  isSelected
                    ? 'bg-indigo-600/20 border-indigo-500/60 text-white shadow-sm shadow-indigo-500/10'
                    : isGroup
                    ? 'bg-[#1e1b2e]/60 border-amber-500/20 hover:border-amber-500/40 text-amber-200'
                    : 'bg-[#171925]/70 border-transparent hover:bg-[#1e2130] text-slate-300'
                }`}
              >
                <div className="flex items-center gap-1.5 min-w-0 pr-1">
                  <GripVertical className="w-3 h-3 text-slate-600 group-hover:text-slate-400 shrink-0 cursor-grab" />

                  {isGroup && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleGroupExpand(layer.id);
                      }}
                      className="p-0.5 text-slate-400 hover:text-white"
                      title={layer.expanded !== false ? 'Collapse group' : 'Expand group'}
                    >
                      {layer.expanded !== false ? (
                        <ChevronDown className="w-3 h-3" />
                      ) : (
                        <ChevronRight className="w-3 h-3" />
                      )}
                    </button>
                  )}

                  <span className="shrink-0">{getLayerIcon(layer)}</span>

                  <div className="min-w-0 flex flex-col">
                    <span className="text-xs font-medium truncate">{layer.name}</span>
                    {parentLayer && (
                      <span className="text-[9px] text-indigo-400/80 flex items-center gap-0.5 font-mono">
                        <LinkIcon className="w-2.5 h-2.5" />
                        <span className="truncate">↳ {parentLayer.name}</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <span
                    className="text-[9px] font-mono px-1 py-0.5 rounded bg-[#090a0f] text-slate-400"
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
                      <Eye className="w-3 h-3" />
                    ) : (
                      <EyeOff className="w-3 h-3 text-slate-600" />
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
