'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  X,
  PenTool,
  Paintbrush,
  Eraser,
  MousePointer2,
  Undo2,
  Redo2,
  Trash2,
  Sparkles,
  Combine,
  Square,
  Circle as CircleIcon,
  Star as StarIcon,
  Hexagon,
  Minus,
  Crosshair,
  FlipHorizontal,
  FlipVertical,
  Heart,
  Plus,
  Sliders,
  Check,
  ExternalLink,
} from 'lucide-react';
import { useMotion } from '@/context/MotionContext';

export interface Point {
  x: number;
  y: number;
  cp1x?: number;
  cp1y?: number;
  cp2x?: number;
  cp2y?: number;
}

type BuilderTool = 'pen' | 'brush' | 'eraser' | 'select';

const KAPPA = 0.5522847498307935;

function makeCirclePoints(r = 70): Point[] {
  const k = r * KAPPA;
  return [
    { x: 0, y: -r },
    { x: r, y: 0, cp1x: k, cp1y: -r, cp2x: r, cp2y: -k },
    { x: 0, y: r, cp1x: r, cp1y: k, cp2x: k, cp2y: r },
    { x: -r, y: 0, cp1x: -k, cp1y: r, cp2x: -r, cp2y: k },
    { x: 0, y: -r, cp1x: -r, cp1y: -k, cp2x: -k, cp2y: -r },
  ];
}

function makeRectPoints(w = 150, h = 110): Point[] {
  const hw = w / 2;
  const hh = h / 2;
  return [
    { x: -hw, y: -hh },
    { x: hw, y: -hh },
    { x: hw, y: hh },
    { x: -hw, y: hh },
  ];
}

function makeStarPoints(points = 5, outerR = 75, innerR = 35): Point[] {
  const pts: Point[] = [];
  const step = Math.PI / points;
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = i * step - Math.PI / 2;
    pts.push({ x: Math.round(r * Math.cos(angle)), y: Math.round(r * Math.sin(angle)) });
  }
  return pts;
}

function makePolygonPoints(sides = 6, r = 70): Point[] {
  const pts: Point[] = [];
  const step = (Math.PI * 2) / sides;
  for (let i = 0; i < sides; i++) {
    const angle = i * step - Math.PI / 2;
    pts.push({ x: Math.round(r * Math.cos(angle)), y: Math.round(r * Math.sin(angle)) });
  }
  return pts;
}

