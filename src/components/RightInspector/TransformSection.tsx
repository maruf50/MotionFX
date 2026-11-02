'use client';

import React from 'react';
import { Diamond, Sliders, Sparkles, Maximize2 } from 'lucide-react';
import { useMotion } from '@/context/MotionContext';
import { AnimatableProp, EasingType } from '@/types/motion';
import { getLayerTransformAtTime, hasKeyframeAtTime } from '@/modules/keyframes/evaluator';
import { EASING_OPTIONS } from '@/modules/easing/easings';

export function TransformSection() {
  const {
    selectedLayer,
    currentTime,
    setAnimPropValue,
    toggleKeyframe,
    keyAllTransformProps,
    updateLayer,
    toggleFadeInOut,
    toggleScaleInOut,
  } = useMotion();

  if (!selectedLayer) return null;

  const tr = getLayerTransformAtTime(selectedLayer, currentTime);

  const isKeyframedNow = (prop: AnimatableProp) =>
    hasKeyframeAtTime(selectedLayer, prop, currentTime);

  return (
    <div className="bg-[#1a1a1e] p-2.5 rounded border border-[#28282e] space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
          <Diamond className="w-3 h-3 text-purple-400 fill-purple-400" />
          Transform (Keyframable)
        </span>

        <button
          onClick={() => keyAllTransformProps(selectedLayer.id)}
          className="text-[10px] px-2 py-0.5 rounded bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 transition cursor-pointer"
          title="Add keyframes to all transform properties at current playhead"
        >
          + Key All
        </button>
      </div>

      {/* Position X & Y */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1">
            <span>Position X</span>
            <button
              onClick={() => toggleKeyframe(selectedLayer.id, 'x')}
              className={`p-0.5 transition cursor-pointer ${
                isKeyframedNow('x')
                  ? 'text-purple-400 scale-110'
                  : 'text-zinc-500 hover:text-purple-300'
              }`}
              title="Toggle Keyframe for Position X"
            >
              <Diamond className={`w-2.5 h-2.5 ${isKeyframedNow('x') ? 'fill-purple-400' : ''}`} />
            </button>
          </div>
          <input
            type="number"
            value={Math.round(tr.x)}
            onChange={(e) =>
              setAnimPropValue(selectedLayer.id, 'x', parseFloat(e.target.value) || 0)
            }
            className="w-full bg-[#121214] border border-[#2c2c32] focus:border-purple-500 rounded px-2 py-1 text-xs font-mono text-white outline-none"
          />
        </div>

        <div>
          <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1">
            <span>Position Y</span>
            <button
              onClick={() => toggleKeyframe(selectedLayer.id, 'y')}
              className={`p-0.5 transition cursor-pointer ${
                isKeyframedNow('y')
                  ? 'text-purple-400 scale-110'
                  : 'text-zinc-500 hover:text-purple-300'
              }`}
              title="Toggle Keyframe for Position Y"
            >
              <Diamond className={`w-2.5 h-2.5 ${isKeyframedNow('y') ? 'fill-purple-400' : ''}`} />
            </button>
          </div>
          <input
            type="number"
            value={Math.round(tr.y)}
            onChange={(e) =>
              setAnimPropValue(selectedLayer.id, 'y', parseFloat(e.target.value) || 0)
            }
            className="w-full bg-[#121214] border border-[#2c2c32] focus:border-purple-500 rounded px-2 py-1 text-xs font-mono text-white outline-none"
          />
        </div>
      </div>

      {/* Scale X & Scale Y */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1">
            <span>Scale X</span>
            <button
              onClick={() => toggleKeyframe(selectedLayer.id, 'scaleX')}
              className={`p-0.5 transition cursor-pointer ${
                isKeyframedNow('scaleX')
                  ? 'text-purple-400 scale-110'
                  : 'text-zinc-500 hover:text-purple-300'
              }`}
              title="Toggle Keyframe for Scale X"
            >
              <Diamond
                className={`w-2.5 h-2.5 ${isKeyframedNow('scaleX') ? 'fill-purple-400' : ''}`}
              />
            </button>
          </div>
          <input
            type="number"
            step="0.05"
            value={Number(tr.scaleX.toFixed(2))}
            onChange={(e) =>
              setAnimPropValue(selectedLayer.id, 'scaleX', parseFloat(e.target.value) || 0)
            }
            className="w-full bg-[#121214] border border-[#2c2c32] focus:border-purple-500 rounded px-2 py-1 text-xs font-mono text-white outline-none"
          />
        </div>

        <div>
          <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1">
            <span>Scale Y</span>
            <button
              onClick={() => toggleKeyframe(selectedLayer.id, 'scaleY')}
              className={`p-0.5 transition cursor-pointer ${
                isKeyframedNow('scaleY')
                  ? 'text-purple-400 scale-110'
                  : 'text-zinc-500 hover:text-purple-300'
              }`}
              title="Toggle Keyframe for Scale Y"
            >
              <Diamond
                className={`w-2.5 h-2.5 ${isKeyframedNow('scaleY') ? 'fill-purple-400' : ''}`}
              />
            </button>
          </div>
          <input
            type="number"
            step="0.05"
            value={Number(tr.scaleY.toFixed(2))}
            onChange={(e) =>
              setAnimPropValue(selectedLayer.id, 'scaleY', parseFloat(e.target.value) || 0)
            }
            className="w-full bg-[#121214] border border-[#2c2c32] focus:border-purple-500 rounded px-2 py-1 text-xs font-mono text-white outline-none"
          />
        </div>
      </div>

      {/* Rotation & Opacity */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1">
            <span>Rotation (°)</span>
            <button
              onClick={() => toggleKeyframe(selectedLayer.id, 'rotation')}
              className={`p-0.5 transition cursor-pointer ${
                isKeyframedNow('rotation')
                  ? 'text-purple-400 scale-110'
                  : 'text-zinc-500 hover:text-purple-300'
              }`}
              title="Toggle Keyframe for Rotation"
            >
              <Diamond
                className={`w-2.5 h-2.5 ${isKeyframedNow('rotation') ? 'fill-purple-400' : ''}`}
              />
            </button>
          </div>
          <input
            type="number"
            step="5"
            value={Math.round(tr.rotation)}
            onChange={(e) =>
              setAnimPropValue(selectedLayer.id, 'rotation', parseFloat(e.target.value) || 0)
            }
            className="w-full bg-[#121214] border border-[#2c2c32] focus:border-purple-500 rounded px-2 py-1 text-xs font-mono text-white outline-none"
          />
        </div>

        <div>
          <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1">
            <span>Opacity</span>
            <button
              onClick={() => toggleKeyframe(selectedLayer.id, 'opacity')}
              className={`p-0.5 transition cursor-pointer ${
                isKeyframedNow('opacity')
                  ? 'text-purple-400 scale-110'
                  : 'text-zinc-500 hover:text-purple-300'
              }`}
              title="Toggle Keyframe for Opacity"
            >
              <Diamond
                className={`w-2.5 h-2.5 ${isKeyframedNow('opacity') ? 'fill-purple-400' : ''}`}
              />
            </button>
          </div>
          <input
            type="number"
            min="0"
            max="1"
            step="0.05"
            value={Number(tr.opacity.toFixed(2))}
            onChange={(e) =>
              setAnimPropValue(
                selectedLayer.id,
                'opacity',
                Math.max(0, Math.min(1, parseFloat(e.target.value) || 0))
              )
            }
            className="w-full bg-[#121214] border border-[#2c2c32] focus:border-purple-500 rounded px-2 py-1 text-xs font-mono text-white outline-none"
          />
        </div>
      </div>

      {/* Layer Easing Curve */}
      <div className="pt-0.5">
        <label className="text-[11px] text-zinc-400 block mb-1">Interpolation Curve</label>
        <select
          value={selectedLayer.easing}
          onChange={(e) => updateLayer(selectedLayer.id, { easing: e.target.value as EasingType })}
          className="w-full bg-[#121214] border border-[#2c2c32] focus:border-purple-500 rounded px-2 py-1 text-xs font-sans text-white outline-none cursor-pointer"
        >
          {EASING_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Layer In/Out Transitions (Top-Level) */}
      <div className="pt-2 border-t border-[#28282e] space-y-2">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 block">
          In / Out Transitions (Top-Level)
        </span>

        {/* Fade In/Out Row */}
        <div className="bg-[#121214] p-2 rounded border border-[#242428] space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-zinc-300 flex items-center gap-1.5 font-medium">
              <Sparkles className="w-3 h-3 text-amber-400" />
              Fade In / Out
            </span>
            <button
              onClick={() => toggleFadeInOut(selectedLayer.id)}
              className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold transition cursor-pointer ${
                selectedLayer.fadeInOut
                  ? 'bg-amber-500/25 text-amber-300 border border-amber-500/50'
                  : 'bg-[#202026] text-zinc-500 hover:text-zinc-300 border border-transparent'
              }`}
            >
              {selectedLayer.fadeInOut ? 'ON' : 'OFF'}
            </button>
          </div>

          {selectedLayer.fadeInOut && (
            <div className="flex items-center justify-between gap-2 pt-1">
              <span className="text-[10px] text-zinc-500">Duration:</span>
              <div className="flex items-center gap-1.5 flex-1 max-w-[140px]">
                <input
                  type="range"
                  min="0.1"
                  max="2.0"
                  step="0.05"
                  value={selectedLayer.fadeDuration ?? 0.5}
                  onChange={(e) =>
                    updateLayer(selectedLayer.id, { fadeDuration: parseFloat(e.target.value) || 0.5 })
                  }
                  className="w-full accent-amber-500 cursor-pointer h-1 bg-[#282830] rounded"
                />
                <span className="text-[10px] font-mono text-zinc-300 w-8 text-right">
                  {(selectedLayer.fadeDuration ?? 0.5).toFixed(2)}s
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Scale In/Out Row */}
        <div className="bg-[#121214] p-2 rounded border border-[#242428] space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-zinc-300 flex items-center gap-1.5 font-medium">
              <Maximize2 className="w-3 h-3 text-cyan-400" />
              Scale In / Out
            </span>
            <button
              onClick={() => toggleScaleInOut(selectedLayer.id)}
              className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold transition cursor-pointer ${
                selectedLayer.scaleInOut
                  ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-500/50'
                  : 'bg-[#202026] text-zinc-500 hover:text-zinc-300 border border-transparent'
              }`}
            >
              {selectedLayer.scaleInOut ? 'ON' : 'OFF'}
            </button>
          </div>

          {selectedLayer.scaleInOut && (
            <div className="flex items-center justify-between gap-2 pt-1">
              <span className="text-[10px] text-zinc-500">Duration:</span>
              <div className="flex items-center gap-1.5 flex-1 max-w-[140px]">
                <input
                  type="range"
                  min="0.1"
                  max="2.0"
                  step="0.05"
                  value={selectedLayer.scaleDuration ?? 0.5}
                  onChange={(e) =>
                    updateLayer(selectedLayer.id, { scaleDuration: parseFloat(e.target.value) || 0.5 })
                  }
                  className="w-full accent-cyan-500 cursor-pointer h-1 bg-[#282830] rounded"
                />
                <span className="text-[10px] font-mono text-zinc-300 w-8 text-right">
                  {(selectedLayer.scaleDuration ?? 0.5).toFixed(2)}s
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
