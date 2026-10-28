'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Maximize2,
  Monitor,
  Smartphone,
  Square,
  Sparkles,
  ArrowRightLeft,
  Check,
  Tv,
  Gauge,
  Zap,
} from 'lucide-react';
import { useMotion } from '@/context/MotionContext';
import { CanvasResolution } from '@/types/motion';

export interface ResolutionPreset {
  id: string;
  name: string;
  category: 'landscape' | 'vertical' | 'square' | 'ultrawide';
  width: number;
  height: number;
  aspectRatio: string;
  description: string;
  recommended?: boolean;
}

export const RESOLUTION_PRESETS: ResolutionPreset[] = [
  // 16:9 Landscape
  {
    id: 'fhd-1080p',
    name: '1080p Full HD',
    category: 'landscape',
    width: 1920,
    height: 1080,
    aspectRatio: '16:9',
    description: 'YouTube, Vimeo, Standard Video',
    recommended: true,
  },
  {
    id: 'hd-720p',
    name: '720p HD',
    category: 'landscape',
    width: 1280,
    height: 720,
    aspectRatio: '16:9',
    description: 'Standard HD Web Video',
  },
  {
    id: 'uhd-4k',
    name: '4K Ultra HD',
    category: 'landscape',
    width: 3840,
    height: 2160,
    aspectRatio: '16:9',
    description: 'Ultra High Definition Master',
  },
  {
    id: 'preview-default',
    name: 'Default Preview',
    category: 'landscape',
    width: 800,
    height: 450,
    aspectRatio: '16:9',
    description: 'Lightweight Compact Preview',
  },
  // 9:16 Vertical
  {
    id: 'tiktok-reels-fhd',
    name: 'Vertical Full HD',
    category: 'vertical',
    width: 1080,
    height: 1920,
    aspectRatio: '9:16',
    description: 'TikTok, Instagram Reels, YouTube Shorts',
    recommended: true,
  },
  {
    id: 'story-hd',
    name: 'Story HD',
    category: 'vertical',
    width: 720,
    height: 1280,
    aspectRatio: '9:16',
    description: 'Snapchat & Instagram Stories',
  },
  // 1:1 Square & 4:5
  {
    id: 'insta-square',
    name: 'Square 1:1',
    category: 'square',
    width: 1080,
    height: 1080,
    aspectRatio: '1:1',
    description: 'Instagram Feed, LinkedIn Square',
  },
  {
    id: 'insta-portrait',
    name: 'Portrait 4:5',
    category: 'square',
    width: 1080,
    height: 1350,
    aspectRatio: '4:5',
    description: 'Instagram Portrait Feed (Max Height)',
  },
  // 21:9 Ultrawide
  {
    id: 'cinema-ultrawide',
    name: 'Cinema Ultrawide',
    category: 'ultrawide',
    width: 2560,
    height: 1080,
    aspectRatio: '21:9',
    description: 'Cinematic Banners & Header Video',
  },
];

export function getAspectRatioString(width: number, height: number): string {
  if (!width || !height) return '16:9';
  const ratio = width / height;
  if (Math.abs(ratio - 16 / 9) < 0.015) return '16:9';
  if (Math.abs(ratio - 9 / 16) < 0.015) return '9:16';
  if (Math.abs(ratio - 1) < 0.015) return '1:1';
  if (Math.abs(ratio - 4 / 5) < 0.015) return '4:5';
  if (Math.abs(ratio - 5 / 4) < 0.015) return '5:4';
  if (Math.abs(ratio - 4 / 3) < 0.015) return '4:3';
  if (Math.abs(ratio - 21 / 9) < 0.05) return '21:9';

  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const div = gcd(Math.round(width), Math.round(height));
  const w = Math.round(width) / div;
  const h = Math.round(height) / div;
  if (w <= 30 && h <= 30) return `${w}:${h}`;
  return `${ratio.toFixed(2)}:1`;
}

