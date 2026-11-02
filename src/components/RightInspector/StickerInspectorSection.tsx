'use client';

import React, { useState, useRef } from 'react';
import {
  Smile,
  Sparkles,
  Upload,
  Search,
  Sliders,
  Palette,
  Maximize2,
  Check,
  Zap,
} from 'lucide-react';
import { useMotion } from '@/context/MotionContext';
import {
  STICKER_PRESETS,
  StickerPreset,
  createEmojiSticker,
} from '@/modules/assets/stickers';

export function StickerInspectorSection() {
  const { selectedLayer, updateLayer } = useMotion();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [customEmoji, setCustomEmoji] = useState('🔥');
  const [emojiShape, setEmojiShape] = useState<'squircle' | 'circle' | 'hexagon' | 'transparent'>('squircle');
  const [bg1, setBg1] = useState('#4f46e5');
  const [bg2, setBg2] = useState('#7c3aed');
  const [strokeColor, setStrokeColor] = useState('#a5b4fc');

  if (!selectedLayer || (selectedLayer.type !== 'image' && !selectedLayer.isSticker)) {
    return null;
  }

  const width = Math.round(selectedLayer.width || 120);
  const height = Math.round(selectedLayer.height || 120);
  const borderRadius = selectedLayer.borderRadius || 0;
  const borderWidth = selectedLayer.borderWidth || 0;
  const stroke = selectedLayer.stroke || '#ffffff';

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'popular', label: 'Popular' },
    { id: 'badge', label: 'Badges' },
    { id: 'reaction', label: 'Reactions' },
    { id: 'tech', label: 'Tech' },
  ];

  const filteredPresets = STICKER_PRESETS.filter((p) =>
    activeCategory === 'all' ? true : p.category === activeCategory
  );

  const handleSelectSticker = (preset: StickerPreset) => {
    updateLayer(selectedLayer.id, {
      imageSrc: preset.dataUrl,
      stickerId: preset.id,
      name: `${preset.name} Sticker`,
      isSticker: true,
    });
  };

  const handleApplyCustomEmojiSticker = () => {
    const dataUrl = createEmojiSticker(customEmoji, emojiShape, bg1, bg2, strokeColor);
    updateLayer(selectedLayer.id, {
      imageSrc: dataUrl,
      name: `${customEmoji} Sticker`,
      isSticker: true,
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (!dataUrl) return;

      const img = new Image();
      img.onload = () => {
        const aspect = img.width / img.height;
        const newWidth = Math.min(240, img.width);
        const newHeight = Math.round(newWidth / aspect);
        updateLayer(selectedLayer.id, {
          imageSrc: dataUrl,
          name: file.name.substring(0, 16) || 'Custom Sticker',
          width: newWidth,
          height: newHeight,
          isSticker: true,
        });
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const sizePresets = [
    { label: '64px', val: 64 },
    { label: '96px', val: 96 },
    { label: '128px', val: 128 },
    { label: '180px', val: 180 },
    { label: '240px', val: 240 },
  ];

  return (
    <div className="bg-[#1a1a1e] p-2.5 rounded-lg border border-[#28282e] space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
          <Smile className="w-3.5 h-3.5 text-purple-400" />
          Sticker & Vector Graphic
        </span>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="text-[10px] text-purple-300 hover:text-purple-200 flex items-center gap-1 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800/40 cursor-pointer"
        >
          <Upload className="w-3 h-3" />
          <span>Upload PNG</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/svg+xml,image/webp"
          className="hidden"
          onChange={handleFileUpload}
        />
      </div>

      {/* Category Filter */}
      <div className="flex gap-1 overflow-x-auto pb-0.5">
        {categories.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setActiveCategory(c.id)}
            className={`px-2 py-0.5 rounded text-[10px] font-medium border transition cursor-pointer shrink-0 ${
              activeCategory === c.id
                ? 'bg-purple-600/30 text-purple-200 border-purple-500/70 font-semibold'
                : 'bg-[#121214] text-zinc-400 border-[#28282e] hover:bg-[#202026]'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Sticker Presets Grid */}
      <div>
        <label className="text-[10px] text-zinc-400 font-mono uppercase block mb-1.5">
          Choose Sticker
        </label>
        <div className="grid grid-cols-6 gap-1 max-h-40 overflow-y-auto p-1 bg-[#121214] rounded border border-[#28282e]">
          {filteredPresets.map((preset) => {
            const isSelected = selectedLayer.stickerId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectSticker(preset)}
                title={preset.name}
                className={`w-full aspect-square rounded p-1 flex items-center justify-center transition cursor-pointer hover:scale-105 border ${
                  isSelected
                    ? 'bg-purple-900/40 border-purple-400 ring-1 ring-purple-400 shadow-md'
                    : 'bg-[#18181c] border-[#2b2b32] hover:border-purple-500/40'
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={preset.dataUrl}
                  alt={preset.name}
                  className="w-full h-full object-contain pointer-events-none"
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Emoji Sticker Creator */}
      <div className="bg-[#141418] p-2 rounded border border-[#2a2a32] space-y-2">
        <span className="text-[10px] text-zinc-300 font-semibold uppercase flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-purple-400" />
          Create Custom Emoji Sticker
        </span>

        <div className="flex items-center gap-2">
          <div>
            <label className="text-[9px] text-zinc-400 block mb-0.5">Emoji</label>
            <input
              type="text"
              value={customEmoji}
              maxLength={4}
              onChange={(e) => setCustomEmoji(e.target.value)}
              className="w-12 text-center bg-[#101012] border border-[#2d2d34] focus:border-purple-500 rounded py-1 text-base text-white outline-none"
            />
          </div>

          <div className="flex-1">
            <label className="text-[9px] text-zinc-400 block mb-0.5">Badge Shape</label>
            <div className="grid grid-cols-4 gap-1">
              {(['squircle', 'circle', 'hexagon', 'transparent'] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setEmojiShape(s)}
                  className={`py-1 text-[9px] font-mono capitalize rounded border text-center transition cursor-pointer ${
                    emojiShape === s
                      ? 'bg-purple-600/30 text-purple-200 border-purple-500/70 font-semibold'
                      : 'bg-[#18181c] text-zinc-400 border-[#2b2b32]'
                  }`}
                >
                  {s.slice(0, 4)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {emojiShape !== 'transparent' && (
          <div className="grid grid-cols-3 gap-1.5 pt-1 border-t border-[#222228]">
            <div>
              <label className="text-[9px] text-zinc-400 block mb-0.5">Grad Start</label>
              <input
                type="color"
                value={bg1}
                onChange={(e) => setBg1(e.target.value)}
                className="w-full h-5 rounded border border-[#3a3a44] bg-transparent cursor-pointer"
              />
            </div>
            <div>
              <label className="text-[9px] text-zinc-400 block mb-0.5">Grad End</label>
              <input
                type="color"
                value={bg2}
                onChange={(e) => setBg2(e.target.value)}
                className="w-full h-5 rounded border border-[#3a3a44] bg-transparent cursor-pointer"
              />
            </div>
            <div>
              <label className="text-[9px] text-zinc-400 block mb-0.5">Ring Stroke</label>
              <input
                type="color"
                value={strokeColor}
                onChange={(e) => setStrokeColor(e.target.value)}
                className="w-full h-5 rounded border border-[#3a3a44] bg-transparent cursor-pointer"
              />
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={handleApplyCustomEmojiSticker}
          className="w-full py-1.5 rounded bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-semibold transition cursor-pointer flex items-center justify-center gap-1 shadow-sm"
        >
          <Sparkles className="w-3 h-3" />
          <span>Apply Emoji Sticker</span>
        </button>
      </div>

      {/* Dimensions & Quick Sizes */}
      <div className="bg-[#141418] p-2 rounded border border-[#2a2a32] space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-zinc-400 font-mono uppercase">Sticker Size</span>
          <div className="flex gap-1">
            {sizePresets.map((sp) => (
              <button
                key={sp.label}
                type="button"
                onClick={() => updateLayer(selectedLayer.id, { width: sp.val, height: sp.val })}
                className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-[#1c1c22] text-zinc-300 hover:bg-[#282830] border border-[#303038] cursor-pointer"
              >
                {sp.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between text-[10px] text-zinc-400 mb-1">
            <span>Size (Uniform)</span>
            <span className="font-mono text-zinc-200 font-semibold">{width}px</span>
          </div>
          <input
            type="range"
            min="30"
            max="350"
            value={width}
            onChange={(e) => {
              const val = parseInt(e.target.value) || 120;
              updateLayer(selectedLayer.id, { width: val, height: val });
            }}
            className="w-full accent-purple-500 cursor-pointer"
          />
        </div>
      </div>

      {/* Frame Border & Corner Radius */}
      <div className="bg-[#141418] p-2 rounded border border-[#2a2a32] space-y-2">
        <span className="text-[10px] text-zinc-400 font-mono uppercase block">Frame & Border</span>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-zinc-400 block mb-1">Border Thickness</label>
            <div className="relative flex items-center">
              <input
                type="number"
                min="0"
                step="1"
                value={borderWidth}
                onChange={(e) =>
                  updateLayer(selectedLayer.id, {
                    borderWidth: Math.max(0, parseInt(e.target.value) || 0),
                    borderStyle: 'solid',
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
            <label className="text-[10px] text-zinc-400 block mb-1">Border Color</label>
            <div className="flex items-center gap-1.5">
              <input
                type="color"
                value={stroke.startsWith('#') ? stroke : '#ffffff'}
                onChange={(e) => updateLayer(selectedLayer.id, { stroke: e.target.value })}
                className="w-6 h-6 rounded border border-[#3a3a44] bg-transparent cursor-pointer"
              />
              <span className="text-[9px] font-mono text-zinc-400 truncate max-w-[65px]">
                {stroke}
              </span>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between text-[10px] text-zinc-400 mb-1">
            <span>Corner Radius</span>
            <span className="font-mono text-zinc-300 font-semibold">{borderRadius}px</span>
          </div>
          <input
            type="range"
            min="0"
            max="60"
            value={borderRadius}
            onChange={(e) =>
              updateLayer(selectedLayer.id, { borderRadius: parseInt(e.target.value) || 0 })
            }
            className="w-full accent-purple-500 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}

