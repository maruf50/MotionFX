'use client';

import React from 'react';
import { Loader2, Film, X } from 'lucide-react';
import { useMotion } from '@/context/MotionContext';

export function ExportModal() {
  const { exportProgress, cancelExport } = useMotion();

  if (!exportProgress.isExporting) return null;

  return (
    <div className="fixed inset-0 bg-[#0d0d0f]/85 backdrop-blur-md z-50 flex items-center justify-center p-4 select-none">
      <div className="w-96 bg-[#161619] border border-[#28282e] rounded-xl p-6 shadow-2xl text-center relative animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={cancelExport}
          className="absolute top-4 right-4 p-1 rounded text-zinc-400 hover:text-white hover:bg-[#222227] transition cursor-pointer"
          title="Cancel Export"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-14 h-14 rounded-xl bg-purple-600/10 border border-purple-500/30 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-950/20">
          <Loader2 className="w-7 h-7 text-purple-400 animate-spin" />
        </div>

        <div className="flex items-center justify-center gap-2 mb-2">
          <h3 className="text-base font-bold text-white">Rendering Motion Video</h3>
          <span
            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
              (exportProgress.fps || 60) >= 120
                ? 'bg-amber-500/15 text-amber-300 border-amber-500/40 shadow-sm shadow-amber-950/40'
                : 'bg-purple-950/60 text-purple-300 border-purple-700/50'
            }`}
          >
            {exportProgress.fps || 60} FPS {(exportProgress.fps || 60) >= 120 ? 'ULTRA' : 'PRO'}
          </span>
        </div>

        <p className="text-xs text-zinc-400 mb-5">
          Capturing {exportProgress.fps || 60} FPS Canvas stream & encoding high-fidelity video
        </p>

        {/* Progress Bar */}
        <div className="w-full h-2.5 bg-[#101012] rounded-full overflow-hidden border border-[#242428] mb-2.5">
          <div
            className={`h-full transition-all duration-75 ${
              (exportProgress.fps || 60) >= 120
                ? 'bg-gradient-to-r from-amber-600 via-purple-600 to-purple-400'
                : 'bg-gradient-to-r from-purple-700 via-purple-500 to-purple-400'
            }`}
            style={{ width: `${exportProgress.progress}%` }}
          />
        </div>

        {/* Progress Status */}
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-purple-400 font-semibold">{exportProgress.progress}%</span>
          <span className="text-[11px] text-zinc-400">
            Frame {Math.round(exportProgress.currentSec * (exportProgress.fps || 60))} /{' '}
            {Math.round(exportProgress.totalSec * (exportProgress.fps || 60))}
          </span>
          <span className="text-zinc-400">
            {exportProgress.currentSec.toFixed(1)}s / {exportProgress.totalSec.toFixed(1)}s
          </span>
        </div>

        <div className="mt-5 pt-3 border-t border-[#242428]">
          <button
            onClick={cancelExport}
            className="text-xs px-3.5 py-1.5 rounded bg-[#222227] hover:bg-[#2c2c32] text-zinc-300 transition cursor-pointer"
          >
            Cancel Render
          </button>
        </div>
      </div>
    </div>
  );
}