function makeHeartPoints(size = 60): Point[] {
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

function makePillPoints(w = 160, h = 80): Point[] {
  const r = h / 2;
  const hw = w / 2 - r;
  const k = r * KAPPA;
  return [
    { x: -hw, y: -r },
    { x: hw, y: -r },
    { x: hw + r, y: 0, cp1x: hw + k, cp1y: -r, cp2x: hw + r, cp2y: -k },
    { x: hw, y: r, cp1x: hw + r, cp1y: k, cp2x: hw + k, cp2y: r },
    { x: -hw, y: r },
    { x: -hw - r, y: 0, cp1x: -hw - k, cp1y: r, cp2x: -hw - r, cp2y: k },
    { x: -hw, y: -r, cp1x: -hw - r, cp1y: -k, cp2x: -hw - k, cp2y: -r },
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

export function BuildShapeModal() {
  const { isBuildShapeModalOpen, setIsBuildShapeModalOpen, addCustomShapeLayer } = useMotion();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [shapeName, setShapeName] = useState('Custom Vector Shape');
  const [tool, setTool] = useState<BuilderTool>('select');
  const [points, setPoints] = useState<Point[]>(() => makeStarPoints(5, 75, 35));
  const [isClosed, setIsClosed] = useState(true);

  // Appearance
  const [fill, setFill] = useState('#8b5cf6');
  const [hasFill, setHasFill] = useState(true);
  const [stroke, setStroke] = useState('#ffffff');
  const [strokeWidth, setStrokeWidth] = useState(2.5);

  // Transform
  const [x, setX] = useState(260);
  const [y, setY] = useState(175);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);

  // Interaction
  const [selectedPointIdx, setSelectedPointIdx] = useState<number | null>(null);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Undo / Redo history
  const [history, setHistory] = useState<Point[][]>([]);
  const [redoStack, setRedoStack] = useState<Point[][]>([]);

  const pushHistory = useCallback(() => {
    setHistory((prev) => [...prev.slice(-20), points]);
    setRedoStack([]);
  }, [points]);

  const handleUndo = () => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setRedoStack((r) => [points, ...r]);
    setPoints(prev);
    setHistory((h) => h.slice(0, -1));
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[0];
    setHistory((h) => [...h, points]);
    setPoints(next);
    setRedoStack((r) => r.slice(1));
  };

  // Convert mouse to local coords relative to (x, y)
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { gx: 0, gy: 0, lx: 0, ly: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const gx = (e.clientX - rect.left) * scaleX;
    const gy = (e.clientY - rect.top) * scaleY;

    const dx = gx - x;
    const dy = gy - y;
    const rad = (-rotation * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const lx = (dx * cos - dy * sin) / Math.max(0.001, scale);
    const ly = (dx * sin + dy * cos) / Math.max(0.001, scale);

    return { gx, gy, lx, ly };
  };

  // Canvas Drawing Routine
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Studio Background
    ctx.fillStyle = '#0f1015';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Fine Studio Grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    const step = 20;
    for (let gx = 0; gx < canvas.width; gx += step) {
      ctx.beginPath();
      ctx.moveTo(gx, 0);
      ctx.lineTo(gx, canvas.height);
      ctx.stroke();
    }
    for (let gy = 0; gy < canvas.height; gy += step) {
      ctx.beginPath();
      ctx.moveTo(0, gy);
      ctx.lineTo(canvas.width, gy);
      ctx.stroke();
    }

    // Center Crosshair
    ctx.strokeStyle = 'rgba(139, 92, 246, 0.25)';
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();

    if (points.length === 0) return;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(scale, scale);

    // Render Shape Path
    const svgPath = pointsToSvgSubpath(points, isClosed);
    try {
      const p2d = new Path2D(svgPath);

      if (hasFill && fill) {
        ctx.fillStyle = fill;
        ctx.fill(p2d);
      }

      if (strokeWidth > 0 && stroke) {
        ctx.lineWidth = strokeWidth / scale;
        ctx.strokeStyle = stroke;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke(p2d);
      }
    } catch {
      // ignore
    }

    // Draw interactive vertices and handles
    points.forEach((p, idx) => {
      const isSelected = selectedPointIdx === idx;

      if (p.cp1x !== undefined && p.cp1y !== undefined) {
        ctx.strokeStyle = 'rgba(236, 72, 153, 0.7)';
        ctx.lineWidth = 1 / scale;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.cp1x, p.cp1y);
        ctx.stroke();

        ctx.fillStyle = '#ec4899';
        ctx.beginPath();
        ctx.arc(p.cp1x, p.cp1y, 3.5 / scale, 0, Math.PI * 2);
        ctx.fill();
      }

      // Anchor vertex
      ctx.fillStyle = isSelected ? '#38bdf8' : '#ffffff';
      ctx.strokeStyle = '#4f46e5';
      ctx.lineWidth = 1.5 / scale;
      const s = 7 / scale;
      ctx.fillRect(p.x - s / 2, p.y - s / 2, s, s);
      ctx.strokeRect(p.x - s / 2, p.y - s / 2, s, s);
    });

    // Center anchor mark
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(0, 0, 3 / scale, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // Pen line preview to cursor
    if (tool === 'pen' && points.length > 0) {
      const last = points[points.length - 1];
      const rad = (rotation * Math.PI) / 180;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);
      const lastGx = last.x * scale * cos - last.y * scale * sin + x;
      const lastGy = last.x * scale * sin + last.y * scale * cos + y;

      ctx.strokeStyle = 'rgba(168, 85, 247, 0.7)';
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
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.9)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cursorPos.x, cursorPos.y, 16, 0, Math.PI * 2);
      ctx.stroke();
    }
  }, [points, isClosed, fill, hasFill, stroke, strokeWidth, x, y, scale, rotation, selectedPointIdx, tool, cursorPos]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  // Mouse Handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { gx, gy, lx, ly } = getCanvasCoords(e);
    setIsMouseDown(true);

    if (tool === 'select') {
      // Check if clicked an anchor vertex
      for (let i = 0; i < points.length; i++) {
        if (Math.hypot(points[i].x - lx, points[i].y - ly) <= 10 / scale) {
          pushHistory();
          setSelectedPointIdx(i);
          return;
        }
      }
      // Clicked shape body to move
      setDragOffset({ x: gx - x, y: gy - y });
      setSelectedPointIdx(null);
      return;
    }

    if (tool === 'pen') {
      pushHistory();
      // If clicked near starting vertex, close the path
      if (points.length >= 3 && Math.hypot(points[0].x - lx, points[0].y - ly) <= 12 / scale) {
        setIsClosed(true);
        setTool('select');
        return;
      }

      const last = points[points.length - 1];
      const newPt: Point = {
        x: Math.round(lx),
        y: Math.round(ly),
        cp1x: last ? Math.round(last.x + (lx - last.x) * 0.4) : undefined,
        cp1y: last ? Math.round(last.y + (ly - last.y) * 0.4) : undefined,
      };
      setPoints((prev) => [...prev, newPt]);
      setSelectedPointIdx(points.length);
      return;
    }

    if (tool === 'brush') {
      pushHistory();
      setPoints([{ x: Math.round(lx), y: Math.round(ly) }]);
      setIsClosed(false);
      return;
    }

    if (tool === 'eraser') {
      pushHistory();
      const filtered = points.filter((p) => Math.hypot(p.x - lx, p.y - ly) > 20 / scale);
      setPoints(filtered);
      return;
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { gx, gy, lx, ly } = getCanvasCoords(e);
    setCursorPos({ x: gx, y: gy });

    if (!isMouseDown) return;

    if (tool === 'select') {
      if (selectedPointIdx !== null) {
        // Dragging single vertex
        setPoints((prev) =>
          prev.map((p, idx) => (idx === selectedPointIdx ? { ...p, x: Math.round(lx), y: Math.round(ly) } : p))
        );
      } else {
        // Dragging entire shape
        setX(Math.round(gx - dragOffset.x));
        setY(Math.round(gy - dragOffset.y));
      }
      return;
    }

    if (tool === 'brush') {
      const last = points[points.length - 1];
      if (!last || Math.hypot(last.x - lx, last.y - ly) >= 8 / scale) {
        setPoints((prev) => [...prev, { x: Math.round(lx), y: Math.round(ly) }]);
      }
      return;
    }

    if (tool === 'eraser') {
      const filtered = points.filter((p) => Math.hypot(p.x - lx, p.y - ly) > 20 / scale);
      if (filtered.length !== points.length) {
        setPoints(filtered);
      }
      return;
    }
  };

  const handleMouseUp = () => {
    setIsMouseDown(false);
  };

  // Add Primitive Presets
  const handleAddPrimitive = (type: 'rect' | 'circle' | 'star' | 'polygon' | 'heart' | 'pill') => {
    pushHistory();
    if (type === 'rect') setPoints(makeRectPoints(160, 120));
    else if (type === 'circle') setPoints(makeCirclePoints(70));
    else if (type === 'star') setPoints(makeStarPoints(5, 75, 35));
    else if (type === 'polygon') setPoints(makePolygonPoints(6, 70));
    else if (type === 'heart') setPoints(makeHeartPoints(60));
    else if (type === 'pill') setPoints(makePillPoints(160, 80));
    setIsClosed(true);
    setSelectedPointIdx(null);
  };

  // Export shape to MotionFX Scene
  const handleAddToScene = () => {
    if (points.length === 0) return;

    // 1. Compute bounding box in local coords
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    points.forEach((p) => {
      minX = Math.min(minX, p.x, p.cp1x ?? p.x, p.cp2x ?? p.x);
      minY = Math.min(minY, p.y, p.cp1y ?? p.y, p.cp2y ?? p.y);
      maxX = Math.max(maxX, p.x, p.cp1x ?? p.x, p.cp2x ?? p.x);
      maxY = Math.max(maxY, p.y, p.cp1y ?? p.y, p.cp2y ?? p.y);
    });

    const w = Math.max(30, Math.round(maxX - minX));
    const h = Math.max(30, Math.round(maxY - minY));
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    // 2. Normalize vertices centered at (0, 0)
    const centeredPts = points.map((p) => ({
      x: p.x - centerX,
      y: p.y - centerY,
      cp1x: p.cp1x !== undefined ? p.cp1x - centerX : undefined,
      cp1y: p.cp1y !== undefined ? p.cp1y - centerY : undefined,
      cp2x: p.cp2x !== undefined ? p.cp2x - centerX : undefined,
      cp2y: p.cp2y !== undefined ? p.cp2y - centerY : undefined,
    }));

    const pathData = pointsToSvgSubpath(centeredPts, isClosed);

    addCustomShapeLayer({
      name: shapeName || 'Custom Shape',
      pathData,
      width: Math.round(w * scale),
      height: Math.round(h * scale),
      fill: hasFill ? fill : 'transparent',
      stroke,
      borderWidth: Math.round(strokeWidth),
    });

    setIsBuildShapeModalOpen(false);
  };

  if (!isBuildShapeModalOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#090a0f]/85 backdrop-blur-md z-50 flex items-center justify-center p-4 select-none animate-in fade-in duration-150">
      <div className="w-[840px] max-w-full bg-[#14151b] border border-[#282a35] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-[#242630] bg-[#101116] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
              <PenTool className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-tight">Build Custom Shape</h3>
                <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-purple-950/60 text-purple-300 border border-purple-700/50">
                  Vector Studio
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Draw Bézier curves, combine geometric primitives, or sketch freehand shapes
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/builder"
              className="text-[11px] px-2.5 py-1 rounded bg-[#1e2029] hover:bg-[#282a36] text-zinc-300 hover:text-white border border-[#2c2f3d] transition flex items-center gap-1 cursor-pointer"
              title="Open full-screen vector compound editor"
            >
              <span>Full Studio</span>
              <ExternalLink className="w-3 h-3 text-purple-400" />
            </Link>

            <button
              onClick={() => setIsBuildShapeModalOpen(false)}
              className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-[#20222b] transition cursor-pointer"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Toolbar & Shape Primitives Row */}
        <div className="px-5 py-2.5 bg-[#121319] border-b border-[#242630] flex flex-wrap items-center justify-between gap-3">
          {/* Tools */}
          <div className="flex items-center gap-1 bg-[#181921] p-1 rounded-xl border border-[#272935]">
            <button
              type="button"
              onClick={() => setTool('select')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                tool === 'select'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-950/40'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="Select & Move Vertices (V)"
            >
              <MousePointer2 className="w-3.5 h-3.5" />
              <span>Select</span>
            </button>

            <button
              type="button"
              onClick={() => setTool('pen')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                tool === 'pen'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-950/40'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="Pen Tool — Click to place Bézier anchors (P)"
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>Pen</span>
            </button>

            <button
              type="button"
              onClick={() => setTool('brush')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                tool === 'brush'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-950/40'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="Freehand Pencil / Brush Tool (B)"
            >
              <Paintbrush className="w-3.5 h-3.5" />
              <span>Brush</span>
            </button>

            <button
              type="button"
              onClick={() => setTool('eraser')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                tool === 'eraser'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-950/40'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="Eraser Tool (E)"
            >
              <Eraser className="w-3.5 h-3.5" />
              <span>Eraser</span>
            </button>
          </div>

          {/* Primitives Spawn Buttons */}
          <div className="flex items-center gap-1 bg-[#181921] px-2 py-1 rounded-xl border border-[#272935]">
            <span className="text-[10px] text-zinc-500 font-semibold uppercase mr-1">Presets:</span>

            <button
              type="button"
              onClick={() => handleAddPrimitive('star')}
              className="p-1 rounded hover:bg-[#252835] text-amber-400 transition cursor-pointer"
              title="Star"
            >
              <StarIcon className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => handleAddPrimitive('circle')}
              className="p-1 rounded hover:bg-[#252835] text-pink-400 transition cursor-pointer"
              title="Circle (Cubic Bézier)"
            >
              <CircleIcon className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => handleAddPrimitive('rect')}
              className="p-1 rounded hover:bg-[#252835] text-indigo-400 transition cursor-pointer"
              title="Rectangle"
            >
              <Square className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => handleAddPrimitive('polygon')}
              className="p-1 rounded hover:bg-[#252835] text-emerald-400 transition cursor-pointer"
              title="Polygon / Hexagon"
            >
              <Hexagon className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => handleAddPrimitive('heart')}
              className="p-1 rounded hover:bg-[#252835] text-rose-400 transition cursor-pointer"
              title="Heart"
            >
              <Heart className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => handleAddPrimitive('pill')}
              className="p-1 rounded hover:bg-[#252835] text-sky-400 transition cursor-pointer"
              title="Capsule / Pill"
            >
              <Minus className="w-3.5 h-3.5 rotate-45" />
            </button>
          </div>

          {/* Undo / Redo */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleUndo}
              disabled={history.length === 0}
              className="p-1.5 rounded-lg bg-[#181921] hover:bg-[#252835] disabled:opacity-30 border border-[#272935] text-zinc-300 transition cursor-pointer"
              title="Undo"
            >
              <Undo2 className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={handleRedo}
              disabled={redoStack.length === 0}
              className="p-1.5 rounded-lg bg-[#181921] hover:bg-[#252835] disabled:opacity-30 border border-[#272935] text-zinc-300 transition cursor-pointer"
              title="Redo"
            >
              <Redo2 className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => {
                pushHistory();
                setPoints([]);
              }}
              className="p-1.5 rounded-lg bg-[#181921] hover:bg-[#252835] border border-[#272935] text-zinc-400 hover:text-red-400 transition cursor-pointer"
              title="Clear Canvas"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Modal Center: Canvas + Inspector */}
        <div className="flex-1 flex min-h-0 overflow-hidden">
          {/* Drawing Canvas Area */}
          <div className="flex-1 bg-[#0b0c10] flex flex-col items-center justify-center p-4 relative overflow-hidden">
            <div className="relative shadow-2xl rounded-xl overflow-hidden border border-[#272a38]">
              <canvas
                ref={canvasRef}
                width={520}
                height={350}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                className="block cursor-crosshair"
              />
            </div>

            <div className="mt-2 text-[11px] text-zinc-500 font-mono">
              {tool === 'pen' && 'Click canvas to add vertices • Click first vertex to close path'}
              {tool === 'select' && 'Drag vertices to reshape • Drag shape body to move'}
              {tool === 'brush' && 'Drag to sketch smooth freehand curve'}
              {tool === 'eraser' && 'Drag over vertices to erase them'}
            </div>
          </div>

          {/* Right Styling & Transformation Inspector */}
          <div className="w-72 bg-[#121319] border-l border-[#242630] p-4 flex flex-col justify-between shrink-0 overflow-y-auto space-y-4">
            <div className="space-y-4">
              {/* Shape Name */}
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 block mb-1">
                  Shape Name
                </label>
                <input
                  type="text"
                  value={shapeName}
                  onChange={(e) => setShapeName(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-[#181921] border border-[#2a2c38] focus:border-purple-500 text-white font-medium text-xs outline-none"
                />
              </div>

              {/* Fill & Stroke */}
              <div className="space-y-2.5 pt-2 border-t border-[#22242e]">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                  Appearance
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasFill}
                      onChange={(e) => setHasFill(e.target.checked)}
                      className="rounded accent-purple-500 cursor-pointer"
                    />
                    <span>Fill Color</span>
                  </label>
                  <input
                    type="color"
                    value={fill}
                    disabled={!hasFill}
                    onChange={(e) => setFill(e.target.value)}
                    className="w-6 h-6 rounded cursor-pointer bg-transparent border-0 disabled:opacity-30"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-300">Stroke Color</span>
                  <input
                    type="color"
                    value={stroke}
                    onChange={(e) => setStroke(e.target.value)}
                    className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                    <span>Stroke Width</span>
                    <span className="font-mono text-purple-300">{strokeWidth}px</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={12}
                    step={0.5}
                    value={strokeWidth}
                    onChange={(e) => setStrokeWidth(parseFloat(e.target.value) || 0)}
                    className="w-full accent-purple-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* Transform Quick Buttons */}
              <div className="space-y-2 pt-2 border-t border-[#22242e]">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                  Geometry
                </div>

                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setX(260);
                      setY(175);
                    }}
                    className="py-1 px-1.5 rounded bg-[#181921] hover:bg-[#252835] border border-[#2a2c38] text-[10px] text-zinc-300 transition cursor-pointer flex items-center justify-center gap-1"
                    title="Center in Canvas"
                  >
                    <Crosshair className="w-3 h-3 text-purple-400" />
                    <span>Center</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      pushHistory();
                      const flipped = points.map((p) => ({
                        ...p,
                        x: -p.x,
                        cp1x: p.cp1x !== undefined ? -p.cp1x : undefined,
                        cp2x: p.cp2x !== undefined ? -p.cp2x : undefined,
                      }));
                      setPoints(flipped);
                    }}
                    className="py-1 px-1.5 rounded bg-[#181921] hover:bg-[#252835] border border-[#2a2c38] text-[10px] text-zinc-300 transition cursor-pointer flex items-center justify-center gap-1"
                    title="Flip Horizontal"
                  >
                    <FlipHorizontal className="w-3 h-3 text-purple-400" />
                    <span>Flip H</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      pushHistory();
                      const flipped = points.map((p) => ({
                        ...p,
                        y: -p.y,
                        cp1y: p.cp1y !== undefined ? -p.cp1y : undefined,
                        cp2y: p.cp2y !== undefined ? -p.cp2y : undefined,
                      }));
                      setPoints(flipped);
                    }}
                    className="py-1 px-1.5 rounded bg-[#181921] hover:bg-[#252835] border border-[#2a2c38] text-[10px] text-zinc-300 transition cursor-pointer flex items-center justify-center gap-1"
                    title="Flip Vertical"
                  >
                    <FlipVertical className="w-3 h-3 text-purple-400" />
                    <span>Flip V</span>
                  </button>
                </div>

                {/* Scale Slider */}
                <div>
                  <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                    <span>Scale</span>
                    <span className="font-mono text-purple-300">{Math.round(scale * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min={0.3}
                    max={2.5}
                    step={0.05}
                    value={scale}
                    onChange={(e) => setScale(parseFloat(e.target.value) || 1)}
                    className="w-full accent-purple-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Vertices Count Badge */}
            <div className="pt-2 border-t border-[#22242e] flex items-center justify-between text-xs text-zinc-500 font-mono">
              <span>{points.length} vertices</span>
              <span>{isClosed ? 'Closed Path' : 'Open Path'}</span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-[#242630] bg-[#101116] flex items-center justify-between">
          <button
            type="button"
            onClick={() => setIsBuildShapeModalOpen(false)}
            className="px-4 py-1.5 rounded-lg bg-[#181921] hover:bg-[#22242e] text-zinc-400 hover:text-white text-xs font-semibold transition cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleAddToScene}
            disabled={points.length === 0}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-950/50 transition cursor-pointer disabled:opacity-40"
          >
            <Sparkles className="w-4 h-4 text-purple-200" />
            <span>Add Built Shape to Scene</span>
          </button>
        </div>
      </div>
    </div>
  );
}
