'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import {
  Maximize2,
  PenTool,
  Check,
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  Sparkles,
  Move,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  Sliders,
  Type,
  Edit3,
} from 'lucide-react';
import { useMotion } from '@/context/MotionContext';
import {
  getLayerWorldTransformAtTime,
  getLayerTransformAtTime,
} from '@/modules/keyframes/evaluator';
import { getLayerDimensions } from '@/modules/renderers/engine';
import { getBranchEndpoints } from '@/modules/renderers/branching';
import { getAspectRatioString } from '@/components/ResolutionModal';
import { GoogleFontPicker } from '@/components/common/GoogleFontPicker';
import { preloadPopularFonts } from '@/modules/fonts/googleFonts';

type ScaleHandleType = 'tl' | 'tr' | 'br' | 'bl' | 't' | 'r' | 'b' | 'l';

export function CanvasStage() {
  const {
    canvasRef,
    layers,
    selectedLayerId,
    selectedLayer,
    selectLayer,
    updateLayer,
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
  const draggingPointRef = useRef<{
    layerId: string;
    pointIdx: number;
    handle: 'anchor' | 'cp1' | 'cp2' | 'branchEndpoint';
  } | null>(null);

  // Interactive On-Canvas Scale & Rotate Transform Refs
  const transformDragModeRef = useRef<'move' | 'rotate' | 'scale' | null>(null);
  const scaleHandleRef = useRef<ScaleHandleType | null>(null);
  const initialTransformRef = useRef<{
    rotation: number;
    scaleX: number;
    scaleY: number;
    angle: number;
    pt: { x: number; y: number };
    dims: { width: number; height: number };
  }>({
    rotation: 0,
    scaleX: 1,
    scaleY: 1,
    angle: 0,
    pt: { x: 0, y: 0 },
    dims: { width: 100, height: 100 },
  });

  const [isDropTarget, setIsDropTarget] = useState<boolean>(false);
  const [canvasCursor, setCanvasCursor] = useState<string>('crosshair');

  // On-Canvas Inline Text Editing State
  const [editingTextLayerId, setEditingTextLayerId] = useState<string | null>(null);
  const [editingTextValue, setEditingTextValue] = useState<string>('');
  const inlineTextareaRef = useRef<HTMLInputElement | null>(null);

  // Preload top Google Fonts on mount
  useEffect(() => {
    preloadPopularFonts();
  }, []);

  const commitInlineText = useCallback(() => {
    if (editingTextLayerId) {
      recordSnapshot();
      updateLayer(editingTextLayerId, { text: editingTextValue });
      setEditingTextLayerId(null);
    }
  }, [editingTextLayerId, editingTextValue, recordSnapshot, updateLayer]);

  // Focus and select text when entering inline editing mode
  useEffect(() => {
    if (editingTextLayerId && inlineTextareaRef.current) {
      inlineTextareaRef.current.focus();
      inlineTextareaRef.current.select();
    }
  }, [editingTextLayerId]);

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

    // 1. If currently selected layer is a pathFollower, check if clicked an anchor or handle
    if (selectedLayer && selectedLayer.shapeType === 'pathFollower' && selectedLayer.pathPoints) {
      const tr = getLayerWorldTransformAtTime(selectedLayer, layers, currentTime);
      const rad = (tr.rotation * Math.PI) / 180;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);

      const toWorld = (lx: number, ly: number) => {
        const sx = lx * tr.scaleX;
        const sy = ly * tr.scaleY;
        return {
          x: tr.x + (sx * cos - sy * sin),
          y: tr.y + (sx * sin + sy * cos),
        };
      };

      for (let i = 0; i < selectedLayer.pathPoints.length; i++) {
        const p = selectedLayer.pathPoints[i];
        const wp = toWorld(p.x, p.y);
        if (Math.hypot(pt.x - wp.x, pt.y - wp.y) <= 12) {
          draggingPointRef.current = { layerId: selectedLayer.id, pointIdx: i, handle: 'anchor' };
          recordSnapshot();
          return;
        }
        if (p.cp1x !== undefined && p.cp1y !== undefined) {
          const wcp1 = toWorld(p.cp1x, p.cp1y);
          if (Math.hypot(pt.x - wcp1.x, pt.y - wcp1.y) <= 10) {
            draggingPointRef.current = { layerId: selectedLayer.id, pointIdx: i, handle: 'cp1' };
            recordSnapshot();
            return;
          }
        }
        if (p.cp2x !== undefined && p.cp2y !== undefined) {
          const wcp2 = toWorld(p.cp2x, p.cp2y);
          if (Math.hypot(pt.x - wcp2.x, pt.y - wcp2.y) <= 10) {
            draggingPointRef.current = { layerId: selectedLayer.id, pointIdx: i, handle: 'cp2' };
            recordSnapshot();
            return;
          }
        }
      }

      // If Pen Tool Mode is active, clicking canvas appends a new anchor point
      if (selectedLayer.isPenEditing) {
        const invRad = (-tr.rotation * Math.PI) / 180;
        const dx = pt.x - tr.x;
        const dy = pt.y - tr.y;
        const localX = Math.round(
          (dx * Math.cos(invRad) - dy * Math.sin(invRad)) / Math.max(0.001, tr.scaleX)
        );
        const localY = Math.round(
          (dx * Math.sin(invRad) + dy * Math.cos(invRad)) / Math.max(0.001, tr.scaleY)
        );

        const last = selectedLayer.pathPoints[selectedLayer.pathPoints.length - 1];
        const newPt = {
          x: localX,
          y: localY,
          cp1x: last ? Math.round(last.x + (localX - last.x) * 0.4) : undefined,
          cp1y: last ? Math.round(last.y + (localY - last.y) * 0.4) : undefined,
          cp2x: last ? Math.round(last.x + (localX - last.x) * 0.7) : undefined,
          cp2y: last ? Math.round(last.y + (localY - last.y) * 0.7) : undefined,
        };
        recordSnapshot();
        updateLayer(selectedLayer.id, {
          pathPoints: [...selectedLayer.pathPoints, newPt],
        });
        return;
      }
    }

    // 2. If currently selected layer is branching, check if clicked an endpoint handle
    if (selectedLayer && selectedLayer.shapeType === 'branching') {
      const tr = getLayerWorldTransformAtTime(selectedLayer, layers, currentTime);
      const rad = (tr.rotation * Math.PI) / 180;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);

      const toWorld = (lx: number, ly: number) => {
        const sx = lx * tr.scaleX;
        const sy = ly * tr.scaleY;
        return {
          x: tr.x + (sx * cos - sy * sin),
          y: tr.y + (sx * sin + sy * cos),
        };
      };

      const endpoints = getBranchEndpoints(selectedLayer);
      for (let i = 0; i < endpoints.length; i++) {
        const ep = endpoints[i];
        const wp = toWorld(ep.x, ep.y);
        if (Math.hypot(pt.x - wp.x, pt.y - wp.y) <= 14) {
          draggingPointRef.current = {
            layerId: selectedLayer.id,
            pointIdx: i,
            handle: 'branchEndpoint',
          };
          recordSnapshot();
          return;
        }
      }
    }

    // 3. Interactive Transform Gizmo: Check if clicked Rotation Handle or 8 Scale Handles on Selected Layer
    if (selectedLayer && !selectedLayer.isPenEditing) {
      const tr = getLayerWorldTransformAtTime(selectedLayer, layers, currentTime);
      const dims = getLayerDimensions(ctx, selectedLayer);
      const pad = 8;
      const hw = (dims.width * Math.abs(tr.scaleX)) / 2 + pad;
      const hh = (dims.height * Math.abs(tr.scaleY)) / 2 + pad;

      const dx = pt.x - tr.x;
      const dy = pt.y - tr.y;
      const rad = (-tr.rotation * Math.PI) / 180;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);
      const unrotX = dx * cos - dy * sin;
      const unrotY = dx * sin + dy * cos;

      // A) Check Rotation Handle Knob at (0, -hh - 26)
      const rotStemLength = 26;
      const rotY = -hh - rotStemLength;
      if (Math.hypot(unrotX, unrotY - rotY) <= 16) {
        transformDragModeRef.current = 'rotate';
        initialTransformRef.current = {
          rotation: tr.rotation,
          scaleX: tr.scaleX,
          scaleY: tr.scaleY,
          angle: Math.atan2(pt.y - tr.y, pt.x - tr.x) * (180 / Math.PI),
          pt,
          dims,
        };
        recordSnapshot();
        return;
      }

      // B) Check 8 Scale Handles (4 Corners + 4 Edge Midpoints)
      const scaleHandles: Array<{ key: ScaleHandleType; x: number; y: number }> = [
        { key: 'tl', x: -hw, y: -hh },
        { key: 'tr', x: hw, y: -hh },
        { key: 'br', x: hw, y: hh },
        { key: 'bl', x: -hw, y: hh },
        { key: 't', x: 0, y: -hh },
        { key: 'r', x: hw, y: 0 },
        { key: 'b', x: 0, y: hh },
        { key: 'l', x: -hw, y: 0 },
      ];

      for (const sh of scaleHandles) {
        if (Math.hypot(unrotX - sh.x, unrotY - sh.y) <= 13) {
          transformDragModeRef.current = 'scale';
          scaleHandleRef.current = sh.key;
          initialTransformRef.current = {
            rotation: tr.rotation,
            scaleX: tr.scaleX,
            scaleY: tr.scaleY,
            angle: 0,
            pt,
            dims,
          };
          recordSnapshot();
          return;
        }
      }
    }

    // 4. Hit test layers from foreground to background using world transform
    for (let i = 0; i < layers.length; i++) {
      const layer = layers[i];
      if (!layer.visible) continue;

      const tr = getLayerWorldTransformAtTime(layer, layers, currentTime);
      const dims = getLayerDimensions(ctx, layer);
      const hw = (dims.width * Math.abs(tr.scaleX)) / 2 + 12;
      const hh = (dims.height * Math.abs(tr.scaleY)) / 2 + 12;

      if (pt.x >= tr.x - hw && pt.x <= tr.x + hw && pt.y >= tr.y - hh && pt.y <= tr.y + hh) {
        if (layer.type === 'text' && selectedLayerId === layer.id) {
          // Clicking an already selected text layer starts inline editing!
          setEditingTextLayerId(layer.id);
          setEditingTextValue(layer.text || '');
          return;
        }
        if (editingTextLayerId && editingTextLayerId !== layer.id) {
          commitInlineText();
        }
        selectLayer(layer.id);
        transformDragModeRef.current = 'move';
        isDraggingRef.current = true;
        dragOffsetRef.current = { x: pt.x - tr.x, y: pt.y - tr.y };
        recordSnapshot();
        return;
      }
    }

    // Clicked empty canvas space
    if (editingTextLayerId) {
      commitInlineText();
    }
    selectLayer(null);
  };

  // Canvas Double Click Handler (instantly enters text edit if double clicked on text)
  const handleDoubleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pt = getCanvasCoords(e.clientX, e.clientY);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    for (let i = 0; i < layers.length; i++) {
      const layer = layers[i];
      if (!layer.visible) continue;

      const tr = getLayerWorldTransformAtTime(layer, layers, currentTime);
      const dims = getLayerDimensions(ctx, layer);
      const hw = (dims.width * Math.abs(tr.scaleX)) / 2 + 12;
      const hh = (dims.height * Math.abs(tr.scaleY)) / 2 + 12;

      if (pt.x >= tr.x - hw && pt.x <= tr.x + hw && pt.y >= tr.y - hh && pt.y <= tr.y + hh) {
        selectLayer(layer.id);
        if (layer.type === 'text') {
          setEditingTextLayerId(layer.id);
          setEditingTextValue(layer.text || '');
        }
        return;
      }
    }
  };

  // Canvas Hover Cursor Update
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (transformDragModeRef.current || isDraggingRef.current) return;
    const pt = getCanvasCoords(e.clientX, e.clientY);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (selectedLayer && !selectedLayer.isPenEditing) {
      const tr = getLayerWorldTransformAtTime(selectedLayer, layers, currentTime);
      const dims = getLayerDimensions(ctx, selectedLayer);
      const pad = 8;
      const hw = (dims.width * Math.abs(tr.scaleX)) / 2 + pad;
      const hh = (dims.height * Math.abs(tr.scaleY)) / 2 + pad;

      const dx = pt.x - tr.x;
      const dy = pt.y - tr.y;
      const rad = (-tr.rotation * Math.PI) / 180;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);
      const unrotX = dx * cos - dy * sin;
      const unrotY = dx * sin + dy * cos;

      // Rotation Handle Knob
      const rotY = -hh - 26;
      if (Math.hypot(unrotX, unrotY - rotY) <= 16) {
        setCanvasCursor('grab');
        return;
      }

      // 8 Scale Handles
      const scaleHandles: Array<{ key: ScaleHandleType; x: number; y: number; cursor: string }> = [
        { key: 'tl', x: -hw, y: -hh, cursor: 'nwse-resize' },
        { key: 'tr', x: hw, y: -hh, cursor: 'nesw-resize' },
        { key: 'br', x: hw, y: hh, cursor: 'nwse-resize' },
        { key: 'bl', x: -hw, y: hh, cursor: 'nesw-resize' },
        { key: 't', x: 0, y: -hh, cursor: 'ns-resize' },
        { key: 'r', x: hw, y: 0, cursor: 'ew-resize' },
        { key: 'b', x: 0, y: hh, cursor: 'ns-resize' },
        { key: 'l', x: -hw, y: 0, cursor: 'ew-resize' },
      ];

      for (const sh of scaleHandles) {
        if (Math.hypot(unrotX - sh.x, unrotY - sh.y) <= 13) {
          setCanvasCursor(sh.cursor);
          return;
        }
      }

      // Inside selected layer
      if (
        Math.abs(unrotX) <= hw &&
        Math.abs(unrotY) <= hh
      ) {
        setCanvasCursor('move');
        return;
      }
    }

    setCanvasCursor('crosshair');
  };

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      const pt = getCanvasCoords(e.clientX, e.clientY);

      // Handle Interactive Rotation Dragging
      if (transformDragModeRef.current === 'rotate' && selectedLayerId) {
        const targetLayer = layers.find((l) => l.id === selectedLayerId);
        if (!targetLayer) return;
        const tr = getLayerWorldTransformAtTime(targetLayer, layers, currentTime);
        const curAngle = Math.atan2(pt.y - tr.y, pt.x - tr.x) * (180 / Math.PI);
        const diff = curAngle - initialTransformRef.current.angle;
        let newRot = initialTransformRef.current.rotation + diff;
        if (e.shiftKey) {
          newRot = Math.round(newRot / 15) * 15;
        }
        setAnimPropValue(selectedLayerId, 'rotation', Math.round(newRot), true);
        return;
      }

      // Handle Interactive Scale Dragging
      if (transformDragModeRef.current === 'scale' && selectedLayerId) {
        const targetLayer = layers.find((l) => l.id === selectedLayerId);
        if (!targetLayer) return;
        const tr = getLayerWorldTransformAtTime(targetLayer, layers, currentTime);
        const dx = pt.x - tr.x;
        const dy = pt.y - tr.y;
        const rad = (-tr.rotation * Math.PI) / 180;
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);
        const unrotX = dx * cos - dy * sin;
        const unrotY = dx * sin + dy * cos;

        const pad = 8;
        const baseW = Math.max(10, initialTransformRef.current.dims.width);
        const baseH = Math.max(10, initialTransformRef.current.dims.height);
        const handle = scaleHandleRef.current;

        let sx = Math.abs(initialTransformRef.current.scaleX);
        let sy = Math.abs(initialTransformRef.current.scaleY);

        if (handle === 'r' || handle === 'l') {
          sx = Math.max(0.05, Math.max(0, Math.abs(unrotX) - pad) / (baseW / 2));
        } else if (handle === 't' || handle === 'b') {
          sy = Math.max(0.05, Math.max(0, Math.abs(unrotY) - pad) / (baseH / 2));
        } else {
          // Corners: uniform proportional scale
          const calcX = Math.max(0, Math.abs(unrotX) - pad) / (baseW / 2);
          const calcY = Math.max(0, Math.abs(unrotY) - pad) / (baseH / 2);
          const uniform = Math.max(0.05, (calcX + calcY) / 2);
          sx = uniform;
          sy = uniform;
        }

        if (initialTransformRef.current.scaleX < 0) sx = -sx;
        if (initialTransformRef.current.scaleY < 0) sy = -sy;

        setAnimPropValue(selectedLayerId, 'scaleX', Math.round(sx * 100) / 100, true);
        setAnimPropValue(selectedLayerId, 'scaleY', Math.round(sy * 100) / 100, true);
        return;
      }

      // Handle dragging an endpoint on a branching layer
      if (draggingPointRef.current?.handle === 'branchEndpoint') {
        const targetLayer = layers.find((l) => l.id === draggingPointRef.current?.layerId);
        if (!targetLayer) return;

        const tr = getLayerWorldTransformAtTime(targetLayer, layers, currentTime);
        const invRad = (-tr.rotation * Math.PI) / 180;
        const dx = pt.x - tr.x;
        const dy = pt.y - tr.y;
        const localX = Math.round(
          (dx * Math.cos(invRad) - dy * Math.sin(invRad)) / Math.max(0.001, tr.scaleX)
        );
        const localY = Math.round(
          (dx * Math.sin(invRad) + dy * Math.cos(invRad)) / Math.max(0.001, tr.scaleY)
        );

        const currentEndpoints = getBranchEndpoints(targetLayer);
        const updated = [...currentEndpoints];
        updated[draggingPointRef.current.pointIdx] = { x: localX, y: localY };

        updateLayer(targetLayer.id, { branchEndpoints: updated }, true);
        return;
      }

      // Handle dragging an anchor point or control handle on a pathFollower
      if (draggingPointRef.current) {
        const targetLayer = layers.find((l) => l.id === draggingPointRef.current?.layerId);
        if (!targetLayer || !targetLayer.pathPoints) return;

        const tr = getLayerWorldTransformAtTime(targetLayer, layers, currentTime);
        const invRad = (-tr.rotation * Math.PI) / 180;
        const dx = pt.x - tr.x;
        const dy = pt.y - tr.y;
        const localX = Math.round(
          (dx * Math.cos(invRad) - dy * Math.sin(invRad)) / Math.max(0.001, tr.scaleX)
        );
        const localY = Math.round(
          (dx * Math.sin(invRad) + dy * Math.cos(invRad)) / Math.max(0.001, tr.scaleY)
        );

        const { pointIdx, handle } = draggingPointRef.current;
        const updated = targetLayer.pathPoints.map((p, idx) => {
          if (idx !== pointIdx) return p;
          if (handle === 'cp1') {
            return { ...p, cp1x: localX, cp1y: localY };
          }
          if (handle === 'cp2') {
            return { ...p, cp2x: localX, cp2y: localY };
          }
          const shiftX = localX - p.x;
          const shiftY = localY - p.y;
          return {
            ...p,
            x: localX,
            y: localY,
            cp1x: p.cp1x !== undefined ? p.cp1x + shiftX : undefined,
            cp1y: p.cp1y !== undefined ? p.cp1y + shiftY : undefined,
            cp2x: p.cp2x !== undefined ? p.cp2x + shiftX : undefined,
            cp2y: p.cp2y !== undefined ? p.cp2y + shiftY : undefined,
          };
        });

        updateLayer(targetLayer.id, { pathPoints: updated }, true);
        return;
      }

      // Handle Layer Position Dragging
      if (
        (transformDragModeRef.current === 'move' || isDraggingRef.current) &&
        selectedLayerId
      ) {
        const canvas = canvasRef.current;
        if (!canvas) return;

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
      }
    };

    const handleGlobalMouseUp = () => {
      draggingPointRef.current = null;
      isDraggingRef.current = false;
      transformDragModeRef.current = null;
      scaleHandleRef.current = null;
    };

    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [
    selectedLayerId,
    setAnimPropValue,
    canvasRef,
    layers,
    currentTime,
    getCanvasCoords,
    updateLayer,
  ]);

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

  // Derive active layer transform values for HUD
  const curTransform = selectedLayer ? getLayerTransformAtTime(selectedLayer, currentTime) : null;
  const selectedLayerWorldTr = selectedLayer
    ? getLayerWorldTransformAtTime(selectedLayer, layers, currentTime)
    : null;
  const currentScalePct = curTransform
    ? Math.round(((Math.abs(curTransform.scaleX) + Math.abs(curTransform.scaleY)) / 2) * 100)
    : 100;
  const currentRotationDeg = curTransform ? Math.round(curTransform.rotation) : 0;

  return (
    <main
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex-1 bg-[#0d0d0f] flex flex-col items-center justify-center relative overflow-hidden p-4 select-none ${
        isDropTarget ? 'ring-4 ring-purple-500/30' : ''
      }`}
    >
      {/* Floating Status & Helper Bar */}
      <div className="absolute top-3 left-4 right-4 flex items-center justify-between pointer-events-none z-10">
        <div className="bg-[#161619]/90 backdrop-blur border border-[#242428] px-3 py-1.5 rounded text-xs text-zinc-300 flex items-center gap-2 pointer-events-auto shadow-xl">
          <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span>
          <span>
            {isDropTarget
              ? 'Release to drop template element here onto canvas'
              : selectedLayer?.type === 'text'
              ? 'Click or Double-Click text to edit directly • Drag handles to scale/rotate'
              : selectedLayerId
              ? 'Drag gizmo handles to Scale • Top knob to Rotate • Body to Reposition'
              : 'Click any element to select, transform, or keyframe • Drag template layers here'}
          </span>
        </div>

        <button
          onClick={() => setIsResolutionModalOpen(true)}
          className="bg-[#161619]/90 backdrop-blur border border-[#242428] hover:border-purple-500/40 px-2.5 py-1 rounded text-xs font-mono text-zinc-300 hover:text-purple-300 pointer-events-auto shadow-xl transition flex items-center gap-1.5 cursor-pointer"
          title="Click to change canvas resolution & framerate"
        >
          <Maximize2 className="w-3 h-3 text-purple-400" />
          <span>
            {canvasResolution.width} × {canvasResolution.height}
          </span>
          <span className="text-[10px] text-zinc-500">
            ({getAspectRatioString(canvasResolution.width, canvasResolution.height)})
          </span>
        </button>
      </div>

      {/* Pen Tool Active Banner */}
      {selectedLayer?.isPenEditing && (
        <div className="absolute top-13 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-950/90 border border-purple-500/80 text-white text-xs shadow-2xl backdrop-blur">
          <PenTool className="w-3.5 h-3.5 text-purple-300" />
          <span>Click canvas to add path points • Drag cyan or pink dots to curve</span>
          <button
            type="button"
            onClick={() => updateLayer(selectedLayer.id, { isPenEditing: false })}
            className="ml-2 px-2.5 py-0.5 rounded-full bg-purple-600 hover:bg-purple-500 text-[10px] font-bold text-white transition cursor-pointer flex items-center gap-1"
          >
            <Check className="w-3 h-3" />
            <span>Done</span>
          </button>
        </div>
      )}

      {/* Stage Canvas Frame */}
      <div
        className="relative shadow-2xl shadow-black rounded-lg overflow-hidden border border-[#242428] canvas-checkerboard flex items-center justify-center max-w-full max-h-[50vh]"
        style={{
          aspectRatio: `${canvasResolution.width} / ${canvasResolution.height}`,
        }}
      >
        <canvas
          ref={canvasRef}
          width={canvasResolution.width}
          height={canvasResolution.height}
          onMouseDown={handleMouseDown}
          onDoubleClick={handleDoubleClick}
          onMouseMove={handleCanvasMouseMove}
          className="block max-w-full max-h-[50vh] w-auto h-auto"
          style={{
            aspectRatio: `${canvasResolution.width} / ${canvasResolution.height}`,
            cursor: canvasCursor,
          }}
        />

        {/* Quick "Edit Text" Badge on Canvas when text layer is selected but not editing */}
        {selectedLayer && selectedLayer.type === 'text' && !editingTextLayerId && selectedLayerWorldTr && (
          <div
            className="absolute z-20 pointer-events-auto -translate-x-1/2"
            style={{
              left: `${(selectedLayerWorldTr.x / canvasResolution.width) * 100}%`,
              top: `${Math.max(4, ((selectedLayerWorldTr.y - ((selectedLayer.fontSize || 48) * 1.25 * Math.abs(selectedLayerWorldTr.scaleY)) / 2 - 36) / canvasResolution.height) * 100)}%`,
            }}
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setEditingTextLayerId(selectedLayer.id);
                setEditingTextValue(selectedLayer.text || '');
              }}
              className="px-2.5 py-1 rounded-full bg-purple-600/90 hover:bg-purple-600 text-white text-[11px] font-semibold shadow-xl border border-purple-400/50 backdrop-blur flex items-center gap-1.5 transition cursor-pointer hover:scale-105 active:scale-95"
              title="Click to edit text directly on canvas"
            >
              <Edit3 className="w-3 h-3" />
              <span>Edit Text</span>
            </button>
          </div>
        )}

        {/* On-Canvas Inline Textarea & Mini Toolbar Overlay */}
        {editingTextLayerId && selectedLayer && selectedLayer.id === editingTextLayerId && selectedLayerWorldTr && (
          <div
            className="absolute z-30 pointer-events-auto flex flex-col items-center"
            style={{
              left: `${(selectedLayerWorldTr.x / canvasResolution.width) * 100}%`,
              top: `${(selectedLayerWorldTr.y / canvasResolution.height) * 100}%`,
              transform: `translate(-50%, -50%) rotate(${selectedLayerWorldTr.rotation}deg)`,
            }}
          >
            {/* Floating Mini Toolbar Above Input */}
            <div
              className="mb-2 bg-[#161619]/95 border border-[#34343e] shadow-2xl rounded-xl px-2.5 py-1.5 flex items-center gap-2 backdrop-blur-md"
              style={{ transform: `rotate(${-selectedLayerWorldTr.rotation}deg)` }}
            >
              <div className="w-32">
                <GoogleFontPicker
                  value={selectedLayer.fontFamily || 'Inter'}
                  onChange={(fontFamily) => updateLayer(selectedLayer.id, { fontFamily })}
                  compact={true}
                />
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() =>
                    updateLayer(selectedLayer.id, {
                      fontSize: Math.max(12, (selectedLayer.fontSize || 48) - 4),
                    })
                  }
                  className="w-5 h-5 rounded bg-[#25252c] hover:bg-[#303038] text-zinc-300 text-xs font-bold flex items-center justify-center cursor-pointer"
                  title="Smaller (-4px)"
                >
                  -
                </button>
                <span className="font-mono text-[11px] text-zinc-300 w-8 text-center">
                  {selectedLayer.fontSize || 48}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    updateLayer(selectedLayer.id, {
                      fontSize: (selectedLayer.fontSize || 48) + 4,
                    })
                  }
                  className="w-5 h-5 rounded bg-[#25252c] hover:bg-[#303038] text-zinc-300 text-xs font-bold flex items-center justify-center cursor-pointer"
                  title="Larger (+4px)"
                >
                  +
                </button>
              </div>

              <input
                type="color"
                value={selectedLayer.fill || '#ffffff'}
                onChange={(e) => updateLayer(selectedLayer.id, { fill: e.target.value })}
                className="w-5 h-5 rounded cursor-pointer bg-transparent border-0 p-0"
                title="Text Color"
              />

              <button
                type="button"
                onClick={commitInlineText}
                className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1 transition cursor-pointer"
                title="Finish Editing (or press Enter)"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Done</span>
              </button>
            </div>

            {/* Inline Input Box */}
            <input
              ref={inlineTextareaRef}
              type="text"
              value={editingTextValue}
              onChange={(e) => setEditingTextValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  commitInlineText();
                } else if (e.key === 'Escape') {
                  e.preventDefault();
                  setEditingTextLayerId(null);
                }
              }}
              className="bg-[#0f0f12]/95 border-2 border-purple-500 rounded-xl px-4 py-2 text-white shadow-2xl outline-none text-center min-w-[200px] max-w-[420px] backdrop-blur-md font-bold"
              style={{
                fontFamily: `"${selectedLayer.fontFamily || 'Inter'}", sans-serif`,
                fontWeight: selectedLayer.fontWeight || 'bold',
                fontStyle: selectedLayer.fontStyle || 'normal',
                color: selectedLayer.fill || '#ffffff',
                fontSize: '18px',
              }}
            />
          </div>
        )}
      </div>

      {/* Interactive Transform HUD: Scale & Rotate Controls for Selected Layer */}
      {selectedLayer && curTransform && (
        <div className="mt-3.5 bg-[#161619]/95 backdrop-blur-md border border-[#2c2c34] shadow-2xl rounded-2xl px-4 py-2 flex flex-wrap items-center justify-center gap-4 text-xs z-20 animate-in fade-in slide-in-from-bottom-2 duration-150">
          {/* Active Layer Tag */}
          <div className="flex items-center gap-1.5 pr-2 border-r border-[#2c2c34]">
            <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
            <span className="font-semibold text-white max-w-[120px] truncate">
              {selectedLayer.name}
            </span>
          </div>

          {/* Direct Text Editor in HUD */}
          {selectedLayer.type === 'text' && (
            <>
              <div className="flex items-center gap-2 pr-2 border-r border-[#2c2c34]">
                <span className="text-[11px] font-semibold uppercase text-zinc-400 flex items-center gap-1">
                  <Type className="w-3 h-3 text-purple-400" />
                  Text
                </span>
                <input
                  type="text"
                  value={selectedLayer.text || ''}
                  onChange={(e) => updateLayer(selectedLayer.id, { text: e.target.value })}
                  placeholder="Text content..."
                  className="bg-[#101012] border border-[#2d2d38] focus:border-purple-500 rounded px-2 py-1 text-xs text-white outline-none w-28 sm:w-40 font-medium"
                />
                <div className="w-32">
                  <GoogleFontPicker
                    value={selectedLayer.fontFamily || 'Inter'}
                    onChange={(fontFamily) => updateLayer(selectedLayer.id, { fontFamily })}
                    compact={true}
                  />
                </div>
              </div>
            </>
          )}

          {/* Scale Section */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold uppercase text-zinc-400 flex items-center gap-1">
              <ZoomIn className="w-3 h-3 text-purple-400" />
              Scale
            </span>

            <button
              type="button"
              onClick={() => {
                const newSx = Math.max(0.1, curTransform.scaleX - 0.1);
                const newSy = Math.max(0.1, curTransform.scaleY - 0.1);
                setAnimPropValue(selectedLayer.id, 'scaleX', Math.round(newSx * 100) / 100);
                setAnimPropValue(selectedLayer.id, 'scaleY', Math.round(newSy * 100) / 100);
              }}
              className="w-6 h-6 rounded bg-[#202026] hover:bg-[#2b2b34] text-zinc-300 font-bold flex items-center justify-center transition cursor-pointer"
              title="Scale Down (-10%)"
            >
              -
            </button>

            <span className="font-mono text-purple-300 font-bold min-w-[42px] text-center">
              {currentScalePct}%
            </span>

            <button
              type="button"
              onClick={() => {
                const newSx = curTransform.scaleX + 0.1;
                const newSy = curTransform.scaleY + 0.1;
                setAnimPropValue(selectedLayer.id, 'scaleX', Math.round(newSx * 100) / 100);
                setAnimPropValue(selectedLayer.id, 'scaleY', Math.round(newSy * 100) / 100);
              }}
              className="w-6 h-6 rounded bg-[#202026] hover:bg-[#2b2b34] text-zinc-300 font-bold flex items-center justify-center transition cursor-pointer"
              title="Scale Up (+10%)"
            >
              +
            </button>

            {/* Quick Scale Presets */}
            <div className="hidden sm:flex items-center gap-1 ml-1">
              {[50, 100, 150, 200].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => {
                    const factor = pct / 100;
                    setAnimPropValue(selectedLayer.id, 'scaleX', factor);
                    setAnimPropValue(selectedLayer.id, 'scaleY', factor);
                  }}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition cursor-pointer ${
                    currentScalePct === pct
                      ? 'bg-purple-600 text-white font-bold'
                      : 'bg-[#202026] text-zinc-400 hover:text-white'
                  }`}
                >
                  {pct}%
                </button>
              ))}
            </div>
          </div>

          <div className="h-5 w-[1px] bg-[#2c2c34] hidden sm:block"></div>

          {/* Rotate Section */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold uppercase text-zinc-400 flex items-center gap-1">
              <RotateCw className="w-3 h-3 text-purple-400" />
              Rotate
            </span>

            <button
              type="button"
              onClick={() => {
                const newRot = Math.round(curTransform.rotation - 90);
                setAnimPropValue(selectedLayer.id, 'rotation', newRot);
              }}
              className="p-1 rounded bg-[#202026] hover:bg-[#2b2b34] text-zinc-300 transition cursor-pointer"
              title="Rotate Left (-90°)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <span className="font-mono text-purple-300 font-bold min-w-[36px] text-center">
              {currentRotationDeg}°
            </span>

            <button
              type="button"
              onClick={() => {
                const newRot = Math.round(curTransform.rotation + 90);
                setAnimPropValue(selectedLayer.id, 'rotation', newRot);
              }}
              className="p-1 rounded bg-[#202026] hover:bg-[#2b2b34] text-zinc-300 transition cursor-pointer"
              title="Rotate Right (+90°)"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>

            {/* Quick Angle Presets */}
            <div className="hidden sm:flex items-center gap-1 ml-1">
              {[0, 45, 90, 180].map((deg) => (
                <button
                  key={deg}
                  type="button"
                  onClick={() => {
                    setAnimPropValue(selectedLayer.id, 'rotation', deg);
                  }}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition cursor-pointer ${
                    currentRotationDeg === deg
                      ? 'bg-purple-600 text-white font-bold'
                      : 'bg-[#202026] text-zinc-400 hover:text-white'
                  }`}
                >
                  {deg}°
                </button>
              ))}
            </div>
          </div>

          <div className="h-5 w-[1px] bg-[#2c2c34] hidden md:block"></div>

          {/* Quick Flip & Reset Section */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                setAnimPropValue(selectedLayer.id, 'scaleX', -curTransform.scaleX);
              }}
              className="p-1.5 rounded bg-[#202026] hover:bg-[#2b2b34] text-zinc-300 transition cursor-pointer"
              title="Flip Horizontally"
            >
              <FlipHorizontal className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => {
                setAnimPropValue(selectedLayer.id, 'scaleY', -curTransform.scaleY);
              }}
              className="p-1.5 rounded bg-[#202026] hover:bg-[#2b2b34] text-zinc-300 transition cursor-pointer"
              title="Flip Vertically"
            >
              <FlipVertical className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => {
                setAnimPropValue(selectedLayer.id, 'scaleX', 1);
                setAnimPropValue(selectedLayer.id, 'scaleY', 1);
                setAnimPropValue(selectedLayer.id, 'rotation', 0);
              }}
              className="px-2 py-1 rounded bg-[#202026] hover:bg-[#2b2b34] text-[10px] font-semibold text-zinc-400 hover:text-white transition cursor-pointer flex items-center gap-1"
              title="Reset Transform (100% Scale & 0° Rotation)"
            >
              <RefreshCw className="w-2.5 h-2.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
