'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Maximize2 } from 'lucide-react';
import { useMotion } from '@/context/MotionContext';
import { getLayerWorldTransformAtTime } from '@/modules/keyframes/evaluator';
import { getLayerDimensions } from '@/modules/renderers/engine';
import { getAspectRatioString } from '@/components/ResolutionModal';

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
    importTemplateLayer,
    canvasResolution,
    setIsResolutionModalOpen,
  } = useMotion();

  const isDraggingRef = useRef<boolean>(false);
  const dragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDropTarget, setIsDropTarget] = useState<boolean>(false);

  const getCanvasCoords = useCallback(
    (clientX: number, clientY: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY,
      };
    },
    [canvasRef]
  );

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pt = getCanvasCoords(e.clientX, e.clientY);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Hit test layers from foreground to background using world transform
    for (let i = 0; i < layers.length; i++) {
      const layer = layers[i];
      if (!layer.visible) continue;

      const tr = getLayerWorldTransformAtTime(layer, layers, currentTime);
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

      const pt = getCanvasCoords(e.clientX, e.clientY);
      const targetLayer = layers.find((l) => l.id === selectedLayerId);
      if (!targetLayer) return;

      const targetWorldX = pt.x - dragOffsetRef.current.x;
      const targetWorldY = pt.y - dragOffsetRef.current.y;

      let localX = Math.round(targetWorldX);
      let localY = Math.round(targetWorldY);

      // If parented, convert world position into local coordinates relative to parent
      if (targetLayer.parentId) {
        const parent = layers.find((l) => l.id === targetLayer.parentId);
        if (parent) {
          const parentWorldTr = getLayerWorldTransformAtTime(parent, layers, currentTime);
          const dx = targetWorldX - parentWorldTr.x;
          const dy = targetWorldY - parentWorldTr.y;
          const rad = (-parentWorldTr.rotation * Math.PI) / 180;
          const cos = Math.cos(rad);
          const sin = Math.sin(rad);

          localX = Math.round((dx * cos - dy * sin) / Math.max(0.001, parentWorldTr.scaleX));
          localY = Math.round((dx * sin + dy * cos) / Math.max(0.001, parentWorldTr.scaleY));
        }
      }

      setAnimPropValue(selectedLayerId, 'x', localX, true);
      setAnimPropValue(selectedLayerId, 'y', localY, true);
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
  }, [selectedLayerId, setAnimPropValue, canvasRef, layers, currentTime, getCanvasCoords]);

  // Handle Drag & Drop from Template Library onto Canvas
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setIsDropTarget(true);
  };

  const handleDragLeave = () => {
    setIsDropTarget(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDropTarget(false);
    const templateData =
      e.dataTransfer.getData('motionfx-template-layer') ||
      e.dataTransfer.getData('application/json');

    if (templateData) {
      try {
        const parsed = JSON.parse(templateData);
        if (parsed) {
          const pt = getCanvasCoords(e.clientX, e.clientY);
          importTemplateLayer(parsed, currentTime, {
            x: Math.round(pt.x),
            y: Math.round(pt.y),
          });
        }
      } catch (err) {
        console.error('Failed to parse dropped template layer onto canvas:', err);
      }
    }
  };

  return (
    <main
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex-1 bg-[#090a0f] flex flex-col items-center justify-center relative overflow-hidden p-4 select-none ${
        isDropTarget ? 'ring-4 ring-indigo-500/30' : ''
      }`}
    >
      {/* Floating Status & Helper Bar */}
      <div className="absolute top-3 left-4 right-4 flex items-center justify-between pointer-events-none z-10">
        <div className="bg-[#11131c]/90 backdrop-blur border border-[#1e2130] px-3 py-1.5 rounded-lg text-xs text-slate-300 flex items-center gap-2 pointer-events-auto shadow-lg">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>
            {isDropTarget
              ? 'Release to drop template element here onto canvas'
              : selectedLayerId
              ? 'Drag element to reposition • Parented elements follow their parent'
              : 'Click any element to select, transform, or keyframe • Drag template layers here'}
          </span>
        </div>

        <button
          onClick={() => setIsResolutionModalOpen(true)}
          className="bg-[#11131c]/90 backdrop-blur border border-[#1e2130] hover:border-indigo-500/40 px-2.5 py-1 rounded-lg text-xs font-mono text-indigo-300 hover:text-indigo-200 pointer-events-auto shadow-lg transition flex items-center gap-1.5 cursor-pointer"
          title="Click to change canvas resolution & aspect ratio"
        >
          <Maximize2 className="w-3 h-3 text-indigo-400" />
          <span>
            {canvasResolution.width} × {canvasResolution.height}
          </span>
          <span className="text-[10px] text-slate-400">
            ({getAspectRatioString(canvasResolution.width, canvasResolution.height)})
          </span>
        </button>
      </div>

      {/* Stage Canvas Frame */}
      <div
        className="relative shadow-2xl shadow-black/80 rounded-xl overflow-hidden border border-[#2b2f44] canvas-checkerboard flex items-center justify-center max-w-full max-h-[50vh]"
        style={{
          aspectRatio: `${canvasResolution.width} / ${canvasResolution.height}`,
        }}
      >
        <canvas
          ref={canvasRef}
          width={canvasResolution.width}
          height={canvasResolution.height}
          onMouseDown={handleMouseDown}
          className="block max-w-full max-h-[50vh] w-auto h-auto cursor-crosshair"
          style={{
            aspectRatio: `${canvasResolution.width} / ${canvasResolution.height}`,
          }}
        />
      </div>
    </main>
  );
}
