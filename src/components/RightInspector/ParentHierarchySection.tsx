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
    <div className="bg-[#171925] p-3 rounded-xl border border-[#1e2130] space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
          <GitBranch className="w-3.5 h-3.5 text-indigo-400" />
          <span>Hierarchy & Parenting</span>
        </div>
        {selectedLayer.parentId && (
          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            Parented
          </span>
        )}
      </div>

      {/* Parent Layer Selector */}
      <div className="space-y-1.5">
        <label className="text-[11px] text-slate-400 flex items-center justify-between">
          <span>Parent Layer:</span>
          {currentParent && (
            <button
              onClick={() => setLayerParent(selectedLayer.id, null)}
              className="text-[10px] text-red-400 hover:text-red-300 underline cursor-pointer"
            >
              Clear Parent
            </button>
          )}
        </label>

        <div className="relative">
          <select
            value={selectedLayer.parentId || ''}
            onChange={(e) => setLayerParent(selectedLayer.id, e.target.value || null)}
            className="w-full bg-[#090a0f] border border-[#2b2f44] focus:border-indigo-500 rounded-md px-2.5 py-1.5 text-xs text-white outline-none cursor-pointer"
          >
            <option value="">None (Canvas Root)</option>
            {eligibleParents.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name} ({l.type})
              </option>
            ))}
          </select>
        </div>
        <p className="text-[10px] text-slate-500">
          {currentParent
            ? `Follows ${currentParent.name}'s position, rotation & scale.`
            : 'Moves independently in canvas world coordinates.'}
        </p>
      </div>

      {/* Add to Existing Group (if not already a group) */}
      {!isGroup && existingGroups.length > 0 && (
        <div className="pt-2 border-t border-[#1e2130]/80 space-y-1.5">
          <label className="text-[11px] text-slate-400 flex items-center gap-1">
            <FolderInput className="w-3 h-3 text-amber-400" />
            <span>Add to Group:</span>
          </label>
          <select
            value={selectedLayer.groupId || ''}
            onChange={(e) => {
              if (e.target.value) {
                addLayersToGroup(e.target.value, [selectedLayer.id]);
              }
            }}
            className="w-full bg-[#090a0f] border border-[#2b2f44] focus:border-amber-500 rounded-md px-2.5 py-1.5 text-xs text-slate-300 outline-none cursor-pointer"
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
      <div className="pt-2 border-t border-[#1e2130]/80 flex items-center gap-2">
        {isGroup ? (
          <button
            onClick={() => ungroupLayer(selectedLayer.id)}
            className="flex-1 py-1.5 px-2 rounded-md bg-[#1e2130] hover:bg-amber-950/60 hover:text-amber-300 border border-[#2b2f44] text-xs text-slate-300 flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <FolderMinus className="w-3.5 h-3.5 text-amber-400" />
            <span>Ungroup</span>
          </button>
        ) : (
          <button
            onClick={() => createGroup('Group', [selectedLayer.id])}
            className="flex-1 py-1.5 px-2 rounded-md bg-[#1e2130] hover:bg-[#282c40] border border-[#2b2f44] text-xs text-slate-300 flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <FolderPlus className="w-3.5 h-3.5 text-indigo-400" />
            <span>New Group</span>
          </button>
        )}

        {/* Delete All Keyframes */}
        <button
          onClick={() => deleteAllKeyframes(selectedLayer.id)}
          className="flex-1 py-1.5 px-2 rounded-md bg-[#1e2130] hover:bg-red-950/50 hover:text-red-300 border border-[#2b2f44] hover:border-red-900/50 text-xs text-slate-300 flex items-center justify-center gap-1.5 transition cursor-pointer"
          title="Delete all animation keyframes and freeze current pose"
        >
          <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
          <span>Clear Keyframes</span>
        </button>
      </div>
    </div>
  );
}
