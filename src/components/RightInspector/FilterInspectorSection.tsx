'use client';

import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Wand2,
  Waves,
  Contrast,
  Zap,
  Tv,
  Boxes,
  Activity,
  Droplets,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  ArrowUp,
  ArrowDown,
  Layers,
  LucideIcon,
} from 'lucide-react';
import { useMotion } from '@/context/MotionContext';
import { LayerFilterItem, LayerFilterType } from '@/types/motion';
import { uid } from '@/modules/keyframes/evaluator';
import { ColorPickerWithAlpha } from './ColorPickerWithAlpha';

interface FilterMeta {
  type: LayerFilterType;
  label: string;
  Icon: LucideIcon;
  desc: string;
  defaultParams: Partial<LayerFilterItem>;
}

const AVAILABLE_FILTERS: FilterMeta[] = [
  {
    type: 'blur',
    label: 'Blur',
    Icon: Droplets,
    desc: 'Optical defocus & soft blur',
    defaultParams: { blurRadius: 20 },
  },
  {
    type: 'glow',
    label: 'Glow',
    Icon: Sparkles,
    desc: 'Luminescent aura & bloom',
    defaultParams: { glowColor: '#a855f7', glowRadius: 24 },
  },
  {
    type: 'wave',
    label: 'Wave',
    Icon: Waves,
    desc: 'Fluid sine-wave warp displacement',
    defaultParams: { waveFrequency: 6, waveAmplitude: 16, waveSpeed: 4 },
  },
  {
    type: 'blackAndWhite',
    label: 'B & W',
    Icon: Contrast,
    desc: 'Cinematic monochrome & contrast',
    defaultParams: { bwContrast: 100 },
  },
  {
    type: 'glitch',
    label: 'Glitch',
    Icon: Zap,
    desc: 'Chromatic slice jitter & RGB offset',
    defaultParams: { glitchAmount: 18, glitchSlices: 10, glitchSpeed: 14 },
  },
  {
    type: 'noise',
    label: 'Noise',
    Icon: Tv,
    desc: 'Cinematic film grain & static',
    defaultParams: { noiseDensity: 50, noiseColor: false },
  },
  {
    type: 'shatter',
    label: 'Shatter',
    Icon: Boxes,
    desc: 'Fragmented geometric shards',
    defaultParams: { shatterSpread: 60, shatterPieces: 16 },
  },
  {
    type: 'wobble',
    label: 'Wobble',
    Icon: Activity,
    desc: 'Organic jelly bounce & jiggle',
    defaultParams: { wobbleAmount: 12, wobbleSpeed: 6 },
  },
];

