'use client';

import React from 'react';
import {
  Sparkles,
  Film,
  Trash2,
  TableProperties,
  Type,
  Award,
  Bell,
  SlidersHorizontal,
  Undo2,
  Redo2,
  Maximize2,
} from 'lucide-react';
import { useMotion } from '@/context/MotionContext';
import { TEMPLATES } from '@/modules/templates';
import { getAspectRatioString } from '@/components/ResolutionModal';

export function Header() {
  const {
    canvasBg,
    setCanvasBg,
    showGuides,
    setShowGuides,
    canvasResolution,
    setIsResolutionModalOpen,
    loadTemplate,
    clearScene,
    startExport,
    exportProgress,
    layers,
    undo,
    redo,
    canUndo,
    canRedo,
    historyStepCount,
  } = useMotion();

  return (
    <header className="h-14 bg-[#11131c] border-b border-[#1e2130] px-4 flex items-center justify-between shrink-0 z-30 select-none">
      {/* Brand & Studio Title */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm tracking-tight text-white">MotionFX</span>
            <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Studio Pro
            </span>
          </div>
        </div>

        <div className="h-5 w-[1px] bg-[#1e2130] mx-2 hidden md:block"></div>

        {/* Quick Template Selector */}
        <div className="hidden lg:flex items-center gap-1.5">
          <span className="text-xs text-slate-400 mr-1 flex items-center gap-1">
            <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
            Templates:
          </span>

          <button
            onClick={() => loadTemplate('bento-grid')}
            className="text-xs px-2.5 py-1.5 rounded-md bg-[#1e2130] hover:bg-[#2b2f44] text-slate-200 border border-[#2b2f44] transition flex items-center gap-1.5 cursor-pointer"
          >
            <TableProperties className="w-3.5 h-3.5 text-indigo-400" />
            Bento Grid Pop
          </button>

          <button
            onClick={() => loadTemplate('kinetic-typography')}
            className="text-xs px-2.5 py-1.5 rounded-md bg-[#1e2130] hover:bg-[#2b2f44] text-slate-200 border border-[#2b2f44] transition flex items-center gap-1.5 cursor-pointer"
          >
            <Type className="w-3.5 h-3.5 text-pink-400" />
            Kinetic Type
          </button>

          <button
            onClick={() => loadTemplate('logo-reveal')}
            className="text-xs px-2.5 py-1.5 rounded-md bg-[#1e2130] hover:bg-[#2b2f44] text-slate-200 border border-[#2b2f44] transition flex items-center gap-1.5 cursor-pointer"
          >
            <Award className="w-3.5 h-3.5 text-emerald-400" />
            Logo Reveal
          </button>

          <button
            onClick={() => loadTemplate('notification-toast')}
            className="text-xs px-2.5 py-1.5 rounded-md bg-[#1e2130] hover:bg-[#2b2f44] text-slate-200 border border-[#2b2f44] transition flex items-center gap-1.5 cursor-pointer"
          >
            <Bell className="w-3.5 h-3.5 text-sky-400" />
            Dynamic Toast
          </button>
        </div>
      </div>

      {/* Center Canvas Background & Guides */}
      <div className="hidden xl:flex items-center gap-3 bg-[#090a0f] px-3 py-1 rounded-lg border border-[#1e2130]">
        <label className="text-xs text-slate-400 flex items-center gap-1.5 cursor-pointer">
          <span>BG:</span>
          <input
            type="color"
            value={canvasBg}
            onChange={(e) => setCanvasBg(e.target.value)}
            className="w-5 h-5 rounded cursor-pointer bg-transparent border-0"
            title="Canvas Background Color"
          />
        </label>
        <button
          onClick={() => setIsResolutionModalOpen(true)}
          className="flex items-center gap-1.5 px-2 py-0.5 rounded hover:bg-[#1e2130] text-xs font-mono text-indigo-300 hover:text-indigo-200 border border-transparent hover:border-[#2b2f44] transition cursor-pointer"
          title="Change Canvas Resolution (Presets & Custom Dimensions)"
        >
          <Maximize2 className="w-3 h-3 text-indigo-400" />
          <span>
            {canvasResolution.width} × {canvasResolution.height}
          </span>
          <span className="text-[10px] text-slate-400">
            ({getAspectRatioString(canvasResolution.width, canvasResolution.height)})
          </span>
        </button>
        <label className="text-xs text-slate-400 flex items-center gap-1.5 cursor-pointer">
          <input
            type="checkbox"
            checked={showGuides}
            onChange={(e) => setShowGuides(e.target.checked)}
            className="rounded accent-indigo-500 cursor-pointer"
          />
          <span>Guides</span>
        </label>
      </div>

      {/* Right Actions, History & Video Export */}
      <div className="flex items-center gap-2.5">
        {/* 50-Step Undo / Redo Controls */}
        <div className="flex items-center gap-1 bg-[#090a0f] p-1 rounded-lg border border-[#1e2130]">
          <button
            onClick={undo}
            disabled={!canUndo}
            className="px-2 py-1.5 rounded-md hover:bg-[#1e2130] text-slate-200 disabled:opacity-30 disabled:hover:bg-transparent transition cursor-pointer disabled:cursor-not-allowed flex items-center gap-1.5 text-xs"
            title={`Undo (Ctrl+Z) • ${historyStepCount}/50 steps recorded`}
          >
            <Undo2 className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline font-medium">Undo</span>
            {canUndo && (
              <span className="text-[10px] px-1 py-0.2 bg-indigo-500/20 text-indigo-300 rounded border border-indigo-500/30 font-mono">
                {historyStepCount}
              </span>
            )}
          </button>

          <button
            onClick={redo}
            disabled={!canRedo}
            className="px-2 py-1.5 rounded-md hover:bg-[#1e2130] text-slate-200 disabled:opacity-30 disabled:hover:bg-transparent transition cursor-pointer disabled:cursor-not-allowed flex items-center gap-1.5 text-xs"
            title="Redo (Ctrl+Y or Ctrl+Shift+Z)"
          >
            <Redo2 className="w-3.5 h-3.5 text-pink-400" />
            <span className="hidden sm:inline font-medium">Redo</span>
          </button>
        </div>

        <button
          onClick={clearScene}
          className="text-xs px-2.5 py-1.5 rounded-lg bg-[#1e2130] hover:bg-red-950/60 hover:text-red-300 hover:border-red-800/50 text-slate-300 border border-[#2b2f44] transition flex items-center gap-1.5 cursor-pointer"
          title="Clear all layers"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear</span>
        </button>

        <button
          onClick={startExport}
          disabled={layers.length === 0 || exportProgress.isExporting}
          className="text-xs font-semibold px-4 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white shadow-lg shadow-indigo-600/25 transition flex items-center gap-2 cursor-pointer"
          title="Export animation as WebM/MP4 video"
        >
          <Film className="w-3.5 h-3.5" />
          <span>Export Video</span>
        </button>
      </div>
    </header>
  );
}
