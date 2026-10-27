'use client';

import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import {
  Layer,
  ShapeType,
  AnimatableProp,
  SelectedKeyframeRef,
  ExportProgress,
  TextEffect,
} from '@/types/motion';
import {
  uid,
  getInterpolatedValue,
  getLayerTransformAtTime,
  setOrUpdateKeyframe,
  removeKeyframeAtIndex,
} from '@/modules/keyframes/evaluator';
import { TEMPLATES } from '@/modules/templates';
import { VideoExporter } from '@/modules/export/videoExporter';
import { renderSceneAtTime } from '@/modules/renderers/engine';

interface MotionContextType {
  layers: Layer[];
  selectedLayerId: string | null;
  selectedLayer: Layer | null;
  selectedKeyframe: SelectedKeyframeRef | null;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  isLooping: boolean;
  canvasBg: string;
  showGuides: boolean;
  exportProgress: ExportProgress;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  // Layer creation
  addShape: (shapeType: ShapeType) => void;
  addCustomShape: (
    name: string,
    pathData: string,
    width: number,
    height: number,
    fill?: string,
    stroke?: string
  ) => void;
  addText: (textEffect?: TextEffect) => void;
  addImage: (src: string, name?: string, w?: number, h?: number) => void;
  // Layer management
  selectLayer: (id: string | null) => void;
  updateLayer: (id: string, updates: Partial<Layer>, skipSnapshot?: boolean) => void;
  deleteLayer: (id: string) => void;
  duplicateLayer: (id: string) => void;
  reorderLayer: (id: string, direction: 'up' | 'down') => void;
  toggleLayerVisibility: (id: string) => void;
  // Keyframes
  setAnimPropValue: (
    layerId: string,
    prop: AnimatableProp,
    value: number,
    skipSnapshot?: boolean
  ) => void;
  toggleKeyframe: (layerId: string, prop: AnimatableProp) => void;
  keyAllTransformProps: (layerId: string) => void;
  selectKeyframe: (ref: SelectedKeyframeRef | null) => void;
  deleteSelectedKeyframe: () => void;
  moveKeyframeTime: (
    layerId: string,
    prop: AnimatableProp,
    index: number,
    newTime: number,
    skipSnapshot?: boolean
  ) => void;
  // Transport & playback
  setCurrentTime: (t: number) => void;
  setDuration: (d: number) => void;
  togglePlay: () => void;
  pausePlay: () => void;
  stopPlay: () => void;
  toggleLoop: () => void;
  seekToStart: () => void;
  setCanvasBg: (c: string) => void;
  setShowGuides: (v: boolean) => void;
  // Templates & Scene
  loadTemplate: (templateId: string) => void;
  clearScene: () => void;
  // Export
  startExport: () => void;
  cancelExport: () => void;
  // 50-step Undo / Redo Mechanism
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  historyStepCount: number;
  recordSnapshot: () => void;
  // Manual trigger for canvas re-render
  requestRender: () => void;
}

const MotionContext = createContext<MotionContextType | null>(null);

const MAX_HISTORY_STEPS = 50;

interface HistorySnapshot {
  layers: Layer[];
  selectedLayerId: string | null;
  duration?: number;
  canvasBg?: string;
}

const PALETTE = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#06b6d4', '#8b5cf6', '#f43f5e'];

