'use client';

import React, { useRef } from 'react';
import { useMotion } from '@/context/MotionContext';

export function TimeRuler() {
  const { duration, setCurrentTime, pausePlay } = useMotion();
  const rulerRef = useRef<HTMLDivElement | null>(null);

  const updateTimeFromMouse = (clientX: number) => {
    if (!rulerRef.current) return;
    const rect = rulerRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    setCurrentTime(ratio * duration);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    pausePlay();
    updateTimeFromMouse(e.clientX);

    const onMouseMove = (moveEvent: MouseEvent) => {
      updateTimeFromMouse(moveEvent.clientX);
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  let minorTick = 0.5;
  let majorTick = 1.0;
  if (duration > 60) {
    minorTick = 5.0;
    majorTick = 10.0;
  } else if (duration > 30) {
    minorTick = 2.0;
    majorTick = 5.0;
  } else if (duration > 15) {
    minorTick = 1.0;
    majorTick = 2.0;
  } else if (duration > 6) {
    minorTick = 0.5;
    majorTick = 1.0;
  } else {
    minorTick = 0.25;
    majorTick = 0.5;
  }

  const ticks: { sec: number; pct: number; isWhole: boolean }[] = [];
  const count = Math.floor(duration / minorTick);
  for (let i = 0; i <= count; i++) {
    const sec = Math.round(i * minorTick * 100) / 100;
    if (sec > duration) break;
    const pct = (sec / duration) * 100;
    const isWhole =
      Math.abs(sec % majorTick) < 0.01 || Math.abs((sec % majorTick) - majorTick) < 0.01;
    ticks.push({ sec, pct, isWhole });
  }

  if (ticks.length > 0 && Math.abs(ticks[ticks.length - 1].sec - duration) > 0.05) {
    ticks.push({ sec: duration, pct: 100, isWhole: true });
  }

  return (
    <div
      ref={rulerRef}
      onMouseDown={handleMouseDown}
      className="h-7 border-b border-[#242428] relative cursor-ew-resize bg-[#141417] select-none overflow-hidden"
    >
      {ticks.map(({ sec, pct, isWhole }, idx) => (
        <div
          key={idx}
          className="absolute top-0 bottom-0 flex flex-col justify-end pointer-events-none"
          style={{ left: `${pct}%` }}
        >
          {isWhole && (
            <span className="text-[10px] font-mono text-zinc-400 -ml-2 mb-1">
              {sec.toFixed(1)}s
            </span>
          )}
          <div
            className={`w-[1px] ${
              isWhole ? 'h-2.5 bg-zinc-500' : 'h-1.5 bg-[#2c2c34]'
            }`}
          />
        </div>
      ))}
    </div>
  );
}
