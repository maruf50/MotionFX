'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  PenTool,
  Paintbrush,
  Eraser,
  MousePointer2,
  Undo2,
  Redo2,
  Trash2,
  Sparkles,
  ArrowLeft,
  CheckCircle,
  Eye,
  EyeOff,
  Sliders,
  Layers,
  Combine,
  Square,
  Circle as CircleIcon,
  Star as StarIcon,
  Hexagon,
  Minus,
  Copy,
  ArrowUp,
  ArrowDown,
  Plus,
  Zap,
  Shield,
  Heart,
  MessageCircle,
} from 'lucide-react';

export interface Point {
  x: number;
  y: number;
  cp1x?: number; // control point 1
  cp1y?: number;
  cp2x?: number; // control point 2
  cp2y?: number;
}

export interface BuilderLayer {
  id: string;
  name: string;
  visible: boolean;
  type: 'pen' | 'brush' | 'rect' | 'circle' | 'star' | 'polygon' | 'line' | 'compound';
  points: Point[];
  isClosed: boolean;
  fill: string;
  hasFill: boolean;
  stroke: string;
  strokeWidth: number;
  opacity: number;
}

type BuilderTool = 'pen' | 'brush' | 'eraser' | 'select';

// Math Helper: Kappa for perfect cubic Bézier circle approximation
const KAPPA = 0.5522847498307935;

function makeRectPoints(cx: number, cy: number, w: number, h: number, r: number = 0): Point[] {
  const hw = w / 2;
  const hh = h / 2;
  return [
    { x: cx - hw, y: cy - hh },
    { x: cx + hw, y: cy - hh },
    { x: cx + hw, y: cy + hh },
    { x: cx - hw, y: cy + hh },
  ];
}

function makeCirclePoints(cx: number, cy: number, r: number): Point[] {
  const k = r * KAPPA;
  return [
    { x: cx, y: cy - r, cp1x: cx + k, cp1y: cy - r, cp2x: cx + r, cp2y: cy - k },
    { x: cx + r, y: cy, cp1x: cx + r, cp1y: cy + k, cp2x: cx + k, cp2y: cy + r },
    { x: cx, y: cy + r, cp1x: cx - k, cp1y: cy + r, cp2x: cx - r, cp2y: cy + k },
    { x: cx - r, y: cy, cp1x: cx - r, cp1y: cy - k, cp2x: cx - k, cp2y: cy - r },
  ];
}

function makeStarPoints(cx: number, cy: number, points: number = 5, outerR: number = 70, innerR: number = 32): Point[] {
  const pts: Point[] = [];
  const step = Math.PI / points;
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = i * step - Math.PI / 2;
    pts.push({
      x: cx + Math.cos(angle) * r,
      y: cy + Math.sin(angle) * r,
    });
  }
  return pts;
}

function makePolygonPoints(cx: number, cy: number, sides: number = 6, r: number = 65): Point[] {
  const pts: Point[] = [];
  const step = (Math.PI * 2) / sides;
  for (let i = 0; i < sides; i++) {
    const angle = i * step - Math.PI / 2;
    pts.push({
      x: cx + Math.cos(angle) * r,
      y: cy + Math.sin(angle) * r,
    });
  }
  return pts;
}

