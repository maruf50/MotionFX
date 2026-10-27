'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import {
  Square,
  Circle,
  Star,
  Hexagon,
  Minus,
  Type,
  Upload,
  PenTool,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useMotion } from '@/context/MotionContext';
import { STICKER_PRESETS } from '@/modules/assets/stickers';

export function AddElementsPanel() {
  const { addShape, addText, addImage } = useMotion();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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
        const width = 180;
        const height = Math.round(width / aspect);
        addImage(dataUrl, file.name.substring(0, 16) || 'PNG Asset', width, height);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div className="p-3 border-b border-[#1e2130]">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center justify-between">
        <span>Add Elements</span>
        <span className="text-[10px] text-indigo-400 font-normal">Click to spawn</span>
      </div>

      {/* Build Shape Studio Option */}
      <Link
        href="/builder"
        className="w-full mb-3 py-2 px-2.5 rounded-lg bg-gradient-to-r from-amber-500/15 via-purple-500/15 to-indigo-500/15 hover:from-amber-500/25 hover:via-purple-500/25 hover:to-indigo-500/25 border border-amber-500/35 hover:border-amber-400 text-slate-100 flex items-center justify-between group transition shadow-sm cursor-pointer"
        title="Open Vector Pen, Eraser & Shape Builder Studio"
      >
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-amber-500/20 flex items-center justify-center text-amber-300 group-hover:scale-110 transition">
            <PenTool className="w-3.5 h-3.5" />
          </div>
          <div className="text-left">
            <div className="text-xs font-semibold text-white group-hover:text-amber-300 transition flex items-center gap-1.5">
              <span>Build Shape</span>
              <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                PRO
              </span>
            </div>
            <div className="text-[10px] text-slate-400">
              Pen tool, eraser & vector canvas
            </div>
          </div>
        </div>
        <ArrowRight className="w-3.5 h-3.5 text-amber-400 group-hover:translate-x-0.5 transition" />
      </Link>

      {/* Shapes Grid */}
      <div className="grid grid-cols-5 gap-1.5 mb-2.5">
        <button
          onClick={() => addShape('rect')}
          className="flex flex-col items-center justify-center p-2 rounded-lg bg-[#171925] hover:bg-[#1e2130] border border-[#2b2f44]/70 hover:border-indigo-500/50 transition group cursor-pointer"
          title="Add Rectangle"
        >
          <Square className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition mb-1" />
          <span className="text-[10px] text-slate-300">Rect</span>
        </button>

        <button
          onClick={() => addShape('circle')}
          className="flex flex-col items-center justify-center p-2 rounded-lg bg-[#171925] hover:bg-[#1e2130] border border-[#2b2f44]/70 hover:border-pink-500/50 transition group cursor-pointer"
          title="Add Circle"
        >
          <Circle className="w-4 h-4 text-pink-400 group-hover:scale-110 transition mb-1" />
          <span className="text-[10px] text-slate-300">Circle</span>
        </button>

        <button
          onClick={() => addShape('star')}
          className="flex flex-col items-center justify-center p-2 rounded-lg bg-[#171925] hover:bg-[#1e2130] border border-[#2b2f44]/70 hover:border-amber-500/50 transition group cursor-pointer"
          title="Add Star"
        >
          <Star className="w-4 h-4 text-amber-400 group-hover:scale-110 transition mb-1" />
          <span className="text-[10px] text-slate-300">Star</span>
        </button>

        <button
          onClick={() => addShape('polygon')}
          className="flex flex-col items-center justify-center p-2 rounded-lg bg-[#171925] hover:bg-[#1e2130] border border-[#2b2f44]/70 hover:border-emerald-500/50 transition group cursor-pointer"
          title="Add Polygon"
        >
          <Hexagon className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition mb-1" />
          <span className="text-[10px] text-slate-300">Poly</span>
        </button>

        <button
          onClick={() => addShape('pill')}
          className="flex flex-col items-center justify-center p-2 rounded-lg bg-[#171925] hover:bg-[#1e2130] border border-[#2b2f44]/70 hover:border-violet-500/50 transition group cursor-pointer"
          title="Add Capsule / Pill"
        >
          <Minus className="w-4 h-4 text-violet-400 group-hover:scale-110 transition mb-1 rotate-45" />
          <span className="text-[10px] text-slate-300">Pill</span>
        </button>
      </div>

      {/* Kinetic Text & PNG Upload Row */}
      <div className="grid grid-cols-2 gap-1.5">
        <button
          onClick={() => addText('cascade')}
          className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg bg-[#171925] hover:bg-[#1e2130] border border-[#2b2f44]/70 hover:border-sky-500/50 transition text-xs text-slate-200 cursor-pointer"
        >
          <Type className="w-3.5 h-3.5 text-sky-400" />
          <span>Kinetic Text</span>
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg bg-[#171925] hover:bg-[#1e2130] border border-[#2b2f44]/70 hover:border-purple-500/50 transition text-xs text-slate-200 cursor-pointer"
        >
          <Upload className="w-3.5 h-3.5 text-purple-400" />
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

      {/* Sample PNG Sticker Presets */}
      <div className="mt-2.5 pt-2 border-t border-[#1e2130]/80 flex items-center justify-between">
        <span className="text-[10px] text-slate-400">PNG Stickers:</span>
        <div className="flex gap-1">
          {STICKER_PRESETS.map((stk) => (
            <button
              key={stk.id}
              onClick={() => addImage(stk.dataUrl, stk.name, 120, 120)}
              title={`Add ${stk.name}`}
              className="w-6 h-6 rounded bg-[#1e2130] hover:bg-[#2b2f44] flex items-center justify-center text-xs transition cursor-pointer hover:scale-110"
            >
              {stk.emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
