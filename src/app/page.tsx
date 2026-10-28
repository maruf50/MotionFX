'use client';

import React from 'react';
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
  return (
    <MotionProvider>
      <div className="h-screen w-screen flex flex-col font-sans antialiased overflow-hidden bg-[#0d0d0f]">
        {/* Top Header Navigation */}
        <Header />

        {/* Main Workspace (Left Palette/Layers + Center Canvas + Right Inspector) */}
        <div className="flex-1 flex min-h-0 overflow-hidden">
          <LeftSidebar />
          <CanvasStage />
          <RightInspector />
        </div>

        {/* Bottom Keyframe Sequencer & Transport Controls */}
        <Timeline />

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
