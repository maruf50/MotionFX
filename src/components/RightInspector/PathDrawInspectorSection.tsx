'use client';

import React from 'react';
import { Route, Type, Diamond, PenTool, Sparkles } from 'lucide-react';
import { useMotion } from '@/context/MotionContext';
import { PathDrawType, PathDrawTextAnim, PathAnimStyle } from '@/types/motion';
import { getInterpolatedValue } from '@/modules/keyframes/evaluator';

export function PathDrawInspectorSection() {
  const {
    selectedLayer,
    updateLayer,
    setAnimPropValue,
    toggleKeyframe,
    addStartAndEndKeyframes,
    currentTime,
  } = useMotion();

  if (!selectedLayer || selectedLayer.shapeType !== 'pathDraw') return null;

  const pathType = selectedLayer.pathDrawType || 'wave';
  const animStyle = selectedLayer.pathAnimStyle || 'writeOn';
  const strokeW = selectedLayer.pathDrawStrokeWidth ?? 4;
  const strokeColor = selectedLayer.pathDrawColor || selectedLayer.stroke || '#8b5cf6';
  const isDashed = selectedLayer.pathDrawDashed ?? false;
  const showArrow = selectedLayer.pathDrawArrow ?? true;
  const duration = selectedLayer.pathDrawDuration ?? 2.5;
  const text = selectedLayer.pathDrawText || '';
  const textAnim = selectedLayer.pathDrawTextAnimation || 'reveal';
  const fontSize = selectedLayer.pathDrawTextFontSize ?? 13;
  const textColor = selectedLayer.pathDrawTextColor || '#ffffff';

  const progress = getInterpolatedValue(selectedLayer, 'pathDrawProgress', currentTime);
  const hasKf = selectedLayer.keyframes?.pathDrawProgress?.some(
    (k) => Math.abs(k.time - currentTime) < 0.04
  );

  const pathTypes: { id: PathDrawType; label: string }[] = [
    { id: 'wave', label: 'Wave' },
    { id: 'arc', label: 'Arch' },
    { id: 'spiral', label: 'Spiral' },
    { id: 'infinity', label: 'Infinity' },
    { id: 'straight', label: 'Line' },
    { id: 'custom', label: 'Custom' },
  ];

  const animStyles: { id: PathAnimStyle; label: string }[] = [
    { id: 'writeOn', label: 'Write-on Stroke' },
    { id: 'laserBeam', label: 'Laser Comet' },
    { id: 'dashFlow', label: 'Dash Flow' },
    { id: 'pulseGlow', label: 'Pulse Glow' },
  ];

  const textAnims: { id: PathDrawTextAnim; label: string }[] = [
    { id: 'reveal', label: 'Reveal with Path' },
    { id: 'travel', label: 'Travel Loop' },
    { id: 'wave', label: 'Letter Wave' },
    { id: 'typewriter', label: 'Typewriter' },
    { id: 'none', label: 'Static' },
  ];

  return (
    <div className="bg-[#1a1a1e] p-2.5 rounded border border-[#28282e] space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
          <Route className="w-3.5 h-3.5 text-purple-400" />
          Path Draw & Text Flow
        </span>
        <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-700/50 uppercase">
          {pathType}
        </span>
      </div>

      {/* Pen Tool to Specify Custom Path */}
      <div className="bg-[#141418] p-2 rounded border border-[#2a2a32] space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-zinc-300 font-mono uppercase font-semibold flex items-center gap-1.5">
            <PenTool className="w-3.5 h-3.5 text-amber-400" />
            Pen Tool (Specify Path)
          </span>
          {selectedLayer.isPenEditing && (
            <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-950/70 text-amber-300 border border-amber-500/50 animate-pulse">
              EDITING ON CANVAS
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => {
            const isEditing = !selectedLayer.isPenEditing;
            const pts =
              selectedLayer.pathPoints && selectedLayer.pathPoints.length >= 2
                ? selectedLayer.pathPoints
                : [
                    { x: -140, y: 30, cp1x: -100, cp1y: -20, cp2x: -60, cp2y: 60 },
                    { x: -20, y: -20, cp1x: 20, cp1y: -60, cp2x: 60, cp2y: 40 },
                    { x: 140, y: 10, cp1x: 100, cp1y: -20, cp2x: 120, cp2y: 20 },
                  ];
            updateLayer(selectedLayer.id, {
              pathDrawType: 'custom',
              isPenEditing: isEditing,
              pathPoints: pts,
            });
          }}
          className={`w-full py-2 px-2.5 rounded text-xs font-semibold flex items-center justify-center gap-2 border transition cursor-pointer shadow-sm ${
            selectedLayer.isPenEditing
              ? 'bg-amber-500/25 text-amber-200 border-amber-500/80 shadow-amber-950/40'
              : 'bg-gradient-to-r from-[#2a1e38] to-[#1e1c2b] text-purple-200 border-purple-500/50 hover:border-purple-400 hover:from-[#352547] hover:to-[#262337]'
          }`}
        >
          <PenTool className="w-4 h-4 text-amber-400" />
          <span>
            {selectedLayer.isPenEditing
              ? 'Done Pen Editing (Click Canvas to Add Points)'
              : 'Draw / Specify Path with Pen Tool'}
          </span>
        </button>

        {selectedLayer.pathPoints && selectedLayer.pathPoints.length > 0 && (
          <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-1 border-t border-[#232328]">
            <span>{selectedLayer.pathPoints.length} anchor points on canvas</span>
            <button
              type="button"
              onClick={() => {
                const defaultPts = [
                  { x: -140, y: 30, cp1x: -100, cp1y: -20, cp2x: -60, cp2y: 60 },
                  { x: -20, y: -20, cp1x: 20, cp1y: -60, cp2x: 60, cp2y: 40 },
                  { x: 140, y: 10, cp1x: 100, cp1y: -20, cp2x: 120, cp2y: 20 },
                ];
                updateLayer(selectedLayer.id, { pathPoints: defaultPts, pathDrawType: 'custom' });
              }}
              className="text-purple-400 hover:text-purple-300 font-mono text-[9px] underline cursor-pointer"
            >
              Reset Points
            </button>
          </div>
        )}
      </div>

      {/* Path Shape Selector */}
      <div>
        <label className="text-[11px] text-zinc-400 block mb-1.5">Predefined Path Geometries</label>
        <div className="grid grid-cols-3 gap-1">
          {pathTypes.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => updateLayer(selectedLayer.id, { pathDrawType: p.id })}
              className={`py-1 rounded text-[10px] font-medium border text-center transition cursor-pointer ${
                pathType === p.id
                  ? 'bg-purple-600/30 text-purple-200 border-purple-500/60'
                  : 'bg-[#121214] text-zinc-400 border-[#2c2c32] hover:bg-[#202026] hover:text-zinc-200'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Path Animation Style */}
      <div>
        <label className="text-[11px] text-zinc-400 block mb-1.5 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-purple-400" />
          Draw Animation Style
        </label>
        <div className="grid grid-cols-2 gap-1">
          {animStyles.map((as) => (
            <button
              key={as.id}
              type="button"
              onClick={() => updateLayer(selectedLayer.id, { pathAnimStyle: as.id })}
              className={`py-1 px-1 rounded text-[10px] font-medium border text-center transition cursor-pointer ${
                animStyle === as.id
                  ? 'bg-purple-600/30 text-purple-200 border-purple-500/60'
                  : 'bg-[#121214] text-zinc-400 border-[#2c2c32] hover:bg-[#202026] hover:text-zinc-200'
              }`}
            >
              {as.label}
            </button>
          ))}
        </div>
      </div>

      {/* Keyframeable Draw Write-on Progress */}
      <div>
        <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1">
          <div className="flex items-center gap-1.5">
            <span>Draw Progress</span>
            <button
              type="button"
              onClick={() => toggleKeyframe(selectedLayer.id, 'pathDrawProgress')}
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
              onClick={() => addStartAndEndKeyframes(selectedLayer.id, 'pathDrawProgress', 0, 100, duration)}
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
            setAnimPropValue(selectedLayer.id, 'pathDrawProgress', parseFloat(e.target.value) || 0)
          }
          className="w-full accent-purple-500 cursor-pointer"
        />
      </div>

      {/* Stroke Width & Color */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[11px] text-zinc-400 block mb-1">Thickness</label>
          <div className="relative flex items-center">
            <input
              type="number"
              min="1"
              step="1"
              value={strokeW}
              onChange={(e) =>
                updateLayer(selectedLayer.id, { pathDrawStrokeWidth: Math.max(1, parseInt(e.target.value, 10) || 1) })
              }
              className="w-full bg-[#121214] border border-[#2c2c32] focus:border-purple-500 rounded px-2 py-1 pr-7 text-xs font-mono text-white outline-none"
              placeholder="Width"
            />
            <span className="absolute right-2 text-[10px] font-mono text-zinc-500 pointer-events-none">
              px
            </span>
          </div>
        </div>
        <div>
          <label className="text-[11px] text-zinc-400 block mb-1">Path Color</label>
          <div className="flex items-center gap-1.5">
            <input
              type="color"
              value={strokeColor}
              onChange={(e) => updateLayer(selectedLayer.id, { pathDrawColor: e.target.value })}
              className="w-7 h-7 rounded border border-[#3a3a44] bg-transparent cursor-pointer"
            />
            <span className="text-[10px] font-mono text-zinc-400 uppercase">{strokeColor}</span>
          </div>
        </div>
      </div>

      {/* Dashed & Arrowhead Toggles */}
      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#28282e]">
        <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-300">
          <input
            type="checkbox"
            checked={isDashed}
            onChange={(e) => updateLayer(selectedLayer.id, { pathDrawDashed: e.target.checked })}
            className="rounded accent-purple-500 cursor-pointer"
          />
          <span>Dashed Stroke</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-300">
          <input
            type="checkbox"
            checked={showArrow}
            onChange={(e) => updateLayer(selectedLayer.id, { pathDrawArrow: e.target.checked })}
            className="rounded accent-purple-500 cursor-pointer"
          />
          <span>Arrow Tip</span>
        </label>
      </div>

      {/* Kinetic Text Along Path */}
      <div className="pt-2 border-t border-[#28282e] space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-zinc-300 flex items-center gap-1.5">
            <Type className="w-3.5 h-3.5 text-purple-400" />
            Text Above / Along Path
          </span>
        </div>

        <input
          type="text"
          placeholder="Type text to follow path..."
          value={text}
          onChange={(e) => updateLayer(selectedLayer.id, { pathDrawText: e.target.value })}
          className="w-full bg-[#121214] border border-[#2c2c32] focus:border-purple-500 rounded px-2 py-1 text-xs text-white outline-none"
        />

        {text && (
          <>
            <div>
              <label className="text-[10px] text-zinc-400 uppercase font-mono block mb-1">
                Text Animation Mode
              </label>
              <div className="grid grid-cols-2 gap-1">
                {textAnims.map((ta) => (
                  <button
                    key={ta.id}
                    type="button"
                    onClick={() => updateLayer(selectedLayer.id, { pathDrawTextAnimation: ta.id })}
                    className={`py-1 px-1 rounded text-[10px] font-medium border text-center transition cursor-pointer ${
                      textAnim === ta.id
                        ? 'bg-purple-600/30 text-purple-200 border-purple-500/60'
                        : 'bg-[#121214] text-zinc-400 border-[#2c2c32] hover:bg-[#202026] hover:text-zinc-200'
                    }`}
                  >
                    {ta.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Font Size</label>
                <div className="relative flex items-center">
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={fontSize}
                    onChange={(e) =>
                      updateLayer(selectedLayer.id, { pathDrawTextFontSize: Math.max(1, parseInt(e.target.value, 10) || 12) })
                    }
                    className="w-full bg-[#121214] border border-[#2c2c32] focus:border-purple-500 rounded px-2 py-1 pr-7 text-xs font-mono text-white outline-none"
                    placeholder="Font size"
                  />
                  <span className="absolute right-2 text-[10px] font-mono text-zinc-500 pointer-events-none">
                    px
                  </span>
                </div>
              </div>
              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Text Color</label>
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => updateLayer(selectedLayer.id, { pathDrawTextColor: e.target.value })}
                  className="w-7 h-7 rounded border border-[#3a3a44] bg-transparent cursor-pointer"
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
