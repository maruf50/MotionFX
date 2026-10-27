'use client';

import React, { useRef } from 'react';
import { useMotion } from '@/context/MotionContext';

export function TimeRuler() {
  const { duration, setCurrentTime, pausePlay } = useMotion();
  const rulerRef = useRef<HTMLDivElement | null>(null);

  const handleRulerClickOrDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!rulerRef.current) return;
    const rect = rulerRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    pausePlay();
    setCurrentTime(ratio * duration);
  };

  const steps = Math.round(duration * 2); // 0.5s ticks
  const ticks = [];
  for (let i = 0; i <= steps; i++) {
    const sec = i * 0.5;
    const pct = (sec / duration) * 100;
    const isWhole = i % 2 === 0;
    ticks.push({ sec, pct, isWhole });
  }

  return (
    <div
      ref={rulerRef}
      onMouseDown={handleRulerClickOrDrag}
      className="h-7 border-b border-[#1e2130] relative cursor-ew-resize bg-[#11131c]/90 select-none overflow-hidden"
    >
      {ticks.map(({ sec, pct, isWhole }, idx) => (
        <div
          key={idx}
          className="absolute top-0 bottom-0 flex flex-col justify-end pointer-events-none"
          style={{ left: `${pct}%` }}
        >
          {isWhole && (
            <span className="text-[10px] font-mono text-slate-400 -ml-2 mb-1">
              {sec.toFixed(1)}s
            </span>
          )}
          <div
            className={`w-[1px] ${
              isWhole ? 'h-2.5 bg-slate-500' : 'h-1.5 bg-[#2b2f44]'
            }`}
          />
        </div>
      ))}
    </div>
  );
}
