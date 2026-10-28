'use client';

import React from 'react';
import {
  X,
  Film,
  Zap,
  Gauge,
  Sparkles,
  Check,
  Clock,
  Layers,
  FileVideo,
  Monitor,
} from 'lucide-react';
import { useMotion } from '@/context/MotionContext';
import { getAspectRatioString } from './ResolutionModal';

interface FpsOption {
  fps: number;
  label: string;
  badge: string;
  description: string;
  idealFor: string;
  bitrateEstimate: string;
  isPopular?: boolean;
  isUltra?: boolean;
}

const FPS_OPTIONS: FpsOption[] = [
  {
    fps: 60,
    label: '60 FPS',
    badge: 'Standard Smooth',
    description: 'Crisp, fluid motion ideal for YouTube, web portfolios, and standard monitors.',
    idealFor: 'Optimal file size & universal 60Hz playback',
    bitrateEstimate: '9 - 16 Mbps',
    isPopular: true,
  },
  {
    fps: 120,
    label: '120 FPS',
    badge: 'Ultra Pro Smooth',
    description: 'Double the frame rate for breathtaking fluidity on 120Hz/144Hz+ displays.',
    idealFor: 'Ultra high refresh monitors, slow-mo & pro grading',
    bitrateEstimate: '18 - 28 Mbps',
    isUltra: true,
  },
  {
    fps: 30,
    label: '30 FPS',
    badge: 'Compact',
    description: 'Classic cinema/broadcast frame rate. Smaller file size for quick previews.',
    idealFor: 'Low bandwidth & lightweight transfers',
    bitrateEstimate: '4 - 8 Mbps',
  },
];