function pointsToSvgSubpath(points: Point[], isClosed: boolean, offsetX = 0, offsetY = 0): string {
  if (points.length === 0) return '';
  let d = '';
  points.forEach((p, idx) => {
    const x = p.x - offsetX;
    const y = p.y - offsetY;
    if (idx === 0) {
      d += `M ${x.toFixed(1)} ${y.toFixed(1)}`;
    } else if (p.cp1x !== undefined && p.cp1y !== undefined) {
      const cp1x = p.cp1x - offsetX;
      const cp1y = p.cp1y - offsetY;
      const cp2x = (p.cp2x ?? p.x) - offsetX;
      const cp2y = (p.cp2y ?? p.y) - offsetY;
      d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${x.toFixed(1)} ${y.toFixed(1)}`;
    } else {
      d += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
    }
  });
  if (isClosed || points.length > 2) {
    d += ' Z';
  }
  return d;
}

export default function ShapeBuilderPage() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Global Builder Settings
  const [shapeName, setShapeName] = useState('Custom Compound Shape');
  const [tool, setTool] = useState<BuilderTool>('pen');
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [eraserRadius, setEraserRadius] = useState(24);

  // Layer Architecture inside Shape Builder
  const [layers, setLayers] = useState<BuilderLayer[]>([
    {
      id: 'layer_rect',
      name: 'Rounded Box 1',
      visible: true,
      type: 'rect',
      points: makeRectPoints(350, 225, 180, 140),
      isClosed: true,
      fill: '#4f46e5',
      hasFill: true,
      stroke: '#a5b4fc',
      strokeWidth: 3,
      opacity: 0.9,
    },
    {
      id: 'layer_circle',
      name: 'Accent Ring 2',
      visible: true,
      type: 'circle',
      points: makeCirclePoints(460, 225, 75),
      isClosed: true,
      fill: '#db2777',
      hasFill: true,
      stroke: '#ffffff',
      strokeWidth: 3,
      opacity: 0.85,
    },
  ]);

  const [activeLayerId, setActiveLayerId] = useState<string>('layer_circle');
  const [selectedPointIdx, setSelectedPointIdx] = useState<number | null>(null);
  const [selectedHandle, setSelectedHandle] = useState<'cp1' | 'cp2' | null>(null);

  // Undo / Redo History
  const [history, setHistory] = useState<BuilderLayer[][]>([]);
  const [redoStack, setRedoStack] = useState<BuilderLayer[][]>([]);

  // Dragging and Cursor State
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [dragStartPoint, setDragStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isSuccessToast, setIsSuccessToast] = useState(false);

  const activeLayer = layers.find((l) => l.id === activeLayerId) || layers[0] || null;

  const pushHistory = useCallback(() => {
    setHistory((prev) => [...prev.slice(-20), layers]);
    setRedoStack([]);
  }, [layers]);

  const handleUndo = () => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setRedoStack((r) => [layers, ...r]);
    setLayers(prev);
    setHistory((h) => h.slice(0, -1));
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[0];
    setHistory((h) => [...h, layers]);
    setLayers(next);
    setRedoStack((r) => r.slice(1));
  };

  // Add Primitive Shapes to Builder
  const addPrimitive = (
    type: 'rect' | 'circle' | 'star' | 'polygon' | 'line',
    name: string
  ) => {
    pushHistory();
    const cx = 400 + (layers.length % 4) * 20 - 30;
    const cy = 225 + (layers.length % 4) * 20 - 30;

    let pts: Point[] = [];
    if (type === 'rect') pts = makeRectPoints(cx, cy, 170, 130);
    else if (type === 'circle') pts = makeCirclePoints(cx, cy, 75);
    else if (type === 'star') pts = makeStarPoints(cx, cy, 5, 80, 36);
    else if (type === 'polygon') pts = makePolygonPoints(cx, cy, 6, 75);
    else if (type === 'line') pts = [{ x: cx - 80, y: cy }, { x: cx + 80, y: cy }];

    const palette = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#8b5cf6'];
    const chosenColor = palette[layers.length % palette.length];

    const newLayer: BuilderLayer = {
      id: `bl_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: `${name} ${layers.length + 1}`,
      visible: true,
      type,
      points: pts,
      isClosed: type !== 'line',
      fill: chosenColor,
      hasFill: type !== 'line',
      stroke: '#ffffff',
      strokeWidth: 3,
      opacity: 1,
    };

    setLayers((prev) => [newLayer, ...prev]);
    setActiveLayerId(newLayer.id);
  };

  // Add New Freehand/Pen Layer
  const addNewPenLayer = () => {
    pushHistory();
    const newLayer: BuilderLayer = {
      id: `bl_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: `Pen Path ${layers.length + 1}`,
      visible: true,
      type: 'pen',
      points: [],
      isClosed: false,
      fill: '#ec4899',
      hasFill: true,
      stroke: '#ffffff',
      strokeWidth: 3,
      opacity: 1,
    };
    setLayers((prev) => [newLayer, ...prev]);
    setActiveLayerId(newLayer.id);
    setTool('pen');
  };

  // Layer Operations
  const updateActiveLayer = (updates: Partial<BuilderLayer>) => {
    if (!activeLayer) return;
    setLayers((prev) =>
      prev.map((l) => (l.id === activeLayer.id ? { ...l, ...updates } : l))
    );
  };

  const deleteLayer = (id: string) => {
    pushHistory();
    setLayers((prev) => {
      const filtered = prev.filter((l) => l.id !== id);
      if (activeLayerId === id) {
        setActiveLayerId(filtered[0]?.id || '');
      }
      return filtered;
    });
  };

  const duplicateLayer = (id: string) => {
    pushHistory();
    const target = layers.find((l) => l.id === id);
    if (!target) return;
    const cloned: BuilderLayer = {
      ...JSON.parse(JSON.stringify(target)),
      id: `bl_${Date.now()}_copy`,
      name: `${target.name} Copy`,
      points: target.points.map((p) => ({
        ...p,
        x: p.x + 25,
        y: p.y + 25,
        cp1x: p.cp1x !== undefined ? p.cp1x + 25 : undefined,
        cp1y: p.cp1y !== undefined ? p.cp1y + 25 : undefined,
        cp2x: p.cp2x !== undefined ? p.cp2x + 25 : undefined,
        cp2y: p.cp2y !== undefined ? p.cp2y + 25 : undefined,
      })),
    };
    setLayers((prev) => [cloned, ...prev]);
    setActiveLayerId(cloned.id);
  };

  const reorderLayer = (id: string, dir: 'up' | 'down') => {
    pushHistory();
    setLayers((prev) => {
      const idx = prev.findIndex((l) => l.id === id);
      if (idx === -1) return prev;
      const targetIdx = dir === 'up' ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= prev.length) return prev;
      const copy = [...prev];
      const item = copy.splice(idx, 1)[0];
      copy.splice(targetIdx, 0, item);
      return copy;
    });
  };

  const toggleLayerVisible = (id: string) => {
    setLayers((prev) =>
      prev.map((l) => (l.id === id ? { ...l, visible: !l.visible } : l))
    );
  };

  // Merge All Visible Layers Together Into a Single Compound Layer
  const mergeLayersTogether = () => {
    const visibleLayers = layers.filter((l) => l.visible && l.points.length > 0);
    if (visibleLayers.length <= 1) {
      alert('You need at least 2 visible layers with points to merge.');
      return;
    }
    pushHistory();

    const mergedPoints: Point[] = [];
    visibleLayers.forEach((l) => {
      mergedPoints.push(...l.points);
    });

    const primary = visibleLayers[0];
    const compoundLayer: BuilderLayer = {
      id: `bl_compound_${Date.now()}`,
      name: `${shapeName || 'Compound Shape'} (Merged)`,
      visible: true,
      type: 'compound',
      points: mergedPoints,
      isClosed: true,
      fill: primary.fill,
      hasFill: primary.hasFill,
      stroke: primary.stroke,
      strokeWidth: primary.strokeWidth,
      opacity: primary.opacity,
    };

    setLayers([compoundLayer]);
    setActiveLayerId(compoundLayer.id);
  };

  // Calculate Global Bounding Box and SVG Path
  const generateMergedSvgPath = useCallback(
    (centered = true): { path: string; width: number; height: number; fill: string; stroke: string } => {
      const visibleLayers = layers.filter((l) => l.visible && l.points.length > 0);
      if (visibleLayers.length === 0) return { path: '', width: 100, height: 100, fill: '#6366f1', stroke: '#ffffff' };

      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;

      visibleLayers.forEach((layer) => {
        layer.points.forEach((p) => {
          minX = Math.min(minX, p.x, p.cp1x ?? p.x, p.cp2x ?? p.x);
          minY = Math.min(minY, p.y, p.cp1y ?? p.y, p.cp2y ?? p.y);
          maxX = Math.max(maxX, p.x, p.cp1x ?? p.x, p.cp2x ?? p.x);
          maxY = Math.max(maxY, p.y, p.cp1y ?? p.y, p.cp2y ?? p.y);
        });
      });

      const width = Math.max(40, maxX - minX);
      const height = Math.max(40, maxY - minY);
      const centerX = (minX + maxX) / 2;
      const centerY = (minY + maxY) / 2;

      const subpaths = visibleLayers.map((l) =>
        pointsToSvgSubpath(l.points, l.isClosed, centered ? centerX : 0, centered ? centerY : 0)
      );

      const unifiedPath = subpaths.join(' ');
      const mainFill = visibleLayers[0]?.hasFill ? visibleLayers[0]?.fill : 'transparent';
      const mainStroke = visibleLayers[0]?.stroke || '#ffffff';

      return {
        path: unifiedPath,
        width: Math.round(width),
        height: Math.round(height),
        fill: mainFill,
        stroke: mainStroke,
      };
    },
    [layers]
  );

  // Render Canvas Scene
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#090a0f';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Millimeter Grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.035)';
    ctx.lineWidth = 1;
    const step = 20;
    for (let x = 0; x < canvas.width; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Center Crosshair
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.2)';
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();

    // Render Layers from bottom of stack to top (reverse order)
    for (let i = layers.length - 1; i >= 0; i--) {
      const layer = layers[i];
      if (!layer.visible || layer.points.length === 0) continue;

      const subpath = pointsToSvgSubpath(layer.points, layer.isClosed);
      try {
        const p2d = new Path2D(subpath);
        ctx.save();
        ctx.globalAlpha = layer.opacity;

        if (layer.hasFill && layer.fill) {
          ctx.fillStyle = layer.fill;
          ctx.fill(p2d);
        }

        if (layer.strokeWidth > 0 && layer.stroke) {
          ctx.lineWidth = layer.strokeWidth;
          ctx.strokeStyle = layer.stroke;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.stroke(p2d);
        }
        ctx.restore();
      } catch {
        // ignore
      }

      // Draw Anchor points for the ACTIVE layer
      if (layer.id === activeLayerId) {
        layer.points.forEach((p, idx) => {
          const isSelected = selectedPointIdx === idx;

          // Bézier Tangent Lines
          if (p.cp1x !== undefined && p.cp1y !== undefined) {
            ctx.strokeStyle = 'rgba(245, 158, 11, 0.6)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.cp1x, p.cp1y);
            ctx.stroke();

            ctx.fillStyle = '#f59e0b';
            ctx.beginPath();
            ctx.arc(p.cp1x, p.cp1y, 4, 0, Math.PI * 2);
            ctx.fill();
          }

          // Anchor Square
          ctx.fillStyle = isSelected ? '#38bdf8' : '#ffffff';
          ctx.strokeStyle = '#090a0f';
          ctx.lineWidth = 2;
          ctx.fillRect(p.x - 5, p.y - 5, 10, 10);
          ctx.strokeRect(p.x - 5, p.y - 5, 10, 10);
        });
      }
    }

    // Active Pen Line following cursor
    if (tool === 'pen' && activeLayer && activeLayer.points.length > 0) {
      const last = activeLayer.points[activeLayer.points.length - 1];
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.55)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(last.x, last.y);
      ctx.lineTo(cursorPos.x, cursorPos.y);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Eraser Cursor Circle
    if (tool === 'eraser') {
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.8)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cursorPos.x, cursorPos.y, eraserRadius, 0, Math.PI * 2);
      ctx.stroke();
    }
  }, [layers, activeLayerId, selectedPointIdx, tool, activeLayer, cursorPos, eraserRadius]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  // Coordinate Calculations
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let x = (e.clientX - rect.left) * scaleX;
    let y = (e.clientY - rect.top) * scaleY;

    if (snapToGrid) {
      x = Math.round(x / 10) * 10;
      y = Math.round(y / 10) * 10;
    }

    return { x, y };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!activeLayer) return;
    const pt = getCanvasCoords(e);
    setIsMouseDown(true);
    setDragStartPoint(pt);

    if (tool === 'pen') {
      pushHistory();
      // Check if clicking first point to close path
      if (activeLayer.points.length > 2) {
        const first = activeLayer.points[0];
        if (Math.hypot(pt.x - first.x, pt.y - first.y) < 14) {
          updateActiveLayer({ isClosed: true });
          return;
        }
      }
      const updated = [...activeLayer.points, { x: pt.x, y: pt.y }];
      updateActiveLayer({ points: updated });
      setSelectedPointIdx(activeLayer.points.length);
    } else if (tool === 'brush') {
      pushHistory();
      const updated = [...activeLayer.points, { x: pt.x, y: pt.y }];
      updateActiveLayer({ points: updated });
    } else if (tool === 'eraser') {
      pushHistory();
      erasePointsNear(pt.x, pt.y);
    } else if (tool === 'select') {
      let foundIdx: number | null = null;
      let foundHandle: 'cp1' | 'cp2' | null = null;

      activeLayer.points.forEach((p, idx) => {
        if (Math.hypot(pt.x - p.x, pt.y - p.y) < 12) {
          foundIdx = idx;
        } else if (p.cp1x !== undefined && Math.hypot(pt.x - p.cp1x, pt.y - p.cp1y!) < 10) {
          foundIdx = idx;
          foundHandle = 'cp1';
        }
      });

      setSelectedPointIdx(foundIdx);
      setSelectedHandle(foundHandle);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pt = getCanvasCoords(e);
    setCursorPos(pt);

    if (!isMouseDown || !activeLayer) return;

    if (tool === 'pen' && dragStartPoint && selectedPointIdx !== null) {
      // Pulling Bézier tangent curve handles
      const updated = activeLayer.points.map((p, idx) => {
        if (idx !== selectedPointIdx) return p;
        const dx = pt.x - dragStartPoint.x;
        const dy = pt.y - dragStartPoint.y;
        return {
          ...p,
          cp1x: p.x - dx,
          cp1y: p.y - dy,
          cp2x: p.x + dx,
          cp2y: p.y + dy,
        };
      });
      updateActiveLayer({ points: updated });
    } else if (tool === 'brush') {
      const last = activeLayer.points[activeLayer.points.length - 1];
      if (!last || Math.hypot(pt.x - last.x, pt.y - last.y) > 8) {
        updateActiveLayer({ points: [...activeLayer.points, { x: pt.x, y: pt.y }] });
      }
    } else if (tool === 'eraser') {
      erasePointsNear(pt.x, pt.y);
    } else if (tool === 'select' && selectedPointIdx !== null) {
      const updated = activeLayer.points.map((p, idx) => {
        if (idx !== selectedPointIdx) return p;
        if (selectedHandle === 'cp1') {
          return { ...p, cp1x: pt.x, cp1y: pt.y };
        }
        const dx = pt.x - p.x;
        const dy = pt.y - p.y;
        return {
          ...p,
          x: pt.x,
          y: pt.y,
          cp1x: p.cp1x !== undefined ? p.cp1x + dx : undefined,
          cp1y: p.cp1y !== undefined ? p.cp1y + dy : undefined,
        };
      });
      updateActiveLayer({ points: updated });
    }
  };

  const handleMouseUp = () => {
    setIsMouseDown(false);
    setDragStartPoint(null);
  };

  const erasePointsNear = (x: number, y: number) => {
    if (!activeLayer) return;
    const remaining = activeLayer.points.filter(
      (p) => Math.hypot(p.x - x, p.y - y) > eraserRadius
    );
    updateActiveLayer({ points: remaining });
  };

  // Add Final Merged Shape into Main MotionFX Studio Scene
  const handleMergeAndAddToScene = () => {
    const { path, width, height, fill, stroke } = generateMergedSvgPath(true);
    if (!path) {
      alert('No visible shape points to export. Please draw or add a shape first.');
      return;
    }

    const payload = {
      name: shapeName || 'Merged Custom Vector',
      pathData: path,
      width,
      height,
      fill,
      stroke,
    };

    localStorage.setItem('motionfx_import_shape', JSON.stringify(payload));
    setIsSuccessToast(true);

    setTimeout(() => {
      router.push('/');
    }, 400);
  };

  return (
    <div className="h-screen w-screen flex flex-col font-sans bg-[#090a0f] text-slate-100 overflow-hidden select-none">
      {/* Top Header Bar */}
      <header className="h-14 bg-[#11131c] border-b border-[#1e2130] px-4 flex items-center justify-between shrink-0 z-30">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg bg-[#171925] border border-[#2b2f44] transition cursor-pointer"
            title="Return to Motion Studio"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Studio</span>
          </Link>

          <div className="h-5 w-[1px] bg-[#1e2130]"></div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Shape Name:</span>
            <input
              type="text"
              value={shapeName}
              onChange={(e) => setShapeName(e.target.value)}
              className="bg-[#090a0f] border border-[#2b2f44] focus:border-amber-400 rounded px-2.5 py-1 text-xs font-semibold text-amber-300 outline-none w-48"
            />
          </div>
        </div>

        {/* Primitive Shapes Quick Add Row in Top Bar */}
        <div className="hidden lg:flex items-center gap-1.5 bg-[#090a0f] px-2.5 py-1 rounded-lg border border-[#1e2130]">
          <span className="text-[11px] font-semibold uppercase text-slate-400 mr-1 flex items-center gap-1">
            <Plus className="w-3.5 h-3.5 text-amber-400" />
            Primitives:
          </span>

          <button
            onClick={() => addPrimitive('rect', 'Rectangle')}
            className="p-1.5 rounded hover:bg-[#171925] text-indigo-400 border border-transparent hover:border-[#2b2f44] transition cursor-pointer"
            title="Add Rectangle"
          >
            <Square className="w-4 h-4" />
          </button>

          <button
            onClick={() => addPrimitive('circle', 'Circle')}
            className="p-1.5 rounded hover:bg-[#171925] text-pink-400 border border-transparent hover:border-[#2b2f44] transition cursor-pointer"
            title="Add Circle"
          >
            <CircleIcon className="w-4 h-4" />
          </button>

          <button
            onClick={() => addPrimitive('star', 'Star')}
            className="p-1.5 rounded hover:bg-[#171925] text-amber-400 border border-transparent hover:border-[#2b2f44] transition cursor-pointer"
            title="Add Star"
          >
            <StarIcon className="w-4 h-4" />
          </button>

          <button
            onClick={() => addPrimitive('polygon', 'Hexagon')}
            className="p-1.5 rounded hover:bg-[#171925] text-emerald-400 border border-transparent hover:border-[#2b2f44] transition cursor-pointer"
            title="Add Polygon"
          >
            <Hexagon className="w-4 h-4" />
          </button>

          <button
            onClick={() => addPrimitive('line', 'Line')}
            className="p-1.5 rounded hover:bg-[#171925] text-violet-400 border border-transparent hover:border-[#2b2f44] transition cursor-pointer"
            title="Add Straight Line"
          >
            <Minus className="w-4 h-4 rotate-45" />
          </button>
        </div>

        {/* Center Active Styling */}
        {activeLayer && (
          <div className="hidden xl:flex items-center gap-3 bg-[#090a0f] px-3 py-1 rounded-lg border border-[#1e2130]">
            <div className="flex items-center gap-1.5">
              <label className="text-xs text-slate-400">Fill:</label>
              <input
                type="checkbox"
                checked={activeLayer.hasFill}
                onChange={(e) => updateActiveLayer({ hasFill: e.target.checked })}
                className="rounded accent-indigo-500 cursor-pointer"
              />
              {activeLayer.hasFill && (
                <input
                  type="color"
                  value={activeLayer.fill}
                  onChange={(e) => updateActiveLayer({ fill: e.target.value })}
                  className="w-5 h-5 rounded cursor-pointer bg-transparent border-0"
                />
              )}
            </div>

            <div className="h-3 w-[1px] bg-[#1e2130]"></div>

            <div className="flex items-center gap-1.5">
              <label className="text-xs text-slate-400">Stroke:</label>
              <input
                type="color"
                value={activeLayer.stroke}
                onChange={(e) => updateActiveLayer({ stroke: e.target.value })}
                className="w-5 h-5 rounded cursor-pointer bg-transparent border-0"
              />
              <input
                type="number"
                min="0"
                max="24"
                value={activeLayer.strokeWidth}
                onChange={(e) =>
                  updateActiveLayer({ strokeWidth: parseInt(e.target.value, 10) || 0 })
                }
                className="w-11 bg-[#171925] border border-[#2b2f44] rounded px-1 text-xs font-mono text-center"
              />
            </div>

            <div className="h-3 w-[1px] bg-[#1e2130]"></div>

            <label className="text-xs text-slate-400 flex items-center gap-1 cursor-pointer">
              <input
                type="checkbox"
                checked={snapToGrid}
                onChange={(e) => setSnapToGrid(e.target.checked)}
                className="rounded accent-indigo-500 cursor-pointer"
              />
              <span>Snap Grid</span>
            </label>
          </div>
        )}

        {/* Right Actions & Merge Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleUndo}
            disabled={history.length === 0}
            className="p-1.5 rounded bg-[#171925] hover:bg-[#1e2130] disabled:opacity-30 border border-[#2b2f44] text-xs cursor-pointer"
            title="Undo"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleRedo}
            disabled={redoStack.length === 0}
            className="p-1.5 rounded bg-[#171925] hover:bg-[#1e2130] disabled:opacity-30 border border-[#2b2f44] text-xs cursor-pointer"
            title="Redo"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleMergeAndAddToScene}
            className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 via-orange-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition cursor-pointer"
            title="Merge all layers together and add as a single unified custom shape to your motion scene"
          >
            <Combine className="w-3.5 h-3.5" />
            <span>Merge & Add to Scene</span>
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Left Toolbar (Illustrator Style) */}
        <aside className="w-16 bg-[#11131c] border-r border-[#1e2130] flex flex-col items-center py-3 gap-2 shrink-0 z-20">
          <button
            onClick={() => setTool('pen')}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition cursor-pointer ${
              tool === 'pen'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:bg-[#171925] hover:text-white'
            }`}
            title="Pen Tool (P) — Click to place anchors, drag for Bézier curves"
          >
            <PenTool className="w-4 h-4" />
          </button>

          <button
            onClick={() => setTool('brush')}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition cursor-pointer ${
              tool === 'brush'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:bg-[#171925] hover:text-white'
            }`}
            title="Freehand Pencil / Brush Tool (B)"
          >
            <Paintbrush className="w-4 h-4" />
          </button>

          <button
            onClick={() => setTool('eraser')}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition cursor-pointer ${
              tool === 'eraser'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:bg-[#171925] hover:text-white'
            }`}
            title="Eraser Tool (E) — Drag to remove points"
          >
            <Eraser className="w-4 h-4" />
          </button>

          <button
            onClick={() => setTool('select')}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition cursor-pointer ${
              tool === 'select'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:bg-[#171925] hover:text-white'
            }`}
            title="Direct Node Selection Tool (A) — Move vertices & handles"
          >
            <MousePointer2 className="w-4 h-4" />
          </button>

          <div className="w-8 h-[1px] bg-[#1e2130] my-1"></div>

          {/* Quick Shape Presets */}
          <button
            onClick={() => addPrimitive('rect', 'Rectangle')}
            className="w-10 h-10 rounded-xl text-indigo-400 hover:bg-[#171925] flex items-center justify-center transition cursor-pointer"
            title="Add Rectangle Primitive"
          >
            <Square className="w-4 h-4" />
          </button>

          <button
            onClick={() => addPrimitive('circle', 'Circle')}
            className="w-10 h-10 rounded-xl text-pink-400 hover:bg-[#171925] flex items-center justify-center transition cursor-pointer"
            title="Add Circle Primitive"
          >
            <CircleIcon className="w-4 h-4" />
          </button>

          <button
            onClick={() => addPrimitive('star', 'Star')}
            className="w-10 h-10 rounded-xl text-amber-400 hover:bg-[#171925] flex items-center justify-center transition cursor-pointer"
            title="Add Star Primitive"
          >
            <StarIcon className="w-4 h-4" />
          </button>

          <button
            onClick={() => addPrimitive('polygon', 'Polygon')}
            className="w-10 h-10 rounded-xl text-emerald-400 hover:bg-[#171925] flex items-center justify-center transition cursor-pointer"
            title="Add Polygon Primitive"
          >
            <Hexagon className="w-4 h-4" />
          </button>

          <button
            onClick={addNewPenLayer}
            className="w-10 h-10 rounded-xl text-sky-400 hover:bg-[#171925] flex items-center justify-center transition cursor-pointer"
            title="Add New Empty Pen Layer"
          >
            <Plus className="w-4 h-4" />
          </button>
        </aside>

        {/* Center Drawing Canvas */}
        <main className="flex-1 bg-[#090a0f] flex flex-col items-center justify-center p-4 relative overflow-hidden">
          {/* Top Status Banner */}
          <div className="absolute top-3 left-4 right-4 flex items-center justify-between pointer-events-none z-10">
            <div className="bg-[#11131c]/90 backdrop-blur border border-[#1e2130] px-3 py-1.5 rounded-lg text-xs text-slate-300 pointer-events-auto shadow-lg flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              <span>
                {tool === 'pen' &&
                  'Pen: Click to add vertices • Drag for Bézier curve • Click start vertex to close path'}
                {tool === 'brush' && 'Freehand Brush: Drag smoothly on canvas'}
                {tool === 'eraser' && 'Eraser Tool: Click or drag over vertices to erase them'}
                {tool === 'select' && 'Direct Selection: Click anchor point or control handle to reposition'}
              </span>
            </div>

            <div className="bg-[#11131c]/90 backdrop-blur border border-[#1e2130] px-2.5 py-1 rounded-lg text-xs font-mono text-indigo-300 pointer-events-auto">
              Active Layer: {activeLayer?.name || 'None'}
            </div>
          </div>

          {/* Canvas Viewport */}
          <div className="relative shadow-2xl shadow-black/80 rounded-xl overflow-hidden border border-[#2b2f44]">
            <canvas
              ref={canvasRef}
              width={800}
              height={450}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              className="block cursor-crosshair"
            />
          </div>

          {/* Success Overlay Toast */}
          {isSuccessToast && (
            <div className="absolute inset-0 bg-[#090a0f]/80 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in">
              <div className="bg-[#11131c] border border-emerald-500/40 p-6 rounded-2xl shadow-2xl flex flex-col items-center text-center">
                <CheckCircle className="w-12 h-12 text-emerald-400 mb-2 animate-bounce" />
                <h4 className="text-base font-bold text-white">Shapes Merged Successfully!</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Importing compound vector into MotionFX scene layers...
                </p>
              </div>
            </div>
          )}
        </main>

        {/* Right Sidebar: Shape Layers Stack & Path Inspector */}
        <aside className="w-80 bg-[#11131c] border-l border-[#1e2130] flex flex-col shrink-0 overflow-hidden z-20">
          {/* Layers Header */}
          <div className="px-3.5 py-2.5 bg-[#090a0f]/60 border-b border-[#1e2130] flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Shape Layers ({layers.length})
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={mergeLayersTogether}
                className="text-[11px] px-2 py-0.5 rounded bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 flex items-center gap-1 transition cursor-pointer"
                title="Merge visible layers into a unified compound layer"
              >
                <Combine className="w-3 h-3" />
                <span>Merge</span>
              </button>
            </div>
          </div>

          {/* Layers List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {layers.map((layer) => {
              const isSelected = layer.id === activeLayerId;

              return (
                <div
                  key={layer.id}
                  onClick={() => setActiveLayerId(layer.id)}
                  className={`group flex items-center justify-between px-2.5 py-2 rounded-lg cursor-pointer border transition ${
                    isSelected
                      ? 'bg-indigo-600/20 border-indigo-500/60 text-white shadow-sm shadow-indigo-500/10'
                      : 'bg-[#171925]/70 border-transparent hover:bg-[#1e2130] text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-3 h-3 rounded-full shrink-0 border border-white/20"
                      style={{ backgroundColor: layer.fill || layer.stroke }}
                    />
                    <span className="text-xs font-medium truncate">{layer.name}</span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        reorderLayer(layer.id, 'up');
                      }}
                      className="p-1 text-slate-400 hover:text-white"
                      title="Move Up"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        reorderLayer(layer.id, 'down');
                      }}
                      className="p-1 text-slate-400 hover:text-white"
                      title="Move Down"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        duplicateLayer(layer.id);
                      }}
                      className="p-1 text-slate-400 hover:text-white"
                      title="Duplicate"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteLayer(layer.id);
                      }}
                      className="p-1 text-slate-400 hover:text-red-400"
                      title="Delete"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLayerVisible(layer.id);
                      }}
                      className="p-1 text-slate-400 hover:text-white"
                      title={layer.visible ? 'Hide' : 'Show'}
                    >
                      {layer.visible ? (
                        <Eye className="w-3 h-3" />
                      ) : (
                        <EyeOff className="w-3 h-3 text-slate-600" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Layer Inspector */}
          {activeLayer && (
            <div className="p-3 bg-[#171925] border-t border-[#1e2130] space-y-3 shrink-0">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase text-slate-400">
                  Active Layer Properties
                </span>
                <span className="text-[10px] font-mono text-indigo-300">
                  {activeLayer.points.length} pts
                </span>
              </div>

              {/* Layer Name */}
              <div>
                <input
                  type="text"
                  value={activeLayer.name}
                  onChange={(e) => updateActiveLayer({ name: e.target.value })}
                  className="w-full bg-[#090a0f] border border-[#2b2f44] focus:border-indigo-500 rounded px-2 py-1 text-xs text-white outline-none"
                />
              </div>

              {/* Path Closed Toggle & Opacity */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => updateActiveLayer({ isClosed: !activeLayer.isClosed })}
                  className="py-1 rounded bg-[#090a0f] hover:bg-[#1e2130] border border-[#2b2f44] text-slate-200 transition"
                >
                  {activeLayer.isClosed ? 'Close Path (Z)' : 'Open Path'}
                </button>

                <div className="flex items-center gap-1.5 bg-[#090a0f] border border-[#2b2f44] rounded px-2 py-1">
                  <span className="text-[10px] text-slate-400">Alpha:</span>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.05"
                    value={activeLayer.opacity}
                    onChange={(e) =>
                      updateActiveLayer({ opacity: parseFloat(e.target.value) })
                    }
                    className="w-full accent-indigo-500"
                  />
                </div>
              </div>

              {/* Eraser Radius (when tool === 'eraser') */}
              {tool === 'eraser' && (
                <div className="pt-1">
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span>Eraser Radius</span>
                    <span className="font-mono text-red-400">{eraserRadius}px</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="60"
                    value={eraserRadius}
                    onChange={(e) => setEraserRadius(parseInt(e.target.value, 10))}
                    className="w-full accent-red-500 cursor-pointer"
                  />
                </div>
              )}
            </div>
          )}

          {/* Merge & Add to Scene Action Footer */}
          <div className="p-3 bg-[#11131c] border-t border-[#1e2130]">
            <button
              onClick={handleMergeAndAddToScene}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition cursor-pointer"
            >
              <Combine className="w-4 h-4" />
              <span>Merge & Add to Scene</span>
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
