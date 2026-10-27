'use client';

import React, { useState } from 'react';
import {
  FolderPlus,
  FolderMinus,
  FolderInput,
  Folder,
  Trash2,
  X,
  Layers,
  Check,
} from 'lucide-react';
import { useMotion } from '@/context/MotionContext';

export function MultiSelectSection() {
  const {
    layers,
    selectedLayerIds,
    selectLayer,
    clearSelectedLayers,
    createGroup,
    addLayersToGroup,
    removeLayersFromGroup,
    deleteLayersBatch,
  } = useMotion();

  const [selectedTargetGroupId, setSelectedTargetGroupId] = useState<string>('');
  const [newGroupName, setNewGroupName] = useState<string>('');
  const [isNamingGroup, setIsNamingGroup] = useState<boolean>(false);

  const selectedLayers = layers.filter((l) => selectedLayerIds.includes(l.id));
  const existingGroups = layers.filter(
    (l) => l.type === 'group' && !selectedLayerIds.includes(l.id)
  );

  const handleCreateNewGroup = () => {
    const name = newGroupName.trim() || 'Group';
    createGroup(name, selectedLayerIds);
    setNewGroupName('');
    setIsNamingGroup(false);
  };

  const handleAddToExistingGroup = () => {
    if (!selectedTargetGroupId) return;
    addLayersToGroup(selectedTargetGroupId, selectedLayerIds);
    setSelectedTargetGroupId('');
  };

  const hasGroupedMember = selectedLayers.some((l) => !!l.parentId);

  return (
    <div className="space-y-3">
      {/* Selection Summary Card */}
      <div className="bg-[#1a1a1e] p-3 rounded border border-purple-500/40 shadow-lg shadow-purple-950/20">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-purple-600/20 text-purple-300 flex items-center justify-center">
              <Layers className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white">Multi-Selection</h3>
              <span className="text-[10px] text-zinc-400">
                {selectedLayerIds.length} layers selected
              </span>
            </div>
          </div>

          <button
            onClick={clearSelectedLayers}
            className="text-[11px] px-2 py-0.5 rounded text-zinc-400 hover:text-white hover:bg-[#24242a] transition flex items-center gap-1 cursor-pointer"
            title="Deselect all"
          >
            <X className="w-3 h-3" />
            <span>Clear</span>
          </button>
        </div>

        {/* Selected Layers Pills */}
        <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
          {selectedLayers.map((layer) => (
            <div
              key={layer.id}
              className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-[#121214] border border-[#2c2c32] text-[11px] text-zinc-200"
            >
              <span className="truncate max-w-[110px] font-medium">{layer.name}</span>
              <button
                type="button"
                onClick={() => selectLayer(layer.id, true)}
                className="text-zinc-400 hover:text-rose-400 p-0.5 rounded"
                title="Remove from selection"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Grouping Options Card */}
      <div className="bg-[#1a1a1e] p-3 rounded border border-[#28282e] space-y-2.5">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
          <Folder className="w-3.5 h-3.5 text-purple-400" />
          <span>Group Management</span>
        </div>

        {/* 1. Add to Existing Group */}
        <div className="space-y-1.5 pt-0.5">
          <label className="text-[11px] font-medium text-zinc-400 flex items-center gap-1">
            <FolderInput className="w-3 h-3 text-purple-400" />
            <span>Add to Existing Group:</span>
          </label>

          {existingGroups.length > 0 ? (
            <div className="flex items-center gap-2">
              <select
                value={selectedTargetGroupId}
                onChange={(e) => setSelectedTargetGroupId(e.target.value)}
                className="flex-1 bg-[#121214] border border-[#2c2c32] focus:border-purple-500 rounded px-2.5 py-1.5 text-xs text-white outline-none cursor-pointer"
              >
                <option value="">Select target group...</option>
                {existingGroups.map((grp) => {
                  const memberCount = layers.filter((l) => l.parentId === grp.id).length;
                  return (
                    <option key={grp.id} value={grp.id}>
                      {grp.name} ({memberCount} {memberCount === 1 ? 'layer' : 'layers'})
                    </option>
                  );
                })}
              </select>

              <button
                type="button"
                onClick={handleAddToExistingGroup}
                disabled={!selectedTargetGroupId}
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-30 disabled:hover:bg-purple-600 text-white rounded text-xs font-medium transition cursor-pointer flex items-center gap-1 shrink-0"
              >
                <Check className="w-3 h-3" />
                <span>Add</span>
              </button>
            </div>
          ) : (
            <div className="text-[10px] text-zinc-500 italic p-1.5 bg-[#121214] rounded border border-[#242428]">
              No other groups in scene yet. Create a new group below!
            </div>
          )}
        </div>

        {/* 2. Create New Group with Selected */}
        <div className="pt-2 border-t border-[#242428] space-y-2">
          {isNamingGroup ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                autoFocus
                placeholder="Group Name..."
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateNewGroup()}
                className="flex-1 bg-[#121214] border border-purple-500 rounded px-2.5 py-1.5 text-xs text-white outline-none"
              />
              <button
                type="button"
                onClick={handleCreateNewGroup}
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded text-xs font-medium transition cursor-pointer"
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => setIsNamingGroup(false)}
                className="p-1.5 text-zinc-400 hover:text-white rounded"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsNamingGroup(true)}
              className="w-full py-1.5 px-3 rounded bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-300 text-xs font-medium flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <FolderPlus className="w-3.5 h-3.5 text-purple-400" />
              <span>Create New Group with {selectedLayerIds.length} Layers</span>
            </button>
          )}
        </div>

        {/* 3. Ungroup if any are grouped */}
        {hasGroupedMember && (
          <div className="pt-2 border-t border-[#242428]">
            <button
              type="button"
              onClick={() => removeLayersFromGroup(selectedLayerIds)}
              className="w-full py-1.5 px-3 rounded bg-[#222227] hover:bg-[#2c2c32] hover:text-white border border-[#2c2c32] text-xs text-zinc-300 flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <FolderMinus className="w-3.5 h-3.5 text-purple-400" />
              <span>Ungroup Selected Layers</span>
            </button>
          </div>
        )}
      </div>

      {/* Batch Delete */}
      <div className="bg-[#1a1a1e] p-3 rounded border border-[#28282e]">
        <button
          type="button"
          onClick={() => deleteLayersBatch(selectedLayerIds)}
          className="w-full py-2 px-3 rounded bg-[#222227] hover:bg-rose-950/50 hover:text-rose-300 hover:border-rose-800/50 border border-[#2c2c32] text-xs text-zinc-300 flex items-center justify-center gap-2 transition cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5 text-rose-400" />
          <span>Delete All {selectedLayerIds.length} Selected Layers</span>
        </button>
      </div>
    </div>
  );
}
