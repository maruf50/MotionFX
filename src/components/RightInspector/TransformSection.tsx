'use client';

import React from 'react';
import { Diamond, Sliders } from 'lucide-react';
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
  } = useMotion();

  if (!selectedLayer) return null;

  const tr = getLayerTransformAtTime(selectedLayer, currentTime);

  const isKeyframedNow = (prop: AnimatableProp) =>
    hasKeyframeAtTime(selectedLayer, prop, currentTime);

  return (
    <div className="bg-[#171925] p-3 rounded-xl border border-[#1e2130] space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
          <Diamond className="w-3 h-3 text-amber-400 fill-amber-400" />
          Transform (Keyframable)
        </span>

        <button
          onClick={() => keyAllTransformProps(selectedLayer.id)}
          className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 transition cursor-pointer"
          title="Add keyframes to all transform properties at current playhead"
        >
          + Key All
        </button>
      </div>

      {/* Position X & Y */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
            <span>Position X</span>
            <button
              onClick={() => toggleKeyframe(selectedLayer.id, 'x')}
              className={`p-0.5 transition cursor-pointer ${
                isKeyframedNow('x')
                  ? 'text-amber-400 scale-110'
                  : 'text-slate-500 hover:text-amber-300'
              }`}
              title="Toggle Keyframe for Position X"
            >
              <Diamond className={`w-2.5 h-2.5 ${isKeyframedNow('x') ? 'fill-amber-400' : ''}`} />
            </button>
          </div>
          <input
            type="number"
            value={Math.round(tr.x)}
            onChange={(e) =>
              setAnimPropValue(selectedLayer.id, 'x', parseFloat(e.target.value) || 0)
            }
            className="w-full bg-[#090a0f] border border-[#2b2f44] focus:border-indigo-500 rounded-md px-2 py-1 text-xs font-mono text-white outline-none"
          />
        </div>

        <div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
            <span>Position Y</span>
            <button
              onClick={() => toggleKeyframe(selectedLayer.id, 'y')}
              className={`p-0.5 transition cursor-pointer ${
                isKeyframedNow('y')
                  ? 'text-amber-400 scale-110'
                  : 'text-slate-500 hover:text-amber-300'
              }`}
              title="Toggle Keyframe for Position Y"
            >
              <Diamond className={`w-2.5 h-2.5 ${isKeyframedNow('y') ? 'fill-amber-400' : ''}`} />
            </button>
          </div>
          <input
            type="number"
            value={Math.round(tr.y)}
            onChange={(e) =>
              setAnimPropValue(selectedLayer.id, 'y', parseFloat(e.target.value) || 0)
            }
            className="w-full bg-[#090a0f] border border-[#2b2f44] focus:border-indigo-500 rounded-md px-2 py-1 text-xs font-mono text-white outline-none"
          />
        </div>
      </div>

      {/* Scale X & Scale Y */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
            <span>Scale X</span>
            <button
              onClick={() => toggleKeyframe(selectedLayer.id, 'scaleX')}
              className={`p-0.5 transition cursor-pointer ${
                isKeyframedNow('scaleX')
                  ? 'text-amber-400 scale-110'
                  : 'text-slate-500 hover:text-amber-300'
              }`}
              title="Toggle Keyframe for Scale X"
            >
              <Diamond
                className={`w-2.5 h-2.5 ${isKeyframedNow('scaleX') ? 'fill-amber-400' : ''}`}
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
            className="w-full bg-[#090a0f] border border-[#2b2f44] focus:border-indigo-500 rounded-md px-2 py-1 text-xs font-mono text-white outline-none"
          />
        </div>

        <div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
            <span>Scale Y</span>
            <button
              onClick={() => toggleKeyframe(selectedLayer.id, 'scaleY')}
              className={`p-0.5 transition cursor-pointer ${
                isKeyframedNow('scaleY')
                  ? 'text-amber-400 scale-110'
                  : 'text-slate-500 hover:text-amber-300'
              }`}
              title="Toggle Keyframe for Scale Y"
            >
              <Diamond
                className={`w-2.5 h-2.5 ${isKeyframedNow('scaleY') ? 'fill-amber-400' : ''}`}
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
            className="w-full bg-[#090a0f] border border-[#2b2f44] focus:border-indigo-500 rounded-md px-2 py-1 text-xs font-mono text-white outline-none"
          />
        </div>
      </div>

      {/* Rotation & Opacity */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
            <span>Rotation (°)</span>
            <button
              onClick={() => toggleKeyframe(selectedLayer.id, 'rotation')}
              className={`p-0.5 transition cursor-pointer ${
                isKeyframedNow('rotation')
                  ? 'text-amber-400 scale-110'
                  : 'text-slate-500 hover:text-amber-300'
              }`}
              title="Toggle Keyframe for Rotation"
            >
              <Diamond
                className={`w-2.5 h-2.5 ${isKeyframedNow('rotation') ? 'fill-amber-400' : ''}`}
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
            className="w-full bg-[#090a0f] border border-[#2b2f44] focus:border-indigo-500 rounded-md px-2 py-1 text-xs font-mono text-white outline-none"
          />
        </div>

        <div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
            <span>Opacity</span>
            <button
              onClick={() => toggleKeyframe(selectedLayer.id, 'opacity')}
              className={`p-0.5 transition cursor-pointer ${
                isKeyframedNow('opacity')
                  ? 'text-amber-400 scale-110'
                  : 'text-slate-500 hover:text-amber-300'
              }`}
              title="Toggle Keyframe for Opacity"
            >
              <Diamond
                className={`w-2.5 h-2.5 ${isKeyframedNow('opacity') ? 'fill-amber-400' : ''}`}
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
            className="w-full bg-[#090a0f] border border-[#2b2f44] focus:border-indigo-500 rounded-md px-2 py-1 text-xs font-mono text-white outline-none"
          />
        </div>
      </div>

      {/* Layer Easing Curve */}
      <div className="pt-1">
        <label className="text-[11px] text-slate-400 block mb-1">Interpolation Curve</label>
        <select
          value={selectedLayer.easing}
          onChange={(e) => updateLayer(selectedLayer.id, { easing: e.target.value as EasingType })}
          className="w-full bg-[#090a0f] border border-[#2b2f44] focus:border-indigo-500 rounded-md px-2 py-1 text-xs font-sans text-white outline-none cursor-pointer"
        >
          {EASING_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
