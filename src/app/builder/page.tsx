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
  Move,
  RotateCw,
  Maximize2,
  FlipHorizontal,
  FlipVertical,
  Crosshair,
  Heart,
  Zap,
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
  type: 'pen' | 'brush' | 'rect' | 'circle' | 'star' | 'polygon' | 'line' | 'heart' | 'compound';
  points: Point[];
  isClosed: boolean;
  fill: string;
  hasFill: boolean;
  stroke: string;
  strokeWidth: number;
  opacity: number;
  // Transform
  x: number;
  y: number;
  scale: number;
  rotation: number; // degrees
}

type BuilderTool = 'pen' | 'brush' | 'eraser' | 'select';

// Kappa for perfect cubic Bézier circle
const KAPPA = 0.5522847498307935;

function makeCirclePoints(r = 75): Point[] {
  const k = r * KAPPA;
  return [
    { x: 0, y: -r },
    { x: r, y: 0, cp1x: k, cp1y: -r, cp2x: r, cp2y: -k },
    { x: 0, y: r, cp1x: r, cp1y: k, cp2x: k, cp2y: r },
    { x: -r, y: 0, cp1x: -k, cp1y: r, cp2x: -r, cp2y: k },
    { x: 0, y: -r, cp1x: -r, cp1y: -k, cp2x: -k, cp2y: -r },
  ];
}

function makeRectPoints(w = 160, h = 120): Point[] {
  const hw = w / 2;
  const hh = h / 2;
  return [
    { x: -hw, y: -hh },
    { x: hw, y: -hh },
    { x: hw, y: hh },
    { x: -hw, y: hh },
  ];
}

function makeStarPoints(points = 5, outerR = 80, innerR = 36): Point[] {
  const pts: Point[] = [];
  const step = Math.PI / points;
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = i * step - Math.PI / 2;
    pts.push({
      x: Math.cos(angle) * r,
      y: Math.sin(angle) * r,
    });
  }
  return pts;
}

function makePolygonPoints(sides = 6, r = 75): Point[] {
  const pts: Point[] = [];
  const step = (Math.PI * 2) / sides;
  for (let i = 0; i < sides; i++) {
    const angle = i * step - Math.PI / 2;
    pts.push({
      x: Math.cos(angle) * r,
      y: Math.sin(angle) * r,
    });
  }
  return pts;
}

function makeLinePoints(len = 150): Point[] {
  return [{ x: -len / 2, y: 0 }, { x: len / 2, y: 0 }];
}

function makeHeartPoints(size = 70): Point[] {
  return [
    { x: 0, y: size * 0.7 },
    { x: -size, y: -size * 0.2, cp1x: -size * 0.7, cp1y: size * 0.4 },
    { x: -size * 0.4, y: -size * 0.7, cp1x: -size, cp1y: -size * 0.6 },
    { x: 0, y: -size * 0.35, cp1x: -size * 0.1, cp1y: -size * 0.7 },
    { x: size * 0.4, y: -size * 0.7, cp1x: size * 0.1, cp1y: -size * 0.7 },
    { x: size, y: -size * 0.2, cp1x: size, cp1y: -size * 0.6 },
    { x: 0, y: size * 0.7, cp1x: size * 0.7, cp1y: size * 0.4 },
  ];
}

