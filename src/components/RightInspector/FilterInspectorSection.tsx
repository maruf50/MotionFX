'use client';

import React from 'react';
import {
  Sparkles,
  Diamond,
  Play,
  Wand2,
  Ban,
  Waves,
  Contrast,
  Zap,
  Tv,
  Boxes,
  Activity,
  Droplets,
  LucideIcon,
} from 'lucide-react';
import { useMotion } from '@/context/MotionContext';
import { LayerFilterType } from '@/types/motion';
import { getInterpolatedValue, hasKeyframeAtTime } from '@/modules/keyframes/evaluator';
import { ColorPickerWithAlpha } from './ColorPickerWithAlpha';

interface FilterDef {
  type: LayerFilterType;
  label: string;
  Icon: LucideIcon;
  desc: string;
}

const FILTERS: FilterDef[] = [
  { type: 'none', label: 'None', Icon: Ban, desc: 'No filter applied' },
  { type: 'blur', label: 'Blur', Icon: Droplets, desc: 'Optical defocus & soft blur' },
  { type: 'glow', label: 'Glow', Icon: Sparkles, desc: 'Luminescent aura & bloom' },
  { type: 'wave', label: 'Wave', Icon: Waves, desc: 'Fluid sine-wave warp' },
  { type: 'blackAndWhite', label: 'B & W', Icon: Contrast, desc: 'Cinematic grayscale' },
  { type: 'glitch', label: 'Glitch', Icon: Zap, desc: 'Chromatic slice jitter' },
  { type: 'noise', label: 'Noise', Icon: Tv, desc: 'Film grain & static' },
  { type: 'shatter', label: 'Shatter', Icon: Boxes, desc: 'Fragmented geometric shards' },
  { type: 'wobble', label: 'Wobble', Icon: Activity, desc: 'Organic jelly jiggle' },
];

