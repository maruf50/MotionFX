'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowUp,
  ArrowDown,
  Copy,
  Trash2,
  Eye,
  EyeOff,
  Square,
  CheckSquare,
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
  FolderInput,
  GripVertical,
  Link as LinkIcon,
  RotateCcw,
  ChevronRight,
  ChevronDown,
  X,
  Check,
} from 'lucide-react';
import { useMotion } from '@/context/MotionContext';
import { Layer } from '@/types/motion';
import { countTotalKeyframes } from '@/modules/keyframes/evaluator';

export function LayersStackPanel() {
  const {
    layers,
    selectedLayerId,
    selectedLayerIds,
    selectLayer,
    selectAllLayers,
    clearSelectedLayers,
    deleteLayersBatch,
    reorderLayer,
    reorderLayersBatch,
    duplicateLayer,
    deleteLayer,
    toggleLayerVisibility,
    createGroup,
    addLayersToGroup,
    removeLayersFromGroup,
    ungroupLayer,
    toggleGroupExpand,
    deleteAllKeyframes,
    importTemplateLayer,
  } = useMotion();

  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const [isDropTarget, setIsDropTarget] = useState<boolean>(false);
  const [isAddToGroupOpen, setIsAddToGroupOpen] = useState<boolean>(false);
  const [isNamingNewGroup, setIsNamingNewGroup] = useState<boolean>(false);
  const [newGroupName, setNewGroupName] = useState<string>('');

  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsAddToGroupOpen(false);
      }
    };
    if (isAddToGroupOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isAddToGroupOpen]);

  const selectedLayer = layers.find((l) => l.id === selectedLayerId);
  const isSelectedGroup = selectedLayer?.type === 'group';
  const existingGroups = layers.filter((l) => l.type === 'group');
  const isMultiSelected = selectedLayerIds.length > 1;

  // Active target layers for group actions: either multi-selected or single active layer
  const activeSelectedIds =
    selectedLayerIds.length > 0
      ? selectedLayerIds
      : selectedLayerId
      ? [selectedLayerId]
      : [];

  const getLayerIcon = (layer: Layer) => {
    if (layer.type === 'group') {
      return layer.expanded !== false ? (
        <FolderOpen className="w-3.5 h-3.5 text-purple-400" />
      ) : (
        <Folder className="w-3.5 h-3.5 text-purple-400" />
      );
    }
    if (layer.type === 'text') return <Type className="w-3.5 h-3.5 text-zinc-300" />;
    if (layer.type === 'image') return <ImageIcon className="w-3.5 h-3.5 text-zinc-300" />;
    if (layer.shapeType === 'line') return <Minus className="w-3.5 h-3.5 text-zinc-300" />;
    if (layer.shapeType === 'rect') return <Square className="w-3.5 h-3.5 text-zinc-300" />;
    if (layer.shapeType === 'circle') return <Circle className="w-3.5 h-3.5 text-zinc-300" />;
    if (layer.shapeType === 'star') return <Star className="w-3.5 h-3.5 text-zinc-300" />;
    if (layer.shapeType === 'polygon') return <Hexagon className="w-3.5 h-3.5 text-zinc-300" />;
    return <Minus className="w-3.5 h-3.5 text-zinc-300 rotate-45" />;
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

  const handleCreateGroupWithActive = (name?: string) => {
    createGroup(name || 'Group', activeSelectedIds);
    setIsAddToGroupOpen(false);
    setIsNamingNewGroup(false);
    setNewGroupName('');
  };

  const handleAddActiveToGroup = (groupId: string) => {
    addLayersToGroup(groupId, activeSelectedIds);
    setIsAddToGroupOpen(false);
  };

  const isAllSelected = layers.length > 0 && selectedLayerIds.length === layers.length;

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
        isDropTarget ? 'ring-2 ring-purple-500/50' : ''
      }`}
    >
      {/* Header with Layer Actions */}
      <div className="px-3 py-1.5 bg-[#121214] border-b border-[#242428] flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {layers.length > 0 && (
            <button
              onClick={() => {
                if (isAllSelected) {
                  clearSelectedLayers();
                } else {
                  selectAllLayers();
                }
              }}
              className="text-zinc-400 hover:text-white p-0.5 rounded cursor-pointer"
              title={isAllSelected ? 'Deselect all layers' : 'Select all layers'}
            >
              {isAllSelected ? (
                <CheckSquare className="w-3.5 h-3.5 text-purple-400" />
              ) : (
                <Square className="w-3.5 h-3.5" />
              )}
            </button>
          )}

          <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
            Scene Layers ({layers.length})
          </span>
        </div>

        <div className="flex items-center gap-0.5">
          {/* Add to Existing Group Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsAddToGroupOpen((prev) => !prev)}
              disabled={activeSelectedIds.length === 0}
              title="Add selected layers to group"
              className="p-1 text-zinc-400 hover:text-purple-400 disabled:opacity-30 rounded hover:bg-[#222227] text-xs cursor-pointer flex items-center gap-0.5"
            >
              <FolderInput className="w-3.5 h-3.5" />
            </button>

            {isAddToGroupOpen && (
              <div className="absolute right-0 top-full mt-1 w-52 bg-[#18181c] border border-[#2b2b32] rounded-xl shadow-2xl py-1.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-1 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider border-b border-[#242428] flex items-center justify-between">
                  <span>Add to Group</span>
                  <span className="font-mono text-purple-300">
                    ({activeSelectedIds.length} sel)
                  </span>
                </div>

                {/* Existing Groups List */}
                <div className="max-h-40 overflow-y-auto py-1">
                  {existingGroups.length > 0 ? (
                    existingGroups.map((grp) => {
                      const count = layers.filter((l) => l.parentId === grp.id).length;
                      return (
                        <button
                          key={grp.id}
                          onClick={() => handleAddActiveToGroup(grp.id)}
                          className="w-full px-3 py-1.5 text-left text-zinc-200 hover:bg-[#232329] flex items-center justify-between transition cursor-pointer"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <Folder className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                            <span className="truncate font-medium">{grp.name}</span>
                          </div>
                          <span className="text-[10px] text-zinc-400 font-mono shrink-0 ml-2">
                            {count} {count === 1 ? 'layer' : 'layers'}
                          </span>
                        </button>
                      );
                    })
                  ) : (
                    <div className="px-3 py-2 text-[11px] text-zinc-500 italic">
                      No groups in scene yet
                    </div>
                  )}
                </div>

                {/* Create New Group Option */}
                <div className="pt-1 mt-1 border-t border-[#242428]">
                  <button
                    onClick={() => handleCreateGroupWithActive()}
                    className="w-full px-3 py-1.5 text-left text-purple-300 hover:bg-purple-600/20 flex items-center gap-2 transition cursor-pointer font-medium"
                  >
                    <FolderPlus className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span>+ New Group with Selected</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Group / Ungroup Action */}
          {isSelectedGroup ? (
            <button
              onClick={() => selectedLayerId && ungroupLayer(selectedLayerId)}
              title="Ungroup Layer"
              className="p-1 text-zinc-400 hover:text-purple-300 rounded hover:bg-[#222227] text-xs cursor-pointer"
            >
              <FolderMinus className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={() => handleCreateGroupWithActive()}
              disabled={activeSelectedIds.length === 0}
              title="Group selected layer(s)"
              className="p-1 text-zinc-400 hover:text-purple-300 disabled:opacity-30 rounded hover:bg-[#222227] text-xs cursor-pointer"
            >
              <FolderPlus className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Delete All Keyframes on Selected Layer */}
          <button
            onClick={() => selectedLayerId && deleteAllKeyframes(selectedLayerId)}
            disabled={!selectedLayerId}
            title="Delete all keyframes (reset to static pose)"
            className="p-1 text-zinc-400 hover:text-purple-300 disabled:opacity-30 rounded hover:bg-[#222227] text-xs cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => selectedLayerId && reorderLayer(selectedLayerId, 'up')}
            disabled={!selectedLayerId}
            title="Move Layer Up"
            className="p-1 text-zinc-400 hover:text-white disabled:opacity-30 disabled:hover:text-zinc-400 rounded hover:bg-[#222227] text-xs cursor-pointer"
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => selectedLayerId && reorderLayer(selectedLayerId, 'down')}
            disabled={!selectedLayerId}
            title="Move Layer Down"
            className="p-1 text-zinc-400 hover:text-white disabled:opacity-30 disabled:hover:text-zinc-400 rounded hover:bg-[#222227] text-xs cursor-pointer"
          >
            <ArrowDown className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => selectedLayerId && duplicateLayer(selectedLayerId)}
            disabled={!selectedLayerId}
            title="Duplicate Layer"
            className="p-1 text-zinc-400 hover:text-white disabled:opacity-30 disabled:hover:text-zinc-400 rounded hover:bg-[#222227] text-xs cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => {
              if (selectedLayerIds.length > 1) {
                deleteLayersBatch(selectedLayerIds);
              } else if (selectedLayerId) {
                deleteLayer(selectedLayerId);
              }
            }}
            disabled={activeSelectedIds.length === 0}
            title={
              selectedLayerIds.length > 1
                ? `Delete ${selectedLayerIds.length} Selected Layers`
                : 'Delete Layer'
            }
            className="p-1 text-zinc-400 hover:text-rose-400 disabled:opacity-30 disabled:hover:text-zinc-400 rounded hover:bg-[#222227] text-xs cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Multi-Selection Action Toolbar Banner */}
      {isMultiSelected && (
        <div className="bg-[#191920] px-3 py-1.5 border-b border-purple-500/30 flex items-center justify-between text-xs animate-in fade-in duration-100">
          <div className="flex items-center gap-1.5 text-purple-300 font-semibold text-[11px]">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span>
            <span>{selectedLayerIds.length} layers selected</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => handleCreateGroupWithActive()}
              className="px-2 py-0.5 rounded bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 text-[10px] font-semibold flex items-center gap-1 transition cursor-pointer"
              title="Create new group containing selected layers"
            >
              <FolderPlus className="w-3 h-3 text-purple-400" />
              <span>New Group</span>
            </button>

            <button
              onClick={() => setIsAddToGroupOpen(true)}
              className="px-2 py-0.5 rounded bg-[#222228] hover:bg-[#2b2b34] text-zinc-200 border border-[#2e2e36] text-[10px] font-semibold flex items-center gap-1 transition cursor-pointer"
              title="Add selected layers to existing group"
            >
              <FolderInput className="w-3 h-3 text-purple-400" />
              <span>Add to Group ▾</span>
            </button>

            <button
              onClick={() => removeLayersFromGroup(selectedLayerIds)}
              className="p-1 rounded text-zinc-400 hover:text-purple-300 transition cursor-pointer"
              title="Ungroup selected layers"
            >
              <FolderMinus className="w-3 h-3 text-purple-400" />
            </button>

            <button
              onClick={() => deleteLayersBatch(selectedLayerIds)}
              className="p-1 rounded text-zinc-400 hover:text-rose-400 transition cursor-pointer"
              title="Delete all selected layers"
            >
              <Trash2 className="w-3 h-3" />
            </button>

            <button
              onClick={clearSelectedLayers}
              className="p-1 rounded text-zinc-400 hover:text-white transition cursor-pointer"
              title="Deselect all"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Layers List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {layers.length === 0 ? (
          <div className="text-xs text-zinc-500 text-center py-8">
            No layers in scene. Add elements above or drag from Templates!
          </div>
        ) : (
          layers.map((layer, idx) => {
            const isSelected = selectedLayerIds.includes(layer.id) || layer.id === selectedLayerId;
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
                onClick={(e) => {
                  if (e.ctrlKey || e.metaKey) {
                    selectLayer(layer.id, true);
                  } else if (e.shiftKey) {
                    selectLayer(layer.id, false, true);
                  } else {
                    selectLayer(layer.id);
                  }
                }}
                className={`group flex items-center justify-between px-2 py-1.5 rounded cursor-pointer border transition relative ${
                  isChild ? 'ml-4' : ''
                } ${
                  isOverThis ? 'border-t-2 border-t-purple-400' : ''
                } ${
                  isSelected
                    ? 'bg-purple-950/40 border-purple-500/70 text-white shadow-sm shadow-purple-950/20'
                    : isGroup
                    ? 'bg-[#1c1c22] border-[#292932] hover:border-zinc-600 text-zinc-200'
                    : 'bg-[#1a1a1e] border-[#25252b] hover:bg-[#222227] text-zinc-300 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-1.5 min-w-0 pr-1">
                  <GripVertical className="w-3 h-3 text-zinc-600 group-hover:text-zinc-400 shrink-0 cursor-grab" />

                  {/* Multi-Selection Checkbox */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      selectLayer(layer.id, true);
                    }}
                    className={`p-0.5 rounded transition shrink-0 ${
                      isSelected
                        ? 'text-purple-400'
                        : 'text-zinc-600 hover:text-zinc-400 opacity-40 group-hover:opacity-100'
                    }`}
                    title={isSelected ? 'Deselect layer' : 'Add to selection (Ctrl+Click)'}
                  >
                    {isSelected ? (
                      <CheckSquare className="w-3.5 h-3.5 text-purple-400" />
                    ) : (
                      <Square className="w-3.5 h-3.5" />
                    )}
                  </button>

                  {isGroup && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleGroupExpand(layer.id);
                      }}
                      className="p-0.5 text-zinc-400 hover:text-white shrink-0"
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
                      <span className="text-[9px] text-purple-400/80 flex items-center gap-0.5 font-mono">
                        <LinkIcon className="w-2.5 h-2.5" />
                        <span className="truncate">↳ {parentLayer.name}</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <span
                    className="text-[9px] font-mono px-1 py-0.5 rounded bg-[#111113] text-zinc-400 border border-[#25252b]"
                    title={`${kfCount} Keyframes on this layer`}
                  >
                    {kfCount}♦
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLayerVisibility(layer.id);
                    }}
                    className="text-xs p-1 text-zinc-400 hover:text-white cursor-pointer"
                    title={layer.visible ? 'Hide Layer' : 'Show Layer'}
                  >
                    {layer.visible ? (
                      <Eye className="w-3 h-3" />
                    ) : (
                      <EyeOff className="w-3 h-3 text-zinc-600" />
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