function pointsToSvgSubpath(points: Point[], isClosed: boolean): string {
  if (points.length === 0) return '';
  let d = '';
  points.forEach((p, idx) => {
    if (idx === 0) {
      d += `M ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
    } else if (p.cp1x !== undefined && p.cp1y !== undefined) {
      const cp2x = p.cp2x ?? p.x;
      const cp2y = p.cp2y ?? p.y;
      d += ` C ${p.cp1x.toFixed(1)} ${p.cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
    } else {
      d += ` L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
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

  // Global Settings
  const [shapeName, setShapeName] = useState('Custom Compound Shape');
  const [tool, setTool] = useState<BuilderTool>('select');
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [eraserRadius, setEraserRadius] = useState(25);

  // Layers Stack
  const [layers, setLayers] = useState<BuilderLayer[]>([
    {
      id: 'bl_rect_1',
      name: 'Rounded Box 1',
      visible: true,
      type: 'rect',
      points: makeRectPoints(170, 130),
      isClosed: true,
      fill: '#4f46e5',
      hasFill: true,
      stroke: '#a5b4fc',
      strokeWidth: 3,
      opacity: 0.9,
      x: 340,
      y: 225,
      scale: 1,
      rotation: 0,
    },
    {
      id: 'bl_circle_1',
      name: 'Circle 2',
      visible: true,
      type: 'circle',
      points: makeCirclePoints(75),
      isClosed: true,
      fill: '#db2777',
      hasFill: true,
      stroke: '#ffffff',
      strokeWidth: 3,
      opacity: 0.85,
      x: 470,
      y: 225,
      scale: 1,
      rotation: 0,
    },
  ]);

  const [activeLayerId, setActiveLayerId] = useState<string>('bl_circle_1');
  const [selectedPointIdx, setSelectedPointIdx] = useState<number | null>(null);
  const [selectedHandle, setSelectedHandle] = useState<'cp1' | 'cp2' | null>(null);

  // Undo / Redo
  const [history, setHistory] = useState<BuilderLayer[][]>([]);
  const [redoStack, setRedoStack] = useState<BuilderLayer[][]>([]);

  // Dragging State
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [isDraggingShape, setIsDraggingShape] = useState(false);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
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

  // Add Primitive Shape to Scene
  const addPrimitive = (
    type: 'rect' | 'circle' | 'star' | 'polygon' | 'line' | 'heart',
    name: string
  ) => {
    pushHistory();
    const cx = 400 + (layers.length % 5) * 15 - 30;
    const cy = 225 + (layers.length % 5) * 15 - 30;

    let pts: Point[] = [];
    if (type === 'rect') pts = makeRectPoints(170, 130);
    else if (type === 'circle') pts = makeCirclePoints(75);
    else if (type === 'star') pts = makeStarPoints(5, 80, 36);
    else if (type === 'polygon') pts = makePolygonPoints(6, 75);
    else if (type === 'line') pts = makeLinePoints(160);
    else if (type === 'heart') pts = makeHeartPoints(65);

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
      x: cx,
      y: cy,
      scale: 1,
      rotation: 0,
    };

    setLayers((prev) => [newLayer, ...prev]);
    setActiveLayerId(newLayer.id);
    setSelectedPointIdx(null);
  };

  const addNewPenLayer = () => {
    pushHistory();
    const newLayer: BuilderLayer = {
      id: `bl_pen_${Date.now()}`,
      name: `Pen Path ${layers.length + 1}`,
      visible: true,
      type: 'pen',
      points: [],
      isClosed: false,
      fill: '#6366f1',
      hasFill: true,
      stroke: '#ffffff',
      strokeWidth: 3,
      opacity: 1,
      x: 400,
      y: 225,
      scale: 1,
      rotation: 0,
    };
    setLayers((prev) => [newLayer, ...prev]);
    setActiveLayerId(newLayer.id);
    setTool('pen');
    setSelectedPointIdx(null);
  };

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
      x: target.x + 25,
      y: target.y + 25,
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

  // Merge visible layers into one unified compound shape
  const mergeLayersTogether = () => {
    const visibleLayers = layers.filter((l) => l.visible && l.points.length > 0);
    if (visibleLayers.length <= 1) {
      alert('You need at least 2 visible layers to merge.');
      return;
    }
    pushHistory();

    const mergedPoints: Point[] = [];
    visibleLayers.forEach((l) => {
      const rad = (l.rotation * Math.PI) / 180;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);

      l.points.forEach((p) => {
        const sx = p.x * l.scale;
        const sy = p.y * l.scale;
        const rx = sx * cos - sy * sin + (l.x - 400);
        const ry = sx * sin + sy * cos + (l.y - 225);

        let cp1x: number | undefined;
        let cp1y: number | undefined;
        let cp2x: number | undefined;
        let cp2y: number | undefined;

        if (p.cp1x !== undefined && p.cp1y !== undefined) {
          const s1x = p.cp1x * l.scale;
          const s1y = p.cp1y * l.scale;
          cp1x = s1x * cos - s1y * sin + (l.x - 400);
          cp1y = s1x * sin + s1y * cos + (l.y - 225);
        }
        if (p.cp2x !== undefined && p.cp2y !== undefined) {
          const s2x = p.cp2x * l.scale;
          const s2y = p.cp2y * l.scale;
          cp2x = s2x * cos - s2y * sin + (l.x - 400);
          cp2y = s2x * sin + s2y * cos + (l.y - 225);
        }

        mergedPoints.push({ x: rx, y: ry, cp1x, cp1y, cp2x, cp2y });
      });
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
      x: 400,
      y: 225,
      scale: 1,
      rotation: 0,
    };

    setLayers([compoundLayer]);
    setActiveLayerId(compoundLayer.id);
  };

  // Convert all visible layers into a unified compound SVG path centered at (0, 0)
  const generateUnifiedSvgPath = useCallback((): {
    path: string;
    width: number;
    height: number;
    fill: string;
    stroke: string;
  } => {
    const visibleLayers = layers.filter((l) => l.visible && l.points.length > 0);
    if (visibleLayers.length === 0) {
      return { path: '', width: 100, height: 100, fill: '#6366f1', stroke: '#ffffff' };
    }

    // Step 1: Compute transformed global coordinates for all points
    const transformedLayers = visibleLayers.map((layer) => {
      const rad = (layer.rotation * Math.PI) / 180;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);

      const transformedPts = layer.points.map((p) => {
        const sx = p.x * layer.scale;
        const sy = p.y * layer.scale;
        const gx = sx * cos - sy * sin + layer.x;
        const gy = sx * sin + sy * cos + layer.y;

        let cp1x: number | undefined;
        let cp1y: number | undefined;
        let cp2x: number | undefined;
        let cp2y: number | undefined;

        if (p.cp1x !== undefined && p.cp1y !== undefined) {
          const s1x = p.cp1x * layer.scale;
          const s1y = p.cp1y * layer.scale;
          cp1x = s1x * cos - s1y * sin + layer.x;
          cp1y = s1x * sin + s1y * cos + layer.y;
        }
        if (p.cp2x !== undefined && p.cp2y !== undefined) {
          const s2x = p.cp2x * layer.scale;
          const s2y = p.cp2y * layer.scale;
          cp2x = s2x * cos - s2y * sin + layer.x;
          cp2y = s2x * sin + s2y * cos + layer.y;
        }

        return { x: gx, y: gy, cp1x, cp1y, cp2x, cp2y };
      });

      return {
        ...layer,
        transformedPts,
      };
    });

    // Step 2: Global Bounding Box
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    transformedLayers.forEach((l) => {
      l.transformedPts.forEach((p) => {
        minX = Math.min(minX, p.x, p.cp1x ?? p.x, p.cp2x ?? p.x);
        minY = Math.min(minY, p.y, p.cp1y ?? p.y, p.cp2y ?? p.y);
        maxX = Math.max(maxX, p.x, p.cp1x ?? p.x, p.cp2x ?? p.x);
        maxY = Math.max(maxY, p.y, p.cp1y ?? p.y, p.cp2y ?? p.y);
      });
    });

    const width = Math.max(40, Math.round(maxX - minX));
    const height = Math.max(40, Math.round(maxY - minY));
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    // Step 3: Shift all points to center around (0, 0)
    const subpaths = transformedLayers.map((l) => {
      const centeredPts = l.transformedPts.map((p) => ({
        x: p.x - centerX,
        y: p.y - centerY,
        cp1x: p.cp1x !== undefined ? p.cp1x - centerX : undefined,
        cp1y: p.cp1y !== undefined ? p.cp1y - centerY : undefined,
        cp2x: p.cp2x !== undefined ? p.cp2x - centerX : undefined,
        cp2y: p.cp2y !== undefined ? p.cp2y - centerY : undefined,
      }));
      return pointsToSvgSubpath(centeredPts, l.isClosed);
    });

    const compoundPath = subpaths.filter(Boolean).join(' ');
    const primary = visibleLayers[0];

    return {
      path: compoundPath,
      width,
      height,
      fill: primary.hasFill ? primary.fill : 'transparent',
      stroke: primary.stroke || '#ffffff',
    };
  }, [layers]);

  // Canvas Drawing Routine
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

    // Render Layers from bottom of stack to top
    for (let i = layers.length - 1; i >= 0; i--) {
      const layer = layers[i];
      if (!layer.visible || layer.points.length === 0) continue;

      ctx.save();
      ctx.translate(layer.x, layer.y);
      ctx.rotate((layer.rotation * Math.PI) / 180);
      ctx.scale(layer.scale, layer.scale);
      ctx.globalAlpha = layer.opacity;

      const subpath = pointsToSvgSubpath(layer.points, layer.isClosed);
      try {
        const p2d = new Path2D(subpath);

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
      } catch {
        // ignore
      }

      // Draw anchor squares and handles for the ACTIVE layer
      if (layer.id === activeLayerId) {
        layer.points.forEach((p, idx) => {
          const isSelected = selectedPointIdx === idx;

          if (p.cp1x !== undefined && p.cp1y !== undefined) {
            ctx.strokeStyle = 'rgba(245, 158, 11, 0.7)';
            ctx.lineWidth = 1 / layer.scale;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.cp1x, p.cp1y);
            ctx.stroke();

            ctx.fillStyle = '#f59e0b';
            ctx.beginPath();
            ctx.arc(p.cp1x, p.cp1y, 4 / layer.scale, 0, Math.PI * 2);
            ctx.fill();
          }

          // Anchor Square
          ctx.fillStyle = isSelected ? '#38bdf8' : '#ffffff';
          ctx.strokeStyle = '#090a0f';
          ctx.lineWidth = 1.5 / layer.scale;
          const s = 8 / layer.scale;
          ctx.fillRect(p.x - s / 2, p.y - s / 2, s, s);
          ctx.strokeRect(p.x - s / 2, p.y - s / 2, s, s);
        });

        // Bounding Box outline around active layer
        ctx.strokeStyle = 'rgba(99, 102, 241, 0.4)';
        ctx.lineWidth = 1 / layer.scale;
        ctx.setLineDash([4 / layer.scale, 4 / layer.scale]);
        // center anchor mark
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(0, 0, 3 / layer.scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.setLineDash([]);
      }

      ctx.restore();
    }

    // Pen line preview to cursor
    if (tool === 'pen' && activeLayer && activeLayer.points.length > 0) {
      const last = activeLayer.points[activeLayer.points.length - 1];
      const rad = (activeLayer.rotation * Math.PI) / 180;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);
      const lastGx = (last.x * activeLayer.scale) * cos - (last.y * activeLayer.scale) * sin + activeLayer.x;
      const lastGy = (last.x * activeLayer.scale) * sin + (last.y * activeLayer.scale) * cos + activeLayer.y;

      ctx.strokeStyle = 'rgba(99, 102, 241, 0.6)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(lastGx, lastGy);
      ctx.lineTo(cursorPos.x, cursorPos.y);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Eraser cursor
    if (tool === 'eraser') {
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.85)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cursorPos.x, cursorPos.y, eraserRadius, 0, Math.PI * 2);
      ctx.stroke();
    }
  }, [layers, activeLayerId, selectedPointIdx, tool, activeLayer, cursorPos, eraserRadius]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  // Convert mouse to active layer local coordinates
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { gx: 0, gy: 0, lx: 0, ly: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let gx = (e.clientX - rect.left) * scaleX;
    let gy = (e.clientY - rect.top) * scaleY;

    if (snapToGrid) {
      gx = Math.round(gx / 10) * 10;
      gy = Math.round(gy / 10) * 10;
    }

    // Compute local coords relative to active layer transform
    let lx = gx;
    let ly = gy;
    if (activeLayer) {
      const dx = gx - activeLayer.x;
      const dy = gy - activeLayer.y;
      const rad = (-activeLayer.rotation * Math.PI) / 180;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);
      lx = (dx * cos - dy * sin) / activeLayer.scale;
      ly = (dx * sin + dy * cos) / activeLayer.scale;
    }

    return { gx, gy, lx, ly };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { gx, gy, lx, ly } = getCanvasCoords(e);
    setIsMouseDown(true);

    if (tool === 'select') {
      // Check if clicking near an anchor of active layer
      if (activeLayer) {
        let foundIdx: number | null = null;
        let foundHandle: 'cp1' | 'cp2' | null = null;

        activeLayer.points.forEach((p, idx) => {
          if (Math.hypot(lx - p.x, ly - p.y) < 14 / activeLayer.scale) {
            foundIdx = idx;
          } else if (p.cp1x !== undefined && Math.hypot(lx - p.cp1x, ly - p.cp1y!) < 12 / activeLayer.scale) {
            foundIdx = idx;
            foundHandle = 'cp1';
          }
        });

        if (foundIdx !== null) {
          setSelectedPointIdx(foundIdx);
          setSelectedHandle(foundHandle);
          return;
        }
      }

      // Check if clicking inside or near any layer to select & drag the whole shape
      for (let i = 0; i < layers.length; i++) {
        const l = layers[i];
        if (!l.visible) continue;
        if (Math.hypot(gx - l.x, gy - l.y) < 100 * l.scale) {
          setActiveLayerId(l.id);
          setIsDraggingShape(true);
          setDragOffset({ x: gx - l.x, y: gy - l.y });
          setSelectedPointIdx(null);
          return;
        }
      }

      setSelectedPointIdx(null);
    } else if (tool === 'pen' && activeLayer) {
      pushHistory();
      // Check if clicking on first point to close path
      if (activeLayer.points.length > 2) {
        const first = activeLayer.points[0];
        if (Math.hypot(lx - first.x, ly - first.y) < 15 / activeLayer.scale) {
          updateActiveLayer({ isClosed: true });
          return;
        }
      }
      updateActiveLayer({ points: [...activeLayer.points, { x: lx, y: ly }] });
      setSelectedPointIdx(activeLayer.points.length);
    } else if (tool === 'brush' && activeLayer) {
      pushHistory();
      updateActiveLayer({ points: [...activeLayer.points, { x: lx, y: ly }] });
    } else if (tool === 'eraser') {
      pushHistory();
      erasePointsNear(gx, gy);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { gx, gy, lx, ly } = getCanvasCoords(e);
    setCursorPos({ x: gx, y: gy });

    if (!isMouseDown) return;

    if (isDraggingShape && activeLayer) {
      updateActiveLayer({
        x: Math.round(gx - dragOffset.x),
        y: Math.round(gy - dragOffset.y),
      });
    } else if (tool === 'select' && activeLayer && selectedPointIdx !== null) {
      const updated = activeLayer.points.map((p, idx) => {
        if (idx !== selectedPointIdx) return p;
        if (selectedHandle === 'cp1') {
          return { ...p, cp1x: lx, cp1y: ly };
        }
        const dx = lx - p.x;
        const dy = ly - p.y;
        return {
          ...p,
          x: lx,
          y: ly,
          cp1x: p.cp1x !== undefined ? p.cp1x + dx : undefined,
          cp1y: p.cp1y !== undefined ? p.cp1y + dy : undefined,
        };
      });
      updateActiveLayer({ points: updated });
    } else if (tool === 'brush' && activeLayer) {
      const last = activeLayer.points[activeLayer.points.length - 1];
      if (!last || Math.hypot(lx - last.x, ly - last.y) > 8) {
        updateActiveLayer({ points: [...activeLayer.points, { x: lx, y: ly }] });
      }
    } else if (tool === 'eraser') {
      erasePointsNear(gx, gy);
    }
  };

  const handleMouseUp = () => {
    setIsMouseDown(false);
    setIsDraggingShape(false);
  };

  const erasePointsNear = (gx: number, gy: number) => {
    if (!activeLayer) return;
    const rad = (activeLayer.rotation * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    const remaining = activeLayer.points.filter((p) => {
      const sx = p.x * activeLayer.scale;
      const sy = p.y * activeLayer.scale;
      const pointGx = sx * cos - sy * sin + activeLayer.x;
      const pointGy = sx * sin + sy * cos + activeLayer.y;
      return Math.hypot(pointGx - gx, pointGy - gy) > eraserRadius;
    });
    updateActiveLayer({ points: remaining });
  };

  // Add Final Merged Shape to Scene
  const handleMergeAndAddToScene = () => {
    const { path, width, height, fill, stroke } = generateUnifiedSvgPath();
    if (!path) {
      alert('Please add or draw shapes on the canvas before exporting.');
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

    // Save to localStorage so MotionContext can restore or prepend directly
    localStorage.setItem('motionfx_import_shape', JSON.stringify(payload));

    // Also directly update saved scene layers if they exist
    try {
      const existingRaw = localStorage.getItem('motionfx_scene_layers');
      let existingLayers = [];
      if (existingRaw) {
        existingLayers = JSON.parse(existingRaw);
      }
      const newLayer = {
        id: `custom_${Date.now()}`,
        name: shapeName || 'Merged Custom Vector',
        type: 'shape',
        shapeType: 'custom',
        pathData: path,
        visible: true,
        width,
        height,
        fill,
        stroke,
        borderWidth: 3,
        borderRadius: 0,
        borderStyle: 'solid',
        animateDash: false,
        easing: 'easeOutCubic',
        keyframes: {
          x: [{ time: 0, value: 400 }],
          y: [{ time: 0, value: 225 }],
          scaleX: [{ time: 0, value: 1 }],
          scaleY: [{ time: 0, value: 1 }],
          rotation: [{ time: 0, value: 0 }],
          opacity: [{ time: 0, value: 1 }],
        },
      };

      const updated = [newLayer, ...existingLayers];
      localStorage.setItem('motionfx_scene_layers', JSON.stringify(updated));
    } catch (err) {
      console.warn(err);
    }

    setIsSuccessToast(true);
    setTimeout(() => {
      router.push('/');
    }, 450);
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
              className="bg-[#090a0f] border border-[#2b2f44] focus:border-amber-400 rounded px-2.5 py-1 text-xs font-semibold text-amber-300 outline-none w-52"
            />
          </div>
        </div>

        {/* Primitive Shapes Quick-Spawn Row */}
        <div className="hidden lg:flex items-center gap-1.5 bg-[#090a0f] px-3 py-1 rounded-lg border border-[#1e2130]">
          <span className="text-[11px] font-semibold uppercase text-slate-400 mr-1 flex items-center gap-1">
            <Plus className="w-3.5 h-3.5 text-amber-400" />
            Add Primitives:
          </span>

          <button
            onClick={() => addPrimitive('rect', 'Rectangle')}
            className="p-1.5 rounded hover:bg-[#171925] text-indigo-400 border border-transparent hover:border-[#2b2f44] transition cursor-pointer"
            title="Add Rectangle (Cubic Bézier Box)"
          >
            <Square className="w-4 h-4" />
          </button>

          <button
            onClick={() => addPrimitive('circle', 'Circle')}
            className="p-1.5 rounded hover:bg-[#171925] text-pink-400 border border-transparent hover:border-[#2b2f44] transition cursor-pointer"
            title="Add Circle (Exact Cubic Bézier)"
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
            onClick={() => addPrimitive('heart', 'Heart')}
            className="p-1.5 rounded hover:bg-[#171925] text-rose-400 border border-transparent hover:border-[#2b2f44] transition cursor-pointer"
            title="Add Heart Vector"
          >
            <Heart className="w-4 h-4" />
          </button>

          <button
            onClick={() => addPrimitive('line', 'Line')}
            className="p-1.5 rounded hover:bg-[#171925] text-violet-400 border border-transparent hover:border-[#2b2f44] transition cursor-pointer"
            title="Add Straight Line"
          >
            <Minus className="w-4 h-4 rotate-45" />
          </button>
        </div>

        {/* Right Header Actions */}
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
            title="Merge all layers together and export as compound shape into your motion graphics scene"
          >
            <Combine className="w-3.5 h-3.5" />
            <span>Merge & Add to Scene</span>
          </button>
        </div>
      </header>

      {/* Main Studio Viewport */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Left Illustrator Toolbar */}
        <aside className="w-16 bg-[#11131c] border-r border-[#1e2130] flex flex-col items-center py-3 gap-2 shrink-0 z-20">
          <button
            onClick={() => setTool('select')}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition cursor-pointer ${
              tool === 'select'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:bg-[#171925] hover:text-white'
            }`}
            title="Selection Tool (V) — Move & select whole shapes or anchor points"
          >
            <MousePointer2 className="w-4 h-4" />
          </button>

          <button
            onClick={() => setTool('pen')}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition cursor-pointer ${
              tool === 'pen'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:bg-[#171925] hover:text-white'
            }`}
            title="Pen Tool (P) — Click to add anchor vertices"
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
            title="Eraser Tool (E) — Drag to erase vertices"
          >
            <Eraser className="w-4 h-4" />
          </button>

          <div className="w-8 h-[1px] bg-[#1e2130] my-1"></div>

          <button
            onClick={() => addPrimitive('rect', 'Rectangle')}
            className="w-10 h-10 rounded-xl text-indigo-400 hover:bg-[#171925] flex items-center justify-center transition cursor-pointer"
            title="Add Rectangle"
          >
            <Square className="w-4 h-4" />
          </button>

          <button
            onClick={() => addPrimitive('circle', 'Circle')}
            className="w-10 h-10 rounded-xl text-pink-400 hover:bg-[#171925] flex items-center justify-center transition cursor-pointer"
            title="Add Circle"
          >
            <CircleIcon className="w-4 h-4" />
          </button>

          <button
            onClick={() => addPrimitive('star', 'Star')}
            className="w-10 h-10 rounded-xl text-amber-400 hover:bg-[#171925] flex items-center justify-center transition cursor-pointer"
            title="Add Star"
          >
            <StarIcon className="w-4 h-4" />
          </button>

          <button
            onClick={() => addPrimitive('polygon', 'Polygon')}
            className="w-10 h-10 rounded-xl text-emerald-400 hover:bg-[#171925] flex items-center justify-center transition cursor-pointer"
            title="Add Polygon"
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
          {/* Top Status Bar */}
          <div className="absolute top-3 left-4 right-4 flex items-center justify-between pointer-events-none z-10">
            <div className="bg-[#11131c]/90 backdrop-blur border border-[#1e2130] px-3 py-1.5 rounded-lg text-xs text-slate-300 pointer-events-auto shadow-lg flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              <span>
                {tool === 'select' &&
                  'Selection Tool: Drag shape to Move • Use inspector to Scale & Rotate • Click points to edit'}
                {tool === 'pen' &&
                  'Pen Tool: Click to place vertices • Click starting vertex to close path'}
                {tool === 'brush' && 'Freehand Brush: Drag smoothly on canvas to sketch'}
                {tool === 'eraser' && 'Eraser Tool: Drag over vertices to delete them'}
              </span>
            </div>

            <div className="bg-[#11131c]/90 backdrop-blur border border-[#1e2130] px-2.5 py-1 rounded-lg text-xs font-mono text-indigo-300 pointer-events-auto shadow-lg">
              Active: {activeLayer?.name || 'None'}
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

        {/* Right Sidebar: Shape Layers Stack & Transform Inspector */}
        <aside className="w-80 bg-[#11131c] border-l border-[#1e2130] flex flex-col shrink-0 overflow-hidden z-20">
          {/* Layers Header */}
          <div className="px-3.5 py-2.5 bg-[#090a0f]/60 border-b border-[#1e2130] flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Shape Layers ({layers.length})
              </span>
            </div>

            <button
              onClick={mergeLayersTogether}
              className="text-[11px] px-2 py-0.5 rounded bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 flex items-center gap-1 transition cursor-pointer"
              title="Merge all visible layers into a unified compound layer"
            >
              <Combine className="w-3 h-3" />
              <span>Merge</span>
            </button>
          </div>

          {/* Layers Stack List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {layers.map((layer) => {
              const isSelected = layer.id === activeLayerId;

              return (
                <div
                  key={layer.id}
                  onClick={() => {
                    setActiveLayerId(layer.id);
                    setSelectedPointIdx(null);
                  }}
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

          {/* Active Layer Transform & Appearance Inspector */}
          {activeLayer && (
            <div className="p-3 bg-[#171925] border-t border-[#1e2130] space-y-3 shrink-0 max-h-[50vh] overflow-y-auto">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase text-slate-300 flex items-center gap-1">
                  <Move className="w-3 h-3 text-indigo-400" />
                  Move, Scale & Rotate
                </span>
                <span className="text-[10px] font-mono text-indigo-300">
                  {activeLayer.points.length} pts
                </span>
              </div>

              {/* Move Position X & Y */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">Position X</label>
                  <input
                    type="number"
                    value={Math.round(activeLayer.x)}
                    onChange={(e) =>
                      updateActiveLayer({ x: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full bg-[#090a0f] border border-[#2b2f44] focus:border-indigo-500 rounded px-2 py-1 text-xs font-mono text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">Position Y</label>
                  <input
                    type="number"
                    value={Math.round(activeLayer.y)}
                    onChange={(e) =>
                      updateActiveLayer({ y: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full bg-[#090a0f] border border-[#2b2f44] focus:border-indigo-500 rounded px-2 py-1 text-xs font-mono text-white outline-none"
                  />
                </div>
              </div>

              {/* Scale Slider */}
              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>Scale</span>
                  <span className="font-mono text-amber-300">
                    {activeLayer.scale.toFixed(2)}×
                  </span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="3.0"
                  step="0.05"
                  value={activeLayer.scale}
                  onChange={(e) =>
                    updateActiveLayer({ scale: parseFloat(e.target.value) || 1 })
                  }
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              {/* Rotation Slider */}
              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>Rotation (°)</span>
                  <span className="font-mono text-indigo-300">
                    {Math.round(activeLayer.rotation)}°
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="360"
                    step="5"
                    value={activeLayer.rotation}
                    onChange={(e) =>
                      updateActiveLayer({ rotation: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                  <button
                    onClick={() =>
                      updateActiveLayer({ rotation: (activeLayer.rotation + 90) % 360 })
                    }
                    className="p-1 rounded bg-[#090a0f] hover:bg-[#1e2130] border border-[#2b2f44] text-xs text-slate-300"
                    title="Rotate 90 degrees"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Quick Alignment Helpers */}
              <div className="flex gap-1.5 pt-1">
                <button
                  onClick={() => updateActiveLayer({ x: 400, y: 225 })}
                  className="flex-1 py-1 rounded bg-[#090a0f] hover:bg-[#1e2130] border border-[#2b2f44] text-[11px] text-slate-300 flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Crosshair className="w-3 h-3 text-indigo-400" />
                  <span>Center</span>
                </button>

                <button
                  onClick={() => {
                    // Flip horizontal
                    const flipped = activeLayer.points.map((p) => ({
                      ...p,
                      x: -p.x,
                      cp1x: p.cp1x !== undefined ? -p.cp1x : undefined,
                      cp2x: p.cp2x !== undefined ? -p.cp2x : undefined,
                    }));
                    updateActiveLayer({ points: flipped });
                  }}
                  className="px-2 py-1 rounded bg-[#090a0f] hover:bg-[#1e2130] border border-[#2b2f44] text-[11px] text-slate-300"
                  title="Flip Horizontal"
                >
                  <FlipHorizontal className="w-3 h-3" />
                </button>

                <button
                  onClick={() => {
                    // Flip vertical
                    const flipped = activeLayer.points.map((p) => ({
                      ...p,
                      y: -p.y,
                      cp1y: p.cp1y !== undefined ? -p.cp1y : undefined,
                      cp2y: p.cp2y !== undefined ? -p.cp2y : undefined,
                    }));
                    updateActiveLayer({ points: flipped });
                  }}
                  className="px-2 py-1 rounded bg-[#090a0f] hover:bg-[#1e2130] border border-[#2b2f44] text-[11px] text-slate-300"
                  title="Flip Vertical"
                >
                  <FlipVertical className="w-3 h-3" />
                </button>
              </div>

              {/* Styling: Fill & Stroke */}
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#1e2130]">
                <div className="bg-[#090a0f] p-1.5 rounded border border-[#2b2f44] flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">Fill</span>
                  <input
                    type="color"
                    value={activeLayer.fill}
                    onChange={(e) => updateActiveLayer({ fill: e.target.value })}
                    className="w-5 h-5 rounded cursor-pointer bg-transparent border-0"
                  />
                </div>
                <div className="bg-[#090a0f] p-1.5 rounded border border-[#2b2f44] flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">Stroke</span>
                  <input
                    type="color"
                    value={activeLayer.stroke}
                    onChange={(e) => updateActiveLayer({ stroke: e.target.value })}
                    className="w-5 h-5 rounded cursor-pointer bg-transparent border-0"
                  />
                </div>
              </div>
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