export function FilterInspectorSection() {
  const { selectedLayer, updateLayer } = useMotion();

  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  // Resolve current filter stack (migrating legacy single filter if present)
  const filters: LayerFilterItem[] = useMemo(() => {
    if (!selectedLayer) return [];
    if (selectedLayer.filters && Array.isArray(selectedLayer.filters)) {
      return selectedLayer.filters;
    }
    // Auto-migrate legacy single filter
    if (selectedLayer.filterType && selectedLayer.filterType !== 'none') {
      return [
        {
          id: 'filter_init',
          type: selectedLayer.filterType,
          enabled: true,
          intensity: selectedLayer.filterIntensity ?? 100,
          blurRadius: selectedLayer.filterBlurRadius,
          glowColor: selectedLayer.filterGlowColor,
          glowRadius: selectedLayer.filterGlowRadius,
          waveFrequency: selectedLayer.filterWaveFrequency,
          waveAmplitude: selectedLayer.filterWaveAmplitude,
          waveSpeed: selectedLayer.filterWaveSpeed,
          bwContrast: selectedLayer.filterBwContrast,
          glitchAmount: selectedLayer.filterGlitchAmount,
          glitchSlices: selectedLayer.filterGlitchSlices,
          glitchSpeed: selectedLayer.filterGlitchSpeed,
          noiseDensity: selectedLayer.filterNoiseDensity,
          noiseColor: selectedLayer.filterNoiseColor,
          shatterSpread: selectedLayer.filterShatterSpread,
          wobbleAmount: selectedLayer.filterWobbleAmount,
          wobbleSpeed: selectedLayer.filterWobbleSpeed,
        },
      ];
    }
    return [];
  }, [selectedLayer]);

  if (!selectedLayer) return null;

  const activeCount = filters.filter((f) => f.enabled !== false && f.type !== 'none').length;

  const commitFilters = (newFilters: LayerFilterItem[]) => {
    updateLayer(selectedLayer.id, {
      filters: newFilters,
      filterType: newFilters[0]?.type || 'none',
      filterIntensity: newFilters[0]?.intensity ?? 100,
    });
  };

  const handleAddFilter = (meta: FilterMeta) => {
    const newId = uid('fx');
    const newItem: LayerFilterItem = {
      id: newId,
      type: meta.type,
      enabled: true,
      intensity: 100,
      ...meta.defaultParams,
    };
    const nextFilters = [...filters, newItem];
    commitFilters(nextFilters);
    setExpandedIds((prev) => ({ ...prev, [newId]: true }));
    setIsAddMenuOpen(false);
  };

  const handleToggleEnabled = (id: string) => {
    const next = filters.map((f) => (f.id === id ? { ...f, enabled: !f.enabled } : f));
    commitFilters(next);
  };

  const handleUpdateItem = (id: string, updates: Partial<LayerFilterItem>) => {
    const next = filters.map((f) => (f.id === id ? { ...f, ...updates } : f));
    commitFilters(next);
  };

  const handleDeleteFilter = (id: string) => {
    const next = filters.filter((f) => f.id !== id);
    commitFilters(next);
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= filters.length) return;
    const reordered = [...filters];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIdx, 0, moved);
    commitFilters(reordered);
  };

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="bg-[#1a1a1e] p-2.5 rounded border border-[#28282e] space-y-2.5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Wand2 className="w-3.5 h-3.5 text-purple-400" />
          <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-300">
            Layer Filters & FX (Stack)
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {activeCount > 0 && (
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-900/50 text-purple-300 font-mono font-bold uppercase border border-purple-700/50">
              {activeCount} Active
            </span>
          )}

          {/* Add Filter Button */}
          <button
            type="button"
            onClick={() => setIsAddMenuOpen((prev) => !prev)}
            className="text-[10px] px-2 py-0.5 rounded bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/50 transition cursor-pointer flex items-center gap-1 font-medium"
            title="Add a filter to the layer FX stack"
          >
            <Plus className="w-3 h-3" />
            <span>Add FX</span>
          </button>
        </div>
      </div>

      {/* Add Filter Dropdown Popover */}
      {isAddMenuOpen && (
        <div className="bg-[#141418] border border-purple-500/40 rounded-lg p-2 space-y-1.5 shadow-xl animate-in fade-in zoom-in-95 duration-100">
          <div className="flex items-center justify-between text-[10px] text-zinc-400 px-0.5">
            <span>Select FX Filter to Add</span>
            <button
              type="button"
              onClick={() => setIsAddMenuOpen(false)}
              className="text-zinc-500 hover:text-white"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-4 gap-1">
            {AVAILABLE_FILTERS.map((meta) => {
              const Icon = meta.Icon;
              return (
                <button
                  key={meta.type}
                  type="button"
                  onClick={() => handleAddFilter(meta)}
                  className="p-1.5 rounded bg-[#1c1c22] hover:bg-purple-600/30 border border-[#2c2c36] hover:border-purple-500/60 transition cursor-pointer flex flex-col items-center justify-center gap-1 text-center group"
                  title={meta.desc}
                >
                  <Icon className="w-3.5 h-3.5 text-zinc-400 group-hover:text-purple-300" />
                  <span className="text-[10px] font-medium text-zinc-300 group-hover:text-white">
                    {meta.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Filter FX Stack Cards */}
      {filters.length === 0 ? (
        <div className="py-4 px-2 text-center border border-dashed border-[#282832] rounded-lg bg-[#141418] space-y-2">
          <Layers className="w-5 h-5 mx-auto text-zinc-600" />
          <p className="text-[11px] text-zinc-400">No active filter FX on this layer.</p>
          <div className="flex flex-wrap items-center justify-center gap-1 pt-1">
            {AVAILABLE_FILTERS.slice(0, 5).map((f) => (
              <button
                key={f.type}
                type="button"
                onClick={() => handleAddFilter(f)}
                className="text-[9px] px-2 py-0.5 rounded bg-[#202028] hover:bg-[#2b2b36] text-zinc-300 hover:text-white border border-[#30303c] transition cursor-pointer"
              >
                + {f.label}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-1.5">
          {filters.map((item, index) => {
            const meta = AVAILABLE_FILTERS.find((f) => f.type === item.type);
            const Icon = meta?.Icon || Wand2;
            const isExpanded = expandedIds[item.id] ?? true;

            return (
              <div
                key={item.id}
                className={`rounded border transition ${
                  item.enabled !== false
                    ? 'bg-[#151518] border-[#2c2c36]'
                    : 'bg-[#121215] border-[#222228] opacity-60'
                }`}
              >
                {/* Filter Item Header */}
                <div className="px-2 py-1.5 flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1.5 truncate">
                    {/* Toggle Visibility */}
                    <button
                      type="button"
                      onClick={() => handleToggleEnabled(item.id)}
                      className={`p-0.5 rounded transition cursor-pointer ${
                        item.enabled !== false
                          ? 'text-purple-400 hover:text-purple-300'
                          : 'text-zinc-600 hover:text-zinc-400'
                      }`}
                      title={item.enabled !== false ? 'Disable filter' : 'Enable filter'}
                    >
                      {item.enabled !== false ? (
                        <Eye className="w-3.5 h-3.5" />
                      ) : (
                        <EyeOff className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <Icon className="w-3.5 h-3.5 text-zinc-300 shrink-0" />
                    <span className="text-xs font-semibold text-zinc-200 truncate">
                      {meta?.label || item.type}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500">
                      {item.intensity ?? 100}%
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Move Up */}
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMove(index, 'up')}
                      className={`p-0.5 rounded transition ${
                        index > 0
                          ? 'text-zinc-400 hover:text-white cursor-pointer'
                          : 'text-zinc-700 cursor-not-allowed'
                      }`}
                      title="Move up in filter stack"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>

                    {/* Move Down */}
                    <button
                      type="button"
                      disabled={index === filters.length - 1}
                      onClick={() => handleMove(index, 'down')}
                      className={`p-0.5 rounded transition ${
                        index < filters.length - 1
                          ? 'text-zinc-400 hover:text-white cursor-pointer'
                          : 'text-zinc-700 cursor-not-allowed'
                      }`}
                      title="Move down in filter stack"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>

                    {/* Expand/Collapse */}
                    <button
                      type="button"
                      onClick={() => toggleExpand(item.id)}
                      className="p-0.5 text-zinc-400 hover:text-white transition cursor-pointer"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => handleDeleteFilter(item.id)}
                      className="p-0.5 text-zinc-500 hover:text-red-400 transition cursor-pointer ml-0.5"
                      title="Remove filter"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Filter Controls when expanded */}
                {isExpanded && (
                  <div className="p-2 pt-1 border-t border-[#222228] space-y-2 text-xs">
                    {/* Intensity Slider */}
                    <div>
                      <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1">
                        <span>Intensity</span>
                        <span className="font-mono text-purple-300 font-semibold">
                          {item.intensity ?? 100}%
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={item.intensity ?? 100}
                          onChange={(e) =>
                            handleUpdateItem(item.id, {
                              intensity: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="w-full accent-purple-500 cursor-pointer h-1.5 bg-[#25252e] rounded"
                        />
                      </div>
                      <div className="flex items-center gap-1 pt-1">
                        {[25, 50, 75, 100].map((pct) => (
                          <button
                            key={pct}
                            type="button"
                            onClick={() => handleUpdateItem(item.id, { intensity: pct })}
                            className={`flex-1 py-0.5 text-[9px] rounded font-mono border transition cursor-pointer text-center ${
                              item.intensity === pct
                                ? 'bg-purple-600/30 text-purple-200 border-purple-500 font-bold'
                                : 'bg-[#18181f] text-zinc-400 border-[#282832] hover:text-white'
                            }`}
                          >
                            {pct}%
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Blur specific params */}
                    {item.type === 'blur' && (
                      <div>
                        <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1">
                          <span>Blur Radius</span>
                          <span className="font-mono text-purple-300">
                            {item.blurRadius ?? 20}px
                          </span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="60"
                          value={item.blurRadius ?? 20}
                          onChange={(e) =>
                            handleUpdateItem(item.id, {
                              blurRadius: parseInt(e.target.value, 10) || 20,
                            })
                          }
                          className="w-full accent-purple-500 cursor-pointer h-1.5 bg-[#25252e] rounded"
                        />
                      </div>
                    )}

                    {/* Glow specific params */}
                    {item.type === 'glow' && (
                      <div className="space-y-1.5">
                        <ColorPickerWithAlpha
                          label="Glow Color"
                          color={item.glowColor || '#a855f7'}
                          onChange={(c) => handleUpdateItem(item.id, { glowColor: c })}
                        />
                        <div>
                          <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1">
                            <span>Glow Radius</span>
                            <span className="font-mono text-purple-300">
                              {item.glowRadius ?? 24}px
                            </span>
                          </div>
                          <input
                            type="range"
                            min="5"
                            max="60"
                            value={item.glowRadius ?? 24}
                            onChange={(e) =>
                              handleUpdateItem(item.id, {
                                glowRadius: parseInt(e.target.value, 10) || 24,
                              })
                            }
                            className="w-full accent-purple-500 cursor-pointer h-1.5 bg-[#25252e] rounded"
                          />
                        </div>
                      </div>
                    )}

                    {/* Wave specific params */}
                    {item.type === 'wave' && (
                      <div className="grid grid-cols-3 gap-1.5">
                        <div>
                          <label className="text-[10px] text-zinc-400 block mb-0.5">
                            Freq: {item.waveFrequency ?? 6}
                          </label>
                          <input
                            type="range"
                            min="1"
                            max="20"
                            value={item.waveFrequency ?? 6}
                            onChange={(e) =>
                              handleUpdateItem(item.id, {
                                waveFrequency: parseInt(e.target.value, 10) || 6,
                              })
                            }
                            className="w-full accent-purple-500 cursor-pointer"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-zinc-400 block mb-0.5">
                            Amp: {item.waveAmplitude ?? 16}px
                          </label>
                          <input
                            type="range"
                            min="2"
                            max="50"
                            value={item.waveAmplitude ?? 16}
                            onChange={(e) =>
                              handleUpdateItem(item.id, {
                                waveAmplitude: parseInt(e.target.value, 10) || 16,
                              })
                            }
                            className="w-full accent-purple-500 cursor-pointer"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-zinc-400 block mb-0.5">
                            Speed: {item.waveSpeed ?? 4}
                          </label>
                          <input
                            type="range"
                            min="1"
                            max="15"
                            value={item.waveSpeed ?? 4}
                            onChange={(e) =>
                              handleUpdateItem(item.id, {
                                waveSpeed: parseInt(e.target.value, 10) || 4,
                              })
                            }
                            className="w-full accent-purple-500 cursor-pointer"
                          />
                        </div>
                      </div>
                    )}

                    {/* B&W specific params */}
                    {item.type === 'blackAndWhite' && (
                      <div>
                        <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1">
                          <span>Contrast</span>
                          <span className="font-mono text-purple-300">
                            {item.bwContrast ?? 100}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min="50"
                          max="200"
                          value={item.bwContrast ?? 100}
                          onChange={(e) =>
                            handleUpdateItem(item.id, {
                              bwContrast: parseInt(e.target.value, 10) || 100,
                            })
                          }
                          className="w-full accent-purple-500 cursor-pointer h-1.5 bg-[#25252e] rounded"
                        />
                      </div>
                    )}

                    {/* Glitch specific params */}
                    {item.type === 'glitch' && (
                      <div className="grid grid-cols-3 gap-1.5">
                        <div>
                          <label className="text-[10px] text-zinc-400 block mb-0.5">
                            Amount: {item.glitchAmount ?? 18}
                          </label>
                          <input
                            type="range"
                            min="2"
                            max="40"
                            value={item.glitchAmount ?? 18}
                            onChange={(e) =>
                              handleUpdateItem(item.id, {
                                glitchAmount: parseInt(e.target.value, 10) || 18,
                              })
                            }
                            className="w-full accent-purple-500 cursor-pointer"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-zinc-400 block mb-0.5">
                            Slices: {item.glitchSlices ?? 10}
                          </label>
                          <input
                            type="range"
                            min="3"
                            max="20"
                            value={item.glitchSlices ?? 10}
                            onChange={(e) =>
                              handleUpdateItem(item.id, {
                                glitchSlices: parseInt(e.target.value, 10) || 10,
                              })
                            }
                            className="w-full accent-purple-500 cursor-pointer"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-zinc-400 block mb-0.5">
                            Speed: {item.glitchSpeed ?? 14}
                          </label>
                          <input
                            type="range"
                            min="1"
                            max="30"
                            value={item.glitchSpeed ?? 14}
                            onChange={(e) =>
                              handleUpdateItem(item.id, {
                                glitchSpeed: parseInt(e.target.value, 10) || 14,
                              })
                            }
                            className="w-full accent-purple-500 cursor-pointer"
                          />
                        </div>
                      </div>
                    )}

                    {/* Noise specific params */}
                    {item.type === 'noise' && (
                      <div className="space-y-1.5">
                        <div>
                          <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1">
                            <span>Density</span>
                            <span className="font-mono text-purple-300">
                              {item.noiseDensity ?? 50}%
                            </span>
                          </div>
                          <input
                            type="range"
                            min="10"
                            max="100"
                            value={item.noiseDensity ?? 50}
                            onChange={(e) =>
                              handleUpdateItem(item.id, {
                                noiseDensity: parseInt(e.target.value, 10) || 50,
                              })
                            }
                            className="w-full accent-purple-500 cursor-pointer h-1.5 bg-[#25252e] rounded"
                          />
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer text-[11px] text-zinc-300">
                          <input
                            type="checkbox"
                            checked={Boolean(item.noiseColor)}
                            onChange={(e) =>
                              handleUpdateItem(item.id, { noiseColor: e.target.checked })
                            }
                            className="rounded accent-purple-500 cursor-pointer"
                          />
                          <span>RGB Chromatic Noise</span>
                        </label>
                      </div>
                    )}

                    {/* Shatter specific params */}
                    {item.type === 'shatter' && (
                      <div>
                        <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1">
                          <span>Shard Spread</span>
                          <span className="font-mono text-purple-300">
                            {item.shatterSpread ?? 60}px
                          </span>
                        </div>
                        <input
                          type="range"
                          min="10"
                          max="200"
                          value={item.shatterSpread ?? 60}
                          onChange={(e) =>
                            handleUpdateItem(item.id, {
                              shatterSpread: parseInt(e.target.value, 10) || 60,
                            })
                          }
                          className="w-full accent-purple-500 cursor-pointer h-1.5 bg-[#25252e] rounded"
                        />
                      </div>
                    )}

                    {/* Wobble specific params */}
                    {item.type === 'wobble' && (
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-zinc-400 block mb-0.5">
                            Amount: {item.wobbleAmount ?? 12}
                          </label>
                          <input
                            type="range"
                            min="2"
                            max="30"
                            value={item.wobbleAmount ?? 12}
                            onChange={(e) =>
                              handleUpdateItem(item.id, {
                                wobbleAmount: parseInt(e.target.value, 10) || 12,
                              })
                            }
                            className="w-full accent-purple-500 cursor-pointer"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-zinc-400 block mb-0.5">
                            Speed: {item.wobbleSpeed ?? 6}
                          </label>
                          <input
                            type="range"
                            min="1"
                            max="20"
                            value={item.wobbleSpeed ?? 6}
                            onChange={(e) =>
                              handleUpdateItem(item.id, {
                                wobbleSpeed: parseInt(e.target.value, 10) || 6,
                              })
                            }
                            className="w-full accent-purple-500 cursor-pointer"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
