'use client';

import React, { useState } from 'react';
import {
  BarChart3,
  PieChart,
  LineChart,
  AreaChart,
  Activity,
  Plus,
  Trash2,
  Diamond,
  Play,
  Layers,
  Settings2,
  Palette,
} from 'lucide-react';
import { useMotion } from '@/context/MotionContext';
import { GraphType, GraphDataItem } from '@/types/motion';
import { getInterpolatedValue, hasKeyframeAtTime } from '@/modules/keyframes/evaluator';
import { ColorPickerWithAlpha } from './ColorPickerWithAlpha';

const GRAPH_PRESETS: { type: GraphType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { type: 'column', label: 'Column', icon: BarChart3 },
  { type: 'bar', label: 'Bar', icon: Activity },
  { type: 'line', label: 'Line', icon: LineChart },
  { type: 'area', label: 'Area', icon: AreaChart },
  { type: 'pie', label: 'Pie/Donut', icon: PieChart },
  { type: 'combo', label: 'Combo', icon: Layers },
];

const DATA_TEMPLATES: { name: string; items: GraphDataItem[] }[] = [
  {
    name: 'Weekly Traffic',
    items: [
      { id: '1', label: 'Mon', value: 45, color: '#6366f1', secondaryValue: 20 },
      { id: '2', label: 'Tue', value: 78, color: '#8b5cf6', secondaryValue: 38 },
      { id: '3', label: 'Wed', value: 62, color: '#ec4899', secondaryValue: 52 },
      { id: '4', label: 'Thu', value: 95, color: '#3b82f6', secondaryValue: 68 },
      { id: '5', label: 'Fri', value: 120, color: '#10b981', secondaryValue: 90 },
      { id: '6', label: 'Sat', value: 85, color: '#f59e0b', secondaryValue: 60 },
      { id: '7', label: 'Sun', value: 105, color: '#06b6d4', secondaryValue: 75 },
    ],
  },
  {
    name: 'Quarterly Growth',
    items: [
      { id: '1', label: 'Q1', value: 120, color: '#3b82f6', secondaryValue: 80 },
      { id: '2', label: 'Q2', value: 185, color: '#8b5cf6', secondaryValue: 130 },
      { id: '3', label: 'Q3', value: 240, color: '#ec4899', secondaryValue: 190 },
      { id: '4', label: 'Q4', value: 310, color: '#10b981', secondaryValue: 260 },
    ],
  },
  {
    name: 'Market Share',
    items: [
      { id: '1', label: 'Mobile', value: 55, color: '#6366f1' },
      { id: '2', label: 'Desktop', value: 35, color: '#ec4899' },
      { id: '3', label: 'Tablet', value: 10, color: '#10b981' },
    ],
  },
];

