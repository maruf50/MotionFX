'use client';

import React from 'react';
import { Percent, Activity, Sliders, CircleDot, Columns, Minus, Diamond } from 'lucide-react';
import { useMotion } from '@/context/MotionContext';
import { BarShape } from '@/types/motion';
import { getInterpolatedValue } from '@/modules/keyframes/evaluator';
import { ColorPickerWithAlpha } from './ColorPickerWithAlpha';

export function BarInspectorSection() {
  const {
    selectedLayer,
    updateLayer,
    setAnimPropValue,
    toggleKeyframe,
    addStartAndEndKeyframes,
    currentTime,
    isAutoKeyframe,
  } = useMotion();

  if (!selectedLayer || selectedLayer.shapeType !== 'bar') return null;

  const hasKeyframes = Boolean(selectedLayer.keyframes?.barPercentage?.length);
  const percentage = hasKeyframes
    ? getInterpolatedValue(selectedLayer, 'barPercentage', currentTime)
    : (selectedLayer.barPercentage ?? 75);
  const barShape = selectedLayer.barShape || 'horizontal';
  const showLabel = selectedLayer.barShowLabel ?? true;

  const hasKf = selectedLayer.keyframes?.barPercentage?.some(
    (k) => Math.abs(k.time - currentTime) < 0.04
  );

  const quickPresets = [25, 50, 75, 100];

  const handlePercentageChange = (val: number) => {
    if (hasKeyframes || isAutoKeyframe) {
      setAnimPropValue(selectedLayer.id, 'barPercentage', val, true);
    } else {
      updateLayer(selectedLayer.id, { barPercentage: val });
    }
  };

  return (
    <div className="bg-[#1a1a1e] p-2.5 rounded border border-[#28282e] space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
          <Percent className="w-3.5 h-3.5 text-purple-400" />
          Fillable Bar & Gauge
        </span>
        <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-700/50">
          {Math.round(percentage)}%
        </span>
      </div>

      {/* Percentage Control */}
      <div>
        <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1">
          <div className="flex items-center gap-1.5">
            <span>Fill Percentage</span>
            <button
              type="button"
              onClick={() => toggleKeyframe(selectedLayer.id, 'barPercentage')}
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
            <span className="font-mono text-purple-300 font-semibold">{Math.round(percentage)}%</span>
            <button
              type="button"
              onClick={() => addStartAndEndKeyframes(selectedLayer.id, 'barPercentage', 0, 100, 2.0)}
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
          step="1"
          value={percentage}
          onChange={(e) => handlePercentageChange(parseFloat(e.target.value) || 0)}
          className="w-full accent-purple-500 cursor-pointer"
        />

        {/* Quick Presets */}
        <div className="grid grid-cols-4 gap-1 mt-1.5">
          {quickPresets.map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => handlePercentageChange(val)}
              className={`py-1 rounded text-[10px] font-mono transition border ${
                Math.round(percentage) === val
                  ? 'bg-purple-600/30 text-purple-200 border-purple-500/60'
                  : 'bg-[#121214] text-zinc-400 border-[#2c2c32] hover:bg-[#202026] hover:text-zinc-200'
              }`}
            >
              {val}%
            </button>
          ))}
        </div>
      </div>

      {/* Bar Shape Selector */}
      <div>
        <label className="text-[11px] text-zinc-400 block mb-1.5">Bar Shape</label>
        <div className="grid grid-cols-4 gap-1">
          <button
            type="button"
            onClick={() => updateLayer(selectedLayer.id, { barShape: 'horizontal' })}
            className={`flex flex-col items-center justify-center p-1.5 rounded border text-[10px] transition ${
              barShape === 'horizontal'
                ? 'bg-purple-600/20 border-purple-500 text-purple-200 font-semibold'
                : 'bg-[#121214] border-[#2c2c32] text-zinc-400 hover:text-zinc-200'
            }`}
            title="Horizontal Progress Bar"
          >
            <Minus className="w-3.5 h-3.5 mb-0.5" />
            <span>Linear</span>
          </button>

          <button
            type="button"
            onClick={() => updateLayer(selectedLayer.id, { barShape: 'vertical' })}
            className={`flex flex-col items-center justify-center p-1.5 rounded border text-[10px] transition ${
              barShape === 'vertical'
                ? 'bg-purple-600/20 border-purple-500 text-purple-200 font-semibold'
                : 'bg-[#121214] border-[#2c2c32] text-zinc-400 hover:text-zinc-200'
            }`}
            title="Vertical Bar Column"
          >
            <Columns className="w-3.5 h-3.5 mb-0.5 rotate-90" />
            <span>Vertical</span>
          </button>

          <button
            type="button"
            onClick={() => updateLayer(selectedLayer.id, { barShape: 'radial' })}
            className={`flex flex-col items-center justify-center p-1.5 rounded border text-[10px] transition ${
              barShape === 'radial'
                ? 'bg-purple-600/20 border-purple-500 text-purple-200 font-semibold'
                : 'bg-[#121214] border-[#2c2c32] text-zinc-400 hover:text-zinc-200'
            }`}
            title="Radial Circular Donut Ring"
          >
            <CircleDot className="w-3.5 h-3.5 mb-0.5" />
            <span>Radial</span>
          </button>

          <button
            type="button"
            onClick={() => updateLayer(selectedLayer.id, { barShape: 'pill' })}
            className={`flex flex-col items-center justify-center p-1.5 rounded border text-[10px] transition ${
              barShape === 'pill'
                ? 'bg-purple-600/20 border-purple-500 text-purple-200 font-semibold'
                : 'bg-[#121214] border-[#2c2c32] text-zinc-400 hover:text-zinc-200'
            }`}
            title="Capsule / Pill"
          >
            <Activity className="w-3.5 h-3.5 mb-0.5" />
            <span>Pill</span>
          </button>
        </div>
      </div>

      {/* Colors with Alpha: Fill vs Track Background */}
      <div className="space-y-2">
        <ColorPickerWithAlpha
          label="Fill Color & Alpha"
          color={selectedLayer.barFillColor || selectedLayer.fill || '#6366f1'}
          onChange={(newFill) =>
            updateLayer(selectedLayer.id, {
              barFillColor: newFill,
              fill: newFill,
            })
          }
        />

        <ColorPickerWithAlpha
          label="Track Color & Alpha"
          color={selectedLayer.barTrackColor || '#22232a'}
          onChange={(newTrack) =>
            updateLayer(selectedLayer.id, { barTrackColor: newTrack })
          }
        />
      </div>

      {/* Thickness / Ring Width */}
      <div>
        <div className="flex justify-between items-center text-[11px] text-zinc-400 mb-1.5">
          <span>{barShape === 'radial' ? 'Ring Thickness' : 'Track Height / Thickness'}</span>
          <div className="flex items-center gap-1">
            {[8, 14, 24, 40].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => updateLayer(selectedLayer.id, { barThickness: t })}
                className={`px-1.5 py-0.5 rounded text-[9px] font-mono border transition cursor-pointer ${
                  (selectedLayer.barThickness || 14) === t
                    ? 'bg-purple-600/30 text-purple-200 border-purple-500/60 font-semibold'
                    : 'bg-[#121214] text-zinc-400 border-[#2c2c32] hover:bg-[#1e1e24] hover:text-white'
                }`}
              >
                {t}px
              </button>
            ))}
          </div>
        </div>
        <div className="relative flex items-center">
          <input
            type="number"
            min="1"
            step="1"
            value={selectedLayer.barThickness || 14}
            onChange={(e) =>
              updateLayer(selectedLayer.id, {
                barThickness: Math.max(1, parseInt(e.target.value, 10) || 1),
              })
            }
            className="w-full bg-[#121214] border border-[#2c2c32] focus:border-purple-500 rounded px-2.5 py-1.5 pr-8 text-xs font-mono text-white outline-none"
            placeholder="Enter thickness (px)"
          />
          <span className="absolute right-2.5 text-[10px] font-mono text-zinc-500 pointer-events-none">
            px
          </span>
        </div>
      </div>

      {/* Percentage Label Controls */}
      <div className="pt-2 border-t border-[#242428] space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-zinc-300">Show Percentage Number</span>
          <input
            type="checkbox"
            checked={showLabel}
            onChange={(e) =>
              updateLayer(selectedLayer.id, { barShowLabel: e.target.checked })
            }
            className="rounded accent-purple-500 cursor-pointer"
          />
        </div>

        {showLabel && (
          <div className="space-y-2 pt-1 border-t border-[#242428]/60">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-zinc-400 block mb-1">Font Size (px)</label>
                <div className="relative flex items-center">
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={selectedLayer.barFontSize || 14}
                    onChange={(e) =>
                      updateLayer(selectedLayer.id, {
                        barFontSize: Math.max(1, parseInt(e.target.value, 10) || 14),
                      })
                    }
                    className="w-full bg-[#121214] border border-[#2c2c32] focus:border-purple-500 rounded px-2 py-1 pr-7 text-xs font-mono text-white outline-none"
                    placeholder="Size"
                  />
                  <span className="absolute right-2 text-[10px] font-mono text-zinc-500 pointer-events-none">
                    px
                  </span>
                </div>
              </div>

              <div className="bg-[#121214] p-1.5 rounded border border-[#2c2c32] flex items-center justify-between self-end">
                <span className="text-[10px] text-zinc-300">Text Color</span>
                <input
                  type="color"
                  value={selectedLayer.barLabelColor || '#ffffff'}
                  onChange={(e) =>
                    updateLayer(selectedLayer.id, { barLabelColor: e.target.value })
                  }
                  className="w-5 h-5 rounded cursor-pointer bg-transparent border-0"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Dimensions (Width / Height) */}
      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#242428]">
        <div>
          <label className="text-[11px] text-zinc-400 block mb-1">Width (px)</label>
          <input
            type="number"
            min="20"
            max="2000"
            value={selectedLayer.width}
            onChange={(e) =>
              updateLayer(selectedLayer.id, {
                width: parseFloat(e.target.value) || 40,
              })
            }
            className="w-full bg-[#121214] border border-[#2c2c32] focus:border-purple-500 rounded px-2 py-1 text-xs font-mono text-white outline-none"
          />
        </div>
        <div>
          <label className="text-[11px] text-zinc-400 block mb-1">Height (px)</label>
          <input
            type="number"
            min="10"
            max="2000"
            value={selectedLayer.height}
            onChange={(e) =>
              updateLayer(selectedLayer.id, {
                height: parseFloat(e.target.value) || 20,
              })
            }
            className="w-full bg-[#121214] border border-[#2c2c32] focus:border-purple-500 rounded px-2 py-1 text-xs font-mono text-white outline-none"
          />
        </div>
      </div>
    </div>
  );
}