export function ExportSettingsModal() {
  const {
    isExportSettingsOpen,
    setIsExportSettingsOpen,
    exportFps,
    setExportFps,
    startExport,
    duration,
    canvasResolution,
    layers,
    exportProgress,
  } = useMotion();

  if (!isExportSettingsOpen) return null;

  const totalFrames = Math.round(duration * exportFps);
  const isUltraRes = canvasResolution.width >= 2500 || canvasResolution.height >= 2500;
  const estimatedBitrate = isUltraRes
    ? exportFps >= 120
      ? '28 Mbps'
      : exportFps >= 60
      ? '16 Mbps'
      : '8 Mbps'
    : exportFps >= 120
    ? '18 Mbps'
    : exportFps >= 60
    ? '9 Mbps'
    : '5 Mbps';

  const handleStartExport = () => {
    setIsExportSettingsOpen(false);
    startExport(exportFps);
  };

  return (
    <div className="fixed inset-0 bg-[#0d0d0f]/85 backdrop-blur-md z-50 flex items-center justify-center p-4 select-none">
      <div className="w-[520px] max-w-full bg-[#161619] border border-[#28282e] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#242428] bg-[#1a1a1e]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-600/20 border border-purple-500/40 flex items-center justify-center shadow-inner">
              <Film className="w-4 h-4 text-purple-300" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Export Video Settings
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-purple-950/70 text-purple-300 border border-purple-700/50">
                  Framerate Selection
                </span>
              </h3>
              <p className="text-[11px] text-zinc-400">
                Choose output framerate, inspect frame metrics, and render your animation
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsExportSettingsOpen(false)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-[#25252b] transition cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Framerate Selection Options */}
          <div>
            <label className="text-xs font-semibold text-zinc-300 mb-2.5 flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-purple-400" />
              Framerate (FPS):
            </label>

            <div className="grid grid-cols-1 gap-2.5">
              {FPS_OPTIONS.map((opt) => {
                const isSelected = exportFps === opt.fps;
                return (
                  <button
                    key={opt.fps}
                    type="button"
                    onClick={() => setExportFps(opt.fps)}
                    className={`relative w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? opt.isUltra
                          ? 'bg-gradient-to-r from-amber-950/30 via-[#201c18] to-[#1a1a1f] border-amber-500/60 shadow-lg shadow-amber-950/20 ring-1 ring-amber-500/40'
                          : 'bg-gradient-to-r from-purple-950/40 via-[#1c1a24] to-[#18181d] border-purple-500/60 shadow-lg shadow-purple-950/30 ring-1 ring-purple-500/40'
                        : 'bg-[#121215] hover:bg-[#1a1a1f] border-[#26262c] text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border mt-0.5 ${
                          isSelected
                            ? opt.isUltra
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              : 'bg-purple-600/20 text-purple-300 border-purple-500/40'
                            : 'bg-[#18181c] text-zinc-500 border-[#2b2b32]'
                        }`}
                      >
                        {opt.isUltra ? (
                          <Sparkles className="w-5 h-5" />
                        ) : opt.fps === 60 ? (
                          <Zap className="w-5 h-5" />
                        ) : (
                          <Gauge className="w-5 h-5" />
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-bold text-sm ${
                              isSelected
                                ? opt.isUltra
                                  ? 'text-amber-200'
                                  : 'text-white'
                                : 'text-zinc-200'
                            }`}
                          >
                            {opt.label}
                          </span>

                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase tracking-wider font-semibold ${
                              isSelected
                                ? opt.isUltra
                                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                  : 'bg-purple-900/60 text-purple-200 border-purple-500/40'
                                : 'bg-[#1c1c22] text-zinc-500 border-[#2a2a30]'
                            }`}
                          >
                            {opt.badge}
                          </span>
                        </div>

                        <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                          {opt.description}
                        </p>

                        <div className="flex items-center gap-3 mt-2 text-[11px] text-zinc-400">
                          <span className="text-zinc-400">
                            Bitrate: <strong className="text-zinc-300">{opt.bitrateEstimate}</strong>
                          </span>
                          <span>•</span>
                          <span className="text-zinc-400">{opt.idealFor}</span>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 ml-3">
                      <div
                        className={`w-6 h-6 rounded-full border flex items-center justify-center transition ${
                          isSelected
                            ? opt.isUltra
                              ? 'bg-amber-500 border-amber-400 text-black'
                              : 'bg-purple-600 border-purple-400 text-white'
                            : 'border-[#33333b] bg-[#17171b]'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Render Specifications Summary */}
          <div className="bg-[#101013] border border-[#242429] rounded-xl p-3.5 space-y-2">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
              Render Specifications
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
              <div className="bg-[#151519] border border-[#222227] rounded-lg p-2.5">
                <div className="text-[10px] text-zinc-500 flex items-center gap-1 mb-1">
                  <Monitor className="w-3 h-3 text-purple-400" />
                  Resolution
                </div>
                <div className="text-xs font-mono font-bold text-zinc-200">
                  {canvasResolution.width} × {canvasResolution.height}
                </div>
                <div className="text-[10px] text-zinc-500">
                  {getAspectRatioString(canvasResolution.width, canvasResolution.height)}
                </div>
              </div>

              <div className="bg-[#151519] border border-[#222227] rounded-lg p-2.5">
                <div className="text-[10px] text-zinc-500 flex items-center gap-1 mb-1">
                  <Clock className="w-3 h-3 text-purple-400" />
                  Duration
                </div>
                <div className="text-xs font-mono font-bold text-zinc-200">
                  {duration.toFixed(1)}s
                </div>
                <div className="text-[10px] text-zinc-500">Timeline Length</div>
              </div>

              <div className="bg-[#151519] border border-[#222227] rounded-lg p-2.5">
                <div className="text-[10px] text-zinc-500 flex items-center gap-1 mb-1">
                  <Layers className="w-3 h-3 text-purple-400" />
                  Total Frames
                </div>
                <div className="text-xs font-mono font-bold text-purple-300">
                  {totalFrames} frames
                </div>
                <div className="text-[10px] text-zinc-500">@ {exportFps} FPS</div>
              </div>

              <div className="bg-[#151519] border border-[#222227] rounded-lg p-2.5">
                <div className="text-[10px] text-zinc-500 flex items-center gap-1 mb-1">
                  <FileVideo className="w-3 h-3 text-purple-400" />
                  Target Bitrate
                </div>
                <div className="text-xs font-mono font-bold text-zinc-200">
                  ~{estimatedBitrate}
                </div>
                <div className="text-[10px] text-zinc-500">WebM / VP9</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-[#141417] border-t border-[#242428] flex items-center justify-between">
          <div className="text-[11px] text-zinc-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Hardware Acceleration Ready
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsExportSettingsOpen(false)}
              className="text-xs px-4 py-2 rounded-lg bg-[#1c1c20] hover:bg-[#25252b] text-zinc-300 hover:text-white border border-[#28282e] transition cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleStartExport}
              disabled={layers.length === 0 || exportProgress.isExporting}
              className={`text-xs font-bold px-5 py-2 rounded-lg transition flex items-center gap-2 cursor-pointer shadow-lg disabled:opacity-40 disabled:cursor-not-allowed ${
                exportFps >= 120
                  ? 'bg-gradient-to-r from-amber-600 via-amber-500 to-purple-600 hover:from-amber-500 hover:to-purple-500 text-white shadow-amber-950/40 border border-amber-400/40'
                  : 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-950/50 border border-purple-400/30'
              }`}
            >
              <Film className="w-4 h-4" />
              <span>Start Render ({exportFps} FPS)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
