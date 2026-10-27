'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useMotion } from '@/context/MotionContext';
import { getLayerTransformAtTime } from '@/modules/keyframes/evaluator';
import { getLayerDimensions } from '@/modules/renderers/engine';

export function CanvasStage() {
  const {
    canvasRef,
    layers,
    selectedLayerId,
    selectLayer,
    currentTime,
    setAnimPropValue,
    duration,
    recordSnapshot,
  } = useMotion();

  const isDraggingRef = useRef<boolean>(false);
  const dragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const getCanvasCoords = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    },
    [canvasRef]
  );

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pt = getCanvasCoords(e);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Hit test layers from foreground to background
    for (let i = 0; i < layers.length; i++) {
      const layer = layers[i];
      if (!layer.visible) continue;

      const tr = getLayerTransformAtTime(layer, currentTime);
      const dims = getLayerDimensions(ctx, layer);
      const hw = (dims.width * Math.abs(tr.scaleX)) / 2 + 12;
      const hh = (dims.height * Math.abs(tr.scaleY)) / 2 + 12;

      if (pt.x >= tr.x - hw && pt.x <= tr.x + hw && pt.y >= tr.y - hh && pt.y <= tr.y + hh) {
        selectLayer(layer.id);
        isDraggingRef.current = true;
        dragOffsetRef.current = { x: pt.x - tr.x, y: pt.y - tr.y };
        recordSnapshot();
        return;
      }
    }

    // Clicked empty canvas space
    selectLayer(null);
  };

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current || !selectedLayerId) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      const pt = {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };

      const newX = Math.round(pt.x - dragOffsetRef.current.x);
      const newY = Math.round(pt.y - dragOffsetRef.current.y);

      setAnimPropValue(selectedLayerId, 'x', newX, true);
      setAnimPropValue(selectedLayerId, 'y', newY, true);
    };

    const handleGlobalMouseUp = () => {
      isDraggingRef.current = false;
    };

    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [selectedLayerId, setAnimPropValue, canvasRef]);

  return (
    <main className="flex-1 bg-[#090a0f] flex flex-col items-center justify-center relative overflow-hidden p-4 select-none">
      {/* Floating Status & Helper Bar */}
      <div className="absolute top-3 left-4 right-4 flex items-center justify-between pointer-events-none z-10">
        <div className="bg-[#11131c]/90 backdrop-blur border border-[#1e2130] px-3 py-1.5 rounded-lg text-xs text-slate-300 flex items-center gap-2 pointer-events-auto shadow-lg">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>
            {selectedLayerId
              ? 'Drag element to reposition • Changes update keyframe at playhead'
              : 'Click any element to select, transform, or keyframe'}
          </span>
        </div>

        <div className="bg-[#11131c]/90 backdrop-blur border border-[#1e2130] px-2.5 py-1 rounded-lg text-xs font-mono text-indigo-300 pointer-events-auto shadow-lg">
          <span>800 × 450 (16:9)</span>
        </div>
      </div>

      {/* Stage Canvas Frame */}
      <div className="relative shadow-2xl shadow-black/80 rounded-xl overflow-hidden border border-[#2b2f44] canvas-checkerboard flex items-center justify-center max-w-full max-h-[50vh]">
        <canvas
          ref={canvasRef}
          width={800}
          height={450}
          onMouseDown={handleMouseDown}
          className="block max-w-full max-h-[50vh] w-auto h-auto cursor-crosshair"
        />
      </div>
    </main>
  );
}
