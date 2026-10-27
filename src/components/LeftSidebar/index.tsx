'use client';

import React, { useState } from 'react';
import { Sparkles, Layers, LayoutTemplate } from 'lucide-react';
import { AddElementsPanel } from './AddElementsPanel';
import { LayersStackPanel } from './LayersStackPanel';
import { TemplatesBrowserPanel } from './TemplatesBrowserPanel';

type SidebarTab = 'elements' | 'layers' | 'templates';

export function LeftSidebar() {
  const [activeTab, setActiveTab] = useState<SidebarTab>('elements');

  return (
    <aside className="w-80 bg-[#11131c] border-r border-[#1e2130] flex flex-col shrink-0 z-20 overflow-hidden select-none">
      {/* Sidebar Mode Tabs */}
      <div className="grid grid-cols-3 bg-[#0a0c13] p-1 border-b border-[#1e2130]">
        <button
          onClick={() => setActiveTab('elements')}
          className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-xs font-medium transition cursor-pointer ${
            activeTab === 'elements'
              ? 'bg-[#1e2130] text-indigo-300 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Add shapes, line, text & image elements"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Elements</span>
        </button>

        <button
          onClick={() => setActiveTab('layers')}
          className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-xs font-medium transition cursor-pointer ${
            activeTab === 'layers'
              ? 'bg-[#1e2130] text-indigo-300 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Manage, group & reorder scene layers"
        >
          <Layers className="w-3.5 h-3.5 text-pink-400" />
          <span>Layers</span>
        </button>

        <button
          onClick={() => setActiveTab('templates')}
          className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-xs font-medium transition cursor-pointer ${
            activeTab === 'templates'
              ? 'bg-[#1e2130] text-indigo-300 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Browse templates & drag layers into scene"
        >
          <LayoutTemplate className="w-3.5 h-3.5 text-amber-400" />
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
