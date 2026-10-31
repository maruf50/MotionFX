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
  const [marqueeBox, setMarqueeBox] = useState<MarqueeBox | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

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

  // Box Selection (Marquee Drag) or Clicking in Empty Track Space
  const handleContainerMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      // If clicking inside a diamond or track title, ignore
      if ((e.target as HTMLElement).closest('.keyframe-diamond')) return;
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
                <span className="text-xs truncate font-medium max-w-[145px]">{layer.name}</span>
                <span className="text-[10px] font-mono text-zinc-500 uppercase">
                  {layer.type === 'text' ? 'text' : layer.type === 'shape' ? layer.shapeType || 'shape' : 'image'}
                </span>
              </div>

              {/* Right Lanes & Diamonds */}
              <div
                className={`flex-1 relative transition cursor-crosshair ${
                  isSel ? 'bg-purple-950/15' : 'hover:bg-[#18181c]/60'
                }`}
              >
                {/* Horizontal Center Guide Line */}
                <div className="absolute inset-y-0 left-0 right-0 flex items-center pointer-events-none">
                  <div className="w-full h-[1px] bg-[#242428]"></div>
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
                      title={`${d.prop}: ${Number(d.value).toFixed(1)} @ ${d.time.toFixed(2)}s`}
                      className={`keyframe-diamond absolute top-1/2 cursor-pointer ${
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
