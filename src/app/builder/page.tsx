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
  Grid,
  CheckCircle,
  Eye,
  Sliders,
  Maximize2,
  Shield,
  Zap,
  MessageCircle,
  Heart,
  Moon,
  Compass,
} from 'lucide-react';

interface Point {
  x: number;
  y: number;
  cp1x?: number; // control point 1
  cp1y?: number;
  cp2x?: number; // control point 2
  cp2y?: number;
}

type BuilderTool = 'pen' | 'brush' | 'eraser' | 'select';

export default function ShapeBuilderPage() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Studio Settings
  const [shapeName, setShapeName] = useState('Custom Vector');
  const [tool, setTool] = useState<BuilderTool>('pen');
  const [fillColor, setFillColor] = useState('#6366f1');
  const [hasFill, setHasFill] = useState(true);
  const [strokeColor, setStrokeColor] = useState('#ffffff');
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [isClosed, setIsClosed] = useState(false);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [eraserRadius, setEraserRadius] = useState(25);

  // Vector Geometry
  const [points, setPoints] = useState<Point[]>([
    { x: 300, y: 150 },
    { x: 450, y: 150, cp1x: 400, cp1y: 120, cp2x: 450, cp2y: 150 },
    { x: 500, y: 280 },
    { x: 250, y: 280, cp1x: 350, cp1y: 340, cp2x: 270, cp2y: 300 },
  ]);
  const [selectedPointIdx, setSelectedPointIdx] = useState<number | null>(null);
  const [selectedHandle, setSelectedHandle] = useState<'cp1' | 'cp2' | null>(null);

  // History for Undo/Redo
  const [history, setHistory] = useState<Point[][]>([]);
  const [redoStack, setRedoStack] = useState<Point[][]>([]);

  // Interaction State
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [dragStartPoint, setDragStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isSuccessToast, setIsSuccessToast] = useState(false);

  const pushHistory = useCallback(() => {
    setHistory((prev) => [...prev.slice(-20), points]);
    setRedoStack([]);
  }, [points]);

  const handleUndo = () => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    setRedoStack((prev) => [points, ...prev]);
    setPoints(previous);
    setHistory((prev) => prev.slice(0, -1));
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[0];
    setHistory((prev) => [...prev, points]);
    setPoints(next);
    setRedoStack((prev) => prev.slice(1));
  };

  // Convert points to SVG path string
  const generateSvgPath = useCallback(
    (centered = false): { path: string; width: number; height: number } => {
      if (points.length === 0) return { path: '', width: 100, height: 100 };

      // Calculate Bounding Box
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

      const width = Math.max(40, maxX - minX);
      const height = Math.max(40, maxY - minY);
      const centerX = (minX + maxX) / 2;
      const centerY = (minY + maxY) / 2;

      let d = '';
      points.forEach((p, idx) => {
        const x = centered ? p.x - centerX : p.x;
        const y = centered ? p.y - centerY : p.y;

        if (idx === 0) {
          d += `M ${x.toFixed(1)} ${y.toFixed(1)}`;
        } else if (p.cp1x !== undefined && p.cp1y !== undefined) {
          const cp1x = centered ? p.cp1x - centerX : p.cp1x;
          const cp1y = centered ? p.cp1y - centerY : p.cp1y;
          const cp2x = centered ? (p.cp2x ?? p.x) - centerX : (p.cp2x ?? p.x);
          const cp2y = centered ? (p.cp2y ?? p.y) - centerY : (p.cp2y ?? p.y);
          d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${x.toFixed(1)} ${y.toFixed(1)}`;
        } else {
          d += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
        }
      });

      if (isClosed || points.length > 2) {
        d += ' Z';
      }

      return { path: d, width, height };
    },
    [points, isClosed]
  );

  // Canvas Redraw
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background
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

    // Center Guides
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.15)';
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();

    if (points.length === 0) return;

    // Draw Vector Path
    const { path: pathD } = generateSvgPath(false);
    try {
      const p2d = new Path2D(pathD);

      if (hasFill && fillColor) {
        ctx.fillStyle = fillColor;
        ctx.fill(p2d);
      }

      if (strokeWidth > 0 && strokeColor) {
        ctx.lineWidth = strokeWidth;
        ctx.strokeStyle = strokeColor;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke(p2d);
      }
    } catch {
      // ignore
    }

    // Interactive Preview Line to cursor while using Pen tool
    if (tool === 'pen' && points.length > 0) {
      const last = points[points.length - 1];
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.5)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(last.x, last.y);
      ctx.lineTo(cursorPos.x, cursorPos.y);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw Anchors & Bézier Control Handles
    points.forEach((p, idx) => {
      const isSelected = selectedPointIdx === idx;

      // Tangent lines
      if (p.cp1x !== undefined && p.cp1y !== undefined) {
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.6)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.cp1x, p.cp1y);
        ctx.stroke();

        // Control point circle
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(p.cp1x, p.cp1y, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      // Anchor Point Square
      ctx.fillStyle = isSelected ? '#38bdf8' : '#ffffff';
      ctx.strokeStyle = '#090a0f';
      ctx.lineWidth = 2;
      ctx.fillRect(p.x - 5, p.y - 5, 10, 10);
      ctx.strokeRect(p.x - 5, p.y - 5, 10, 10);
    });

    // Eraser Cursor Circle
    if (tool === 'eraser') {
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.8)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cursorPos.x, cursorPos.y, eraserRadius, 0, Math.PI * 2);
      ctx.stroke();
    }
  }, [
    points,
    fillColor,
    hasFill,
    strokeColor,
    strokeWidth,
    generateSvgPath,
    tool,
    cursorPos,
    selectedPointIdx,
    eraserRadius,
  ]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  // Coordinate Calculation
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
    const pt = getCanvasCoords(e);
    setIsMouseDown(true);
    setDragStartPoint(pt);

    if (tool === 'pen') {
      pushHistory();
      // Check if clicking close to first point to close path
      if (points.length > 2) {
        const first = points[0];
        const dist = Math.hypot(pt.x - first.x, pt.y - first.y);
        if (dist < 15) {
          setIsClosed(true);
          return;
        }
      }
      setPoints((prev) => [...prev, { x: pt.x, y: pt.y }]);
      setSelectedPointIdx(points.length);
    } else if (tool === 'brush') {
      pushHistory();
      setPoints((prev) => [...prev, { x: pt.x, y: pt.y }]);
    } else if (tool === 'eraser') {
      pushHistory();
      erasePointsNear(pt.x, pt.y);
    } else if (tool === 'select') {
      // Find closest anchor or control handle
      let foundIdx: number | null = null;
      let foundHandle: 'cp1' | 'cp2' | null = null;

      points.forEach((p, idx) => {
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

    if (!isMouseDown) return;

    if (tool === 'pen' && dragStartPoint && selectedPointIdx !== null) {
      // Pulling Bézier handles while dragging pen!
      setPoints((prev) =>
        prev.map((p, idx) => {
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
        })
      );
    } else if (tool === 'brush') {
      setPoints((prev) => {
        const last = prev[prev.length - 1];
        if (!last || Math.hypot(pt.x - last.x, pt.y - last.y) > 8) {
          return [...prev, { x: pt.x, y: pt.y }];
        }
        return prev;
      });
    } else if (tool === 'eraser') {
      erasePointsNear(pt.x, pt.y);
    } else if (tool === 'select' && selectedPointIdx !== null) {
      setPoints((prev) =>
        prev.map((p, idx) => {
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
        })
      );
    }
  };

  const handleMouseUp = () => {
    setIsMouseDown(false);
    setDragStartPoint(null);
  };

  const erasePointsNear = (x: number, y: number) => {
    setPoints((prev) =>
      prev.filter((p) => Math.hypot(p.x - x, p.y - y) > eraserRadius)
    );
  };

  // Preset Template Shapes
  const loadPreset = (preset: string) => {
    pushHistory();
    const cx = 400;
    const cy = 225;

    if (preset === 'lightning') {
      setPoints([
        { x: cx, y: cy - 100 },
        { x: cx + 30, y: cy - 20 },
        { x: cx + 5, y: cy - 20 },
        { x: cx + 35, y: cy + 100 },
        { x: cx - 25, y: cy + 10 },
        { x: cx + 5, y: cy + 10 },
      ]);
      setIsClosed(true);
    } else if (preset === 'shield') {
      setPoints([
        { x: cx, y: cy - 90 },
        { x: cx + 70, y: cy - 70 },
        { x: cx + 60, y: cy + 30, cp1x: cx + 70, cp1y: cy },
        { x: cx, y: cy + 100, cp1x: cx + 40, cp1y: cy + 70 },
        { x: cx - 60, y: cy + 30, cp1x: cx - 40, cp1y: cy + 70 },
        { x: cx - 70, y: cy - 70, cp1x: cx - 70, cp1y: cy },
      ]);
      setIsClosed(true);
    } else if (preset === 'heart') {
      setPoints([
        { x: cx, y: cy + 70 },
        { x: cx - 80, y: cy - 20, cp1x: cx - 60, cp1y: cy + 40 },
        { x: cx - 35, y: cy - 70, cp1x: cx - 80, cp1y: cy - 60 },
        { x: cx, y: cy - 35, cp1x: cx - 10, cp1y: cy - 70 },
        { x: cx + 35, y: cy - 70, cp1x: cx + 10, cp1y: cy - 70 },
        { x: cx + 80, y: cy - 20, cp1x: cx + 80, cp1y: cy - 60 },
      ]);
      setIsClosed(true);
    } else if (preset === 'bubble') {
      setPoints([
        { x: cx - 80, y: cy - 50 },
        { x: cx + 80, y: cy - 50, cp1x: cx, cp1y: cy - 50 },
        { x: cx + 80, y: cy + 30, cp1x: cx + 80, cp1y: cy },
        { x: cx - 20, y: cy + 30 },
        { x: cx - 50, y: cy + 65 },
        { x: cx - 45, y: cy + 30 },
        { x: cx - 80, y: cy + 30 },
      ]);
      setIsClosed(true);
    }
  };

  // Add Shape To Motion Scene Action
  const handleAddToScene = () => {
    if (points.length < 2) {
      alert('Please draw at least 2 points before adding to scene.');
      return;
    }

    const { path, width, height } = generateSvgPath(true);

    const customShapePayload = {
      name: shapeName || 'Custom Vector',
      pathData: path,
      width: Math.round(width),
      height: Math.round(height),
      fill: hasFill ? fillColor : 'transparent',
      stroke: strokeColor,
    };

    localStorage.setItem('motionfx_import_shape', JSON.stringify(customShapePayload));
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
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg bg-[#171925] border border-[#2b2f44] transition"
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
              className="bg-[#090a0f] border border-[#2b2f44] focus:border-amber-400 rounded px-2.5 py-1 text-xs font-semibold text-amber-300 outline-none w-44"
            />
          </div>
        </div>

        {/* Center Canvas Settings */}
        <div className="flex items-center gap-3 bg-[#090a0f] px-3 py-1 rounded-lg border border-[#1e2130]">
          {/* Fill Picker */}
          <div className="flex items-center gap-1.5">
            <label className="text-xs text-slate-400">Fill:</label>
            <input
              type="checkbox"
              checked={hasFill}
              onChange={(e) => setHasFill(e.target.checked)}
              className="rounded accent-indigo-500 cursor-pointer"
              title="Toggle Fill"
            />
            {hasFill && (
              <input
                type="color"
                value={fillColor}
                onChange={(e) => setFillColor(e.target.value)}
                className="w-5 h-5 rounded cursor-pointer bg-transparent border-0"
              />
            )}
          </div>

          <div className="h-3 w-[1px] bg-[#1e2130]"></div>

          {/* Stroke Picker */}
          <div className="flex items-center gap-1.5">
            <label className="text-xs text-slate-400">Stroke:</label>
            <input
              type="color"
              value={strokeColor}
              onChange={(e) => setStrokeColor(e.target.value)}
              className="w-5 h-5 rounded cursor-pointer bg-transparent border-0"
            />
            <input
              type="number"
              min="0"
              max="24"
              value={strokeWidth}
              onChange={(e) => setStrokeWidth(parseInt(e.target.value, 10) || 0)}
              className="w-12 bg-[#171925] border border-[#2b2f44] rounded px-1.5 py-0.5 text-xs font-mono text-center"
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

        {/* Right Actions */}
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
            onClick={() => {
              pushHistory();
              setPoints([]);
              setIsClosed(false);
            }}
            className="p-1.5 rounded bg-[#171925] hover:bg-red-950/70 text-slate-300 hover:text-red-300 border border-[#2b2f44] text-xs cursor-pointer"
            title="Clear Vector Canvas"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleAddToScene}
            className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 via-orange-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Add to Scene Layers</span>
          </button>
        </div>
      </header>

      {/* Main Studio Viewport */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Left Illustrator Toolbar */}
        <aside className="w-16 bg-[#11131c] border-r border-[#1e2130] flex flex-col items-center py-3 gap-2 shrink-0 z-20">
          <button
            onClick={() => setTool('pen')}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition cursor-pointer ${
              tool === 'pen'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:bg-[#171925] hover:text-white'
            }`}
            title="Pen Tool (P) — Click to add anchors, drag for Bézier curves"
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
            onClick={() => loadPreset('lightning')}
            className="w-10 h-10 rounded-xl text-amber-400 hover:bg-[#171925] flex items-center justify-center text-xs transition cursor-pointer"
            title="Insert Lightning Bolt Preset"
          >
            <Zap className="w-4 h-4" />
          </button>

          <button
            onClick={() => loadPreset('shield')}
            className="w-10 h-10 rounded-xl text-emerald-400 hover:bg-[#171925] flex items-center justify-center text-xs transition cursor-pointer"
            title="Insert Shield Crest Preset"
          >
            <Shield className="w-4 h-4" />
          </button>

          <button
            onClick={() => loadPreset('heart')}
            className="w-10 h-10 rounded-xl text-pink-400 hover:bg-[#171925] flex items-center justify-center text-xs transition cursor-pointer"
            title="Insert Heart Vector Preset"
          >
            <Heart className="w-4 h-4" />
          </button>

          <button
            onClick={() => loadPreset('bubble')}
            className="w-10 h-10 rounded-xl text-sky-400 hover:bg-[#171925] flex items-center justify-center text-xs transition cursor-pointer"
            title="Insert Speech Bubble Preset"
          >
            <MessageCircle className="w-4 h-4" />
          </button>
        </aside>

        {/* Center Drawing Canvas */}
        <main className="flex-1 bg-[#090a0f] flex flex-col items-center justify-center p-4 relative overflow-hidden">
          {/* Top Helper Hint */}
          <div className="absolute top-3 left-4 right-4 flex items-center justify-between pointer-events-none z-10">
            <div className="bg-[#11131c]/90 backdrop-blur border border-[#1e2130] px-3 py-1.5 rounded-lg text-xs text-slate-300 pointer-events-auto shadow-lg flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              <span>
                {tool === 'pen' &&
                  'Pen Tool: Click to place anchor point • Drag for Bézier curve • Click start point to close'}
                {tool === 'brush' && 'Freehand Brush: Click and drag smoothly on canvas'}
                {tool === 'eraser' && 'Eraser Tool: Click or drag over vertices to delete them'}
                {tool === 'select' && 'Direct Selection: Click anchor point or control handle to reposition'}
              </span>
            </div>

            <div className="bg-[#11131c]/90 backdrop-blur border border-[#1e2130] px-2.5 py-1 rounded-lg text-xs font-mono text-slate-400 pointer-events-auto">
              Points: {points.length}
            </div>
          </div>

          {/* Vector Stage */}
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
                <h4 className="text-base font-bold text-white">Custom Shape Exported!</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Importing into your MotionFX scene layers...
                </p>
              </div>
            </div>
          )}
        </main>

        {/* Right Vector Properties Panel */}
        <aside className="w-72 bg-[#11131c] border-l border-[#1e2130] flex flex-col p-4 space-y-4 shrink-0 overflow-y-auto">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2 pb-2 border-b border-[#1e2130]">
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            <span>Path Inspector</span>
          </div>

          {/* Quick Shape Geometry Information */}
          <div className="bg-[#171925] p-3 rounded-xl border border-[#1e2130] space-y-2 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Anchor Points</span>
              <span className="font-mono text-white">{points.length}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Path Status</span>
              <span className="font-mono text-amber-400">
                {isClosed ? 'Closed' : 'Open'}
              </span>
            </div>
            <div className="pt-2">
              <button
                onClick={() => setIsClosed((v) => !v)}
                className="w-full py-1.5 rounded bg-[#1e2130] hover:bg-[#2b2f44] text-xs text-slate-200 border border-[#2b2f44] transition cursor-pointer"
              >
                {isClosed ? 'Open Path' : 'Close Path (Z)'}
              </button>
            </div>
          </div>

          {/* Eraser Radius Slider (when eraser active) */}
          {tool === 'eraser' && (
            <div className="bg-[#171925] p-3 rounded-xl border border-[#1e2130] space-y-2">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Eraser Radius</span>
                <span className="font-mono text-indigo-300">{eraserRadius}px</span>
              </div>
              <input
                type="range"
                min="10"
                max="60"
                value={eraserRadius}
                onChange={(e) => setEraserRadius(parseInt(e.target.value, 10))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
            </div>
          )}

          {/* Path SVG Code Preview */}
          <div className="bg-[#171925] p-3 rounded-xl border border-[#1e2130] space-y-1.5">
            <span className="text-[11px] font-semibold uppercase text-slate-400">
              SVG Path Preview
            </span>
            <div className="h-28 overflow-y-auto bg-[#090a0f] p-2 rounded border border-[#1e2130] font-mono text-[10px] text-indigo-300 break-all select-all">
              {generateSvgPath(true).path || 'No path points yet'}
            </div>
          </div>

          {/* Ready to Export Card */}
          <div className="bg-gradient-to-br from-indigo-950/60 to-purple-950/40 p-3.5 rounded-xl border border-indigo-500/30 space-y-2">
            <span className="text-xs font-semibold text-white flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Add To Motion Scene
            </span>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              This shape will be converted into an animatable scene layer with full keyframing
              (Position, Rotation, Scale, Opacity, and Marching Ants border flow).
            </p>
            <button
              onClick={handleAddToScene}
              className="w-full mt-1 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/30 transition cursor-pointer"
            >
              Add Shape to Scene Layers
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
