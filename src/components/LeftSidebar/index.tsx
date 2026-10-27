'use client';

import React from 'react';
import { AddElementsPanel } from './AddElementsPanel';
import { LayersStackPanel } from './LayersStackPanel';

export function LeftSidebar() {
  return (
    <aside className="w-72 bg-[#11131c] border-r border-[#1e2130] flex flex-col shrink-0 z-20 overflow-hidden">
      <AddElementsPanel />
      <LayersStackPanel />
    </aside>
  );
}
