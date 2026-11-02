'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useMotion } from '@/context/MotionContext';
import { AnimatableProp, SelectedKeyframeRef } from '@/types/motion';

interface DraggingItem {
  layerId: string;
  prop: AnimatableProp;
  index: number;
  initialTime: number;
}

interface DraggingKeyframeState {
  primaryLayerId: string;
  primaryProp: AnimatableProp;
  primaryIndex: number;
  primaryStartTime: number;
  items: DraggingItem[];
}

interface DraggingLayerState {
  type: 'move' | 'trim-left' | 'trim-right';
  layerId: string;
  initialClientX: number;
  initialStartTime: number;
  initialEndTime: number;
  initialKeyframes: Partial<Record<AnimatableProp, { time: number; value: number }[]>>;
}

interface MarqueeBox {
  left: number;
  top: number;
  width: number;
  height: number;
}

export function TimelineTracks() {
  const {
    layers,
    selectedLayerId,
    selectLayer,
    updateLayer,
    selectedKeyframe,
    selectedKeyframes,
    selectKeyframe,
    selectMultipleKeyframes,
    clearSelectedKeyframes,
    deleteSelectedKeyframes,
    duration,
    setCurrentTime,
    moveMultipleKeyframes,
    pausePlay,
    recordSnapshot,
  } = useMotion();

  const [draggingKf, setDraggingKf] = useState<DraggingKeyframeState | null>(null);
  const [draggingLayer, setDraggingLayer] = useState<DraggingLayerState | null>(null);
  const [marqueeBox, setMarqueeBox] = useState<MarqueeBox | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Handle clicking and dragging on a layer bar body to move layer in time
  const handleStartLayerMove = (
    e: React.MouseEvent,
    layerId: string,
    currentStartTime: number,
    currentEndTime: number
  ) => {
    // If clicked on trim handle or diamond, ignore
    if ((e.target as HTMLElement).closest('.trim-handle')) return;
    if ((e.target as HTMLElement).closest('.keyframe-diamond')) return;

    e.stopPropagation();
    pausePlay();
    selectLayer(layerId);

    const targetLayer = layers.find((l) => l.id === layerId);
    const initialKeyframes: Partial<Record<AnimatableProp, { time: number; value: number }[]>> = {};
    if (targetLayer) {
      (Object.entries(targetLayer.keyframes) as [AnimatableProp, { time: number; value: number }[]][]).forEach(
        ([prop, kfs]) => {
          if (kfs) {
            initialKeyframes[prop] = kfs.map((k) => ({ ...k }));
          }
        }
      );
    }

    setDraggingLayer({
      type: 'move',
      layerId,
      initialClientX: e.clientX,
      initialStartTime: currentStartTime,
      initialEndTime: currentEndTime,
      initialKeyframes,
    });
  };

  // Handle clicking and dragging on left or right trim handles
  const handleStartTrim = (
    e: React.MouseEvent,
    layerId: string,
    handle: 'left' | 'right',
    currentStartTime: number,
    currentEndTime: number
  ) => {
    e.stopPropagation();
    pausePlay();
    selectLayer(layerId);

    setDraggingLayer({
      type: handle === 'left' ? 'trim-left' : 'trim-right',
      layerId,
      initialClientX: e.clientX,
      initialStartTime: currentStartTime,
      initialEndTime: currentEndTime,
      initialKeyframes: {},
    });
  };

  // Handle clicking and dragging on a keyframe diamond
  const handleStartKeyframeDrag = (
    e: React.MouseEvent,
    layerId: string,
    prop: AnimatableProp,
    index: number,
    time: number
  ) => {
    e.stopPropagation();
    pausePlay();
    recordSnapshot();
    selectLayer(layerId);

    const isShiftOrCtrl = e.shiftKey || e.ctrlKey || e.metaKey;

    if (isShiftOrCtrl) {
      selectKeyframe({ layerId, prop, index }, true);
      return;
    }

    const isAlreadySelected = selectedKeyframes.some(
      (k) => k.layerId === layerId && k.prop === prop && k.index === index
    );

    let activeItems: DraggingItem[] = [];

    if (isAlreadySelected && selectedKeyframes.length > 1) {
      // Drag all selected keyframes together
      activeItems = selectedKeyframes.map((k) => {
        const lyr = layers.find((l) => l.id === k.layerId);
        const kf = lyr?.keyframes[k.prop]?.[k.index];
        return {
          layerId: k.layerId,
          prop: k.prop,
          index: k.index,
          initialTime: kf ? kf.time : time,
        };
      });
    } else {
      // Select only this keyframe and drag it
      selectKeyframe({ layerId, prop, index }, false);
      activeItems = [{ layerId, prop, index, initialTime: time }];
    }

    setDraggingKf({
      primaryLayerId: layerId,
      primaryProp: prop,
      primaryIndex: index,
      primaryStartTime: time,
      items: activeItems,
    });
    setCurrentTime(time);
  };

  // Continuous dragging of keyframe diamonds (single or multiple)
  useEffect(() => {
    if (!draggingKf) return;

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const leftOffset = 256; // 16rem = w-64
      const tracksWidth = rect.width - leftOffset;
      if (tracksWidth <= 0) return;

      const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left - leftOffset) / tracksWidth));
      const targetTime = ratio * duration;
      const deltaTime = targetTime - draggingKf.primaryStartTime;

      const moves = draggingKf.items.map((it) => {
        const rawNewTime = it.initialTime + deltaTime;
        const clamped = Math.max(0, Math.min(duration, Math.round(rawNewTime * 20) / 20));
        return {
          layerId: it.layerId,
          prop: it.prop,
          index: it.index,
          newTime: clamped,
        };
      });

      moveMultipleKeyframes(moves, true);
      setCurrentTime(targetTime);
    };

    const handleGlobalMouseUp = () => {
      setDraggingKf(null);
    };

    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [draggingKf, duration, moveMultipleKeyframes, setCurrentTime]);

  // Continuous dragging of Layer Bar (Time Shift) or Trim Handles (In/Out Points)
  useEffect(() => {
    if (!draggingLayer) return;

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const leftOffset = 256; // 16rem = w-64
      const tracksWidth = rect.width - leftOffset;
      if (tracksWidth <= 0) return;

      const dx = e.clientX - draggingLayer.initialClientX;
      const dt = (dx / tracksWidth) * duration;

      if (draggingLayer.type === 'move') {
        const span = draggingLayer.initialEndTime - draggingLayer.initialStartTime;
        let targetStart = draggingLayer.initialStartTime + dt;
        let targetEnd = targetStart + span;

        if (targetStart < 0) {
          targetStart = 0;
          targetEnd = targetStart + span;
        } else if (targetEnd > duration) {
          targetEnd = duration;
          targetStart = Math.max(0, targetEnd - span);
        }

        const appliedShift = targetStart - draggingLayer.initialStartTime;

        // Shift all keyframes proportionally from initial snapshot
        const shiftedKeyframes: Partial<Record<AnimatableProp, { time: number; value: number }[]>> = {};
        Object.entries(draggingLayer.initialKeyframes).forEach(([prop, kfs]) => {
          if (kfs) {
            shiftedKeyframes[prop as AnimatableProp] = kfs.map((kf) => ({
              ...kf,
              time: Math.max(0, Math.min(duration, Math.round((kf.time + appliedShift) * 20) / 20)),
            }));
          }
        });

        updateLayer(
          draggingLayer.layerId,
          {
            startTime: Math.round(targetStart * 20) / 20,
            endTime: Math.round(targetEnd * 20) / 20,
            keyframes: shiftedKeyframes,
          },
          true
        );
      } else if (draggingLayer.type === 'trim-left') {
        const rawNewStart = draggingLayer.initialStartTime + dt;
        const targetStart = Math.max(0, Math.min(draggingLayer.initialEndTime - 0.05, rawNewStart));
        updateLayer(
          draggingLayer.layerId,
          { startTime: Math.round(targetStart * 20) / 20 },
          true
        );
      } else if (draggingLayer.type === 'trim-right') {
        const rawNewEnd = draggingLayer.initialEndTime + dt;
        const targetEnd = Math.max(draggingLayer.initialStartTime + 0.05, Math.min(duration, rawNewEnd));
        updateLayer(
          draggingLayer.layerId,
          { endTime: Math.round(targetEnd * 20) / 20 },
          true
        );
      }
    };

    const handleGlobalMouseUp = () => {
      recordSnapshot();
      setDraggingLayer(null);
    };

    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [draggingLayer, duration, recordSnapshot, updateLayer]);

  // Box Selection (Marquee Drag) or Clicking in Empty Track Space
  const handleContainerMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      // If clicking inside a diamond, layer bar, trim handle, or track title, ignore
      if ((e.target as HTMLElement).closest('.keyframe-diamond')) return;
      if ((e.target as HTMLElement).closest('.trim-handle')) return;
      if ((e.target as HTMLElement).closest('.layer-bar')) return;
      if ((e.target as HTMLElement).closest('.track-title-cell')) return;

      const container = containerRef.current;
      if (!container) return;

      pausePlay();

      const startClientX = e.clientX;
      const startClientY = e.clientY;
      const containerRect = container.getBoundingClientRect();
      const leftOffset = 256; // left track names column

      let isMarquee = false;

      const onMouseMove = (moveEvent: MouseEvent) => {
        const dx = moveEvent.clientX - startClientX;
        const dy = moveEvent.clientY - startClientY;

        if (!isMarquee && Math.hypot(dx, dy) > 4) {
          isMarquee = true;
        }

        if (isMarquee) {
          const clientMinX = Math.min(startClientX, moveEvent.clientX);
          const clientMaxX = Math.max(startClientX, moveEvent.clientX);
          const clientMinY = Math.min(startClientY, moveEvent.clientY);
          const clientMaxY = Math.max(startClientY, moveEvent.clientY);

          // Update visible marquee box relative to container
          const scrollLeft = container.scrollLeft;
          const scrollTop = container.scrollTop;

          setMarqueeBox({
            left: clientMinX - containerRect.left + scrollLeft,
            top: clientMinY - containerRect.top + scrollTop,
            width: clientMaxX - clientMinX,
            height: clientMaxY - clientMinY,
          });

          // Check intersection with all keyframe diamonds
          const diamondEls = container.querySelectorAll<HTMLElement>('.keyframe-diamond');
          const selected: SelectedKeyframeRef[] = [];

          diamondEls.forEach((el) => {
            const dRect = el.getBoundingClientRect();
            // Test intersection between diamond rect and marquee rect
            const intersects = !(
              dRect.right < clientMinX ||
              dRect.left > clientMaxX ||
              dRect.bottom < clientMinY ||
              dRect.top > clientMaxY
            );

            if (intersects) {
              const layerId = el.getAttribute('data-layer-id');
              const prop = el.getAttribute('data-prop') as AnimatableProp;
              const index = parseInt(el.getAttribute('data-index') || '-1', 10);

              if (layerId && prop && index !== -1) {
                selected.push({ layerId, prop, index });
              }
            }
          });

          selectMultipleKeyframes(selected);
        }
      };

      const onMouseUp = (upEvent: MouseEvent) => {
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
        setMarqueeBox(null);

        // If it was a simple click without dragging:
        if (!isMarquee) {
          if (!upEvent.shiftKey && !upEvent.ctrlKey && !upEvent.metaKey) {
            clearSelectedKeyframes();
          }

          // Move playhead to clicked time if in lanes area
          const tracksWidth = containerRect.width - leftOffset;
          if (tracksWidth > 0 && upEvent.clientX >= containerRect.left + leftOffset) {
            const ratio = Math.max(
              0,
              Math.min(1, (upEvent.clientX - containerRect.left - leftOffset) / tracksWidth)
            );
            setCurrentTime(ratio * duration);
          }
        }
      };

      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    },
    [clearSelectedKeyframes, duration, pausePlay, selectMultipleKeyframes, setCurrentTime]
  );

  // Keyboard shortcut: Delete or Backspace to delete selected keyframes
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInput =
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          (activeEl as HTMLElement).isContentEditable);

      if (isInput) return;

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedKeyframes.length > 0 || selectedKeyframe) {
          e.preventDefault();
          deleteSelectedKeyframes();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [deleteSelectedKeyframes, selectedKeyframe, selectedKeyframes.length]);

  return (
    <div
      ref={containerRef}
      onMouseDown={handleContainerMouseDown}
      className="h-full overflow-y-auto divide-y divide-[#242428]/80 select-none bg-[#121215] relative"
    >
      {/* Box Selection Visual Marquee Overlay */}
      {marqueeBox && (
        <div
          className="absolute pointer-events-none border border-purple-400 bg-purple-500/25 rounded z-40 shadow-sm"
          style={{
            left: `${marqueeBox.left}px`,
            top: `${marqueeBox.top}px`,
            width: `${marqueeBox.width}px`,
            height: `${marqueeBox.height}px`,
          }}
        />
      )}

      {layers.length === 0 ? (
        <div className="h-full min-h-[80px] flex items-center justify-center text-zinc-500 text-xs py-8">
          No layers in scene yet. Add elements from the left panel.
        </div>
      ) : (
        layers.map((layer) => {
          const isSel = layer.id === selectedLayerId;
          const start = Math.max(0, layer.startTime ?? 0);
          const end = Math.min(duration, layer.endTime ?? duration);
          const layerLeftPct = (start / duration) * 100;
          const layerWidthPct = Math.max(0.4, ((end - start) / duration) * 100);

          // Flatten keyframes across all properties on this layer
          const diamonds: { prop: AnimatableProp; index: number; time: number; value: number }[] = [];
          (Object.entries(layer.keyframes) as [AnimatableProp, { time: number; value: number }[]][]).forEach(
            ([prop, kfs]) => {
              kfs?.forEach((kf, idx) => {
                diamonds.push({ prop, index: idx, time: kf.time, value: kf.value });
              });
            }
          );

          return (
            <div key={layer.id} className="flex h-9 group">
              {/* Left Track Names List */}
              <div
                onClick={() => selectLayer(layer.id)}
                className={`track-title-cell w-64 border-r border-[#242428] px-3 flex items-center justify-between shrink-0 cursor-pointer transition ${
                  isSel
                    ? 'bg-purple-950/30 text-purple-200 border-l-2 border-purple-500'
                    : 'bg-[#161619] text-zinc-400 hover:bg-[#1c1c20] hover:text-zinc-200'
                }`}
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{
                      backgroundColor:
                        layer.fill && layer.fill !== 'transparent' ? layer.fill : '#a855f7',
                    }}
                  />
                  <span className="text-xs truncate font-medium max-w-[135px]">{layer.name}</span>
                </div>
                <span className="text-[10px] font-mono text-zinc-500 uppercase shrink-0">
                  {layer.type === 'text' ? 'text' : layer.type === 'shape' ? layer.shapeType || 'shape' : 'image'}
                </span>
              </div>

              {/* Right Lanes, Layer Bar & Keyframe Diamonds */}
              <div
                className={`flex-1 relative transition cursor-crosshair ${
                  isSel ? 'bg-purple-950/15' : 'hover:bg-[#18181c]/60'
                }`}
              >
                {/* Horizontal Center Guide Line across full track */}
                <div className="absolute inset-y-0 left-0 right-0 flex items-center pointer-events-none">
                  <div className="w-full h-[1px] bg-[#242428]/70"></div>
                </div>

                {/* After Effects Style Layer Bar */}
                <div
                  onMouseDown={(e) => handleStartLayerMove(e, layer.id, start, end)}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    setCurrentTime(start);
                  }}
                  className={`layer-bar absolute top-1.5 bottom-1.5 rounded-sm flex items-center select-none group/bar transition-colors z-10 cursor-grab active:cursor-grabbing ${
                    isSel
                      ? 'bg-purple-600/80 hover:bg-purple-600 border border-purple-400 text-white shadow-md shadow-purple-950/60'
                      : 'bg-[#252632]/90 hover:bg-[#2e303f] border border-[#3c3e52]/80 text-zinc-300'
                  }`}
                  style={{
                    left: `${layerLeftPct}%`,
                    width: `${layerWidthPct}%`,
                  }}
                  title={`${layer.name} (${start.toFixed(2)}s – ${end.toFixed(2)}s)`}
                >
                  {/* Left Trim Handle */}
                  <div
                    onMouseDown={(e) => handleStartTrim(e, layer.id, 'left', start, end)}
                    className="trim-handle absolute -left-1 inset-y-0 w-2.5 cursor-ew-resize flex items-center justify-center group-hover/bar:bg-white/20 hover:!bg-purple-400 rounded-l transition z-20"
                    title={`Trim In-Point (${start.toFixed(2)}s)`}
                  >
                    <div className="w-0.5 h-3 bg-white/70 group-hover/bar:bg-white rounded-full"></div>
                  </div>

                  {/* Inner Label */}
                  <div className="flex-1 h-full px-2 flex items-center gap-1.5 overflow-hidden pointer-events-none">
                    <span className="text-[11px] font-medium truncate tracking-tight">
                      {layer.name}
                    </span>
                    <span className="text-[9px] font-mono opacity-60 shrink-0 hidden sm:inline">
                      {(end - start).toFixed(1)}s
                    </span>
                  </div>

                  {/* Right Trim Handle */}
                  <div
                    onMouseDown={(e) => handleStartTrim(e, layer.id, 'right', start, end)}
                    className="trim-handle absolute -right-1 inset-y-0 w-2.5 cursor-ew-resize flex items-center justify-center group-hover/bar:bg-white/20 hover:!bg-purple-400 rounded-r transition z-20"
                    title={`Trim Out-Point (${end.toFixed(2)}s)`}
                  >
                    <div className="w-0.5 h-3 bg-white/70 group-hover/bar:bg-white rounded-full"></div>
                  </div>
                </div>

                {/* Keyframe Diamonds */}
                {diamonds.map((d, dIdx) => {
                  const leftPct = Math.min(99.2, Math.max(0.5, (d.time / duration) * 100));
                  const isKfSelected =
                    (selectedKeyframe &&
                      selectedKeyframe.layerId === layer.id &&
                      selectedKeyframe.prop === d.prop &&
                      selectedKeyframe.index === d.index) ||
                    selectedKeyframes.some(
                      (k) => k.layerId === layer.id && k.prop === d.prop && k.index === d.index
                    );

                  return (
                    <div
                      key={`${d.prop}_${d.index}_${dIdx}`}
                      data-layer-id={layer.id}
                      data-prop={d.prop}
                      data-index={d.index}
                      data-time={d.time}
                      onMouseDown={(e) =>
                        handleStartKeyframeDrag(e, layer.id, d.prop, d.index, d.time)
                      }
                      title={
                        d.prop === 'barPercentage'
                          ? `Bar Fill: ${Math.round(d.value)}% @ ${d.time.toFixed(2)}s`
                          : d.prop === 'pathDrawProgress'
                          ? `Path Draw: ${Math.round(d.value)}% @ ${d.time.toFixed(2)}s`
                          : d.prop === 'arrayProgress'
                          ? `Array Spawn: ${Math.round(d.value)}% @ ${d.time.toFixed(2)}s`
                          : d.prop === 'cursorProgress'
                          ? `Cursor Flight: ${Math.round(d.value)}% @ ${d.time.toFixed(2)}s`
                          : d.prop === 'branchGrowth'
                          ? `Branch Lifetime: ${Math.round(d.value)}% @ ${d.time.toFixed(2)}s`
                          : d.prop === 'followerProgress'
                          ? `Follower Path: ${Math.round(d.value)}% @ ${d.time.toFixed(2)}s`
                          : d.prop === 'cardProgress'
                          ? `Card Stack: ${Math.round(d.value)}% @ ${d.time.toFixed(2)}s`
                          : d.prop === 'buttonProgress'
                          ? `Button Motion: ${Math.round(d.value)}% @ ${d.time.toFixed(2)}s`
                          : `${d.prop}: ${Number(d.value).toFixed(1)} @ ${d.time.toFixed(2)}s`
                      }
                      className={`keyframe-diamond absolute top-1/2 cursor-pointer z-30 ${
                        isKfSelected
                          ? 'selected'
                          : 'bg-zinc-200 border border-zinc-950 hover:bg-white'
                      }`}
                      style={{ left: `${leftPct}%` }}
                    />
                  );
                })}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
