'use client';

import React, { useEffect, useRef } from 'react';
import { useMotion } from '@/context/MotionContext';
import { TransportControls } from './TransportControls';
import { TimeRuler } from './TimeRuler';
import { TimelineTracks } from './TimelineTracks';

export function Timeline() {
  const {
    currentTime,
    duration,
    togglePlay,
    pausePlay,
    setCurrentTime,
    selectedKeyframe,
    deleteSelectedKeyframe,
    selectedLayerId,
    deleteLayer,
    undo,
    redo,
    importTemplateLayer,
  } = useMotion();

  const containerRef = useRef<HTMLDivElement | null>(null);

  // Playhead scrubber handle drag
  const handlePlayheadMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    pausePlay();

    const onMouseMove = (moveEvent: MouseEvent) => {
      if (!containerRef.current) return;
      // The right timeline area starts after the 16rem (256px) left track names
      const rect = containerRef.current.getBoundingClientRect();
      const leftOffset = 256; // 16rem
      const tracksWidth = rect.width - leftOffset;
      if (tracksWidth <= 0) return;

      const clickX = moveEvent.clientX - rect.left - leftOffset;
      const ratio = Math.max(0, Math.min(1, clickX / tracksWidth));
      setCurrentTime(ratio * duration);
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  // Keyboard Shortcuts (Undo/Redo, Space to play/pause, Delete to remove keyframe/layer)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(activeTag || '')) return;

      // Undo / Redo
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
        return;
      }

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
  }, [
    togglePlay,
    selectedKeyframe,
    deleteSelectedKeyframe,
    selectedLayerId,
    deleteLayer,
    undo,
    redo,
  ]);

  const playheadPct = Math.min(100, Math.max(0, (currentTime / duration) * 100));

  return (
    <section className="h-64 bg-[#11131c] border-t border-[#1e2130] flex flex-col shrink-0 z-30 select-none">
      <TransportControls />

      <div
        ref={containerRef}
        onDragOver={(e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'copy';
        }}
        onDrop={(e) => {
          e.preventDefault();
          const templateData =
            e.dataTransfer.getData('motionfx-template-layer') ||
            e.dataTransfer.getData('application/json');
          if (templateData && containerRef.current) {
            try {
              const parsed = JSON.parse(templateData);
              if (parsed) {
                const rect = containerRef.current.getBoundingClientRect();
                const leftOffset = 256;
                const tracksWidth = rect.width - leftOffset;
                const clickX = e.clientX - rect.left - leftOffset;
                const ratio = Math.max(0, Math.min(1, clickX / Math.max(1, tracksWidth)));
                const dropTime = Math.round(ratio * duration * 20) / 20;
                importTemplateLayer(parsed, dropTime);
                setCurrentTime(dropTime);
              }
            } catch (err) {
              console.error('Failed to parse dropped template layer onto timeline:', err);
            }
          }
        }}
        className="flex-1 flex min-h-0 overflow-hidden relative"
      >
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

          {/* Red Playhead Indicator Line (NO lag transition, realtime cursor follow) */}
          <div
            className="absolute top-0 bottom-0 w-[2px] bg-rose-500 z-40 pointer-events-none"
            style={{
              left: `calc(16rem + (100% - 16rem) * ${playheadPct / 100})`,
            }}
          >
            {/* Playhead Scrubber Top Handle */}
            <div
              onMouseDown={handlePlayheadMouseDown}
              title="Drag playhead to scrub timeline in realtime"
              className="w-4 h-5 -ml-[7px] bg-rose-500 rounded-b-sm flex items-center justify-center shadow-lg shadow-rose-500/50 cursor-ew-resize pointer-events-auto hover:scale-110 transition-transform"
            >
              <div className="w-1 h-2.5 bg-white/90 rounded-full pointer-events-none"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
