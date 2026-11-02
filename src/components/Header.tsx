'use client';

import React, { useState, useRef, useEffect } from 'react';
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
  Layers,
  Plus,
  Check,
  ChevronDown,
  Magnet,
  FileJson,
  FolderOpen,
  Save,
  Download,
  FileDown,
} from 'lucide-react';
import { useMotion } from '@/context/MotionContext';
import { TEMPLATES } from '@/modules/templates';
import { getAspectRatioString } from '@/components/ResolutionModal';
import { ColorPickerWithAlpha } from '@/components/RightInspector/ColorPickerWithAlpha';

export function Header() {
  const {
    canvasBg,
    setCanvasBg,
    showGuides,
    setShowGuides,
    isSnappingEnabled,
    toggleSnapping,
    canvasResolution,
    setIsResolutionModalOpen,
    setIsBuildShapeModalOpen,
    loadTemplate,
    compositions,
    activeCompositionId,
    activeCompositionName,
    createBlankComposition,
    switchComposition,
    deleteComposition,
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
    saveProject,
    openProject,
    exportAnimationJSONFile,
    isSavingProject,
    lastSavedTimestamp,
    fileStatusMessage,
    projectFileName,
  } = useMotion();

  const [isFileMenuOpen, setIsFileMenuOpen] = useState(false);
  const [isCompMenuOpen, setIsCompMenuOpen] = useState(false);
  const [isTmplMenuOpen, setIsTmplMenuOpen] = useState(false);
  const [isBgPickerOpen, setIsBgPickerOpen] = useState(false);

  const fileMenuRef = useRef<HTMLDivElement | null>(null);
  const compMenuRef = useRef<HTMLDivElement | null>(null);
  const tmplMenuRef = useRef<HTMLDivElement | null>(null);
  const bgPickerRef = useRef<HTMLDivElement | null>(null);

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (fileMenuRef.current && !fileMenuRef.current.contains(e.target as Node)) {
        setIsFileMenuOpen(false);
      }
      if (compMenuRef.current && !compMenuRef.current.contains(e.target as Node)) {
        setIsCompMenuOpen(false);
      }
      if (tmplMenuRef.current && !tmplMenuRef.current.contains(e.target as Node)) {
        setIsTmplMenuOpen(false);
      }
      if (bgPickerRef.current && !bgPickerRef.current.contains(e.target as Node)) {
        setIsBgPickerOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-12 bg-[#141417] border-b border-[#242428] px-3.5 flex items-center justify-between shrink-0 z-30 select-none">
      {/* Brand & Studio Title */}
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#241344] via-[#150a2b] to-[#090414] border-[1.5px] border-purple-500/80 flex items-center justify-center shadow-md shadow-purple-950/70 group hover:border-purple-400 transition cursor-default">
          <span className="font-mono font-black text-xs tracking-tighter text-purple-300 drop-shadow-[0_0_8px_rgba(168,85,247,0.9)] select-none">
            Fx
          </span>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-xs tracking-tight text-white uppercase font-sans">
              Motion<span className="text-purple-400 font-black">FX</span>
            </span>
          </div>
        </div>

        <div className="h-4 w-[1px] bg-[#242428] mx-1.5 hidden md:block"></div>

        {/* File System Menu (Save, Save As, Open, Export JSON) */}
        <div ref={fileMenuRef} className="relative">
          <button
            type="button"
            onClick={() => {
              setIsFileMenuOpen(!isFileMenuOpen);
              setIsCompMenuOpen(false);
              setIsTmplMenuOpen(false);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#1c1c20] hover:bg-[#25252b] border border-[#2c2c34] text-xs text-white transition cursor-pointer"
            title="File Menu (Save, Save As, Open / Import, Export JSON)"
          >
            <FileJson className="w-3.5 h-3.5 text-purple-400" />
            <span className="font-semibold">File</span>
            <ChevronDown className="w-3 h-3 text-zinc-400" />
          </button>

          {isFileMenuOpen && (
            <div className="absolute top-full left-0 mt-1 w-64 bg-[#18181c] border border-[#2f2f38] rounded-lg shadow-2xl z-50 p-1.5 space-y-1 select-none">
              <div className="px-2 py-1 text-[10px] font-mono text-zinc-400 uppercase border-b border-[#242428] flex items-center justify-between">
                <span>File System (JSON)</span>
                {lastSavedTimestamp && (
                  <span className="text-[9px] text-emerald-400 font-semibold">Saved</span>
                )}
              </div>

              {/* Quick Save */}
              <button
                type="button"
                onClick={() => {
                  saveProject(false);
                  setIsFileMenuOpen(false);
                }}
                disabled={isSavingProject}
                className="w-full text-left px-2 py-1.5 rounded hover:bg-[#22222a] text-zinc-200 hover:text-white text-xs flex items-center justify-between transition cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Save className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Save Project</span>
                </span>
                <span className="text-[10px] font-mono text-zinc-500">Ctrl+S</span>
              </button>

              {/* Save As JSON */}
              <button
                type="button"
                onClick={() => {
                  saveProject(true);
                  setIsFileMenuOpen(false);
                }}
                disabled={isSavingProject}
                className="w-full text-left px-2 py-1.5 rounded hover:bg-[#22222a] text-zinc-200 hover:text-white text-xs flex items-center justify-between transition cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <FileDown className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Save Project As...</span>
                </span>
                <span className="text-[10px] font-mono text-zinc-500">Ctrl+Shift+S</span>
              </button>

              {/* Open / Import JSON */}
              <button
                type="button"
                onClick={() => {
                  openProject();
                  setIsFileMenuOpen(false);
                }}
                className="w-full text-left px-2 py-1.5 rounded hover:bg-[#22222a] text-zinc-200 hover:text-white text-xs flex items-center justify-between transition cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
                  <span>Open / Import JSON...</span>
                </span>
                <span className="text-[10px] font-mono text-zinc-500">Ctrl+O</span>
              </button>

              <div className="h-[1px] bg-[#242428] my-1" />

              {/* Export Animation JSON */}
              <button
                type="button"
                onClick={() => {
                  exportAnimationJSONFile();
                  setIsFileMenuOpen(false);
                }}
                className="w-full text-left px-2 py-1.5 rounded hover:bg-[#22222a] text-zinc-200 hover:text-white text-xs flex items-center justify-between transition cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Download className="w-3.5 h-3.5 text-purple-400" />
                  <span>Export Animation JSON</span>
                </span>
                <span className="text-[10px] font-mono text-zinc-500">.json</span>
              </button>
            </div>
          )}
        </div>

        {/* Quick Save Action Button */}
        <button
          type="button"
          onClick={() => saveProject(false)}
          disabled={isSavingProject}
          className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#1c1c20] hover:bg-[#25252b] text-zinc-300 hover:text-white border border-[#2c2c34] text-xs transition cursor-pointer"
          title="Quick Save Project (Ctrl+S)"
        >
          <Save className="w-3 h-3 text-emerald-400" />
          <span className="hidden sm:inline">Save</span>
        </button>

        <div className="h-4 w-[1px] bg-[#242428] mx-1.5 hidden md:block"></div>

        {/* Composition Switcher Dropdown */}
        <div ref={compMenuRef} className="relative">
          <button
            type="button"
            onClick={() => {
              setIsCompMenuOpen(!isCompMenuOpen);
              setIsTmplMenuOpen(false);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#1c1c20] hover:bg-[#25252b] border border-[#2c2c34] text-xs text-white transition cursor-pointer"
            title="Switch or manage compositions (preserves your work)"
          >
            <Layers className="w-3.5 h-3.5 text-purple-400" />
            <span className="font-semibold max-w-[130px] truncate">{activeCompositionName}</span>
            <ChevronDown className="w-3 h-3 text-zinc-400" />
          </button>

          {isCompMenuOpen && (
            <div className="absolute top-full left-0 mt-1 w-64 bg-[#18181c] border border-[#2f2f38] rounded-lg shadow-2xl z-50 p-1.5 space-y-1">
              <div className="flex items-center justify-between px-2 py-1 text-[10px] font-mono text-zinc-400 uppercase border-b border-[#242428]">
                <span>Compositions ({compositions.length})</span>
                <button
                  type="button"
                  onClick={() => {
                    createBlankComposition();
                    setIsCompMenuOpen(false);
                  }}
                  className="text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-0.5 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>New Blank</span>
                </button>
              </div>

              <div className="max-h-56 overflow-y-auto space-y-0.5">
                {compositions.map((comp) => {
                  const isActive = comp.id === activeCompositionId;
                  return (
                    <div
                      key={comp.id}
                      onClick={() => {
                        switchComposition(comp.id);
                        setIsCompMenuOpen(false);
                      }}
                      className={`flex items-center justify-between px-2 py-1.5 rounded text-xs transition cursor-pointer ${
                        isActive
                          ? 'bg-purple-900/30 text-purple-200 border border-purple-500/50'
                          : 'text-zinc-300 hover:bg-[#222228] hover:text-white border border-transparent'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-1.5">
                          {isActive && <Check className="w-3 h-3 text-purple-400 shrink-0" />}
                          <span className="font-semibold truncate">{comp.name}</span>
                        </div>
                        <span className="text-[10px] text-zinc-500 font-mono block">
                          {comp.layers.length} layers • {comp.duration}s
                        </span>
                      </div>

                      {compositions.length > 1 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteComposition(comp.id);
                          }}
                          className="p-1 rounded text-zinc-500 hover:text-red-400 hover:bg-red-950/20 transition cursor-pointer"
                          title="Delete Composition"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 1-Click New Blank Composition Button */}
        <button
          type="button"
          onClick={() => createBlankComposition()}
          className="text-xs px-2 py-1 rounded bg-[#1c1c20] hover:bg-[#25252b] text-zinc-300 hover:text-white border border-[#28282e] hover:border-purple-500/40 transition flex items-center gap-1 cursor-pointer"
          title="Create a fresh blank composition without overwriting"
        >
          <Plus className="w-3 h-3 text-purple-400" />
          <span>New Blank</span>
        </button>

        {/* Templates Selector Dropdown (Opens in dedicated composition) */}
        <div ref={tmplMenuRef} className="relative hidden md:block">
          <button
            type="button"
            onClick={() => {
              setIsTmplMenuOpen(!isTmplMenuOpen);
              setIsCompMenuOpen(false);
            }}
            className="text-xs px-2.5 py-1 rounded bg-[#1c1c20] hover:bg-[#25252b] text-zinc-300 hover:text-white border border-[#28282e] hover:border-purple-500/40 transition flex items-center gap-1.5 cursor-pointer"
            title="Load animation templates as separate compositions"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Templates</span>
            <ChevronDown className="w-3 h-3 text-zinc-400" />
          </button>

          {isTmplMenuOpen && (
            <div className="absolute top-full left-0 mt-1 w-60 bg-[#18181c] border border-[#2f2f38] rounded-lg shadow-2xl z-50 p-1.5 space-y-1">
              <div className="px-2 py-1 text-[10px] font-mono text-zinc-400 uppercase border-b border-[#242428] flex items-center justify-between">
                <span>Templates</span>
                <span className="text-[9px] text-purple-400">Safe in New Comp</span>
              </div>
              {TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.id}
                  type="button"
                  onClick={() => {
                    loadTemplate(tmpl.id, true);
                    setIsTmplMenuOpen(false);
                  }}
                  className="w-full text-left px-2 py-1.5 rounded hover:bg-[#23232a] text-xs text-zinc-200 hover:text-white flex items-center justify-between transition cursor-pointer"
                >
                  <span className="font-medium truncate">{tmpl.name}</span>
                  <span className="text-[9px] font-mono text-zinc-500 shrink-0">{tmpl.duration}s</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Canvas Snapping Action */}
        <button
          onClick={toggleSnapping}
          className={`text-xs px-2.5 py-1 rounded border transition flex items-center gap-1.5 cursor-pointer ${
            isSnappingEnabled
              ? 'bg-purple-600/30 text-purple-200 border-purple-500/60 font-semibold shadow-sm'
              : 'bg-[#161619] text-zinc-400 border-[#28282e] hover:text-zinc-200'
          }`}
          title={isSnappingEnabled ? 'Snapping is ON (Canvas center & layer alignment) — Click to toggle (S)' : 'Snapping is OFF — Click to toggle (S)'}
        >
          <Magnet className={`w-3.5 h-3.5 ${isSnappingEnabled ? 'text-purple-300' : 'text-zinc-500'}`} />
          <span>Snap</span>
        </button>
      </div>

      {/* Center Canvas Background & Guides */}
      <div className="hidden xl:flex items-center gap-3 bg-[#101012] px-3 py-1 rounded-md border border-[#242428] relative">
        <div ref={bgPickerRef} className="relative flex items-center">
          <button
            type="button"
            onClick={() => setIsBgPickerOpen(!isBgPickerOpen)}
            className="text-[11px] text-zinc-400 flex items-center gap-1.5 cursor-pointer hover:text-zinc-200 transition"
            title="Canvas Background Color & Gradients"
          >
            <span>BG:</span>
            <div
              className="w-4 h-4 rounded border border-white/30 shadow-inner overflow-hidden"
              style={{
                background: canvasBg,
              }}
            />
          </button>

          {isBgPickerOpen && (
            <div className="absolute top-full left-0 mt-2 z-50 w-72 shadow-2xl">
              <ColorPickerWithAlpha
                label="Canvas Background Color"
                color={canvasBg}
                onChange={setCanvasBg}
              />
            </div>
          )}
        </div>
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

      {/* Right Action Tools: Undo, Redo, Export */}
      <div className="flex items-center gap-2">
        {fileStatusMessage && (
          <div
            className={`px-2 py-0.5 rounded text-[11px] font-medium border flex items-center gap-1.5 shadow-md animate-in fade-in transition ${
              fileStatusMessage.type === 'success'
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                : fileStatusMessage.type === 'error'
                ? 'bg-red-950/80 text-red-300 border-red-500/40'
                : 'bg-indigo-950/80 text-indigo-300 border-indigo-500/40'
            }`}
          >
            {fileStatusMessage.type === 'success' ? (
              <Check className="w-3 h-3 text-emerald-400" />
            ) : (
              <FileJson className="w-3 h-3 text-purple-400" />
            )}
            <span className="max-w-[200px] truncate">{fileStatusMessage.text}</span>
          </div>
        )}

        <div className="flex items-center gap-1 bg-[#101012] p-1 rounded-md border border-[#242428]">
          <button
            onClick={undo}
            disabled={!canUndo}
            className={`p-1.5 rounded transition ${
              canUndo
                ? 'text-zinc-300 hover:text-white hover:bg-[#1e1e24] cursor-pointer'
                : 'text-zinc-600 cursor-not-allowed'
            }`}
            title={`Undo (Ctrl+Z) - ${historyStepCount} steps`}
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            className={`p-1.5 rounded transition ${
              canRedo
                ? 'text-zinc-300 hover:text-white hover:bg-[#1e1e24] cursor-pointer'
                : 'text-zinc-600 cursor-not-allowed'
            }`}
            title="Redo (Ctrl+Y / Ctrl+Shift+Z)"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Video Framerate / Export Settings Configuration Trigger */}
        <button
          onClick={() => setIsExportSettingsOpen(true)}
          className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer border ${
            exportFps >= 120
              ? 'bg-amber-500/15 text-amber-300 border-amber-500/40 hover:bg-amber-500/25'
              : 'bg-[#18181c] text-purple-300 border-purple-500/30 hover:bg-[#202026]'
          }`}
          title="Video Render Framerate & Encoding Settings"
        >
          <SlidersHorizontal className="w-3 h-3 text-purple-400" />
          <span>{exportFps} FPS</span>
        </button>

        {/* Export Render Button */}
        <button
          onClick={() => startExport(exportFps)}
          disabled={exportProgress.isExporting || layers.length === 0}
          className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 shadow-sm transition ${
            exportProgress.isExporting || layers.length === 0
              ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
              : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white cursor-pointer shadow-purple-900/30'
          }`}
          title={layers.length === 0 ? 'Add elements to export video' : 'Export Video WebM / MP4'}
        >
          <Film className="w-3.5 h-3.5" />
          <span>{exportProgress.isExporting ? 'Exporting...' : 'Export'}</span>
        </button>
      </div>
    </header>
  );
}
