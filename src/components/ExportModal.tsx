'use client';

import React from 'react';
import { Loader2, Film, X } from 'lucide-react';
import { useMotion } from '@/context/MotionContext';

export function ExportModal() {
  const { exportProgress, cancelExport } = useMotion();

  if (!exportProgress.isExporting) return null;

  return (
    <div className="fixed inset-0 bg-[#090a0f]/85 backdrop-blur-md z-50 flex items-center justify-center p-4 select-none">
      <div className="w-96 bg-[#11131c] border border-[#2b2f44] rounded-2xl p-6 shadow-2xl text-center relative animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={cancelExport}
          className="absolute top-4 right-4 p-1 rounded-md text-slate-400 hover:text-white hover:bg-[#1e2130] transition cursor-pointer"
          title="Cancel Export"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/10">
          <Loader2 className="w-7 h-7 text-indigo-400 animate-spin" />
        </div>

        <h3 className="text-base font-bold text-white mb-1">Rendering Motion Video...</h3>
        <p className="text-xs text-slate-400 mb-5">
          Capturing 60 FPS Canvas captureStream & encoding video file
        </p>

        {/* Progress Bar */}
        <div className="w-full h-2.5 bg-[#090a0f] rounded-full overflow-hidden border border-[#1e2130] mb-2.5">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-75"
            style={{ width: `${exportProgress.progress}%` }}
          />
        </div>

        {/* Progress Status */}
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-indigo-400 font-semibold">{exportProgress.progress}%</span>
          <span className="text-slate-400">
            {exportProgress.currentSec.toFixed(1)}s / {exportProgress.totalSec.toFixed(1)}s
          </span>
        </div>

        <div className="mt-5 pt-3 border-t border-[#1e2130]">
          <button
            onClick={cancelExport}
            className="text-xs px-3 py-1.5 rounded-lg bg-[#1e2130] hover:bg-[#2b2f44] text-slate-300 transition cursor-pointer"
          >
            Cancel Render
          </button>
        </div>
      </div>
    </div>
  );
}
