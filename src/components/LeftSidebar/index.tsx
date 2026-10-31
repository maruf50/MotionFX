'use client';

import React, { useState } from 'react';
import { Sparkles, Layers, LayoutTemplate } from 'lucide-react';
import { AddElementsPanel } from './AddElementsPanel';
import { LayersStackPanel } from './LayersStackPanel';
import { TemplatesBrowserPanel } from './TemplatesBrowserPanel';

type SidebarTab = 'elements' | 'layers' | 'templates';

interface LeftSidebarProps {
  width?: number;
}

export function LeftSidebar({ width }: LeftSidebarProps) {
  const [activeTab, setActiveTab] = useState<SidebarTab>('elements');

  return (
    <aside
      style={width ? { width: `${width}px` } : undefined}
      className={`${width ? '' : 'w-80 '}bg-[#161619] border-r border-[#242428] flex flex-col shrink-0 z-20 overflow-hidden select-none`}
    >
      {/* Sidebar Mode Tabs */}
      <div className="grid grid-cols-3 bg-[#111113] p-1 border-b border-[#242428]">
        <button
          onClick={() => setActiveTab('elements')}
          className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded text-xs font-medium transition cursor-pointer ${
            activeTab === 'elements'
              ? 'bg-[#222227] text-white border-b-2 border-purple-500 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
          title="Add shapes, line, text & image elements"
        >
          <Sparkles className={`w-3.5 h-3.5 ${activeTab === 'elements' ? 'text-purple-400' : 'text-zinc-400'}`} />
          <span>Elements</span>
        </button>

        <button
          onClick={() => setActiveTab('layers')}
          className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded text-xs font-medium transition cursor-pointer ${
            activeTab === 'layers'
              ? 'bg-[#222227] text-white border-b-2 border-purple-500 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
          title="Manage, group & reorder scene layers"
        >
          <Layers className={`w-3.5 h-3.5 ${activeTab === 'layers' ? 'text-purple-400' : 'text-zinc-400'}`} />
          <span>Layers</span>
        </button>

        <button
          onClick={() => setActiveTab('templates')}
          className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded text-xs font-medium transition cursor-pointer ${
            activeTab === 'templates'
              ? 'bg-[#222227] text-white border-b-2 border-purple-500 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
          title="Browse templates & drag layers into scene"
        >
          <LayoutTemplate className={`w-3.5 h-3.5 ${activeTab === 'templates' ? 'text-purple-400' : 'text-zinc-400'}`} />
          <span>Templates</span>
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'elements' && (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <AddElementsPanel />
          <LayersStackPanel />
        </div>
      )}

      {activeTab === 'layers' && (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <LayersStackPanel />
        </div>
      )}

      {activeTab === 'templates' && (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <TemplatesBrowserPanel />
        </div>
      )}
    </aside>
  );
}