export function MotionProvider({ children }: { children: React.ReactNode }) {
  const [layers, setLayers] = useState<Layer[]>([]);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [selectedKeyframe, setSelectedKeyframe] = useState<SelectedKeyframeRef | null>(null);
  const [currentTime, setCurrentTimeState] = useState<number>(0);
  const [duration, setDurationState] = useState<number>(5.0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isLooping, setIsLooping] = useState<boolean>(true);
  const [canvasBg, setCanvasBg] = useState<string>('#090b10');
  const [showGuides, setShowGuides] = useState<boolean>(true);
  const [exportProgress, setExportProgress] = useState<ExportProgress>({
    isExporting: false,
    progress: 0,
    currentSec: 0,
    totalSec: 0,
  });

  // 50-step Undo / Redo History Stacks
  const [undoStack, setUndoStack] = useState<HistorySnapshot[]>([]);
  const [redoStack, setRedoStack] = useState<HistorySnapshot[]>([]);

  // Refs for tracking synchronous state without stale closures
  const layersRef = useRef<Layer[]>(layers);
  layersRef.current = layers;
  const selectedLayerIdRef = useRef<string | null>(selectedLayerId);
  selectedLayerIdRef.current = selectedLayerId;
  const durationRef = useRef<number>(duration);
  durationRef.current = duration;
  const canvasBgRef = useRef<string>(canvasBg);
  canvasBgRef.current = canvasBg;
  const lastSnapshotTimeRef = useRef<number>(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const exporterRef = useRef<VideoExporter | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  // Push snapshot to undo stack
  const pushUndo = useCallback((force: boolean = true) => {
    const now = Date.now();
    if (!force && now - lastSnapshotTimeRef.current < 400) {
      return;
    }
    lastSnapshotTimeRef.current = now;

    const snapshot: HistorySnapshot = {
      layers: JSON.parse(JSON.stringify(layersRef.current)),
      selectedLayerId: selectedLayerIdRef.current,
      duration: durationRef.current,
      canvasBg: canvasBgRef.current,
    };

    setUndoStack((prev) => {
      const next = [...prev, snapshot];
      if (next.length > MAX_HISTORY_STEPS) {
        return next.slice(next.length - MAX_HISTORY_STEPS);
      }
      return next;
    });
    setRedoStack([]);
  }, []);

  const recordSnapshot = useCallback(() => {
    pushUndo(true);
  }, [pushUndo]);

  const undo = useCallback(() => {
    setUndoStack((prevUndo) => {
      if (prevUndo.length === 0) return prevUndo;
      const nextUndo = [...prevUndo];
      const targetSnapshot = nextUndo.pop()!;

      const currentSnapshot: HistorySnapshot = {
        layers: JSON.parse(JSON.stringify(layersRef.current)),
        selectedLayerId: selectedLayerIdRef.current,
        duration: durationRef.current,
        canvasBg: canvasBgRef.current,
      };

      setRedoStack((prevRedo) => {
        const next = [...prevRedo, currentSnapshot];
        if (next.length > MAX_HISTORY_STEPS) {
          return next.slice(next.length - MAX_HISTORY_STEPS);
        }
        return next;
      });

      setLayers(targetSnapshot.layers);
      setSelectedLayerId(targetSnapshot.selectedLayerId);
      if (targetSnapshot.duration !== undefined) setDurationState(targetSnapshot.duration);
      if (targetSnapshot.canvasBg !== undefined) setCanvasBg(targetSnapshot.canvasBg);
      setSelectedKeyframe(null);

      return nextUndo;
    });
  }, []);

  const redo = useCallback(() => {
    setRedoStack((prevRedo) => {
      if (prevRedo.length === 0) return prevRedo;
      const nextRedo = [...prevRedo];
      const targetSnapshot = nextRedo.pop()!;

      const currentSnapshot: HistorySnapshot = {
        layers: JSON.parse(JSON.stringify(layersRef.current)),
        selectedLayerId: selectedLayerIdRef.current,
        duration: durationRef.current,
        canvasBg: canvasBgRef.current,
      };

      setUndoStack((prevUndo) => {
        const next = [...prevUndo, currentSnapshot];
        if (next.length > MAX_HISTORY_STEPS) {
          return next.slice(next.length - MAX_HISTORY_STEPS);
        }
        return next;
      });

      setLayers(targetSnapshot.layers);
      setSelectedLayerId(targetSnapshot.selectedLayerId);
      if (targetSnapshot.duration !== undefined) setDurationState(targetSnapshot.duration);
      if (targetSnapshot.canvasBg !== undefined) setCanvasBg(targetSnapshot.canvasBg);
      setSelectedKeyframe(null);

      return nextRedo;
    });
  }, []);

  // Selected layer derived
  const selectedLayer = useMemo(() => {
    return layers.find((l) => l.id === selectedLayerId) || null;
  }, [layers, selectedLayerId]);

  // Canvas Redraw Routine
  const drawCurrentFrame = useCallback(
    (timeToRender: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      renderSceneAtTime(ctx, canvas.width, canvas.height, layers, timeToRender, duration, {
        canvasBg,
        showGuides,
        selectedLayerId,
        hideSelectionGizmo: exportProgress.isExporting,
      });
    },
    [layers, duration, canvasBg, showGuides, selectedLayerId, exportProgress.isExporting]
  );

  const requestRender = useCallback(() => {
    drawCurrentFrame(currentTime);
  }, [drawCurrentFrame, currentTime]);

  useEffect(() => {
    drawCurrentFrame(currentTime);
  }, [drawCurrentFrame, currentTime]);

  // Set Current Time with Clamp
  const setCurrentTime = useCallback(
    (t: number) => {
      const clamped = Math.max(0, Math.min(duration, t));
      setCurrentTimeState(clamped);
    },
    [duration]
  );

  const setDuration = useCallback(
    (d: number) => {
      setDurationState(d);
      if (currentTime > d) setCurrentTimeState(d);
    },
    [currentTime]
  );

  // Animation Loop for Smooth Playback
  useEffect(() => {
    if (!isPlaying) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      return;
    }

    lastTimeRef.current = performance.now();

    const loop = (now: number) => {
      const dt = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      setCurrentTimeState((prev) => {
        const nextTime = prev + dt;
        if (nextTime >= duration) {
          if (isLooping) {
            return 0;
          } else {
            setIsPlaying(false);
            return duration;
          }
        }
        return nextTime;
      });

      animationFrameRef.current = requestAnimationFrame(loop);
    };

    animationFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, duration, isLooping]);

  // Playback Controls
  const togglePlay = useCallback(() => {
    setIsPlaying((prev) => {
      if (!prev && currentTime >= duration) {
        setCurrentTimeState(0);
      }
      return !prev;
    });
  }, [currentTime, duration]);

  const pausePlay = useCallback(() => setIsPlaying(false), []);

  const stopPlay = useCallback(() => {
    setIsPlaying(false);
    setCurrentTimeState(0);
  }, []);

  const seekToStart = useCallback(() => {
    setCurrentTimeState(0);
  }, []);

  const toggleLoop = useCallback(() => setIsLooping((v) => !v), []);

  // Layer Creation Functions
  const addShape = useCallback(
    (shapeType: ShapeType) => {
      pushUndo(true);
      const offset = (layers.length % 5) * 20;
      const color = PALETTE[layers.length % PALETTE.length];
      const newLayer: Layer = {
        id: uid(`shape_${shapeType}`),
        name: `${shapeType.charAt(0).toUpperCase() + shapeType.slice(1)} ${layers.length + 1}`,
        type: 'shape',
        shapeType,
        visible: true,
        width: shapeType === 'rect' ? 160 : shapeType === 'pill' ? 180 : 130,
        height: shapeType === 'rect' ? 120 : shapeType === 'pill' ? 90 : 130,
        sides: shapeType === 'star' ? 5 : shapeType === 'polygon' ? 6 : undefined,
        fill: color,
        stroke: '#ffffff',
        borderWidth: 3,
        borderRadius: shapeType === 'rect' ? 24 : 8,
        borderStyle: 'solid',
        animateDash: false,
        easing: 'backOut',
        keyframes: {
          x: [{ time: 0, value: 400 + offset - 40 }],
          y: [{ time: 0, value: 225 + offset - 40 }],
          scaleX: [
            { time: 0, value: 0.1 },
            { time: 0.6, value: 1 },
          ],
          scaleY: [
            { time: 0, value: 0.1 },
            { time: 0.6, value: 1 },
          ],
          rotation: [
            { time: 0, value: -15 },
            { time: 0.6, value: 0 },
          ],
          opacity: [
            { time: 0, value: 0 },
            { time: 0.4, value: 1 },
          ],
        },
      };

      setLayers((prev) => [newLayer, ...prev]);
      setSelectedLayerId(newLayer.id);
    },
    [layers.length, pushUndo]
  );

  const addCustomShape = useCallback(
    (
      name: string,
      pathData: string,
      width: number,
      height: number,
      fill: string = '#6366f1',
      stroke: string = '#ffffff'
    ) => {
      pushUndo(true);
      const offset = (layers.length % 5) * 20;
      const newLayer: Layer = {
        id: uid('custom_shape'),
        name: name || `Custom Shape ${layers.length + 1}`,
        type: 'shape',
        shapeType: 'custom',
        pathData,
        visible: true,
        width: Math.max(40, width),
        height: Math.max(40, height),
        fill,
        stroke,
        borderWidth: 3,
        borderRadius: 0,
        borderStyle: 'solid',
        animateDash: false,
        easing: 'backOut',
        keyframes: {
          x: [{ time: 0, value: 400 + offset - 30 }],
          y: [{ time: 0, value: 225 + offset - 30 }],
          scaleX: [
            { time: 0, value: 0.1 },
            { time: 0.6, value: 1 },
          ],
          scaleY: [
            { time: 0, value: 0.1 },
            { time: 0.6, value: 1 },
          ],
          rotation: [
            { time: 0, value: -15 },
            { time: 0.6, value: 0 },
          ],
          opacity: [
            { time: 0, value: 0 },
            { time: 0.4, value: 1 },
          ],
        },
      };

      setLayers((prev) => [newLayer, ...prev]);
      setSelectedLayerId(newLayer.id);
    },
    [layers.length, pushUndo]
  );

  const addText = useCallback(
    (textEffect: TextEffect = 'cascade') => {
      pushUndo(true);
      const newLayer: Layer = {
        id: uid('text'),
        name: `Kinetic Text ${layers.length + 1}`,
        type: 'text',
        visible: true,
        text: 'MOTION FLOW',
        morphTarget: 'FUTURE DESIGN',
        fontSize: 52,
        fill: '#ffffff',
        stroke: '#6366f1',
        borderWidth: 0,
        borderRadius: 0,
        borderStyle: 'none',
        animateDash: false,
        textEffect,
        easing: 'backOut',
        width: 340,
        height: 60,
        keyframes: {
          x: [{ time: 0, value: 400 }],
          y: [{ time: 0, value: 225 }],
          scaleX: [
            { time: 0, value: 0.6 },
            { time: 0.5, value: 1 },
          ],
          scaleY: [
            { time: 0, value: 0.6 },
            { time: 0.5, value: 1 },
          ],
          rotation: [{ time: 0, value: 0 }],
          opacity: [{ time: 0, value: 1 }],
        },
      };

      setLayers((prev) => [newLayer, ...prev]);
      setSelectedLayerId(newLayer.id);
    },
    [layers.length, pushUndo]
  );

  const addImage = useCallback(
    (src: string, name: string = 'PNG Asset', w = 150, h = 150) => {
      pushUndo(true);
      const newLayer: Layer = {
        id: uid('img'),
        name,
        type: 'image',
        imageSrc: src,
        visible: true,
        width: w,
        height: h,
        fill: '#ffffff',
        stroke: '#ffffff',
        borderWidth: 0,
        borderRadius: 14,
        borderStyle: 'none',
        animateDash: false,
        easing: 'elastic',
        keyframes: {
          x: [{ time: 0, value: 400 }],
          y: [
            { time: 0, value: 260 },
            { time: 0.7, value: 225 },
          ],
          scaleX: [
            { time: 0, value: 0 },
            { time: 0.7, value: 1 },
          ],
          scaleY: [
            { time: 0, value: 0 },
            { time: 0.7, value: 1 },
          ],
          rotation: [
            { time: 0, value: -25 },
            { time: 0.7, value: 0 },
          ],
          opacity: [
            { time: 0, value: 0 },
            { time: 0.4, value: 1 },
          ],
        },
      };

      setLayers((prev) => [newLayer, ...prev]);
      setSelectedLayerId(newLayer.id);
    },
    [pushUndo]
  );

  // Layer Update & Management
  const selectLayer = useCallback((id: string | null) => {
    setSelectedLayerId(id);
    setSelectedKeyframe(null);
  }, []);

  const updateLayer = useCallback(
    (id: string, updates: Partial<Layer>, skipSnapshot: boolean = false) => {
      if (!skipSnapshot) {
        pushUndo(false);
      }
      setLayers((prev) => prev.map((l) => (l.id === id ? { ...l, ...updates } : l)));
    },
    [pushUndo]
  );

  const deleteLayer = useCallback(
    (id: string) => {
      pushUndo(true);
      setLayers((prev) => {
        const next = prev.filter((l) => l.id !== id);
        if (selectedLayerIdRef.current === id) {
          setSelectedLayerId(next[0]?.id || null);
          setSelectedKeyframe(null);
        }
        return next;
      });
    },
    [pushUndo]
  );

  const duplicateLayer = useCallback(
    (id: string) => {
      pushUndo(true);
      setLayers((prev) => {
        const target = prev.find((l) => l.id === id);
        if (!target) return prev;
        const clone: Layer = JSON.parse(JSON.stringify(target));
        clone.id = uid(target.type);
        clone.name = `${target.name} Copy`;
        clone.keyframes.x.forEach((k) => (k.value += 20));
        clone.keyframes.y.forEach((k) => (k.value += 20));
        return [clone, ...prev];
      });
    },
    [pushUndo]
  );

  const reorderLayer = useCallback(
    (id: string, direction: 'up' | 'down') => {
      pushUndo(true);
      setLayers((prev) => {
        const idx = prev.findIndex((l) => l.id === id);
        if (idx === -1) return prev;
        const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
        if (targetIdx < 0 || targetIdx >= prev.length) return prev;

        const updated = [...prev];
        const item = updated.splice(idx, 1)[0];
        updated.splice(targetIdx, 0, item);
        return updated;
      });
    },
    [pushUndo]
  );

  const toggleLayerVisibility = useCallback(
    (id: string) => {
      pushUndo(true);
      setLayers((prev) => prev.map((l) => (l.id === id ? { ...l, visible: !l.visible } : l)));
    },
    [pushUndo]
  );

  // Keyframe Actions
  const setAnimPropValue = useCallback(
    (layerId: string, prop: AnimatableProp, value: number, skipSnapshot: boolean = false) => {
      if (!skipSnapshot) {
        pushUndo(false);
      }
      setLayers((prev) =>
        prev.map((l) => (l.id === layerId ? setOrUpdateKeyframe(l, prop, currentTime, value) : l))
      );
    },
    [currentTime, pushUndo]
  );

  const toggleKeyframe = useCallback(
    (layerId: string, prop: AnimatableProp) => {
      pushUndo(true);
      setLayers((prev) =>
        prev.map((layer) => {
          if (layer.id !== layerId) return layer;
          const kfs = layer.keyframes[prop];
          const idx = kfs.findIndex((k) => Math.abs(k.time - currentTime) < 0.04);
          if (idx !== -1 && kfs.length > 1) {
            return removeKeyframeAtIndex(layer, prop, idx);
          } else {
            const currentVal = getInterpolatedValue(layer, prop, currentTime);
            return setOrUpdateKeyframe(layer, prop, currentTime, currentVal);
          }
        })
      );
    },
    [currentTime, pushUndo]
  );

  const keyAllTransformProps = useCallback(
    (layerId: string) => {
      pushUndo(true);
      setLayers((prev) =>
        prev.map((layer) => {
          if (layer.id !== layerId) return layer;
          const tr = getLayerTransformAtTime(layer, currentTime);
          let updated = layer;
          (['x', 'y', 'scaleX', 'scaleY', 'rotation', 'opacity'] as AnimatableProp[]).forEach(
            (p) => {
              updated = setOrUpdateKeyframe(updated, p, currentTime, tr[p]);
            }
          );
          return updated;
        })
      );
    },
    [currentTime, pushUndo]
  );

  const selectKeyframe = useCallback((ref: SelectedKeyframeRef | null) => {
    setSelectedKeyframe(ref);
  }, []);

  const deleteSelectedKeyframe = useCallback(() => {
    if (!selectedKeyframe) return;
    pushUndo(true);
    const { layerId, prop, index } = selectedKeyframe;
    setLayers((prev) =>
      prev.map((l) => {
        if (l.id !== layerId) return l;
        return removeKeyframeAtIndex(l, prop, index);
      })
    );
    setSelectedKeyframe(null);
  }, [selectedKeyframe, pushUndo]);

  const moveKeyframeTime = useCallback(
    (
      layerId: string,
      prop: AnimatableProp,
      index: number,
      newTime: number,
      skipSnapshot: boolean = false
    ) => {
      if (!skipSnapshot) {
        pushUndo(false);
      }
      const rounded = Math.round(newTime * 20) / 20;
      setLayers((prev) =>
        prev.map((layer) => {
          if (layer.id !== layerId) return layer;
          const list = [...layer.keyframes[prop]];
          if (!list[index]) return layer;
          list[index] = { ...list[index], time: rounded };
          list.sort((a, b) => a.time - b.time);
          return {
            ...layer,
            keyframes: {
              ...layer.keyframes,
              [prop]: list,
            },
          };
        })
      );
    },
    [pushUndo]
  );

  // Template Loading
  const loadTemplate = useCallback(
    (templateId: string) => {
      pushUndo(true);
      const t = TEMPLATES.find((item) => item.id === templateId) || TEMPLATES[0];
      pausePlay();
      setDurationState(t.duration);
      setCanvasBg(t.canvasBg);
      const newLayers = t.createLayers();
      setLayers(newLayers);
      setSelectedLayerId(newLayers[0]?.id || null);
      setSelectedKeyframe(null);
      setCurrentTimeState(0);
    },
    [pausePlay, pushUndo]
  );

  const clearScene = useCallback(() => {
    pushUndo(true);
    pausePlay();
    setLayers([]);
    setSelectedLayerId(null);
    setSelectedKeyframe(null);
    setCurrentTimeState(0);
  }, [pausePlay, pushUndo]);

  // Video Export
  const startExport = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas || layers.length === 0) return;

    pausePlay();
    setSelectedKeyframe(null);
    exporterRef.current = new VideoExporter();

    setExportProgress({
      isExporting: true,
      progress: 0,
      currentSec: 0,
      totalSec: duration,
    });

    try {
      await exporterRef.current.exportVideo({
        canvas,
        layers,
        duration,
        canvasBg,
        onProgress: (pct, cur, total) => {
          setExportProgress({
            isExporting: true,
            progress: pct,
            currentSec: cur,
            totalSec: total,
          });
        },
        onComplete: () => {
          setExportProgress({
            isExporting: false,
            progress: 100,
            currentSec: duration,
            totalSec: duration,
          });
          setCurrentTimeState(0);
        },
        onError: (err) => {
          console.error('Export error:', err);
          setExportProgress({
            isExporting: false,
            progress: 0,
            currentSec: 0,
            totalSec: 0,
          });
          alert('Failed to export video: ' + err.message);
        },
      });
    } catch (e: unknown) {
      console.error(e);
      setExportProgress({
        isExporting: false,
        progress: 0,
        currentSec: 0,
        totalSec: 0,
      });
    }
  }, [layers, duration, canvasBg, pausePlay]);

  const cancelExport = useCallback(() => {
    if (exporterRef.current) {
      exporterRef.current.cancel();
      setExportProgress({
        isExporting: false,
        progress: 0,
        currentSec: 0,
        totalSec: 0,
      });
    }
  }, []);

  // Initialize scene layers: restore from localStorage if present, or load Bento Grid on first visit
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let initialLayers: Layer[] = [];
    const savedScene = localStorage.getItem('motionfx_scene_layers');

    if (savedScene) {
      try {
        const parsed = JSON.parse(savedScene);
        if (Array.isArray(parsed) && parsed.length > 0) {
          initialLayers = parsed;
        }
      } catch (err) {
        console.error('Failed to parse saved scene layers:', err);
      }
    }

    // Default to Bento Grid if no saved scene
    if (initialLayers.length === 0) {
      const defaultTemplate = TEMPLATES[0];
      initialLayers = defaultTemplate.createLayers();
      setDurationState(defaultTemplate.duration);
      setCanvasBg(defaultTemplate.canvasBg);
    }

    // Check if user exported a custom shape from /builder
    let selectedId = initialLayers[0]?.id || null;
    const importedRaw = localStorage.getItem('motionfx_import_shape');

    if (importedRaw) {
      try {
        const item = JSON.parse(importedRaw);
        if (item && item.pathData) {
          const customLayer: Layer = {
            id: uid('custom_shape'),
            name: item.name || 'Merged Custom Vector',
            type: 'shape',
            shapeType: 'custom',
            pathData: item.pathData,
            visible: true,
            width: Math.max(40, item.width || 180),
            height: Math.max(40, item.height || 180),
            fill: item.fill || '#6366f1',
            stroke: item.stroke || '#ffffff',
            borderWidth: 3,
            borderRadius: 0,
            borderStyle: 'solid',
            animateDash: false,
            easing: 'backOut',
            keyframes: {
              x: [{ time: 0, value: 400 }],
              y: [{ time: 0, value: 225 }],
              scaleX: [
                { time: 0, value: 0.1 },
                { time: 0.6, value: 1 },
              ],
              scaleY: [
                { time: 0, value: 0.1 },
                { time: 0.6, value: 1 },
              ],
              rotation: [
                { time: 0, value: -15 },
                { time: 0.6, value: 0 },
              ],
              opacity: [
                { time: 0, value: 0 },
                { time: 0.4, value: 1 },
              ],
            },
          };

          initialLayers = [customLayer, ...initialLayers];
          selectedId = customLayer.id;
          localStorage.removeItem('motionfx_import_shape');
        }
      } catch (err) {
        console.error('Failed to parse imported custom shape:', err);
      }
    }

    setLayers(initialLayers);
    setSelectedLayerId(selectedId);
    setSelectedKeyframe(null);
    setCurrentTimeState(0);
    localStorage.setItem('motionfx_scene_layers', JSON.stringify(initialLayers));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save layers whenever changed
  useEffect(() => {
    if (typeof window !== 'undefined' && layers.length > 0) {
      localStorage.setItem('motionfx_scene_layers', JSON.stringify(layers));
    }
  }, [layers]);

  return (
    <MotionContext.Provider
      value={{
        layers,
        selectedLayerId,
        selectedLayer,
        selectedKeyframe,
        currentTime,
        duration,
        isPlaying,
        isLooping,
        canvasBg,
        showGuides,
        exportProgress,
        canvasRef,
        addShape,
        addCustomShape,
        addText,
        addImage,
        selectLayer,
        updateLayer,
        deleteLayer,
        duplicateLayer,
        reorderLayer,
        toggleLayerVisibility,
        setAnimPropValue,
        toggleKeyframe,
        keyAllTransformProps,
        selectKeyframe,
        deleteSelectedKeyframe,
        moveKeyframeTime,
        setCurrentTime,
        setDuration,
        togglePlay,
        pausePlay,
        stopPlay,
        toggleLoop,
        seekToStart,
        setCanvasBg,
        setShowGuides,
        loadTemplate,
        clearScene,
        startExport,
        cancelExport,
        undo,
        redo,
        canUndo: undoStack.length > 0,
        canRedo: redoStack.length > 0,
        historyStepCount: undoStack.length,
        recordSnapshot,
        requestRender,
      }}
    >
      {children}
    </MotionContext.Provider>
  );
}

export function useMotion(): MotionContextType {
  const context = useContext(MotionContext);
  if (!context) {
    throw new Error('useMotion must be used within a MotionProvider');
  }
  return context;
}