export function ResolutionModal() {
  const {
    canvasResolution,
    setCanvasResolution,
    isResolutionModalOpen,
    setIsResolutionModalOpen,
    exportFps,
    setExportFps,
  } = useMotion();

  const [customWidth, setCustomWidth] = useState<number>(canvasResolution.width);
  const [customHeight, setCustomHeight] = useState<number>(canvasResolution.height);
  const [scaleLayers, setScaleLayers] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'presets' | 'custom'>('presets');
  const [selectedFps, setSelectedFps] = useState<number>(exportFps || 60);
  const [isCustomFpsActive, setIsCustomFpsActive] = useState<boolean>(
    exportFps !== 30 && exportFps !== 60 && exportFps !== 120
  );

  // Synchronize initial input values when modal opens
  useEffect(() => {
    if (isResolutionModalOpen) {
      setCustomWidth(canvasResolution.width);
      setCustomHeight(canvasResolution.height);
      setSelectedFps(exportFps || 60);
      setIsCustomFpsActive(exportFps !== 30 && exportFps !== 60 && exportFps !== 120);
    }
  }, [isResolutionModalOpen, canvasResolution, exportFps]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isResolutionModalOpen) return;
      if (e.key === 'Escape') {
        setIsResolutionModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isResolutionModalOpen, setIsResolutionModalOpen]);

  if (!isResolutionModalOpen) return null;

  const handleSelectPreset = (preset: ResolutionPreset) => {
    setExportFps(selectedFps);
    setCanvasResolution({ width: preset.width, height: preset.height }, scaleLayers);
    setIsResolutionModalOpen(false);
  };

  const handleApplyCustom = () => {
    const w = Math.max(100, Math.min(7680, customWidth || 800));
    const h = Math.max(100, Math.min(4320, customHeight || 450));
    setExportFps(selectedFps);
    setCanvasResolution({ width: w, height: h }, scaleLayers);
    setIsResolutionModalOpen(false);
  };

  const handleSwapDimensions = () => {
    setCustomWidth(customHeight);
    setCustomHeight(customWidth);
  };

  const currentRatio = getAspectRatioString(customWidth, customHeight);

  return (
    <div
      className="fixed inset-0 bg-[#0d0d0f]/85 backdrop-blur-md z-50 flex items-center justify-center p-4 select-none animate-in fade-in duration-150"
      onClick={() => setIsResolutionModalOpen(false)}
    >
      <div
        className="w-full max-w-3xl bg-[#161619] border border-[#28282e] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 border-b border-[#242428] flex items-center justify-between shrink-0 bg-[#121215]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-purple-600/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Maximize2 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">Canvas Resolution</h2>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-700/50">
                  {canvasResolution.width} × {canvasResolution.height} (
                  {getAspectRatioString(canvasResolution.width, canvasResolution.height)})
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Choose popular social & video presets or enter custom dimensions
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsResolutionModalOpen(false)}
            className="w-7 h-7 rounded text-zinc-400 hover:text-white hover:bg-[#222227] transition flex items-center justify-center cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 pt-3 border-b border-[#242428] flex items-center justify-between shrink-0 bg-[#121215]">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('presets')}
              className={`px-4 py-2 text-xs font-semibold rounded-t transition border-b-2 flex items-center gap-2 cursor-pointer ${
                activeTab === 'presets'
                  ? 'text-purple-400 border-purple-500 bg-[#161619]'
                  : 'text-zinc-400 border-transparent hover:text-zinc-200'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Standard Presets</span>
            </button>
            <button
              onClick={() => setActiveTab('custom')}
              className={`px-4 py-2 text-xs font-semibold rounded-t transition border-b-2 flex items-center gap-2 cursor-pointer ${
                activeTab === 'custom'
                  ? 'text-purple-400 border-purple-500 bg-[#161619]'
                  : 'text-zinc-400 border-transparent hover:text-zinc-200'
              }`}
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>Custom Resolution</span>
            </button>
          </div>

          {/* Scale layers option toggle in header */}
          <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer pb-2">
            <input
              type="checkbox"
              checked={scaleLayers}
              onChange={(e) => setScaleLayers(e.target.checked)}
              className="rounded accent-purple-500 cursor-pointer"
            />
            <span className="font-medium">Scale layers to fit</span>
          </label>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5">
          {activeTab === 'presets' ? (
            <div className="space-y-5">
              {/* 16:9 Landscape Video */}
              <div>
                <div className="flex items-center gap-2 mb-2.5 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  <Tv className="w-3.5 h-3.5 text-purple-400" />
                  <span>Landscape 16:9 (YouTube & Video)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {RESOLUTION_PRESETS.filter((p) => p.category === 'landscape').map((preset) => {
                    const isCurrent =
                      canvasResolution.width === preset.width &&
                      canvasResolution.height === preset.height;

                    return (
                      <button
                        key={preset.id}
                        onClick={() => handleSelectPreset(preset)}
                        className={`p-3 rounded border text-left transition flex items-center justify-between group cursor-pointer ${
                          isCurrent
                            ? 'bg-purple-950/30 border-purple-500 ring-1 ring-purple-500/50'
                            : 'bg-[#1a1a1e] border-[#25252b] hover:bg-[#222228] hover:border-zinc-600'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {/* Mini aspect ratio preview box */}
                          <div className="w-9 h-5 rounded border border-[#303038] bg-[#101012] flex items-center justify-center shrink-0">
                            <span className="text-[9px] font-mono text-zinc-400">16:9</span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-white group-hover:text-purple-300 transition">
                                {preset.name}
                              </span>
                              {preset.recommended && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-950/60 text-purple-300 border border-purple-700/50 font-medium">
                                  Standard
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] font-mono text-purple-300">
                              {preset.width} × {preset.height}
                            </div>
                            <div className="text-[10px] text-zinc-400 mt-0.5">
                              {preset.description}
                            </div>
                          </div>
                        </div>

                        {isCurrent && (
                          <div className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center shrink-0">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 9:16 Vertical Video */}
              <div>
                <div className="flex items-center gap-2 mb-2.5 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  <Smartphone className="w-3.5 h-3.5 text-purple-400" />
                  <span>Vertical 9:16 (Shorts, Reels, TikTok)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {RESOLUTION_PRESETS.filter((p) => p.category === 'vertical').map((preset) => {
                    const isCurrent =
                      canvasResolution.width === preset.width &&
                      canvasResolution.height === preset.height;

                    return (
                      <button
                        key={preset.id}
                        onClick={() => handleSelectPreset(preset)}
                        className={`p-3 rounded border text-left transition flex items-center justify-between group cursor-pointer ${
                          isCurrent
                            ? 'bg-purple-950/30 border-purple-500 ring-1 ring-purple-500/50'
                            : 'bg-[#1a1a1e] border-[#25252b] hover:bg-[#222228] hover:border-zinc-600'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-5 h-9 rounded border border-[#303038] bg-[#101012] flex items-center justify-center shrink-0">
                            <span className="text-[8px] font-mono text-zinc-400">9:16</span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-white group-hover:text-purple-300 transition">
                                {preset.name}
                              </span>
                              {preset.recommended && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-950/60 text-purple-300 border border-purple-700/50 font-medium">
                                  Viral
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] font-mono text-purple-300">
                              {preset.width} × {preset.height}
                            </div>
                            <div className="text-[10px] text-zinc-400 mt-0.5">
                              {preset.description}
                            </div>
                          </div>
                        </div>

                        {isCurrent && (
                          <div className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center shrink-0">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 1:1 Square & Social Portrait */}
              <div>
                <div className="flex items-center gap-2 mb-2.5 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  <Square className="w-3.5 h-3.5 text-purple-400" />
                  <span>Square 1:1 & Portrait 4:5 (Instagram & Feeds)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {RESOLUTION_PRESETS.filter(
                    (p) => p.category === 'square' || p.category === 'ultrawide'
                  ).map((preset) => {
                    const isCurrent =
                      canvasResolution.width === preset.width &&
                      canvasResolution.height === preset.height;

                    return (
                      <button
                        key={preset.id}
                        onClick={() => handleSelectPreset(preset)}
                        className={`p-3 rounded border text-left transition flex items-center justify-between group cursor-pointer ${
                          isCurrent
                            ? 'bg-purple-950/30 border-purple-500 ring-1 ring-purple-500/50'
                            : 'bg-[#1a1a1e] border-[#25252b] hover:bg-[#222228] hover:border-zinc-600'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`rounded border border-[#303038] bg-[#101012] flex items-center justify-center shrink-0 ${
                              preset.category === 'ultrawide' ? 'w-10 h-4' : 'w-7 h-7'
                            }`}
                          >
                            <span className="text-[8px] font-mono text-zinc-400">
                              {preset.aspectRatio}
                            </span>
                          </div>
                          <div>
                            <span className="text-xs font-bold text-white group-hover:text-purple-300 transition block">
                              {preset.name}
                            </span>
                            <div className="text-[11px] font-mono text-purple-300">
                              {preset.width} × {preset.height}
                            </div>
                            <div className="text-[10px] text-zinc-400 mt-0.5">
                              {preset.description}
                            </div>
                          </div>
                        </div>

                        {isCurrent && (
                          <div className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center shrink-0">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            /* Custom Resolution View */
            <div className="space-y-5">
              <div className="p-4 rounded border border-[#28282e] bg-[#1a1a1e]">
                <h3 className="text-sm font-semibold text-white mb-1.5 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span>Custom Canvas Dimensions</span>
                </h3>
                <p className="text-xs text-zinc-400 mb-5">
                  Specify arbitrary pixel width and height for special video banners, displays, or
                  custom canvas formats (from 100px up to 8K).
                </p>

                {/* Dimension Inputs & Swap Button */}
                <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
                  {/* Width */}
                  <div className="w-full sm:w-44">
                    <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                      Width (px)
                    </label>
                    <input
                      type="number"
                      min={100}
                      max={7680}
                      step={10}
                      value={customWidth}
                      onChange={(e) => setCustomWidth(parseInt(e.target.value) || 100)}
                      className="w-full px-3 py-2 rounded bg-[#101012] border border-[#2c2c32] focus:border-purple-500 focus:outline-none text-white font-mono text-sm"
                    />
                  </div>

                  {/* Swap Button */}
                  <div className="sm:pt-5">
                    <button
                      type="button"
                      onClick={handleSwapDimensions}
                      className="p-2 rounded bg-[#222227] hover:bg-[#2c2c32] text-purple-300 border border-[#2c2c32] transition cursor-pointer flex items-center justify-center"
                      title="Swap Width and Height (Flip Orientation)"
                    >
                      <ArrowRightLeft className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Height */}
                  <div className="w-full sm:w-44">
                    <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                      Height (px)
                    </label>
                    <input
                      type="number"
                      min={100}
                      max={4320}
                      step={10}
                      value={customHeight}
                      onChange={(e) => setCustomHeight(parseInt(e.target.value) || 100)}
                      className="w-full px-3 py-2 rounded bg-[#101012] border border-[#2c2c32] focus:border-purple-500 focus:outline-none text-white font-mono text-sm"
                    />
                  </div>
                </div>

                {/* Live Aspect Ratio Info */}
                <div className="mt-5 pt-3 border-t border-[#242428] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-400">Computed Ratio:</span>
                    <span className="px-2 py-0.5 rounded bg-purple-950/60 text-purple-300 font-mono font-bold border border-purple-700/50">
                      {currentRatio}
                    </span>
                  </div>
                  <div className="text-zinc-400">
                    Total Pixels:{' '}
                    <span className="font-mono text-white">
                      {((customWidth * customHeight) / 1000000).toFixed(2)} MP
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Aspect Ratio Fill Shortcuts */}
              <div>
                <span className="text-xs text-zinc-400 block mb-2 font-medium">
                  Quick Ratio Base Sizes:
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCustomWidth(1920);
                      setCustomHeight(1080);
                    }}
                    className="text-xs px-2.5 py-1 rounded bg-[#1a1a1e] hover:bg-[#222228] text-zinc-300 border border-[#28282e] transition cursor-pointer"
                  >
                    16:9 (1920×1080)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCustomWidth(1080);
                      setCustomHeight(1920);
                    }}
                    className="text-xs px-2.5 py-1 rounded bg-[#1a1a1e] hover:bg-[#222228] text-zinc-300 border border-[#28282e] transition cursor-pointer"
                  >
                    9:16 (1080×1920)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCustomWidth(1080);
                      setCustomHeight(1080);
                    }}
                    className="text-xs px-2.5 py-1 rounded bg-[#1a1a1e] hover:bg-[#222228] text-zinc-300 border border-[#28282e] transition cursor-pointer"
                  >
                    1:1 (1080×1080)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCustomWidth(1080);
                      setCustomHeight(1350);
                    }}
                    className="text-xs px-2.5 py-1 rounded bg-[#1a1a1e] hover:bg-[#222228] text-zinc-300 border border-[#28282e] transition cursor-pointer"
                  >
                    4:5 (1080×1350)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCustomWidth(2560);
                      setCustomHeight(1080);
                    }}
                    className="text-xs px-2.5 py-1 rounded bg-[#1a1a1e] hover:bg-[#222228] text-zinc-300 border border-[#28282e] transition cursor-pointer"
                  >
                    21:9 (2560×1080)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Framerate (FPS) Selection Section */}
          <div className="p-4 rounded-xl bg-[#1a1a1e] border border-[#28282e] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gauge className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-semibold text-white uppercase tracking-wider">
                  Framerate (FPS) Options
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-700/50">
                Active: {selectedFps} FPS
              </span>
            </div>

            <p className="text-[11px] text-zinc-400">
              Set target timeline playback & high-fidelity export framerate for this canvas.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { fps: 30, label: '30 FPS', badge: 'Compact', desc: 'Web & light transfers' },
                { fps: 60, label: '60 FPS', badge: 'Standard Smooth', desc: 'Universal 60Hz displays', recommended: true },
                { fps: 120, label: '120 FPS', badge: 'Ultra Fluid', desc: '120Hz/144Hz+ displays' },
                { fps: -1, label: 'Custom FPS', badge: 'Custom', desc: 'Arbitrary framerate' },
              ].map((item) => {
                const isSelected = item.fps === -1 ? isCustomFpsActive : selectedFps === item.fps && !isCustomFpsActive;
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => {
                      if (item.fps === -1) {
                        setIsCustomFpsActive(true);
                      } else {
                        setIsCustomFpsActive(false);
                        setSelectedFps(item.fps);
                        setExportFps(item.fps);
                      }
                    }}
                    className={`p-2.5 rounded-lg border text-left transition cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-purple-950/40 border-purple-500/80 ring-1 ring-purple-500/50 shadow-md shadow-purple-950/30'
                        : 'bg-[#121215] border-[#26262c] hover:bg-[#1a1a20] text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-zinc-300'}`}>
                        {item.label}
                      </span>
                      {item.recommended && (
                        <span className="text-[8px] font-bold px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          PRO
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-zinc-500 leading-tight">
                      {item.desc}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Custom FPS Input */}
            {isCustomFpsActive && (
              <div className="pt-2 border-t border-[#242428] flex items-center gap-3">
                <span className="text-xs text-zinc-300 font-medium">Custom FPS:</span>
                <input
                  type="number"
                  min={1}
                  max={240}
                  value={selectedFps}
                  onChange={(e) => {
                    const val = Math.max(1, Math.min(240, parseInt(e.target.value) || 60));
                    setSelectedFps(val);
                    setExportFps(val);
                  }}
                  className="w-24 px-2.5 py-1 rounded bg-[#101012] border border-[#2c2c32] focus:border-purple-500 focus:outline-none text-white font-mono text-xs"
                />
                <span className="text-[11px] text-zinc-400">
                  (Common: 24 for Film, 75, 90, 144, 240 for high refresh gaming displays)
                </span>
              </div>
            )}
          </div>

          {/* Scale layers explanation note */}
          <div className="p-3 rounded bg-purple-950/20 border border-purple-900/30 text-xs text-purple-200/90 flex items-start gap-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 shrink-0"></span>
            <div>
              <span className="font-semibold text-white">Scale layers option: </span>
              When enabled, all layer properties (positions, widths, heights, border widths, corner
              radii, text font sizes, and vector paths) proportionally scale to maintain the exact
              visual ratio across any canvas resolution without borders shrinking.
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 border-t border-[#242428] bg-[#121215] flex items-center justify-between shrink-0">
          <div className="text-xs text-zinc-400">
            Selected:{' '}
            <span className="font-mono font-semibold text-white">
              {activeTab === 'presets'
                ? `${canvasResolution.width} × ${canvasResolution.height}`
                : `${customWidth} × ${customHeight} (${currentRatio})`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsResolutionModalOpen(false)}
              className="px-3.5 py-1.5 text-xs font-medium rounded bg-[#222227] hover:bg-[#2c2c32] text-zinc-300 transition cursor-pointer"
            >
              Cancel
            </button>

            {activeTab === 'custom' ? (
              <button
                onClick={handleApplyCustom}
                className="px-4 py-1.5 text-xs font-medium rounded bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-950/50 transition cursor-pointer"
              >
                Apply Custom Resolution
              </button>
            ) : (
              <button
                onClick={() => setIsResolutionModalOpen(false)}
                className="px-4 py-1.5 text-xs font-medium rounded bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-950/50 transition cursor-pointer"
              >
                Done
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
