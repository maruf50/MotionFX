'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useMotion } from '@/context/MotionContext';
import { AnimatableProp, SelectedKeyframeRef } from '@/types/motion';

interface DraggingKeyframeState {
  layerId: string;
  prop: AnimatableProp;
  index: number;
}

export function TimelineTracks() {
  const {
    layers,
    selectedLayerId,
    selectLayer,
    selectedKeyframe,
    selectKeyframe,
    duration,
    setCurrentTime,
    moveKeyframeTime,
    pausePlay,
  } = useMotion();

  const [draggingKf, setDraggingKf] = useState<DraggingKeyframeState | null>(null);
  const tracksPaneRef = useRef<HTMLDivElement | null>(null);

  const handleStartKeyframeDrag = (
    e: React.MouseEvent,
    layerId: string,
    prop: AnimatableProp,
    index: number,
    time: number
  ) => {
    e.stopPropagation();
    pausePlay();
    selectLayer(layerId);
    selectKeyframe({ layerId, prop, index });
    setDraggingKf({ layerId, prop, index });
    setCurrentTime(time);
  };

  // Continuous dragging of keyframe diamond
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!draggingKf || !tracksPaneRef.current) return;
      const rect = tracksPaneRef.current.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const newTime = ratio * duration;

      moveKeyframeTime(draggingKf.layerId, draggingKf.prop, draggingKf.index, newTime);
      setCurrentTime(newTime);
    };

    const handleGlobalMouseUp = () => {
      setDraggingKf(null);
    };

    if (draggingKf) {
      window.addEventListener('mousemove', handleGlobalMouseMove);
      window.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [draggingKf, duration, moveKeyframeTime, setCurrentTime]);

  // Continuous dragging on the track lanes (empty space)
  const handleTrackPaneMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('.keyframe-diamond')) return;
    pausePlay();

    const updateTime = (clientX: number) => {
      if (!tracksPaneRef.current) return;
      const rect = tracksPaneRef.current.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      setCurrentTime(ratio * duration);
    };

    updateTime(e.clientX);

    const onMouseMove = (moveEvent: MouseEvent) => {
      updateTime(moveEvent.clientX);
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  return (
    <div className="flex-1 flex min-h-0 overflow-hidden">
      {/* Left Track Names List */}
      <div className="w-64 border-r border-[#1e2130] flex flex-col shrink-0 bg-[#11131c]">
        <div className="h-7 border-b border-[#1e2130] px-3 flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-slate-500 bg-[#090a0f]/40">
          <span>Layer Track</span>
          <span>Properties</span>
        </div>

        <div className="flex-1 overflow-y-hidden divide-y divide-[#1e2130]/60">
          {layers.map((layer) => {
            const isSel = layer.id === selectedLayerId;
            return (
              <div
                key={layer.id}
                onClick={() => selectLayer(layer.id)}
                className={`h-9 px-3 flex items-center justify-between cursor-pointer transition ${
                  isSel ? 'bg-indigo-950/50 text-indigo-200' : 'text-slate-400 hover:bg-[#171925]'
                }`}
              >
                <span className="text-xs truncate font-medium">{layer.name}</span>
                <span className="text-[10px] font-mono text-slate-500">
                  pos • scale • rot
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Lanes & Diamonds */}
      <div
        ref={tracksPaneRef}
        onMouseDown={handleTrackPaneMouseDown}
        className="flex-1 overflow-y-auto relative divide-y divide-[#1e2130]/60 select-none cursor-crosshair"
      >
        {layers.map((layer) => {
          const isSel = layer.id === selectedLayerId;

          // Flatten keyframes across all properties on this layer
          const diamonds: { prop: AnimatableProp; index: number; time: number; value: number }[] =
            [];
          (Object.entries(layer.keyframes) as [AnimatableProp, { time: number; value: number }[]][]).forEach(
            ([prop, kfs]) => {
              kfs.forEach((kf, idx) => {
                diamonds.push({ prop, index: idx, time: kf.time, value: kf.value });
              });
            }
          );

          return (
            <div
              key={layer.id}
              className={`h-9 relative transition ${
                isSel ? 'bg-indigo-950/20' : 'hover:bg-[#11131c]/50'
              }`}
            >
              {/* Horizontal Center Guide Line */}
              <div className="absolute inset-y-0 left-0 right-0 flex items-center pointer-events-none">
                <div className="w-full h-[1px] bg-[#1e2130]/70"></div>
              </div>

              {/* Keyframe Diamonds */}
              {diamonds.map((d, dIdx) => {
                const leftPct = Math.min(99.2, Math.max(0.5, (d.time / duration) * 100));
                const isKfSelected =
                  selectedKeyframe &&
                  selectedKeyframe.layerId === layer.id &&
                  selectedKeyframe.prop === d.prop &&
                  selectedKeyframe.index === d.index;

                return (
                  <div
                    key={`${d.prop}_${d.index}_${dIdx}`}
                    onMouseDown={(e) =>
                      handleStartKeyframeDrag(e, layer.id, d.prop, d.index, d.time)
                    }
                    title={`${d.prop}: ${Number(d.value).toFixed(1)} @ ${d.time.toFixed(2)}s`}
                    className={`keyframe-diamond absolute top-1/2 bg-amber-400 border border-amber-950 cursor-pointer ${
                      isKfSelected ? 'selected' : ''
                    }`}
                    style={{ left: `${leftPct}%` }}
                  />
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
