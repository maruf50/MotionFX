'use client';

import React, { useState } from 'react';
import {
  Grid,
  Sparkles,
  Diamond,
  Palette,
  Plus,
  Trash2,
  Type,
  Image as ImageIcon,
  Shapes,
  Shuffle,
  Repeat,
  Sliders,
  RotateCw,
} from 'lucide-react';
import { useMotion } from '@/context/MotionContext';
import { ArrayItemShape, ArrayAnimType, ArrayElementItem, ArrayElementKind } from '@/types/motion';
import { getInterpolatedValue, uid } from '@/modules/keyframes/evaluator';

export function ArrayInspectorSection() {
  const {
    selectedLayer,
    updateLayer,
    setAnimPropValue,
    toggleKeyframe,
    addStartAndEndKeyframes,
    currentTime,
    isAutoKeyframe,
  } = useMotion();
  const [activeTab, setActiveTab] = useState<'elements' | 'layout' | 'style'>('elements');

  if (!selectedLayer || selectedLayer.shapeType !== 'array') return null;

  const rows = selectedLayer.arrayRows ?? 4;
  const cols = selectedLayer.arrayCols ?? 5;
  const gap = selectedLayer.arrayGap ?? 14;
  const itemSize = selectedLayer.arrayItemSize ?? 22;
  const shape = selectedLayer.arrayShape || 'circle';
  const animType = selectedLayer.arrayAnimType || 'pop';
  const duration = selectedLayer.arrayAnimDuration ?? 2.5;
  const stagger = selectedLayer.arrayAnimStagger ?? 0.08;
  const loopMode = selectedLayer.arrayAnimLoop || 'loop';
  const isRandomColor = selectedLayer.arrayRandomColor ?? false;
  const customEmoji = selectedLayer.arrayCustomEmoji || '⚡';
  const baseColor = selectedLayer.fill || '#6366f1';

  // Appearance & variation options
  const borderWidth = selectedLayer.arrayItemBorderWidth ?? selectedLayer.borderWidth ?? 0;
  const borderColor = selectedLayer.arrayItemBorderColor || selectedLayer.stroke || '#ffffff';
  const randomSize = selectedLayer.arrayRandomSize ?? false;
  const sizeVariance = Math.round((selectedLayer.arraySizeVariance ?? 0.35) * 100);
  const randomRot = selectedLayer.arrayRandomRotation ?? false;
  const itemRotation = selectedLayer.arrayItemRotation ?? 0;

  // Custom element layers pool
  const elements = selectedLayer.arrayElements || [];
  const spawnMode = selectedLayer.arrayElementSpawnMode || 'cycle';

  const hasKeyframes = Boolean(selectedLayer.keyframes?.arrayProgress?.length);
  const progress = hasKeyframes
    ? getInterpolatedValue(selectedLayer, 'arrayProgress', currentTime)
    : (selectedLayer.arrayProgress ?? 100);

  const hasKf = selectedLayer.keyframes?.arrayProgress?.some(
    (k) => Math.abs(k.time - currentTime) < 0.04
  );

  const shapes: { id: ArrayItemShape; label: string }[] = [
    { id: 'circle', label: 'Circle' },
    { id: 'square', label: 'Square' },
    { id: 'rounded', label: 'Rounded' },
    { id: 'star', label: 'Star' },
    { id: 'dot', label: 'Dot' },
    { id: 'ring', label: 'Ring' },
    { id: 'triangle', label: 'Triangle' },
    { id: 'diamond', label: 'Diamond' },
    { id: 'hexagon', label: 'Hexagon' },
    { id: 'emoji', label: 'Emoji' },
  ];

  const animTypes: { id: ArrayAnimType; label: string }[] = [
    { id: 'pop', label: 'Spring Pop' },
    { id: 'wave', label: 'Wave' },
    { id: 'ripple', label: 'Ripple' },
    { id: 'drop', label: 'Drop In' },
    { id: 'fade', label: 'Fade' },
    { id: 'snake', label: 'Order' },
  ];

  const handleProgressChange = (val: number) => {
    if (hasKeyframes || isAutoKeyframe) {
      setAnimPropValue(selectedLayer.id, 'arrayProgress', val, true);
    } else {
      updateLayer(selectedLayer.id, { arrayProgress: val });
    }
  };

  // Add custom element to the array pool
  const addElement = (kind: ArrayElementKind) => {
    let newElem: ArrayElementItem;
    if (kind === 'text') {
      newElem = {
        id: uid('ae_txt'),
        kind: 'text',
        text: 'FX',
        textColor: '#ffffff',
        color: '#6366f1',
      };
    } else if (kind === 'image') {
      newElem = {
        id: uid('ae_img'),
        kind: 'image',
        imageSrc: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=60',
      };
    } else if (kind === 'icon') {
      newElem = {
        id: uid('ae_ico'),
        kind: 'icon',
        icon: '⚡',
        color: '#f59e0b',
      };
    } else {
      newElem = {
        id: uid('ae_shp'),
        kind: 'shape',
        shape: 'circle',
        color: '#8b5cf6',
      };
    }

    updateLayer(selectedLayer.id, {
      arrayElements: [...elements, newElem],
    });
  };

  const removeElement = (id: string) => {
    updateLayer(selectedLayer.id, {
      arrayElements: elements.filter((e) => e.id !== id),
    });
  };

  const updateElement = (id: string, updates: Partial<ArrayElementItem>) => {
    updateLayer(selectedLayer.id, {
      arrayElements: elements.map((e) => (e.id === id ? { ...e, ...updates } : e)),
    });
  };

  // Quick Presets
  const applyPreset = (type: 'tech' | 'letters' | 'geometric') => {
    if (type === 'tech') {
      updateLayer(selectedLayer.id, {
        arrayElements: [
          { id: uid('ae'), kind: 'icon', icon: '⚡', color: '#eab308' },
          { id: uid('ae'), kind: 'icon', icon: '🔥', color: '#f97316' },
          { id: uid('ae'), kind: 'icon', icon: '💎', color: '#06b6d4' },
          { id: uid('ae'), kind: 'icon', icon: '🚀', color: '#8b5cf6' },
        ],
        arrayElementSpawnMode: 'random',
      });
    } else if (type === 'letters') {
      updateLayer(selectedLayer.id, {
        arrayElements: [
          { id: uid('ae'), kind: 'text', text: 'M', textColor: '#ffffff', color: '#6366f1' },
          { id: uid('ae'), kind: 'text', text: 'O', textColor: '#ffffff', color: '#8b5cf6' },
          { id: uid('ae'), kind: 'text', text: 'T', textColor: '#ffffff', color: '#ec4899' },
          { id: uid('ae'), kind: 'text', text: 'I', textColor: '#ffffff', color: '#3b82f6' },
          { id: uid('ae'), kind: 'text', text: 'O', textColor: '#ffffff', color: '#10b981' },
          { id: uid('ae'), kind: 'text', text: 'N', textColor: '#ffffff', color: '#f59e0b' },
        ],
        arrayElementSpawnMode: 'cycle',
      });
    } else if (type === 'geometric') {
      updateLayer(selectedLayer.id, {
        arrayElements: [
          { id: uid('ae'), kind: 'shape', shape: 'circle', color: '#6366f1' },
          { id: uid('ae'), kind: 'shape', shape: 'diamond', color: '#ec4899' },
          { id: uid('ae'), kind: 'shape', shape: 'hexagon', color: '#3b82f6' },
          { id: uid('ae'), kind: 'shape', shape: 'star', color: '#eab308' },
        ],
        arrayElementSpawnMode: 'cycle',
      });
    }
  };

  return (
    <div className="bg-[#1a1a1e] p-2.5 rounded border border-[#28282e] space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
          <Grid className="w-3.5 h-3.5 text-purple-400" />
          Array & Grid Matrix
        </span>
        <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-700/50">
          {rows} × {cols} ({elements.length > 0 ? `${elements.length} custom` : shape})
        </span>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="grid grid-cols-3 gap-1 bg-[#121214] p-0.5 rounded border border-[#24242a]">
        <button
          type="button"
          onClick={() => setActiveTab('elements')}
          className={`py-1 rounded text-[10px] font-semibold transition cursor-pointer ${
            activeTab === 'elements'
              ? 'bg-purple-600/30 text-purple-200 border border-purple-500/50 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Elements ({elements.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('style')}
          className={`py-1 rounded text-[10px] font-semibold transition cursor-pointer ${
            activeTab === 'style'
              ? 'bg-purple-600/30 text-purple-200 border border-purple-500/50 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Shape & Style
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('layout')}
          className={`py-1 rounded text-[10px] font-semibold transition cursor-pointer ${
            activeTab === 'layout'
              ? 'bg-purple-600/30 text-purple-200 border border-purple-500/50 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Grid & Motion
        </button>
      </div>

      {/* TAB 1: CUSTOM ELEMENTS POOL */}
      {activeTab === 'elements' && (
        <div className="space-y-2.5">
          {/* Add Element Action Buttons */}
          <div>
            <label className="text-[11px] text-zinc-400 block mb-1">Add Element Layer to Array</label>
            <div className="grid grid-cols-4 gap-1">
              <button
                type="button"
                onClick={() => addElement('shape')}
                className="py-1 px-1 rounded text-[10px] font-medium border text-center transition cursor-pointer bg-[#141418] border-[#2c2c34] hover:bg-[#202028] text-purple-300 flex items-center justify-center gap-1"
                title="Add vector shape to matrix"
              >
                <Shapes className="w-3 h-3" />
                <span>+ Shape</span>
              </button>
              <button
                type="button"
                onClick={() => addElement('text')}
                className="py-1 px-1 rounded text-[10px] font-medium border text-center transition cursor-pointer bg-[#141418] border-[#2c2c34] hover:bg-[#202028] text-blue-300 flex items-center justify-center gap-1"
                title="Add text/word to matrix"
              >
                <Type className="w-3 h-3" />
                <span>+ Text</span>
              </button>
              <button
                type="button"
                onClick={() => addElement('icon')}
                className="py-1 px-1 rounded text-[10px] font-medium border text-center transition cursor-pointer bg-[#141418] border-[#2c2c34] hover:bg-[#202028] text-amber-300 flex items-center justify-center gap-1"
                title="Add emoji/icon to matrix"
              >
                <Sparkles className="w-3 h-3" />
                <span>+ Icon</span>
              </button>
              <button
                type="button"
                onClick={() => addElement('image')}
                className="py-1 px-1 rounded text-[10px] font-medium border text-center transition cursor-pointer bg-[#141418] border-[#2c2c34] hover:bg-[#202028] text-emerald-300 flex items-center justify-center gap-1"
                title="Add image to matrix"
              >
                <ImageIcon className="w-3 h-3" />
                <span>+ Image</span>
              </button>
            </div>
          </div>

          {/* Preset Combos */}
          <div className="flex items-center justify-between pt-1 border-t border-[#24242a]">
            <span className="text-[10px] text-zinc-400 uppercase font-mono">Quick Combos:</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => applyPreset('tech')}
                className="px-1.5 py-0.5 rounded text-[10px] bg-[#141418] border border-[#2b2b34] hover:bg-[#202028] text-amber-300 cursor-pointer"
                title="Tech icons pool"
              >
                ⚡ Tech
              </button>
              <button
                type="button"
                onClick={() => applyPreset('letters')}
                className="px-1.5 py-0.5 rounded text-[10px] bg-[#141418] border border-[#2b2b34] hover:bg-[#202028] text-blue-300 cursor-pointer"
                title="Letter word pool"
              >
                🔤 Words
              </button>
              <button
                type="button"
                onClick={() => applyPreset('geometric')}
                className="px-1.5 py-0.5 rounded text-[10px] bg-[#141418] border border-[#2b2b34] hover:bg-[#202028] text-purple-300 cursor-pointer"
                title="Geometric combo pool"
              >
                🔷 Geometrics
              </button>
            </div>
          </div>

          {/* Spawn Distribution Mode */}
          {elements.length > 0 && (
            <div className="flex items-center justify-between bg-[#141418] p-1.5 rounded border border-[#272730]">
              <span className="text-[11px] text-zinc-300 flex items-center gap-1.5">
                {spawnMode === 'cycle' ? <Repeat className="w-3.5 h-3.5 text-purple-400" /> : <Shuffle className="w-3.5 h-3.5 text-purple-400" />}
                Distribution Mode
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => updateLayer(selectedLayer.id, { arrayElementSpawnMode: 'cycle' })}
                  className={`px-2 py-0.5 rounded text-[10px] font-medium border transition cursor-pointer ${
                    spawnMode === 'cycle'
                      ? 'bg-purple-600/30 text-purple-200 border-purple-500/60'
                      : 'bg-[#181820] text-zinc-400 border-transparent hover:text-zinc-200'
                  }`}
                >
                  Cycle Order
                </button>
                <button
                  type="button"
                  onClick={() => updateLayer(selectedLayer.id, { arrayElementSpawnMode: 'random' })}
                  className={`px-2 py-0.5 rounded text-[10px] font-medium border transition cursor-pointer ${
                    spawnMode === 'random'
                      ? 'bg-purple-600/30 text-purple-200 border-purple-500/60'
                      : 'bg-[#181820] text-zinc-400 border-transparent hover:text-zinc-200'
                  }`}
                >
                  Random Matrix
                </button>
              </div>
            </div>
          )}

          {/* Element Layers List */}
          {elements.length === 0 ? (
            <div className="text-center py-4 px-2 rounded border border-dashed border-[#2f2f3a] bg-[#121216]">
              <p className="text-xs text-zinc-400">No custom elements in array pool yet.</p>
              <p className="text-[10px] text-zinc-500 mt-1">
                Click <span className="text-purple-300 font-semibold">+ Shape</span>, <span className="text-blue-300 font-semibold">+ Text</span>, <span className="text-amber-300 font-semibold">+ Icon</span>, or <span className="text-emerald-300 font-semibold">+ Image</span> above to populate the grid matrix.
              </p>
            </div>
          ) : (
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {elements.map((elem, idx) => (
                <div
                  key={elem.id}
                  className="bg-[#141418] border border-[#282830] rounded p-2 space-y-1.5 hover:border-[#383844] transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-zinc-800 text-zinc-400">
                        #{idx + 1}
                      </span>
                      <span className="text-xs font-semibold text-zinc-200 uppercase font-mono">
                        {elem.kind}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeElement(elem.id)}
                      className="p-1 rounded text-zinc-500 hover:text-rose-400 hover:bg-rose-950/40 transition cursor-pointer"
                      title="Remove element from array"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Kind Specific Config */}
                  {elem.kind === 'shape' && (
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <select
                          value={elem.shape || 'circle'}
                          onChange={(e) => updateElement(elem.id, { shape: e.target.value as ArrayItemShape })}
                          className="w-full bg-[#1c1c22] border border-[#34343e] rounded px-1.5 py-0.5 text-xs text-white outline-none"
                        >
                          {shapes.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="color"
                          value={elem.color || '#6366f1'}
                          onChange={(e) => updateElement(elem.id, { color: e.target.value })}
                          className="w-6 h-6 rounded border border-[#3a3a44] bg-transparent cursor-pointer"
                        />
                        <span className="text-[10px] font-mono text-zinc-400">{elem.color || '#6366f1'}</span>
                      </div>
                    </div>
                  )}

                  {elem.kind === 'text' && (
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={elem.text || ''}
                        placeholder="Text..."
                        onChange={(e) => updateElement(elem.id, { text: e.target.value })}
                        className="bg-[#1c1c22] border border-[#34343e] focus:border-blue-500 rounded px-1.5 py-0.5 text-xs text-white outline-none font-bold"
                      />
                      <div className="flex items-center gap-1.5">
                        <input
                          type="color"
                          value={elem.textColor || '#ffffff'}
                          onChange={(e) => updateElement(elem.id, { textColor: e.target.value })}
                          title="Text Color"
                          className="w-6 h-6 rounded border border-[#3a3a44] bg-transparent cursor-pointer"
                        />
                        <input
                          type="color"
                          value={elem.color || '#6366f1'}
                          onChange={(e) => updateElement(elem.id, { color: e.target.value })}
                          title="Badge Background Color"
                          className="w-6 h-6 rounded border border-[#3a3a44] bg-transparent cursor-pointer"
                        />
                      </div>
                    </div>
                  )}

                  {elem.kind === 'icon' && (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={elem.icon || '⚡'}
                        maxLength={2}
                        onChange={(e) => updateElement(elem.id, { icon: e.target.value })}
                        className="w-12 text-center bg-[#1c1c22] border border-[#34343e] rounded px-1 py-0.5 text-sm text-white outline-none"
                      />
                      <div className="flex items-center gap-1">
                        {['⚡', '🔥', '💎', '🚀', '⭐', '❤️', '🎯'].map((ico) => (
                          <button
                            key={ico}
                            type="button"
                            onClick={() => updateElement(elem.id, { icon: ico })}
                            className="p-1 rounded text-xs hover:bg-[#252530] transition cursor-pointer"
                          >
                            {ico}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {elem.kind === 'image' && (
                    <div className="space-y-1">
                      <input
                        type="text"
                        value={elem.imageSrc || ''}
                        placeholder="Image URL (https://...)"
                        onChange={(e) => updateElement(elem.id, { imageSrc: e.target.value })}
                        className="w-full bg-[#1c1c22] border border-[#34343e] focus:border-emerald-500 rounded px-1.5 py-0.5 text-[11px] text-zinc-300 outline-none font-mono"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SHAPE & STYLE OPTIONS */}
      {activeTab === 'style' && (
        <div className="space-y-3">
          {/* Default Item Shape (when no custom elements, or fallback) */}
          <div>
            <label className="text-[11px] text-zinc-400 block mb-1.5">Base Item Shape</label>
            <div className="grid grid-cols-5 gap-1">
              {shapes.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => updateLayer(selectedLayer.id, { arrayShape: s.id })}
                  className={`py-1 rounded text-[10px] font-medium border text-center transition cursor-pointer ${
                    shape === s.id
                      ? 'bg-purple-600/30 text-purple-200 border-purple-500/60'
                      : 'bg-[#121214] text-zinc-400 border-[#2c2c32] hover:bg-[#202026] hover:text-zinc-200'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Border Width & Color */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] text-zinc-400 block mb-1">Border Thickness</label>
              <div className="relative flex items-center">
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={borderWidth}
                  onChange={(e) =>
                    updateLayer(selectedLayer.id, {
                      arrayItemBorderWidth: Math.max(0, parseInt(e.target.value, 10) || 0),
                      borderWidth: Math.max(0, parseInt(e.target.value, 10) || 0),
                    })
                  }
                  className="w-full bg-[#121214] border border-[#2c2c32] focus:border-purple-500 rounded px-2 py-1 pr-7 text-xs font-mono text-white outline-none"
                  placeholder="Border"
                />
                <span className="absolute right-2 text-[10px] font-mono text-zinc-500 pointer-events-none">
                  px
                </span>
              </div>
            </div>
            <div>
              <label className="text-[11px] text-zinc-400 block mb-1">Border Color</label>
              <div className="flex items-center gap-1.5">
                <input
                  type="color"
                  value={borderColor}
                  onChange={(e) =>
                    updateLayer(selectedLayer.id, {
                      arrayItemBorderColor: e.target.value,
                      stroke: e.target.value,
                    })
                  }
                  className="w-7 h-7 rounded border border-[#3a3a44] bg-transparent cursor-pointer"
                />
                <span className="text-[10px] font-mono text-zinc-400 uppercase">{borderColor}</span>
              </div>
            </div>
          </div>

          {/* Color & Palette Mode */}
          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#28282e]">
            <div>
              <label className="text-[11px] text-zinc-400 block mb-1">Fill Color</label>
              <div className="flex items-center gap-1.5">
                <input
                  type="color"
                  value={baseColor}
                  onChange={(e) => updateLayer(selectedLayer.id, { fill: e.target.value })}
                  className="w-7 h-7 rounded border border-[#3a3a44] bg-transparent cursor-pointer"
                />
                <span className="text-[10px] font-mono text-zinc-400 uppercase">{baseColor}</span>
              </div>
            </div>
            <div className="flex flex-col justify-end">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-300 pb-1.5">
                <input
                  type="checkbox"
                  checked={isRandomColor}
                  onChange={(e) => updateLayer(selectedLayer.id, { arrayRandomColor: e.target.checked })}
                  className="rounded accent-purple-500 cursor-pointer"
                />
                <span className="flex items-center gap-1">
                  <Palette className="w-3 h-3 text-purple-400" />
                  Vibrant Colors
                </span>
              </label>
            </div>
          </div>

          {/* Random Size Variance */}
          <div className="pt-1 border-t border-[#28282e] space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-300">
                <input
                  type="checkbox"
                  checked={randomSize}
                  onChange={(e) => updateLayer(selectedLayer.id, { arrayRandomSize: e.target.checked })}
                  className="rounded accent-purple-500 cursor-pointer"
                />
                <span>Random Size Variation</span>
              </label>
              {randomSize && (
                <span className="text-[11px] font-mono text-purple-300 font-semibold">±{sizeVariance}%</span>
              )}
            </div>
            {randomSize && (
              <input
                type="range"
                min="10"
                max="75"
                value={sizeVariance}
                onChange={(e) =>
                  updateLayer(selectedLayer.id, { arraySizeVariance: (parseInt(e.target.value, 10) || 35) / 100 })
                }
                className="w-full accent-purple-500 cursor-pointer"
              />
            )}
          </div>

          {/* Random Rotation & Base Rotation */}
          <div className="pt-1 border-t border-[#28282e] space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-300">
                <input
                  type="checkbox"
                  checked={randomRot}
                  onChange={(e) => updateLayer(selectedLayer.id, { arrayRandomRotation: e.target.checked })}
                  className="rounded accent-purple-500 cursor-pointer"
                />
                <span>Random Rotation</span>
              </label>
              <div className="flex items-center gap-1">
                <RotateCw className="w-3 h-3 text-zinc-400" />
                <span className="text-[11px] font-mono text-zinc-400">{itemRotation}°</span>
              </div>
            </div>
            <input
              type="range"
              min="0"
              max="360"
              value={itemRotation}
              onChange={(e) =>
                updateLayer(selectedLayer.id, { arrayItemRotation: parseInt(e.target.value, 10) || 0 })
              }
              className="w-full accent-purple-500 cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* TAB 3: GRID LAYOUT & MOTION */}
      {activeTab === 'layout' && (
        <div className="space-y-3">
          {/* Rows & Columns */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] text-zinc-400 block mb-1">Rows: {rows}</label>
              <input
                type="range"
                min="1"
                max="16"
                value={rows}
                onChange={(e) => updateLayer(selectedLayer.id, { arrayRows: parseInt(e.target.value, 10) || 1 })}
                className="w-full accent-purple-500 cursor-pointer"
              />
            </div>
            <div>
              <label className="text-[11px] text-zinc-400 block mb-1">Cols: {cols}</label>
              <input
                type="range"
                min="1"
                max="16"
                value={cols}
                onChange={(e) => updateLayer(selectedLayer.id, { arrayCols: parseInt(e.target.value, 10) || 1 })}
                className="w-full accent-purple-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Item Size & Gap */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] text-zinc-400 block mb-1">Item Size: {itemSize}px</label>
              <input
                type="range"
                min="8"
                max="64"
                value={itemSize}
                onChange={(e) => updateLayer(selectedLayer.id, { arrayItemSize: parseInt(e.target.value, 10) || 20 })}
                className="w-full accent-purple-500 cursor-pointer"
              />
            </div>
            <div>
              <label className="text-[11px] text-zinc-400 block mb-1">Cell Gap: {gap}px</label>
              <input
                type="range"
                min="2"
                max="50"
                value={gap}
                onChange={(e) => updateLayer(selectedLayer.id, { arrayGap: parseInt(e.target.value, 10) || 10 })}
                className="w-full accent-purple-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Spawn Animation Style */}
          <div>
            <label className="text-[11px] text-zinc-400 block mb-1.5">Spawn Animation Style</label>
            <div className="grid grid-cols-3 gap-1">
              {animTypes.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => updateLayer(selectedLayer.id, { arrayAnimType: a.id })}
                  className={`py-1 px-1 rounded text-[10px] font-medium border text-center transition cursor-pointer ${
                    animType === a.id
                      ? 'bg-purple-600/30 text-purple-200 border-purple-500/60'
                      : 'bg-[#121214] text-zinc-400 border-[#2c2c32] hover:bg-[#202026] hover:text-zinc-200'
                  }`}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cycle Duration & Stagger */}
          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#28282e]">
            <div>
              <label className="text-[11px] text-zinc-400 block mb-1">Cycle Duration: {duration}s</label>
              <input
                type="range"
                min="0.5"
                max="8"
                step="0.5"
                value={duration}
                onChange={(e) => updateLayer(selectedLayer.id, { arrayAnimDuration: parseFloat(e.target.value) || 2.5 })}
                className="w-full accent-purple-500 cursor-pointer"
              />
            </div>
            <div>
              <label className="text-[11px] text-zinc-400 block mb-1">Stagger Delay: {stagger.toFixed(2)}s</label>
              <input
                type="range"
                min="0.01"
                max="0.3"
                step="0.01"
                value={stagger}
                onChange={(e) => updateLayer(selectedLayer.id, { arrayAnimStagger: parseFloat(e.target.value) || 0.08 })}
                className="w-full accent-purple-500 cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* Keyframeable Matrix Progress Slider (Always available across all tabs) */}
      <div className="pt-2 border-t border-[#28282e]">
        <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1">
          <div className="flex items-center gap-1.5">
            <span>Spawn / Fill Progress</span>
            <button
              type="button"
              onClick={() => toggleKeyframe(selectedLayer.id, 'arrayProgress')}
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
              onClick={() => addStartAndEndKeyframes(selectedLayer.id, 'arrayProgress', 0, 100, duration)}
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
          onChange={(e) => handleProgressChange(parseFloat(e.target.value) || 0)}
          className="w-full accent-purple-500 cursor-pointer"
        />
      </div>
    </div>
  );
}
