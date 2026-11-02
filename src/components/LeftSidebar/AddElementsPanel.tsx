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
  Percent,
  GitBranch,
  Route,
  Grid,
  Layers,
  Spline,
  ToggleLeft,
  MousePointer,
  Smile,
} from 'lucide-react';
import { useMotion } from '@/context/MotionContext';

export function AddElementsPanel() {
  const { addShape, addText, addImage, addSticker, setIsBuildShapeModalOpen } = useMotion();
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
    <div className="p-3 border-b border-[#242428]">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-2 flex items-center justify-between">
        <span>Add Elements</span>
        <span className="text-[10px] text-purple-400 font-normal">Click to spawn</span>
      </div>

      {/* Shapes Grid with Pen Tool */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        <button
          onClick={() => addShape('line')}
          className="flex flex-col items-center justify-center p-1.5 rounded bg-[#1c1c20] hover:bg-[#24242a] border border-[#28282e] hover:border-purple-500/50 transition group cursor-pointer"
          title="Add Line Shape"
        >
          <Minus className="w-4 h-4 text-zinc-400 group-hover:text-purple-300 group-hover:scale-105 transition mb-1" />
          <span className="text-[9px] text-zinc-400 group-hover:text-zinc-200">Line</span>
        </button>

        <button
          onClick={() => addShape('rect')}
          className="flex flex-col items-center justify-center p-1.5 rounded bg-[#1c1c20] hover:bg-[#24242a] border border-[#28282e] hover:border-purple-500/50 transition group cursor-pointer"
          title="Add Rectangle"
        >
          <Square className="w-4 h-4 text-zinc-400 group-hover:text-purple-300 group-hover:scale-105 transition mb-1" />
          <span className="text-[9px] text-zinc-400 group-hover:text-zinc-200">Rect</span>
        </button>

        <button
          onClick={() => addShape('circle')}
          className="flex flex-col items-center justify-center p-1.5 rounded bg-[#1c1c20] hover:bg-[#24242a] border border-[#28282e] hover:border-purple-500/50 transition group cursor-pointer"
          title="Add Circle"
        >
          <Circle className="w-4 h-4 text-zinc-400 group-hover:text-purple-300 group-hover:scale-105 transition mb-1" />
          <span className="text-[9px] text-zinc-400 group-hover:text-zinc-200">Circle</span>
        </button>

        <button
          onClick={() => addShape('star')}
          className="flex flex-col items-center justify-center p-1.5 rounded bg-[#1c1c20] hover:bg-[#24242a] border border-[#28282e] hover:border-purple-500/50 transition group cursor-pointer"
          title="Add Star"
        >
          <Star className="w-4 h-4 text-zinc-400 group-hover:text-purple-300 group-hover:scale-105 transition mb-1" />
          <span className="text-[9px] text-zinc-400 group-hover:text-zinc-200">Star</span>
        </button>

        <button
          onClick={() => addShape('polygon')}
          className="flex flex-col items-center justify-center p-1.5 rounded bg-[#1c1c20] hover:bg-[#24242a] border border-[#28282e] hover:border-purple-500/50 transition group cursor-pointer"
          title="Add Polygon"
        >
          <Hexagon className="w-4 h-4 text-zinc-400 group-hover:text-purple-300 group-hover:scale-105 transition mb-1" />
          <span className="text-[9px] text-zinc-400 group-hover:text-zinc-200">Poly</span>
        </button>

        <button
          onClick={() => addShape('pill')}
          className="flex flex-col items-center justify-center p-1.5 rounded bg-[#1c1c20] hover:bg-[#24242a] border border-[#28282e] hover:border-purple-500/50 transition group cursor-pointer"
          title="Add Capsule / Pill"
        >
          <Minus className="w-4 h-4 text-zinc-400 group-hover:text-purple-300 group-hover:scale-105 transition mb-1 rotate-45" />
          <span className="text-[9px] text-zinc-400 group-hover:text-zinc-200">Pill</span>
        </button>

        <button
          onClick={() => addShape('custom')}
          className="flex flex-col items-center justify-center p-1.5 rounded bg-purple-950/30 hover:bg-purple-900/40 border border-purple-500/50 hover:border-purple-400 transition group cursor-pointer"
          title="Pen Tool — Draw custom vector shape with bezier anchors directly on canvas"
        >
          <PenTool className="w-4 h-4 text-purple-400 group-hover:text-purple-200 group-hover:scale-105 transition mb-1" />
          <span className="text-[9px] font-semibold text-purple-300 group-hover:text-purple-100">Pen</span>
        </button>
      </div>

      {/* Special Smart Shapes Section */}
      <div className="mb-2.5 pt-2 border-t border-[#242428]">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-purple-400 mb-1.5 flex items-center justify-between">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-purple-400" />
            Special Shapes & Motion
          </span>
        </div>

        <div className="grid grid-cols-4 gap-1">
          {/* 1. Bar */}
          <button
            type="button"
            onClick={() => addShape('bar')}
            className="flex flex-col items-center justify-center p-1.5 rounded bg-gradient-to-b from-[#1e1c2b] to-[#16161d] hover:from-[#29253c] hover:to-[#201f2b] border border-purple-500/30 hover:border-purple-400 transition group cursor-pointer shadow-sm text-center"
            title="Add Fillable Bar (keyframeable fill %, horizontal, vertical, radial gauge)"
          >
            <div className="w-5 h-5 rounded bg-purple-500/20 text-purple-300 flex items-center justify-center group-hover:scale-110 transition mb-1">
              <Percent className="w-3 h-3" />
            </div>
            <span className="text-[9px] font-semibold text-zinc-200 group-hover:text-purple-200">Bar</span>
            <span className="text-[7px] text-zinc-500 font-mono">Fill & %</span>
          </button>

          {/* 2. Branching */}
          <button
            type="button"
            onClick={() => addShape('branching')}
            className="flex flex-col items-center justify-center p-1.5 rounded bg-gradient-to-b from-[#1e1c2b] to-[#16161d] hover:from-[#29253c] hover:to-[#201f2b] border border-purple-500/30 hover:border-purple-400 transition group cursor-pointer shadow-sm text-center"
            title="Add Branching Lines (control branch count, lengths, position, curvature)"
          >
            <div className="w-5 h-5 rounded bg-purple-500/20 text-purple-300 flex items-center justify-center group-hover:scale-110 transition mb-1">
              <GitBranch className="w-3 h-3" />
            </div>
            <span className="text-[9px] font-semibold text-zinc-200 group-hover:text-purple-200">Branch</span>
            <span className="text-[7px] text-zinc-500 font-mono">Tree & Pos</span>
          </button>

          {/* 3. Move Along Path */}
          <button
            type="button"
            onClick={() => addShape('pathFollower')}
            className="flex flex-col items-center justify-center p-1.5 rounded bg-gradient-to-b from-[#1e1c2b] to-[#16161d] hover:from-[#29253c] hover:to-[#201f2b] border border-purple-500/30 hover:border-purple-400 transition group cursor-pointer shadow-sm text-center"
            title="Add Move Along Path (pen tool path, multiple items travel & fade away)"
          >
            <div className="w-5 h-5 rounded bg-purple-500/20 text-purple-300 flex items-center justify-center group-hover:scale-110 transition mb-1">
              <Route className="w-3 h-3" />
            </div>
            <span className="text-[9px] font-semibold text-zinc-200 group-hover:text-purple-200">Path Move</span>
            <span className="text-[7px] text-zinc-500 font-mono">Travel & Fade</span>
          </button>

          {/* 4. Array Matrix */}
          <button
            type="button"
            onClick={() => addShape('array')}
            className="flex flex-col items-center justify-center p-1.5 rounded bg-gradient-to-b from-[#1e1c2b] to-[#16161d] hover:from-[#29253c] hover:to-[#201f2b] border border-purple-500/30 hover:border-purple-400 transition group cursor-pointer shadow-sm text-center"
            title="Add Array Matrix (custom grid rows/cols, spring pop, wave, ripple, emojis)"
          >
            <div className="w-5 h-5 rounded bg-purple-500/20 text-purple-300 flex items-center justify-center group-hover:scale-110 transition mb-1">
              <Grid className="w-3 h-3" />
            </div>
            <span className="text-[9px] font-semibold text-zinc-200 group-hover:text-purple-200">Array</span>
            <span className="text-[7px] text-zinc-500 font-mono">Grid Matrix</span>
          </button>

          {/* 5. Card Stack */}
          <button
            type="button"
            onClick={() => addShape('card')}
            className="flex flex-col items-center justify-center p-1.5 rounded bg-gradient-to-b from-[#1e1c2b] to-[#16161d] hover:from-[#29253c] hover:to-[#201f2b] border border-purple-500/30 hover:border-purple-400 transition group cursor-pointer shadow-sm text-center"
            title="Add Card Stack (fan out, swipe, depth shift, cascade, flip)"
          >
            <div className="w-5 h-5 rounded bg-purple-500/20 text-purple-300 flex items-center justify-center group-hover:scale-110 transition mb-1">
              <Layers className="w-3 h-3" />
            </div>
            <span className="text-[9px] font-semibold text-zinc-200 group-hover:text-purple-200">Cards</span>
            <span className="text-[7px] text-zinc-500 font-mono">Stack & Fan</span>
          </button>

          {/* 6. Path Draw */}
          <button
            type="button"
            onClick={() => addShape('pathDraw')}
            className="flex flex-col items-center justify-center p-1.5 rounded bg-gradient-to-b from-[#1e1c2b] to-[#16161d] hover:from-[#29253c] hover:to-[#201f2b] border border-purple-500/30 hover:border-purple-400 transition group cursor-pointer shadow-sm text-center"
            title="Add Path Draw (line write-on animation, wave/spiral/arc, kinetic text on curve)"
          >
            <div className="w-5 h-5 rounded bg-purple-500/20 text-purple-300 flex items-center justify-center group-hover:scale-110 transition mb-1">
              <Spline className="w-3 h-3" />
            </div>
            <span className="text-[9px] font-semibold text-zinc-200 group-hover:text-purple-200">Path Draw</span>
            <span className="text-[7px] text-zinc-500 font-mono">Write & Text</span>
          </button>

          {/* 7. Button */}
          <button
            type="button"
            onClick={() => addShape('button')}
            className="flex flex-col items-center justify-center p-1.5 rounded bg-gradient-to-b from-[#1e1c2b] to-[#16161d] hover:from-[#29253c] hover:to-[#201f2b] border border-purple-500/30 hover:border-purple-400 transition group cursor-pointer shadow-sm text-center"
            title="Add Motion Button (toggle switch, floating FAB, shimmer gradient, click press)"
          >
            <div className="w-5 h-5 rounded bg-purple-500/20 text-purple-300 flex items-center justify-center group-hover:scale-110 transition mb-1">
              <ToggleLeft className="w-3 h-3" />
            </div>
            <span className="text-[9px] font-semibold text-zinc-200 group-hover:text-purple-200">Button</span>
            <span className="text-[7px] text-zinc-500 font-mono">Toggle & CTA</span>
          </button>

          {/* 8. Cursor */}
          <button
            type="button"
            onClick={() => addShape('cursor')}
            className="flex flex-col items-center justify-center p-1.5 rounded bg-gradient-to-b from-[#1e1c2b] to-[#16161d] hover:from-[#29253c] hover:to-[#201f2b] border border-purple-500/30 hover:border-purple-400 transition group cursor-pointer shadow-sm text-center"
            title="Add Motion Cursor (flight path, click ripple wave, tactile press, blink mode)"
          >
            <div className="w-5 h-5 rounded bg-purple-500/20 text-purple-300 flex items-center justify-center group-hover:scale-110 transition mb-1">
              <MousePointer className="w-3 h-3" />
            </div>
            <span className="text-[9px] font-semibold text-zinc-200 group-hover:text-purple-200">Cursor</span>
            <span className="text-[7px] text-zinc-500 font-mono">Click & Path</span>
          </button>
        </div>
      </div>

      {/* Text, Upload & Stickers Row */}
      <div className="grid grid-cols-3 gap-1.5">
        <button
          onClick={() => addText('none')}
          className="flex items-center justify-center gap-1 py-1.5 px-1.5 rounded bg-[#1c1c20] hover:bg-[#24242a] border border-[#28282e] hover:border-purple-500/50 transition text-xs text-zinc-200 cursor-pointer"
          title="Add Kinetic Text"
        >
          <Type className="w-3.5 h-3.5 text-purple-400" />
          <span>Text</span>
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center justify-center gap-1 py-1.5 px-1.5 rounded bg-[#1c1c20] hover:bg-[#24242a] border border-[#28282e] hover:border-purple-500/50 transition text-xs text-zinc-200 cursor-pointer"
          title="Upload Custom Image or PNG"
        >
          <Upload className="w-3.5 h-3.5 text-purple-400" />
          <span>Upload</span>
        </button>

        <button
          onClick={() => addSticker()}
          className="flex items-center justify-center gap-1 py-1.5 px-1.5 rounded bg-gradient-to-b from-[#221e33] to-[#1a1728] hover:from-[#2e2846] hover:to-[#221f35] border border-purple-500/40 hover:border-purple-400 transition text-xs text-purple-200 font-medium cursor-pointer shadow-sm"
          title="Add Sticker (browse and pick in Inspector)"
        >
          <Smile className="w-3.5 h-3.5 text-purple-400" />
          <span>Stickers</span>
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/svg+xml,image/webp"
          className="hidden"
          onChange={handleFileUpload}
        />
      </div>
    </div>
  );
}
