'use client';

import React from 'react';
import { MousePointer, Sparkles, Diamond, PenTool, Compass, Navigation } from 'lucide-react';
import { useMotion } from '@/context/MotionContext';
import { CursorType, CursorPathMode, CursorClickAnim } from '@/types/motion';
import { getInterpolatedValue } from '@/modules/keyframes/evaluator';

export function CursorInspectorSection() {
  const {
    selectedLayer,
    updateLayer,
    setAnimPropValue,
    toggleKeyframe,
    addStartAndEndKeyframes,
    currentTime,
  } = useMotion();

  if (!selectedLayer || selectedLayer.shapeType !== 'cursor') return null;

  const cursorType = selectedLayer.cursorType || 'pointer';
  const color = selectedLayer.cursorColor || selectedLayer.fill || '#ffffff';
  const size = selectedLayer.cursorSize ?? 24;
  const pathMode = selectedLayer.cursorPathMode || 'customPath';
  const duration = selectedLayer.cursorPathDuration ?? 2.5;
  const clickAnim = selectedLayer.cursorClickAnim || 'ripple';
  const clickInterval = selectedLayer.cursorClickInterval ?? 2.0;
  const isBlinking = selectedLayer.cursorBlinking ?? false;
  const showTrail = selectedLayer.cursorTrail ?? true;
  const orientToMotion = selectedLayer.cursorOrientToMotion ?? true;
  const showFlightPath = selectedLayer.showCursorPath ?? true;

  const progress = getInterpolatedValue(selectedLayer, 'cursorProgress', currentTime);
  const hasKf = selectedLayer.keyframes?.cursorProgress?.some(
    (k) => Math.abs(k.time - currentTime) < 0.04
  );

  const cursorTypes: { id: CursorType; label: string }[] = [
    { id: 'pointer', label: 'Pointer' },
    { id: 'hand', label: 'Hand Finger' },
    { id: 'crosshair', label: 'Crosshair' },
    { id: 'beam', label: 'Text Beam' },
    { id: 'glowDot', label: 'Glow Dot' },
  ];

  const pathModes: { id: CursorPathMode; label: string }[] = [
    { id: 'customPath', label: 'Custom Spline' },
    { id: 'orbit', label: 'Orbit Path' },
    { id: 'linear', label: 'Linear Flight' },
    { id: 'float', label: 'Hover Float' },
  ];

  const clickAnims: { id: CursorClickAnim; label: string }[] = [
    { id: 'ripple', label: 'Ripple Wave' },
    { id: 'press', label: 'Press Recoil' },
    { id: 'burst', label: 'Sparkle Burst' },
    { id: 'none', label: 'No Click' },
  ];

  return (
    <div className="bg-[#1a1a1e] p-2.5 rounded border border-[#28282e] space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
          <MousePointer className="w-3.5 h-3.5 text-purple-400" />
          Motion Cursor & Flight
        </span>
        <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-700/50 uppercase">
          {cursorType}
        </span>
      </div>

      {/* Cursor Shape / Type */}
      <div>
        <label className="text-[11px] text-zinc-400 block mb-1.5">Cursor Glyph</label>
        <div className="grid grid-cols-3 gap-1">
          {cursorTypes.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => updateLayer(selectedLayer.id, { cursorType: c.id })}
              className={`py-1 px-1 rounded text-[10px] font-medium border text-center transition cursor-pointer ${
                cursorType === c.id
                  ? 'bg-purple-600/30 text-purple-200 border-purple-500/60'
                  : 'bg-[#121214] text-zinc-400 border-[#2c2c32] hover:bg-[#202026] hover:text-zinc-200'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Flight Path Mode */}
      <div>
        <label className="text-[11px] text-zinc-400 block mb-1.5">Path Flight Mode</label>
        <div className="grid grid-cols-2 gap-1">
          {pathModes.map((pm) => (
            <button
              key={pm.id}
              type="button"
              onClick={() => updateLayer(selectedLayer.id, { cursorPathMode: pm.id })}
              className={`py-1 px-1 rounded text-[10px] font-medium border text-center transition cursor-pointer ${
                pathMode === pm.id
                  ? 'bg-purple-600/30 text-purple-200 border-purple-500/60'
                  : 'bg-[#121214] text-zinc-400 border-[#2c2c32] hover:bg-[#202026] hover:text-zinc-200'
              }`}
            >
              {pm.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Spline Bezier Pen Tool Button */}
      {pathMode === 'customPath' && (
        <button
          type="button"
          onClick={() =>
            updateLayer(selectedLayer.id, { isPenEditing: !selectedLayer.isPenEditing })
          }
          className={`w-full py-1.5 px-2 rounded text-xs font-semibold flex items-center justify-center gap-1.5 border transition cursor-pointer ${
            selectedLayer.isPenEditing
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 animate-pulse'
              : 'bg-[#181822] text-zinc-300 border-[#2f2f3d] hover:bg-[#252535]'
          }`}
        >
          <PenTool className="w-3.5 h-3.5 text-amber-400" />
          {selectedLayer.isPenEditing ? 'Editing Flight Spline (Click canvas)' : 'Edit Spline Path on Canvas'}
        </button>
      )}

      {/* Keyframeable Flight Progress */}
      <div className="bg-[#141418] p-2 rounded border border-[#2a2a32] space-y-1.5">
        <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1">
          <div className="flex items-center gap-1.5">
            <span>Flight Traversal Progress</span>
            <button
              type="button"
              onClick={() => toggleKeyframe(selectedLayer.id, 'cursorProgress')}
              title={hasKf ? 'Remove keyframe at playhead' : 'Add keyframe at playhead'}
              className={`p-1 rounded transition cursor-pointer ${
                hasKf
                  ? 'text-purple-400 bg-purple-950/60 hover:bg-purple-900/60'
                  : 'text-zinc-600 hover:text-zinc-300'
              }`}
            >
              <Diamond className={`w-3 h-3 ${hasKf ? 'fill-purple-400' : ''}`} />
            </button>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-purple-300 font-semibold">{Math.round(progress)}%</span>
            <button
              type="button"
              onClick={() => addStartAndEndKeyframes(selectedLayer.id, 'cursorProgress', 0, 100, duration)}
              className="text-[9px] px-1.5 py-0.5 rounded bg-[#1e1e24] hover:bg-purple-950 text-zinc-300 hover:text-purple-300 border border-[#303038] hover:border-purple-600 transition"
              title="Add 0% start and 100% end keyframes"
            >
              0%→100%
            </button>
          </div>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={progress}
          onChange={(e) =>
            setAnimPropValue(selectedLayer.id, 'cursorProgress', parseFloat(e.target.value) || 0)
          }
          className="w-full accent-purple-500 cursor-pointer"
        />
      </div>

      {/* Click Timestamps String */}
      <div>
        <label className="text-[11px] text-zinc-400 block mb-1">
          Click Timestamps (seconds, e.g. "0.8, 1.8, 2.8")
        </label>
        <input
          type="text"
          value={selectedLayer.cursorClickTimes || ''}
          placeholder="0.8, 1.8, 2.8"
          onChange={(e) => updateLayer(selectedLayer.id, { cursorClickTimes: e.target.value })}
          className="w-full bg-[#121216] border border-[#2c2c36] rounded px-2 py-1 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-purple-500 font-mono"
        />
      </div>

      {/* Click Effect */}
      <div>
        <label className="text-[11px] text-zinc-400 block mb-1.5">Click Animation Style</label>
        <div className="grid grid-cols-2 gap-1">
          {clickAnims.map((ca) => (
            <button
              key={ca.id}
              type="button"
              onClick={() => updateLayer(selectedLayer.id, { cursorClickAnim: ca.id })}
              className={`py-1 px-1 rounded text-[10px] font-medium border text-center transition cursor-pointer ${
                clickAnim === ca.id
                  ? 'bg-purple-600/30 text-purple-200 border-purple-500/60'
                  : 'bg-[#121214] text-zinc-400 border-[#2c2c32] hover:bg-[#202026] hover:text-zinc-200'
              }`}
            >
              {ca.label}
            </button>
          ))}
        </div>
      </div>

      {/* Keyframeable Flight Progress */}
      <div className="bg-[#141418] p-2 rounded border border-[#2a2a32] space-y-1.5">
        <div className="flex items-center justify-between text-[11px] text-zinc-400">
          <div className="flex items-center gap-1.5">
            <span>Flight Progress</span>
            <button
              type="button"
              onClick={() => toggleKeyframe(selectedLayer.id, 'cursorProgress')}
              title={hasKf ? 'Remove keyframe at playhead' : 'Add keyframe at playhead'}
              className={`p-1 rounded transition cursor-pointer ${
                hasKf
                  ? 'text-purple-400 bg-purple-950/60 hover:bg-purple-900/60'
                  : 'text-zinc-600 hover:text-zinc-300'
              }`}
            >
              <Diamond className={`w-3 h-3 ${hasKf ? 'fill-purple-400' : ''}`} />
            </button>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-purple-300 font-semibold">{Math.round(progress)}%</span>
            <button
              type="button"
              onClick={() => addStartAndEndKeyframes(selectedLayer.id, 'cursorProgress', 0, 100, duration)}
              className="text-[9px] px-1.5 py-0.5 rounded bg-[#1e1e24] hover:bg-purple-950 text-zinc-300 hover:text-purple-300 border border-[#303038] hover:border-purple-600 transition"
              title="Add 0% start and 100% end keyframes"
            >
              0%→100%
            </button>
          </div>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={progress}
          onChange={(e) =>
            setAnimPropValue(selectedLayer.id, 'cursorProgress', parseFloat(e.target.value) || 0)
          }
          className="w-full accent-purple-500 cursor-pointer"
        />
      </div>

      {/* Size & Duration */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[11px] text-zinc-400 block mb-1">Cursor Size: {size}px</label>
          <input
            type="range"
            min="12"
            max="64"
            value={size}
            onChange={(e) => updateLayer(selectedLayer.id, { cursorSize: parseInt(e.target.value, 10) || 24 })}
            className="w-full accent-purple-500 cursor-pointer"
          />
        </div>
        <div>
          <label className="text-[11px] text-zinc-400 block mb-1">Flight Loop: {duration}s</label>
          <input
            type="range"
            min="0.5"
            max="8"
            step="0.5"
            value={duration}
            onChange={(e) => updateLayer(selectedLayer.id, { cursorPathDuration: parseFloat(e.target.value) || 2.5 })}
            className="w-full accent-purple-500 cursor-pointer"
          />
        </div>
      </div>

      {/* Keyframeable Flight Progress */}
      <div className="bg-[#141418] p-2 rounded border border-[#2a2a32] space-y-1.5">
        <div className="flex items-center justify-between text-[11px] text-zinc-400">
          <div className="flex items-center gap-1.5">
            <span>Flight Progress</span>
            <button
              type="button"
              onClick={() => toggleKeyframe(selectedLayer.id, 'cursorProgress')}
              title={hasKf ? 'Remove keyframe at playhead' : 'Add keyframe at playhead'}
              className={`p-1 rounded transition cursor-pointer ${
                hasKf
                  ? 'text-purple-400 bg-purple-950/60 hover:bg-purple-900/60'
                  : 'text-zinc-600 hover:text-zinc-300'
              }`}
            >
              <Diamond className={`w-3 h-3 ${hasKf ? 'fill-purple-400' : ''}`} />
            </button>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-purple-300 font-semibold">{Math.round(progress)}%</span>
            <button
              type="button"
              onClick={() => addStartAndEndKeyframes(selectedLayer.id, 'cursorProgress', 0, 100, duration)}
              className="text-[9px] px-1.5 py-0.5 rounded bg-[#1e1e24] hover:bg-purple-950 text-zinc-300 hover:text-purple-300 border border-[#303038] hover:border-purple-600 transition"
              title="Add 0% start and 100% end keyframes"
            >
              0%→100%
            </button>
          </div>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={progress}
          onChange={(e) =>
            setAnimPropValue(selectedLayer.id, 'cursorProgress', parseFloat(e.target.value) || 0)
          }
          className="w-full accent-purple-500 cursor-pointer"
        />
      </div>

      {/* Click Cadence & Color */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[11px] text-zinc-400 block mb-1">Auto Click: {clickInterval}s</label>
          <input
            type="range"
            min="0.5"
            max="5"
            step="0.5"
            value={clickInterval}
            onChange={(e) => updateLayer(selectedLayer.id, { cursorClickInterval: parseFloat(e.target.value) || 2.0 })}
            className="w-full accent-purple-500 cursor-pointer"
          />
        </div>
        <div>
          <label className="text-[11px] text-zinc-400 block mb-1">Cursor Color</label>
          <div className="flex items-center gap-1.5">
            <input
              type="color"
              value={color}
              onChange={(e) => updateLayer(selectedLayer.id, { cursorColor: e.target.value, fill: e.target.value })}
              className="w-7 h-7 rounded border border-[#3a3a44] bg-transparent cursor-pointer"
            />
            <span className="text-[10px] font-mono text-zinc-400 uppercase">{color}</span>
          </div>
        </div>
      </div>

      {/* Keyframeable Flight Progress */}
      <div className="bg-[#141418] p-2 rounded border border-[#2a2a32] space-y-1.5">
        <div className="flex items-center justify-between text-[11px] text-zinc-400">
          <div className="flex items-center gap-1.5">
            <span>Flight Progress</span>
            <button
              type="button"
              onClick={() => toggleKeyframe(selectedLayer.id, 'cursorProgress')}
              title={hasKf ? 'Remove keyframe at playhead' : 'Add keyframe at playhead'}
              className={`p-1 rounded transition cursor-pointer ${
                hasKf
                  ? 'text-purple-400 bg-purple-950/60 hover:bg-purple-900/60'
                  : 'text-zinc-600 hover:text-zinc-300'
              }`}
            >
              <Diamond className={`w-3 h-3 ${hasKf ? 'fill-purple-400' : ''}`} />
            </button>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-purple-300 font-semibold">{Math.round(progress)}%</span>
            <button
              type="button"
              onClick={() => addStartAndEndKeyframes(selectedLayer.id, 'cursorProgress', 0, 100, duration)}
              className="text-[9px] px-1.5 py-0.5 rounded bg-[#1e1e24] hover:bg-purple-950 text-zinc-300 hover:text-purple-300 border border-[#303038] hover:border-purple-600 transition"
              title="Add 0% start and 100% end keyframes"
            >
              0%→100%
            </button>
          </div>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={progress}
          onChange={(e) =>
            setAnimPropValue(selectedLayer.id, 'cursorProgress', parseFloat(e.target.value) || 0)
          }
          className="w-full accent-purple-500 cursor-pointer"
        />
      </div>

      {/* Flight & Motion Toggles */}
      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#28282e]">
        <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-300">
          <input
            type="checkbox"
            checked={orientToMotion}
            onChange={(e) => updateLayer(selectedLayer.id, { cursorOrientToMotion: e.target.checked })}
            className="rounded accent-purple-500 cursor-pointer"
          />
          <span>Orient to Motion</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-300">
          <input
            type="checkbox"
            checked={showFlightPath}
            onChange={(e) => updateLayer(selectedLayer.id, { showCursorPath: e.target.checked })}
            className="rounded accent-purple-500 cursor-pointer"
          />
          <span>Show Flight Path</span>
        </label>
      </div>

      {/* Blink Mode & Motion Trail */}
      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#28282e]">
        <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-300">
          <input
            type="checkbox"
            checked={isBlinking}
            onChange={(e) => updateLayer(selectedLayer.id, { cursorBlinking: e.target.checked })}
            className="rounded accent-purple-500 cursor-pointer"
          />
          <span>Blink Mode</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-300">
          <input
            type="checkbox"
            checked={showTrail}
            onChange={(e) => updateLayer(selectedLayer.id, { cursorTrail: e.target.checked })}
            className="rounded accent-purple-500 cursor-pointer"
          />
          <span>Motion Trail</span>
        </label>
      </div>
    </div>
  );
}
