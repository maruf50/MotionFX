'use client';

import React, { useEffect } from 'react';
import { useMotion } from '@/context/MotionContext';
import { TransportControls } from './TransportControls';
import { TimeRuler } from './TimeRuler';
import { TimelineTracks } from './TimelineTracks';

export function Timeline() {
  const {
    currentTime,
    duration,
    togglePlay,
    selectedKeyframe,
    deleteSelectedKeyframe,
    selectedLayerId,
    deleteLayer,
  } = useMotion();

  // Keyboard Shortcuts (Space to play/pause, Delete to remove keyframe/layer)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(activeTag || '')) return;

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'Delete' || e.code === 'Backspace') {
        if (selectedKeyframe) {
          e.preventDefault();
          deleteSelectedKeyframe();
        } else if (selectedLayerId) {
          e.preventDefault();
          deleteLayer(selectedLayerId);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, selectedKeyframe, deleteSelectedKeyframe, selectedLayerId, deleteLayer]);

  const playheadPct = Math.min(100, Math.max(0, (currentTime / duration) * 100));

  return (
    <section className="h-64 bg-[#11131c] border-t border-[#1e2130] flex flex-col shrink-0 z-30 select-none">
      <TransportControls />

      <div className="flex-1 flex min-h-0 overflow-hidden relative">
        <div className="flex-1 flex flex-col min-w-0 relative">
          <div className="flex flex-1 min-h-0">
            {/* Left track names spacer alignment with TimeRuler */}
            <div className="w-64 border-r border-[#1e2130] bg-[#11131c] shrink-0 flex flex-col">
              <div className="h-7 border-b border-[#1e2130] px-3 flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-slate-500 bg-[#090a0f]/40">
                <span>Timeline</span>
                <span className="font-mono text-indigo-400">FPS: 60</span>
              </div>
            </div>

            {/* Right ruler pane */}
            <div className="flex-1 min-w-0">
              <TimeRuler />
            </div>
          </div>

          {/* Timeline Tracks Lane area */}
          <TimelineTracks />

          {/* Red Playhead Indicator Line */}
          <div
            className="absolute top-0 bottom-0 w-[2px] bg-rose-500 pointer-events-none z-40 transition-transform duration-75"
            style={{
              left: `calc(16rem + (100% - 16rem) * ${playheadPct / 100})`,
            }}
          >
            {/* Playhead Scrubber Top Handle */}
            <div className="w-3.5 h-4 -ml-[6px] bg-rose-500 rounded-b-sm flex items-center justify-center shadow-lg shadow-rose-500/50">
              <div className="w-1 h-2 bg-white/90 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
