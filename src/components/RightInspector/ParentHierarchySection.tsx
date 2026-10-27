'use client';

import React from 'react';
import {
  Link as LinkIcon,
  FolderPlus,
  FolderMinus,
  FolderInput,
  Folder,
  RotateCcw,
  GitBranch,
} from 'lucide-react';
import { useMotion } from '@/context/MotionContext';
import { isDescendantOf } from '@/modules/keyframes/evaluator';

export function ParentHierarchySection() {
  const {
    selectedLayer,
    layers,
    setLayerParent,
    createGroup,
    addLayersToGroup,
    ungroupLayer,
    deleteAllKeyframes,
  } = useMotion();

  if (!selectedLayer) return null;

  // Eligible parents: exclude self and any of own descendants
  const eligibleParents = layers.filter(
    (l) => l.id !== selectedLayer.id && !isDescendantOf(l.id, selectedLayer.id, layers)
  );

  const existingGroups = layers.filter(
    (l) =>
      l.type === 'group' &&
      l.id !== selectedLayer.id &&
      !isDescendantOf(l.id, selectedLayer.id, layers)
  );

  const currentParent = selectedLayer.parentId
    ? layers.find((l) => l.id === selectedLayer.parentId)
    : null;

  const isGroup = selectedLayer.type === 'group';

  return (
    <div className="bg-[#1a1a1e] p-2.5 rounded border border-[#28282e] space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-300">
          <GitBranch className="w-3.5 h-3.5 text-purple-400" />
          <span>Hierarchy & Parenting</span>
        </div>
        {selectedLayer.parentId && (
          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-purple-950/60 text-purple-300 border border-purple-700/50">
            Parented
          </span>
        )}
      </div>

      {/* Parent Layer Selector */}
      <div className="space-y-1.5">
        <label className="text-[11px] text-zinc-400 flex items-center justify-between">
          <span>Parent Layer:</span>
          {currentParent && (
            <button
              onClick={() => setLayerParent(selectedLayer.id, null)}
              className="text-[10px] text-rose-400 hover:text-rose-300 underline cursor-pointer"
            >
              Clear Parent
            </button>
          )}
        </label>

        <div className="relative">
          <select
            value={selectedLayer.parentId || ''}
            onChange={(e) => setLayerParent(selectedLayer.id, e.target.value || null)}
            className="w-full bg-[#121214] border border-[#2c2c32] focus:border-purple-500 rounded px-2.5 py-1.5 text-xs text-white outline-none cursor-pointer"
          >
            <option value="">None (Canvas Root)</option>
            {eligibleParents.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name} ({l.type})
              </option>
            ))}
          </select>
        </div>
        <p className="text-[10px] text-zinc-500">
          {currentParent
            ? `Follows ${currentParent.name}'s position, rotation & scale.`
            : 'Moves independently in canvas world coordinates.'}
        </p>
      </div>

      {/* Add to Existing Group (if not already a group) */}
      {!isGroup && existingGroups.length > 0 && (
        <div className="pt-2 border-t border-[#242428] space-y-1.5">
          <label className="text-[11px] text-zinc-400 flex items-center gap-1">
            <FolderInput className="w-3 h-3 text-purple-400" />
            <span>Add to Group:</span>
          </label>
          <select
            value={selectedLayer.groupId || ''}
            onChange={(e) => {
              if (e.target.value) {
                addLayersToGroup(e.target.value, [selectedLayer.id]);
              }
            }}
            className="w-full bg-[#121214] border border-[#2c2c32] focus:border-purple-500 rounded px-2.5 py-1.5 text-xs text-zinc-200 outline-none cursor-pointer"
          >
            <option value="">Select group...</option>
            {existingGroups.map((grp) => (
              <option key={grp.id} value={grp.id}>
                {grp.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Group Actions */}
      <div className="pt-2 border-t border-[#242428] flex items-center gap-2">
        {isGroup ? (
          <button
            onClick={() => ungroupLayer(selectedLayer.id)}
            className="flex-1 py-1.5 px-2 rounded bg-[#222227] hover:bg-rose-950/40 hover:text-rose-300 border border-[#2c2c32] text-xs text-zinc-300 flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <FolderMinus className="w-3.5 h-3.5 text-zinc-400" />
            <span>Ungroup</span>
          </button>
        ) : (
          <button
            onClick={() => createGroup('Group', [selectedLayer.id])}
            className="flex-1 py-1.5 px-2 rounded bg-[#222227] hover:bg-[#2c2c32] hover:text-white border border-[#2c2c32] hover:border-purple-500/40 text-xs text-zinc-300 flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <FolderPlus className="w-3.5 h-3.5 text-purple-400" />
            <span>New Group</span>
          </button>
        )}

        {/* Delete All Keyframes */}
        <button
          onClick={() => deleteAllKeyframes(selectedLayer.id)}
          className="flex-1 py-1.5 px-2 rounded bg-[#222227] hover:bg-rose-950/40 hover:text-rose-300 border border-[#2c2c32] hover:border-rose-900/40 text-xs text-zinc-300 flex items-center justify-center gap-1.5 transition cursor-pointer"
          title="Delete all animation keyframes and freeze current pose"
        >
          <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
          <span>Clear Keyframes</span>
        </button>
      </div>
    </div>
  );
}