export function GraphInspectorSection() {
  const {
    selectedLayer,
    updateLayer,
    currentTime,
    setAnimPropValue,
    toggleKeyframe,
    addStartAndEndKeyframes,
  } = useMotion();

  const [activeTab, setActiveTab] = useState<'preset' | 'data' | 'style'>('preset');

  if (!selectedLayer || selectedLayer.shapeType !== 'graph') return null;

  const currentType: GraphType = selectedLayer.graphType || 'column';
  const progress = getInterpolatedValue(selectedLayer, 'graphProgress', currentTime);
  const hasKf = hasKeyframeAtTime(selectedLayer, 'graphProgress', currentTime);

  const data: GraphDataItem[] =
    selectedLayer.graphData && selectedLayer.graphData.length > 0
      ? selectedLayer.graphData
      : DATA_TEMPLATES[0].items;

  const handleUpdateItem = (idx: number, patch: Partial<GraphDataItem>) => {
    const updated = [...data];
    updated[idx] = { ...updated[idx], ...patch };
    updateLayer(selectedLayer.id, { graphData: updated });
  };

  const handleAddItem = () => {
    const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#06b6d4'];
    const newItem: GraphDataItem = {
      id: Math.random().toString(36).substring(2, 9),
      label: `Item ${data.length + 1}`,
      value: Math.round(30 + Math.random() * 70),
      color: colors[data.length % colors.length],
      secondaryValue: Math.round(20 + Math.random() * 50),
    };
    updateLayer(selectedLayer.id, { graphData: [...data, newItem] });
  };

  const handleDeleteItem = (idx: number) => {
    if (data.length <= 1) return;
    const updated = data.filter((_, i) => i !== idx);
    updateLayer(selectedLayer.id, { graphData: updated });
  };

  return (
    <div className="bg-[#1a1a1e] p-2.5 rounded border border-[#28282e] space-y-2.5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
          <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
          Graph & Chart Presets
        </span>
        <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold uppercase border border-emerald-500/30">
          {currentType}
        </span>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-3 gap-1 bg-[#121214] p-0.5 rounded border border-[#242428]">
        <button
          type="button"
          onClick={() => setActiveTab('preset')}
          className={`py-1 text-[10px] font-medium rounded transition flex items-center justify-center gap-1 ${
            activeTab === 'preset'
              ? 'bg-[#222228] text-white shadow-sm font-semibold'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <BarChart3 className="w-3 h-3" />
          Presets
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('data')}
          className={`py-1 text-[10px] font-medium rounded transition flex items-center justify-center gap-1 ${
            activeTab === 'data'
              ? 'bg-[#222228] text-white shadow-sm font-semibold'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Palette className="w-3 h-3" />
          Data ({data.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('style')}
          className={`py-1 text-[10px] font-medium rounded transition flex items-center justify-center gap-1 ${
            activeTab === 'style'
              ? 'bg-[#222228] text-white shadow-sm font-semibold'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Settings2 className="w-3 h-3" />
          Styles
        </button>
      </div>

      {/* Animation Progress Slider (Always Accessible) */}
      <div className="pt-1 border-t border-[#242428] space-y-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-zinc-300">Animation Progress</span>
            <button
              type="button"
              onClick={() => toggleKeyframe(selectedLayer.id, 'graphProgress')}
              className={`p-0.5 rounded transition cursor-pointer ${
                hasKf ? 'text-emerald-400 hover:text-emerald-300' : 'text-zinc-500 hover:text-zinc-300'
              }`}
              title={hasKf ? 'Keyframe set at playhead (click to remove)' : 'Add keyframe at playhead'}
            >
              <Diamond className={`w-3 h-3 ${hasKf ? 'fill-emerald-400' : ''}`} />
            </button>
          </div>

          <button
            type="button"
            onClick={() => addStartAndEndKeyframes(selectedLayer.id, 'graphProgress', 0, 100, 2.0)}
            className="text-[10px] px-2 py-0.5 rounded bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 transition cursor-pointer flex items-center gap-1"
            title="Create 0% -> 100% keyframe animation across 2s"
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
            value={Math.round(progress)}
            onChange={(e) => {
              const val = Math.max(0, Math.min(100, parseFloat(e.target.value) || 0));
              setAnimPropValue(selectedLayer.id, 'graphProgress', val);
            }}
            className="w-full accent-purple-500 cursor-pointer h-1.5 bg-[#25252e] rounded"
          />
          <span className="text-[11px] font-mono text-zinc-300 w-10 text-right shrink-0">
            {Math.round(progress)}%
          </span>
        </div>

        <div className="grid grid-cols-3 gap-1">
          {[0, 50, 100].map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setAnimPropValue(selectedLayer.id, 'graphProgress', preset)}
              className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition cursor-pointer ${
                Math.round(progress) === preset
                  ? 'bg-purple-600 text-white font-bold'
                  : 'bg-[#202026] text-zinc-400 hover:text-white'
              }`}
            >
              {preset}%
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: PRESET PICKER */}
      {activeTab === 'preset' && (
        <div className="space-y-2 pt-1 border-t border-[#242428]">
          <label className="text-[10px] text-zinc-400 block font-medium uppercase tracking-wider">
            Graph Type Presets
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {GRAPH_PRESETS.map((p) => {
              const IconComp = p.icon;
              const isSelected = currentType === p.type;
              return (
                <button
                  key={p.type}
                  type="button"
                  onClick={() => updateLayer(selectedLayer.id, { graphType: p.type })}
                  className={`p-2 rounded flex flex-col items-center justify-center gap-1 transition cursor-pointer border ${
                    isSelected
                      ? 'bg-emerald-600/25 border-emerald-500/80 text-emerald-200 font-semibold'
                      : 'bg-[#141417] text-zinc-400 hover:text-zinc-200 hover:bg-[#1a1a20] border-[#25252c]'
                  }`}
                >
                  <IconComp className={`w-4 h-4 ${isSelected ? 'text-emerald-400' : 'text-zinc-400'}`} />
                  <span className="text-[10px]">{p.label}</span>
                </button>
              );
            })}
          </div>

          {/* Quick Data Presets */}
          <div className="pt-2">
            <label className="text-[10px] text-zinc-400 block font-medium mb-1">
              Sample Data Presets
            </label>
            <div className="grid grid-cols-3 gap-1">
              {DATA_TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.name}
                  type="button"
                  onClick={() => updateLayer(selectedLayer.id, { graphData: tmpl.items })}
                  className="px-2 py-1 rounded bg-[#16161b] hover:bg-[#20202a] text-[10px] text-zinc-300 hover:text-white border border-[#272730] transition text-center truncate"
                >
                  {tmpl.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CUSTOM DATA TABLE */}
      {activeTab === 'data' && (
        <div className="space-y-2 pt-1 border-t border-[#242428]">
          <div className="flex items-center justify-between">
            <label className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">
              Data Points ({data.length})
            </label>
            <button
              type="button"
              onClick={handleAddItem}
              className="text-[10px] px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white transition cursor-pointer flex items-center gap-1 shadow-sm"
            >
              <Plus className="w-3 h-3" />
              Add Data
            </button>
          </div>

          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-0.5">
            {data.map((item, idx) => (
              <div
                key={item.id || idx}
                className="p-1.5 rounded bg-[#131316] border border-[#24242a] flex items-center gap-1.5 text-xs"
              >
                {/* Color Swatch */}
                <input
                  type="color"
                  value={item.color || '#6366f1'}
                  onChange={(e) => handleUpdateItem(idx, { color: e.target.value })}
                  className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent shrink-0"
                  title="Series Color"
                />

                {/* Label */}
                <input
                  type="text"
                  value={item.label}
                  onChange={(e) => handleUpdateItem(idx, { label: e.target.value })}
                  placeholder="Label"
                  className="w-16 bg-[#1a1a20] border border-[#2b2b34] rounded px-1.5 py-0.5 text-[11px] text-white shrink-0"
                />

                {/* Primary Value */}
                <div className="flex-1 flex items-center gap-1">
                  <input
                    type="number"
                    value={item.value}
                    onChange={(e) =>
                      handleUpdateItem(idx, { value: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full bg-[#1a1a20] border border-[#2b2b34] rounded px-1.5 py-0.5 text-[11px] font-mono text-white text-right"
                  />
                </div>

                {/* Secondary Value for Combo */}
                {currentType === 'combo' && (
                  <div className="w-12 shrink-0">
                    <input
                      type="number"
                      value={item.secondaryValue ?? Math.round(item.value * 0.6)}
                      onChange={(e) =>
                        handleUpdateItem(idx, { secondaryValue: parseFloat(e.target.value) || 0 })
                      }
                      title="Secondary Line Value"
                      className="w-full bg-[#1a1a20] border border-amber-500/40 rounded px-1 py-0.5 text-[11px] font-mono text-amber-300 text-right"
                    />
                  </div>
                )}

                {/* Delete button */}
                <button
                  type="button"
                  onClick={() => handleDeleteItem(idx)}
                  disabled={data.length <= 1}
                  className="p-1 rounded text-zinc-500 hover:text-red-400 disabled:opacity-20 transition cursor-pointer shrink-0"
                  title="Remove item"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: STYLES & GEOMETRY */}
      {activeTab === 'style' && (
        <div className="space-y-2.5 pt-1 border-t border-[#242428]">
          {/* Pie Donut Hole Slider */}
          {currentType === 'pie' && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] text-zinc-400">
                <span>Donut Hole Cutout</span>
                <span className="font-mono text-zinc-300">{selectedLayer.graphDonutHole ?? 45}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="80"
                step="5"
                value={selectedLayer.graphDonutHole ?? 45}
                onChange={(e) =>
                  updateLayer(selectedLayer.id, { graphDonutHole: parseInt(e.target.value, 10) })
                }
                className="w-full accent-purple-500 cursor-pointer h-1.5 bg-[#25252e] rounded"
              />
            </div>
          )}

          {/* Line & Area Curvature */}
          {(currentType === 'line' || currentType === 'area' || currentType === 'combo') && (
            <div className="space-y-1">
              <label className="text-[10px] text-zinc-400 block">Curve Interpolation</label>
              <div className="grid grid-cols-3 gap-1">
                {(['smooth', 'straight', 'step'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => updateLayer(selectedLayer.id, { graphLineCurvature: mode })}
                    className={`py-1 rounded text-[10px] capitalize transition cursor-pointer border ${
                      (selectedLayer.graphLineCurvature || 'smooth') === mode
                        ? 'bg-purple-600/30 border-purple-500/80 text-white font-semibold'
                        : 'bg-[#141417] text-zinc-400 border-[#25252c] hover:text-white'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Bar Spacing & Corner Radius */}
          {(currentType === 'column' || currentType === 'bar' || currentType === 'combo') && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-zinc-400 block mb-0.5">Bar Corner Radius</label>
                <input
                  type="number"
                  min="0"
                  max="24"
                  value={selectedLayer.graphBarRadius ?? 6}
                  onChange={(e) =>
                    updateLayer(selectedLayer.id, { graphBarRadius: parseInt(e.target.value, 10) || 0 })
                  }
                  className="w-full bg-[#121214] border border-[#2c2c32] rounded px-2 py-0.5 text-xs font-mono text-white"
                />
              </div>
              <div>
                <label className="text-[10px] text-zinc-400 block mb-0.5">Bar Spacing Gap</label>
                <input
                  type="number"
                  min="2"
                  max="40"
                  value={selectedLayer.graphBarSpacing ?? 10}
                  onChange={(e) =>
                    updateLayer(selectedLayer.id, { graphBarSpacing: parseInt(e.target.value, 10) || 4 })
                  }
                  className="w-full bg-[#121214] border border-[#2c2c32] rounded px-2 py-0.5 text-xs font-mono text-white"
                />
              </div>
            </div>
          )}

          {/* Line Width & Dot Size */}
          {(currentType === 'line' || currentType === 'area' || currentType === 'combo') && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-zinc-400 block mb-0.5">Line Stroke Thickness</label>
                <div className="relative flex items-center">
                  <input
                    type="number"
                    min="1"
                    step="0.5"
                    value={selectedLayer.graphLineWidth ?? 3}
                    onChange={(e) =>
                      updateLayer(selectedLayer.id, { graphLineWidth: Math.max(0.5, parseFloat(e.target.value) || 2) })
                    }
                    className="w-full bg-[#121214] border border-[#2c2c32] focus:border-purple-500 rounded px-2 py-0.5 pr-6 text-xs font-mono text-white outline-none"
                  />
                  <span className="absolute right-1.5 text-[9px] font-mono text-zinc-500 pointer-events-none">
                    px
                  </span>
                </div>
              </div>
              <div>
                <label className="text-[10px] text-zinc-400 block mb-0.5">Dot Point Radius</label>
                <input
                  type="number"
                  min="2"
                  max="14"
                  value={selectedLayer.graphDotSize ?? 4.5}
                  onChange={(e) =>
                    updateLayer(selectedLayer.id, { graphDotSize: parseFloat(e.target.value) || 3 })
                  }
                  className="w-full bg-[#121214] border border-[#2c2c32] rounded px-2 py-0.5 text-xs font-mono text-white"
                />
              </div>
            </div>
          )}

          {/* Toggles */}
          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#242428] text-xs text-zinc-300">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedLayer.graphShowValues ?? true}
                onChange={(e) => updateLayer(selectedLayer.id, { graphShowValues: e.target.checked })}
                className="accent-purple-500"
              />
              <span className="text-[11px]">Show Values</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedLayer.graphShowLabels ?? true}
                onChange={(e) => updateLayer(selectedLayer.id, { graphShowLabels: e.target.checked })}
                className="accent-purple-500"
              />
              <span className="text-[11px]">Show Labels</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedLayer.graphShowGrid ?? true}
                onChange={(e) => updateLayer(selectedLayer.id, { graphShowGrid: e.target.checked })}
                className="accent-purple-500"
              />
              <span className="text-[11px]">Show Grid</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedLayer.graphShowAxes ?? true}
                onChange={(e) => updateLayer(selectedLayer.id, { graphShowAxes: e.target.checked })}
                className="accent-purple-500"
              />
              <span className="text-[11px]">Show Axes</span>
            </label>
          </div>

          {/* Card Frame / Background Activation */}
          <div className="pt-1.5 border-t border-[#242428] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-zinc-300 font-medium">Card Frame / Background</span>
              <input
                type="checkbox"
                checked={selectedLayer.graphShowCard ?? false}
                onChange={(e) => {
                  const active = e.target.checked;
                  updateLayer(selectedLayer.id, {
                    graphShowCard: active,
                    fill: active ? (selectedLayer.fill && selectedLayer.fill !== 'transparent' ? selectedLayer.fill : 'rgba(20, 20, 26, 0.75)') : 'transparent',
                    stroke: active ? (selectedLayer.stroke && selectedLayer.stroke !== 'transparent' ? selectedLayer.stroke : 'rgba(255, 255, 255, 0.12)') : 'transparent',
                    borderWidth: active ? (selectedLayer.borderWidth || 1) : 0,
                  });
                }}
                className="rounded accent-purple-500 cursor-pointer"
              />
            </div>

            {selectedLayer.graphShowCard && (
              <div className="space-y-2 pt-1 border-t border-[#242428]/60 bg-[#121215] p-2 rounded border border-[#26262e]">
                <ColorPickerWithAlpha
                  label="Card Background Color"
                  color={selectedLayer.fill && selectedLayer.fill !== 'transparent' ? selectedLayer.fill : 'rgba(20, 20, 26, 0.75)'}
                  onChange={(c) => updateLayer(selectedLayer.id, { fill: c })}
                />
                <ColorPickerWithAlpha
                  label="Card Border Color"
                  color={selectedLayer.stroke && selectedLayer.stroke !== 'transparent' ? selectedLayer.stroke : 'rgba(255, 255, 255, 0.12)'}
                  onChange={(c) => updateLayer(selectedLayer.id, { stroke: c })}
                />
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-zinc-400 block mb-0.5">Border Thickness</label>
                    <div className="relative flex items-center">
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={selectedLayer.borderWidth ?? 1}
                        onChange={(e) => updateLayer(selectedLayer.id, { borderWidth: Math.max(0, parseInt(e.target.value, 10) || 0) })}
                        className="w-full bg-[#18181c] border border-[#2c2c32] rounded px-2 py-0.5 pr-6 text-xs font-mono text-white"
                      />
                      <span className="absolute right-1.5 text-[9px] font-mono text-zinc-500 pointer-events-none">px</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-400 block mb-0.5">Corner Radius</label>
                    <div className="relative flex items-center">
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={selectedLayer.borderRadius ?? 12}
                        onChange={(e) => updateLayer(selectedLayer.id, { borderRadius: Math.max(0, parseInt(e.target.value, 10) || 0) })}
                        className="w-full bg-[#18181c] border border-[#2c2c32] rounded px-2 py-0.5 pr-6 text-xs font-mono text-white"
                      />
                      <span className="absolute right-1.5 text-[9px] font-mono text-zinc-500 pointer-events-none">px</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Color Pickers */}
          <div className="pt-1 border-t border-[#242428] space-y-2">
            <ColorPickerWithAlpha
              label="Text & Label Color"
              color={selectedLayer.graphTextColor || '#d4d4d8'}
              onChange={(c) => updateLayer(selectedLayer.id, { graphTextColor: c })}
            />
          </div>
        </div>
      )}
    </div>
  );
}

