'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { MotionProvider } from '@/context/MotionContext';
import { Header } from '@/components/Header';
import { LeftSidebar } from '@/components/LeftSidebar';
import { CanvasStage } from '@/components/CanvasStage';
import { RightInspector } from '@/components/RightInspector';
import { Timeline } from '@/components/Timeline';
import { ExportModal } from '@/components/ExportModal';
import { ExportSettingsModal } from '@/components/ExportSettingsModal';
import { ResolutionModal } from '@/components/ResolutionModal';
import { BuildShapeModal } from '@/components/BuildShapeModal';

export default function MotionGraphicsStudioPage() {
  const [leftWidth, setLeftWidth] = useState<number>(320);
  const [rightWidth, setRightWidth] = useState<number>(320);
  const [timelineHeight, setTimelineHeight] = useState<number>(260);

  // Restore saved panel sizes from localStorage
  useEffect(() => {
    try {
      const savedLeft = localStorage.getItem('motionfx_panel_left_width');
      if (savedLeft) setLeftWidth(Math.max(220, Math.min(600, Number(savedLeft))));
      const savedRight = localStorage.getItem('motionfx_panel_right_width');
      if (savedRight) setRightWidth(Math.max(240, Math.min(600, Number(savedRight))));
      const savedTimeline = localStorage.getItem('motionfx_panel_timeline_height');
      if (savedTimeline) setTimelineHeight(Math.max(140, Math.min(650, Number(savedTimeline))));
    } catch {
      // Ignore in SSR
    }
  }, []);

  // Drag-to-resize Left Sidebar (Elements/Layers)
  const handleLeftResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startW = leftWidth;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    const onMouseMove = (moveEvent: MouseEvent) => {
      const delta = moveEvent.clientX - startX;
      const maxW = Math.floor(window.innerWidth * 0.45);
      const nextW = Math.max(220, Math.min(maxW, startW + delta));
      setLeftWidth(nextW);
    };

    const onMouseUp = (upEvent: MouseEvent) => {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      const delta = upEvent.clientX - startX;
      const maxW = Math.floor(window.innerWidth * 0.45);
      const finalW = Math.max(220, Math.min(maxW, startW + delta));
      try {
        localStorage.setItem('motionfx_panel_left_width', String(finalW));
      } catch {}
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }, [leftWidth]);

  // Drag-to-resize Right Inspector
  const handleRightResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startW = rightWidth;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    const onMouseMove = (moveEvent: MouseEvent) => {
      const delta = startX - moveEvent.clientX;
      const maxW = Math.floor(window.innerWidth * 0.45);
      const nextW = Math.max(240, Math.min(maxW, startW + delta));
      setRightWidth(nextW);
    };

    const onMouseUp = (upEvent: MouseEvent) => {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      const delta = startX - upEvent.clientX;
      const maxW = Math.floor(window.innerWidth * 0.45);
      const finalW = Math.max(240, Math.min(maxW, startW + delta));
      try {
        localStorage.setItem('motionfx_panel_right_width', String(finalW));
      } catch {}
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }, [rightWidth]);

  // Drag-to-resize Bottom Timeline
  const handleTimelineResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const startY = e.clientY;
    const startH = timelineHeight;
    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none';

    const onMouseMove = (moveEvent: MouseEvent) => {
      const delta = startY - moveEvent.clientY;
      const maxH = Math.floor(window.innerHeight * 0.7);
      const nextH = Math.max(140, Math.min(maxH, startH + delta));
      setTimelineHeight(nextH);
    };

    const onMouseUp = (upEvent: MouseEvent) => {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      const delta = startY - upEvent.clientY;
      const maxH = Math.floor(window.innerHeight * 0.7);
      const finalH = Math.max(140, Math.min(maxH, startH + delta));
      try {
        localStorage.setItem('motionfx_panel_timeline_height', String(finalH));
      } catch {}
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }, [timelineHeight]);

  return (
    <MotionProvider>
      <div className="h-screen w-screen flex flex-col font-sans antialiased overflow-hidden bg-[#0d0d0f]">
        {/* Top Header Navigation */}
        <Header />

        {/* Main Workspace (Left Palette/Layers + Center Canvas + Right Inspector) */}
        <div className="flex-1 flex min-h-0 overflow-hidden relative">
          <LeftSidebar width={leftWidth} />

          {/* Vertical Resizer: Left Sidebar <-> Canvas */}
          <div
            onMouseDown={handleLeftResizeStart}
            role="separator"
            aria-orientation="vertical"
            title="Drag to resize left panel"
            className="w-2 -ml-1 -mr-1 z-30 cursor-col-resize group relative flex items-center justify-center shrink-0 hover:bg-purple-500/20 active:bg-purple-500/30 transition-colors"
          >
            <div className="w-[1px] h-full bg-[#242428] group-hover:bg-purple-400 group-active:bg-purple-400 transition-colors" />
          </div>

          <CanvasStage />

          {/* Vertical Resizer: Canvas <-> Right Inspector */}
          <div
            onMouseDown={handleRightResizeStart}
            role="separator"
            aria-orientation="vertical"
            title="Drag to resize inspector panel"
            className="w-2 -ml-1 -mr-1 z-30 cursor-col-resize group relative flex items-center justify-center shrink-0 hover:bg-purple-500/20 active:bg-purple-500/30 transition-colors"
          >
            <div className="w-[1px] h-full bg-[#242428] group-hover:bg-purple-400 group-active:bg-purple-400 transition-colors" />
          </div>

          <RightInspector width={rightWidth} />
        </div>

        {/* Horizontal Resizer: Workspace <-> Timeline */}
        <div
          onMouseDown={handleTimelineResizeStart}
          role="separator"
          aria-orientation="horizontal"
          title="Drag to resize timeline height"
          className="h-2 -mt-1 -mb-1 z-30 cursor-row-resize group relative flex items-center justify-center shrink-0 hover:bg-purple-500/20 active:bg-purple-500/30 transition-colors"
        >
          <div className="h-[1px] w-full bg-[#242428] group-hover:bg-purple-400 group-active:bg-purple-400 transition-colors" />
        </div>

        {/* Bottom Keyframe Sequencer & Transport Controls */}
        <Timeline height={timelineHeight} />

        {/* Video Rendering / Export Modal */}
        <ExportModal />

        {/* Export Settings & FPS Modal */}
        <ExportSettingsModal />

        {/* Canvas Resolution & Aspect Ratio Modal */}
        <ResolutionModal />

        {/* In-Scene Vector Shape Builder Studio Modal */}
        <BuildShapeModal />
      </div>
    </MotionProvider>
  );
}
