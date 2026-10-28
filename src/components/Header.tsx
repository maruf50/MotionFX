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
  PenTool,
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
    setIsBuildShapeModalOpen,
    loadTemplate,
    clearScene,
    startExport,
    exportProgress,
    exportFps,
    setIsExportSettingsOpen,
    layers,
    undo,
    redo,
    canUndo,
    canRedo,
    historyStepCount,
  } = useMotion();

  return (
    <header className="h-12 bg-[#141417] border-b border-[#242428] px-3.5 flex items-center justify-between shrink-0 z-30 select-none">
      {/* Brand & Studio Title */}
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 rounded-md bg-purple-600/20 border border-purple-500/40 flex items-center justify-center shadow-sm shadow-purple-950/50">
          <Sparkles className="w-3.5 h-3.5 text-purple-300" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-xs tracking-tight text-white uppercase">MotionFX</span>
            <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-purple-950/60 text-purple-300 border border-purple-700/50">
              Studio Pro
            </span>
          </div>
        </div>

        <div className="h-4 w-[1px] bg-[#242428] mx-1.5 hidden md:block"></div>

        {/* Quick Template Selector */}
        <div className="hidden lg:flex items-center gap-1.5">
          <span className="text-[11px] text-zinc-400 mr-1 flex items-center gap-1">
            <SlidersHorizontal className="w-3 h-3 text-purple-400" />
            Templates:
          </span>

          <button
            onClick={() => loadTemplate('bento-grid')}
            className="text-xs px-2.5 py-1 rounded bg-[#1c1c20] hover:bg-[#25252b] text-zinc-300 hover:text-white border border-[#28282e] hover:border-purple-500/40 transition flex items-center gap-1.5 cursor-pointer"
          >
            <TableProperties className="w-3.5 h-3.5 text-zinc-400" />
            Bento Grid Pop
          </button>

          <button
            onClick={() => loadTemplate('kinetic-typography')}
            className="text-xs px-2.5 py-1 rounded bg-[#1c1c20] hover:bg-[#25252b] text-zinc-300 hover:text-white border border-[#28282e] hover:border-purple-500/40 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Type className="w-3.5 h-3.5 text-zinc-400" />
            Kinetic Type
          </button>

          <button
            onClick={() => loadTemplate('logo-reveal')}
            className="text-xs px-2.5 py-1 rounded bg-[#1c1c20] hover:bg-[#25252b] text-zinc-300 hover:text-white border border-[#28282e] hover:border-purple-500/40 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Award className="w-3.5 h-3.5 text-zinc-400" />
            Logo Reveal
          </button>

          <button
            onClick={() => loadTemplate('notification-toast')}
            className="text-xs px-2.5 py-1 rounded bg-[#1c1c20] hover:bg-[#25252b] text-zinc-300 hover:text-white border border-[#28282e] hover:border-purple-500/40 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Bell className="w-3.5 h-3.5 text-zinc-400" />
            Dynamic Toast
          </button>
        </div>

        {/* Build Shape Studio Action */}
        <button
          onClick={() => setIsBuildShapeModalOpen(true)}
          className="text-xs px-2.5 py-1 rounded bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 hover:text-white border border-purple-500/40 transition flex items-center gap-1.5 cursor-pointer"
          title="Open Vector Pen & Shape Builder Studio"
        >
          <PenTool className="w-3.5 h-3.5 text-purple-300" />
          <span className="font-semibold">Build Shape</span>
        </button>
      </div>

      {/* Center Canvas Background & Guides */}
      <div className="hidden xl:flex items-center gap-3 bg-[#101012] px-3 py-1 rounded-md border border-[#242428]">
        <label className="text-[11px] text-zinc-400 flex items-center gap-1.5 cursor-pointer">
          <span>BG:</span>
          <input
            type="color"
            value={canvasBg}
            onChange={(e) => setCanvasBg(e.target.value)}
            className="w-4 h-4 rounded cursor-pointer bg-transparent border-0"
            title="Canvas Background Color"
          />
        </label>
        <button
          onClick={() => setIsResolutionModalOpen(true)}
          className="flex items-center gap-1.5 px-2 py-0.5 rounded hover:bg-[#1c1c20] text-xs font-mono text-zinc-300 hover:text-purple-300 border border-transparent hover:border-[#2f2f36] transition cursor-pointer"
          title="Change Canvas Resolution (Presets & Custom Dimensions)"
        >
          <Maximize2 className="w-3 h-3 text-purple-400" />
          <span>
            {canvasResolution.width} × {canvasResolution.height}
          </span>
          <span className="text-[10px] text-zinc-500">
            ({getAspectRatioString(canvasResolution.width, canvasResolution.height)})
          </span>
        </button>
        <label className="text-[11px] text-zinc-400 flex items-center gap-1.5 cursor-pointer">
          <input
            type="checkbox"
            checked={showGuides}
            onChange={(e) => setShowGuides(e.target.checked)}
            className="rounded accent-purple-500 cursor-pointer"
          />
          <span>Guides</span>
        </label>
      </div>

      {/* Right Actions, History & Video Export */}
      <div className="flex items-center gap-2">
        {/* 50-Step Undo / Redo Controls */}
        <div className="flex items-center gap-0.5 bg-[#101012] p-0.5 rounded-md border border-[#242428]">
          <button
            onClick={undo}
            disabled={!canUndo}
            className="px-2 py-1 rounded hover:bg-[#1c1c20] text-zinc-300 disabled:opacity-30 disabled:hover:bg-transparent transition cursor-pointer disabled:cursor-not-allowed flex items-center gap-1.5 text-xs"
            title={`Undo (Ctrl+Z) • ${historyStepCount}/50 steps recorded`}
          >
            <Undo2 className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline font-medium">Undo</span>
            {canUndo && (
              <span className="text-[9px] px-1 py-0.2 bg-purple-950/60 text-purple-300 rounded border border-purple-700/50 font-mono">
                {historyStepCount}
              </span>
            )}
          </button>

          <button
            onClick={redo}
            disabled={!canRedo}
            className="px-2 py-1 rounded hover:bg-[#1c1c20] text-zinc-300 disabled:opacity-30 disabled:hover:bg-transparent transition cursor-pointer disabled:cursor-not-allowed flex items-center gap-1.5 text-xs"
            title="Redo (Ctrl+Y or Ctrl+Shift+Z)"
          >
            <Redo2 className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline font-medium">Redo</span>
          </button>
        </div>

        <button
          onClick={clearScene}
          className="text-xs px-2.5 py-1 rounded bg-[#1c1c20] hover:bg-rose-950/50 hover:text-rose-300 hover:border-rose-800/40 text-zinc-300 border border-[#28282e] transition flex items-center gap-1.5 cursor-pointer"
          title="Clear all layers"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear</span>
        </button>

        <button
          onClick={() => setIsExportSettingsOpen(true)}
          disabled={layers.length === 0 || exportProgress.isExporting}
          className={`text-xs font-semibold px-3 py-1 rounded transition flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-30 disabled:cursor-not-allowed ${
            exportFps >= 120
              ? 'bg-gradient-to-r from-amber-600 via-purple-600 to-purple-600 hover:from-amber-500 hover:to-purple-500 text-white shadow-amber-950/30 border border-amber-400/40'
              : 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-950/50 border border-purple-400/30'
          }`}
          title="Export Video Settings (Choose 60 FPS or 120 FPS)"
        >
          <Film className="w-3.5 h-3.5" />
          <span>Export</span>
          <span
            className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold uppercase ${
              exportFps >= 120
                ? 'bg-amber-400 text-black shadow-xs'
                : 'bg-purple-950/80 text-purple-200 border border-purple-400/40'
            }`}
          >
            {exportFps} FPS
          </span>
        </button>
      </div>
    </header>
  );
}