export function FilterInspectorSection() {
  const {
    selectedLayer,
    updateLayer,
    currentTime,
    setAnimPropValue,
    toggleKeyframe,
    addStartAndEndKeyframes,
  } = useMotion();

  if (!selectedLayer) return null;

  const currentFilter = selectedLayer.filterType || 'none';
  const intensity = getInterpolatedValue(selectedLayer, 'filterIntensity', currentTime);
  const hasKf = hasKeyframeAtTime(selectedLayer, 'filterIntensity', currentTime);

  const handleSelectFilter = (type: LayerFilterType) => {
    updateLayer(selectedLayer.id, {
      filterType: type,
      filterIntensity: selectedLayer.filterIntensity ?? 100,
    });
  };

  return (
    <div className="bg-[#1a1a1e] p-2.5 rounded border border-[#28282e] space-y-2.5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
          <Wand2 className="w-3 h-3 text-zinc-400" />
          Layer Filters & FX (Top-Level)
        </span>

        {currentFilter !== 'none' && (
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono font-bold uppercase border border-zinc-700">
            {currentFilter}
          </span>
        )}
      </div>

      {/* Filter Selection Grid */}
      <div className="grid grid-cols-4 gap-1.5">
        {FILTERS.map((f) => {
          const isSelected = currentFilter === f.type;
          const FilterIcon = f.Icon;
          return (
            <button
              key={f.type}
              type="button"
              onClick={() => handleSelectFilter(f.type)}
              className={`p-1.5 rounded flex flex-col items-center justify-center gap-1 transition cursor-pointer border ${
                isSelected
                  ? 'bg-zinc-200 text-zinc-950 border-white shadow-sm font-semibold'
                  : 'bg-[#141417] text-zinc-400 hover:text-zinc-200 hover:bg-[#1f1f26] border-[#25252c]'
              }`}
              title={f.desc}
            >
              <FilterIcon className={`w-3.5 h-3.5 ${isSelected ? 'text-zinc-950' : 'text-zinc-400'}`} />
              <span className="text-[10px] font-medium tracking-tight truncate w-full text-center">
                {f.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter Parameters when active */}
      {currentFilter !== 'none' && (
        <div className="pt-2 border-t border-[#28282e] space-y-2.5">
          {/* Keyframable Intensity Slider (0 to 100%) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-semibold text-zinc-300">Filter Intensity</span>
                <button
                  type="button"
                  onClick={() => toggleKeyframe(selectedLayer.id, 'filterIntensity')}
                  className={`p-0.5 rounded transition cursor-pointer ${
                    hasKf
                      ? 'text-fuchsia-400 hover:text-fuchsia-300'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                  title={hasKf ? 'Keyframe set at playhead (click to remove)' : 'Add keyframe at playhead'}
                >
                  <Diamond className={`w-3 h-3 ${hasKf ? 'fill-fuchsia-400' : ''}`} />
                </button>
              </div>

              <button
                type="button"
                onClick={() => addStartAndEndKeyframes(selectedLayer.id, 'filterIntensity', 0, 100, 2.0)}
                className="text-[10px] px-2 py-0.5 rounded bg-fuchsia-600/20 hover:bg-fuchsia-600/30 text-fuchsia-300 border border-fuchsia-500/40 transition cursor-pointer flex items-center gap-1"
                title="Create 0% -> 100% keyframe transition across 2s"
              >
                <Play className="w-2.5 h-2.5 fill-current" />
                0% → 100%
              </button>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={Math.round(intensity)}
                onChange={(e) => {
                  const val = Math.max(0, Math.min(100, parseFloat(e.target.value) || 0));
                  setAnimPropValue(selectedLayer.id, 'filterIntensity', val);
                }}
                className="w-full accent-fuchsia-500 cursor-pointer h-1.5 bg-[#25252e] rounded"
              />
              <span className="text-[11px] font-mono text-zinc-300 w-10 text-right shrink-0">
                {Math.round(intensity)}%
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1">
              {[0, 50, 100].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAnimPropValue(selectedLayer.id, 'filterIntensity', preset)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition cursor-pointer ${
                    Math.round(intensity) === preset
                      ? 'bg-fuchsia-600 text-white font-bold'
                      : 'bg-[#202026] text-zinc-400 hover:text-white'
                  }`}
                >
                  {preset}%
                </button>
              ))}
            </div>
          </div>

          {/* Specific Parameters for BLUR */}
          {currentFilter === 'blur' && (
            <div className="space-y-2 pt-1 border-t border-[#242428]">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] text-zinc-400">
                  <span>Blur Radius</span>
                  <span className="font-mono text-zinc-300">{selectedLayer.filterBlurRadius ?? 20}px</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="60"
                  step="1"
                  value={selectedLayer.filterBlurRadius ?? 20}
                  onChange={(e) =>
                    updateLayer(selectedLayer.id, { filterBlurRadius: parseInt(e.target.value, 10) })
                  }
                  className="w-full accent-fuchsia-500 cursor-pointer h-1 bg-[#25252e] rounded"
                />
              </div>
            </div>
          )}

          {/* Specific Parameters for GLOW */}
          {currentFilter === 'glow' && (
            <div className="space-y-2 pt-1 border-t border-[#242428]">
              <ColorPickerWithAlpha
                label="Glow Color"
                color={selectedLayer.filterGlowColor || selectedLayer.fill || '#a855f7'}
                onChange={(c) => updateLayer(selectedLayer.id, { filterGlowColor: c })}
              />

              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] text-zinc-400">
                  <span>Glow Radius</span>
                  <span className="font-mono text-zinc-300">{selectedLayer.filterGlowRadius ?? 24}px</span>
                </div>
                <input
                  type="range"
                  min="4"
                  max="60"
                  step="2"
                  value={selectedLayer.filterGlowRadius ?? 24}
                  onChange={(e) =>
                    updateLayer(selectedLayer.id, { filterGlowRadius: parseInt(e.target.value, 10) })
                  }
                  className="w-full accent-fuchsia-500 cursor-pointer h-1 bg-[#25252e] rounded"
                />
              </div>
            </div>
          )}

          {/* Specific Parameters for WAVE */}
          {currentFilter === 'wave' && (
            <div className="space-y-2 pt-1 border-t border-[#242428]">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] text-zinc-400">
                  <span>Wave Amplitude</span>
                  <span className="font-mono text-zinc-300">{selectedLayer.filterWaveAmplitude ?? 16}px</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="45"
                  step="1"
                  value={selectedLayer.filterWaveAmplitude ?? 16}
                  onChange={(e) =>
                    updateLayer(selectedLayer.id, { filterWaveAmplitude: parseInt(e.target.value, 10) })
                  }
                  className="w-full accent-fuchsia-500 cursor-pointer h-1 bg-[#25252e] rounded"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-zinc-400 block mb-0.5">Frequency</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={selectedLayer.filterWaveFrequency ?? 6}
                    onChange={(e) =>
                      updateLayer(selectedLayer.id, { filterWaveFrequency: parseInt(e.target.value, 10) || 6 })
                    }
                    className="w-full bg-[#121214] border border-[#2c2c32] rounded px-2 py-0.5 text-xs font-mono text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-400 block mb-0.5">Speed</label>
                  <input
                    type="number"
                    min="0"
                    max="15"
                    step="0.5"
                    value={selectedLayer.filterWaveSpeed ?? 4}
                    onChange={(e) =>
                      updateLayer(selectedLayer.id, { filterWaveSpeed: parseFloat(e.target.value) || 4 })
                    }
                    className="w-full bg-[#121214] border border-[#2c2c32] rounded px-2 py-0.5 text-xs font-mono text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Specific Parameters for BLACK & WHITE */}
          {currentFilter === 'blackAndWhite' && (
            <div className="space-y-2 pt-1 border-t border-[#242428]">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] text-zinc-400">
                  <span>Contrast Boost</span>
                  <span className="font-mono text-zinc-300">{selectedLayer.filterBwContrast ?? 100}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="200"
                  step="5"
                  value={selectedLayer.filterBwContrast ?? 100}
                  onChange={(e) =>
                    updateLayer(selectedLayer.id, { filterBwContrast: parseInt(e.target.value, 10) })
                  }
                  className="w-full accent-fuchsia-500 cursor-pointer h-1 bg-[#25252e] rounded"
                />
              </div>
            </div>
          )}

          {/* Specific Parameters for GLITCH */}
          {currentFilter === 'glitch' && (
            <div className="space-y-2 pt-1 border-t border-[#242428]">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] text-zinc-400">
                  <span>Glitch Slice Jitter</span>
                  <span className="font-mono text-zinc-300">{selectedLayer.filterGlitchAmount ?? 18}px</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="40"
                  step="2"
                  value={selectedLayer.filterGlitchAmount ?? 18}
                  onChange={(e) =>
                    updateLayer(selectedLayer.id, { filterGlitchAmount: parseInt(e.target.value, 10) })
                  }
                  className="w-full accent-fuchsia-500 cursor-pointer h-1 bg-[#25252e] rounded"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-zinc-400 block mb-0.5">Slices</label>
                  <input
                    type="number"
                    min="3"
                    max="20"
                    value={selectedLayer.filterGlitchSlices ?? 10}
                    onChange={(e) =>
                      updateLayer(selectedLayer.id, { filterGlitchSlices: parseInt(e.target.value, 10) || 10 })
                    }
                    className="w-full bg-[#121214] border border-[#2c2c32] rounded px-2 py-0.5 text-xs font-mono text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-400 block mb-0.5">Speed</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={selectedLayer.filterGlitchSpeed ?? 14}
                    onChange={(e) =>
                      updateLayer(selectedLayer.id, { filterGlitchSpeed: parseInt(e.target.value, 10) || 14 })
                    }
                    className="w-full bg-[#121214] border border-[#2c2c32] rounded px-2 py-0.5 text-xs font-mono text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Specific Parameters for NOISE */}
          {currentFilter === 'noise' && (
            <div className="space-y-2 pt-1 border-t border-[#242428]">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] text-zinc-400">
                  <span>Grain Density</span>
                  <span className="font-mono text-zinc-300">{selectedLayer.filterNoiseDensity ?? 50}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={selectedLayer.filterNoiseDensity ?? 50}
                  onChange={(e) =>
                    updateLayer(selectedLayer.id, { filterNoiseDensity: parseInt(e.target.value, 10) })
                  }
                  className="w-full accent-fuchsia-500 cursor-pointer h-1 bg-[#25252e] rounded"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-300">
                <input
                  type="checkbox"
                  checked={Boolean(selectedLayer.filterNoiseColor)}
                  onChange={(e) => updateLayer(selectedLayer.id, { filterNoiseColor: e.target.checked })}
                  className="accent-fuchsia-500"
                />
                <span>Chromatic RGB Noise</span>
              </label>
            </div>
          )}

          {/* Specific Parameters for SHATTER */}
          {currentFilter === 'shatter' && (
            <div className="space-y-2 pt-1 border-t border-[#242428]">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] text-zinc-400">
                  <span>Dispersal Spread</span>
                  <span className="font-mono text-zinc-300">{selectedLayer.filterShatterSpread ?? 60}px</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="160"
                  step="5"
                  value={selectedLayer.filterShatterSpread ?? 60}
                  onChange={(e) =>
                    updateLayer(selectedLayer.id, { filterShatterSpread: parseInt(e.target.value, 10) })
                  }
                  className="w-full accent-fuchsia-500 cursor-pointer h-1 bg-[#25252e] rounded"
                />
              </div>
            </div>
          )}

          {/* Specific Parameters for WOBBLE */}
          {currentFilter === 'wobble' && (
            <div className="space-y-2 pt-1 border-t border-[#242428]">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] text-zinc-400">
                  <span>Wobble Amount</span>
                  <span className="font-mono text-zinc-300">{selectedLayer.filterWobbleAmount ?? 12}</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="30"
                  step="1"
                  value={selectedLayer.filterWobbleAmount ?? 12}
                  onChange={(e) =>
                    updateLayer(selectedLayer.id, { filterWobbleAmount: parseInt(e.target.value, 10) })
                  }
                  className="w-full accent-fuchsia-500 cursor-pointer h-1 bg-[#25252e] rounded"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] text-zinc-400">
                  <span>Wobble Speed</span>
                  <span className="font-mono text-zinc-300">{selectedLayer.filterWobbleSpeed ?? 6}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="20"
                  step="1"
                  value={selectedLayer.filterWobbleSpeed ?? 6}
                  onChange={(e) =>
                    updateLayer(selectedLayer.id, { filterWobbleSpeed: parseInt(e.target.value, 10) })
                  }
                  className="w-full accent-fuchsia-500 cursor-pointer h-1 bg-[#25252e] rounded"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

