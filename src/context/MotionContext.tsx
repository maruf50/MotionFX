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
  Keyframe,
  ShapeType,
  AnimatableProp,
  SelectedKeyframeRef,
  ExportProgress,
  TextEffect,
  CanvasResolution,
  Composition,
} from '@/types/motion';
import {
  uid,
  getInterpolatedValue,
  getLayerTransformAtTime,
  getLayerWorldTransformAtTime,
  isDescendantOf,
  setOrUpdateKeyframe,
  removeKeyframeAtIndex,
} from '@/modules/keyframes/evaluator';
import { TEMPLATES } from '@/modules/templates';
import { VideoExporter } from '@/modules/export/videoExporter';
import { renderSceneAtTime, renderSingleLayerToCanvas } from '@/modules/renderers/engine';
import { DEFAULT_PATH_POINTS } from '@/modules/renderers/pathFollower';
import { STICKER_PRESETS } from '@/modules/assets/stickers';

interface MotionContextType {
  layers: Layer[];
  selectedLayerId: string | null;
  selectedLayerIds: string[];
  selectedLayer: Layer | null;
  selectedKeyframe: SelectedKeyframeRef | null;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  isLooping: boolean;
  canvasBg: string;
  showGuides: boolean;
  canvasResolution: CanvasResolution;
  isResolutionModalOpen: boolean;
  exportProgress: ExportProgress;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  editingTextLayerId: string | null;
  setEditingTextLayerId: (id: string | null) => void;
  // Canvas Resolution
  setCanvasResolution: (res: CanvasResolution, scaleLayers?: boolean) => void;
  setIsResolutionModalOpen: (open: boolean) => void;
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
  addSticker: (presetId?: string) => void;
  // Layer management & Multi-selection
  selectLayer: (id: string | null, isMulti?: boolean, isRange?: boolean) => void;
  selectMultipleLayers: (ids: string[]) => void;
  selectAllLayers: () => void;
  clearSelectedLayers: () => void;
  updateLayer: (id: string, updates: Partial<Layer>, skipSnapshot?: boolean) => void;
  deleteLayer: (id: string) => void;
  deleteLayersBatch: (ids: string[]) => void;
  duplicateLayer: (id: string) => void;
  reorderLayer: (id: string, direction: 'up' | 'down') => void;
  toggleLayerVisibility: (id: string) => void;
  // Layer timeline trimming, moving & splitting (After Effects style)
  trimLayer: (id: string, startTime: number, endTime: number, skipSnapshot?: boolean) => void;
  moveLayerTime: (id: string, dt: number, skipSnapshot?: boolean) => void;
  splitLayerAtCurrentTime: (layerId?: string) => void;
  trimLayerInToCurrentTime: (layerId?: string) => void;
  trimLayerOutToCurrentTime: (layerId?: string) => void;
  // Top-level Layer Transitions (Fade In/Out & Scale In/Out)
  toggleFadeInOut: (layerId?: string, durationSec?: number) => void;
  toggleScaleInOut: (layerId?: string, durationSec?: number) => void;
  // Parenting & Grouping hierarchy
  setLayerParent: (layerId: string, parentId: string | null) => void;
  createGroup: (name?: string, layerIds?: string[]) => string;
  addLayersToGroup: (groupId: string, layerIds?: string[]) => void;
  removeLayersFromGroup: (layerIds?: string[]) => void;
  ungroupLayer: (groupId: string) => void;
  toggleGroupExpand: (groupId: string) => void;
  // Drag-and-drop layer reordering
  reorderLayersBatch: (sourceIndex: number, targetIndex: number) => void;
  // Auto Keyframe
  isAutoKeyframe: boolean;
  toggleAutoKeyframe: () => void;
  setIsAutoKeyframe: (val: boolean) => void;
  // Keyframes
  setAnimPropValue: (
    layerId: string,
    prop: AnimatableProp,
    value: number,
    skipSnapshot?: boolean
  ) => void;
  toggleKeyframe: (layerId: string, prop: AnimatableProp) => void;
  addStartAndEndKeyframes: (
    layerId: string,
    prop: AnimatableProp,
    startVal?: number,
    endVal?: number,
    durationSec?: number
  ) => void;
  keyAllTransformProps: (layerId: string) => void;
  selectedKeyframes: SelectedKeyframeRef[];
  selectKeyframe: (ref: SelectedKeyframeRef | null, multi?: boolean) => void;
  selectMultipleKeyframes: (refs: SelectedKeyframeRef[]) => void;
  clearSelectedKeyframes: () => void;
  deleteSelectedKeyframe: () => void;
  deleteSelectedKeyframes: () => void;
  deleteAllKeyframes: (layerId: string) => void;
  moveKeyframeTime: (
    layerId: string,
    prop: AnimatableProp,
    index: number,
    newTime: number,
    skipSnapshot?: boolean
  ) => void;
  moveMultipleKeyframes: (
    moves: { layerId: string; prop: AnimatableProp; index: number; newTime: number }[],
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
  // Snapping
  isSnappingEnabled: boolean;
  setIsSnappingEnabled: (val: boolean) => void;
  toggleSnapping: () => void;
  // Merging & Custom Pen
  mergeSelectedLayers: (layerIds?: string[]) => void;
  addCustomPenShape: () => void;
  // Multi-Composition Management
  compositions: Composition[];
  activeCompositionId: string;
  activeCompositionName: string;
  createBlankComposition: (name?: string) => void;
  switchComposition: (id: string) => void;
  deleteComposition: (id: string) => void;
  renameComposition: (id: string, name: string) => void;
  // Templates & Scene
  loadTemplate: (templateId: string, openInNewComp?: boolean) => void;
  importTemplateLayer: (
    templateLayer: Layer,
    atTime?: number,
    atPos?: { x: number; y: number }
  ) => void;
  importTemplateAsGroup: (templateId: string, customGroupName?: string) => void;
  importAllTemplatesAsGroups: () => void;
  clearScene: () => void;
  // Shape Builder Studio
  isBuildShapeModalOpen: boolean;
  setIsBuildShapeModalOpen: (open: boolean) => void;
  addCustomShapeLayer: (shape: {
    name: string;
    pathData: string;
    width: number;
    height: number;
    fill: string;
    stroke: string;
    borderWidth?: number;
  }) => void;
  // Export Settings & FPS
  exportFps: number;
  setExportFps: (fps: number) => void;
  isExportSettingsOpen: boolean;
  setIsExportSettingsOpen: (open: boolean) => void;
  // Export
  startExport: (customFps?: number) => void;
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
  selectedLayerIds?: string[];
  duration?: number;
  canvasBg?: string;
  canvasResolution?: CanvasResolution;
}

const PALETTE = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#06b6d4', '#8b5cf6', '#f43f5e'];

/**
 * Scales an SVG path string's coordinates by sx and sy.
 */
export function scaleSvgPath(d: string, sx: number, sy: number): string {
  if (!d) return d;
  return d.replace(/([a-df-z])\s*([^a-df-z]*)/gi, (match, cmd, argsStr) => {
    const upperCmd = cmd.toUpperCase();
    if (upperCmd === 'Z') return match;

    const rawNums = argsStr.match(/-?\d+(?:\.\d+)?(?:e[+-]?\d+)?/gi);
    if (!rawNums || rawNums.length === 0) return match;
    const nums = rawNums.map(Number);

    if (upperCmd === 'H') {
      return `${cmd} ${nums.map((x: number) => (x * sx).toFixed(1)).join(' ')} `;
    }
    if (upperCmd === 'V') {
      return `${cmd} ${nums.map((y: number) => (y * sy).toFixed(1)).join(' ')} `;
    }
    if (upperCmd === 'M' || upperCmd === 'L' || upperCmd === 'T') {
      const parts: string[] = [];
      for (let i = 0; i < nums.length; i += 2) {
        if (i + 1 < nums.length) {
          parts.push(`${(nums[i] * sx).toFixed(1)} ${(nums[i + 1] * sy).toFixed(1)}`);
        }
      }
      return `${cmd} ${parts.join(' ')} `;
    }
    if (upperCmd === 'C') {
      const parts: string[] = [];
      for (let i = 0; i < nums.length; i += 6) {
        if (i + 5 < nums.length) {
          const cp1x = (nums[i] * sx).toFixed(1);
          const cp1y = (nums[i + 1] * sy).toFixed(1);
          const cp2x = (nums[i + 2] * sx).toFixed(1);
          const cp2y = (nums[i + 3] * sy).toFixed(1);
          const x = (nums[i + 4] * sx).toFixed(1);
          const y = (nums[i + 5] * sy).toFixed(1);
          parts.push(`${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x} ${y}`);
        }
      }
      return `${cmd} ${parts.join(' ')} `;
    }
    if (upperCmd === 'S' || upperCmd === 'Q') {
      const parts: string[] = [];
      for (let i = 0; i < nums.length; i += 4) {
        if (i + 3 < nums.length) {
          parts.push(
            `${(nums[i] * sx).toFixed(1)} ${(nums[i + 1] * sy).toFixed(1)}, ${(nums[i + 2] * sx).toFixed(1)} ${(nums[i + 3] * sy).toFixed(1)}`
          );
        }
      }
      return `${cmd} ${parts.join(' ')} `;
    }
    if (upperCmd === 'A') {
      const parts: string[] = [];
      for (let i = 0; i < nums.length; i += 7) {
        if (i + 6 < nums.length) {
          const rx = (nums[i] * sx).toFixed(1);
          const ry = (nums[i + 1] * sy).toFixed(1);
          const xRot = nums[i + 2];
          const largeArc = nums[i + 3];
          const sweep = nums[i + 4];
          const x = (nums[i + 5] * sx).toFixed(1);
          const y = (nums[i + 6] * sy).toFixed(1);
          parts.push(`${rx} ${ry} ${xRot} ${largeArc} ${sweep} ${x} ${y}`);
        }
      }
      return `${cmd} ${parts.join(' ')} `;
    }
    return match;
  });
}

/**
 * Proportionally scales a layer's dimensions, keyframes, border width, corner radius,
 * font size, and vector path data so that visual ratios and object shapes are identically
 * preserved across all resolutions and aspect ratios without distortion.
 */
export function scaleLayerToResolution(
  layer: Layer,
  scaleX: number,
  scaleY: number,
  oldRes?: CanvasResolution,
  newRes?: CanvasResolution
): Layer {
  // Use geometric mean of scaleX and scaleY (reversible isotropic scaling factor)
  // This guarantees two critical properties:
  // 1. Aspect ratios and shapes are strictly preserved (width, height, and vectors scale by the same factor).
  // 2. Reversibility: switching resolutions back and forth has a net multiplier of exactly 1.0
  //    (sqrt(sx*sy) * sqrt((1/sx)*(1/sy)) == 1.0). Objects will NEVER shrink or grow when toggling resolutions.
  const uniformScale = Math.sqrt(Math.max(0.0001, scaleX * scaleY));

  const hasRes = !!(oldRes && newRes && oldRes.width > 0 && oldRes.height > 0);
  const oldMidX = hasRes ? oldRes.width / 2 : 0;
  const newMidX = hasRes ? newRes.width / 2 : 0;
  const oldMidY = hasRes ? oldRes.height / 2 : 0;
  const newMidY = hasRes ? newRes.height / 2 : 0;

  const newKeyframes = { ...layer.keyframes };
  if (newKeyframes.x) {
    newKeyframes.x = newKeyframes.x.map((kf) => ({
      ...kf,
      value: hasRes
        ? Math.round(newMidX + (kf.value - oldMidX) * uniformScale)
        : Math.round(kf.value * uniformScale),
    }));
  }
  if (newKeyframes.y) {
    newKeyframes.y = newKeyframes.y.map((kf) => ({
      ...kf,
      value: hasRes
        ? Math.round(newMidY + (kf.value - oldMidY) * uniformScale)
        : Math.round(kf.value * uniformScale),
    }));
  }

  const newW = Math.max(1, Math.round(layer.width * uniformScale));
  const newH =
    layer.width === layer.height
      ? newW
      : Math.max(1, Math.round(layer.height * uniformScale));

  const updated: Layer = {
    ...layer,
    width: newW,
    height: newH,
    keyframes: newKeyframes,
  };

  // Preserve border width ratio across resolutions (prevent borders from shrinking)
  if (typeof layer.borderWidth === 'number' && layer.borderWidth > 0) {
    updated.borderWidth = Math.max(1, Math.round(layer.borderWidth * uniformScale));
  }

  // Preserve border radius (rounded corner curvature)
  if (typeof layer.borderRadius === 'number' && layer.borderRadius > 0) {
    updated.borderRadius = Math.max(0, Math.round(layer.borderRadius * uniformScale));
  }

  // Preserve typography scale
  if (layer.fontSize) {
    updated.fontSize = Math.max(8, Math.round(layer.fontSize * uniformScale));
  }

  // Preserve custom vector path coordinates uniformly (no non-uniform warping)
  if (layer.pathData) {
    updated.pathData = scaleSvgPath(layer.pathData, uniformScale, uniformScale);
  }

  // Preserve vector path follower points uniformly
  if (layer.pathPoints && layer.pathPoints.length > 0) {
    updated.pathPoints = layer.pathPoints.map((p) => ({
      x: Math.round(p.x * uniformScale),
      y: Math.round(p.y * uniformScale),
      cp1x: p.cp1x !== undefined ? Math.round(p.cp1x * uniformScale) : undefined,
      cp1y: p.cp1y !== undefined ? Math.round(p.cp1y * uniformScale) : undefined,
      cp2x: p.cp2x !== undefined ? Math.round(p.cp2x * uniformScale) : undefined,
      cp2y: p.cp2y !== undefined ? Math.round(p.cp2y * uniformScale) : undefined,
    }));
  }

  // Preserve path track width & follower size
  if (typeof layer.pathTrackWidth === 'number') {
    updated.pathTrackWidth = Math.max(1, Math.round(layer.pathTrackWidth * uniformScale));
  }
  if (typeof layer.followerSize === 'number') {
    updated.followerSize = Math.max(4, Math.round(layer.followerSize * uniformScale));
  }

  // Preserve branching metrics & custom endpoints
  if (typeof layer.branchLength === 'number') {
    updated.branchLength = Math.max(10, Math.round(layer.branchLength * uniformScale));
  }
  if (typeof layer.branchTrunkLength === 'number') {
    updated.branchTrunkLength = Math.max(10, Math.round(layer.branchTrunkLength * uniformScale));
  }
  if (typeof layer.branchSpread === 'number') {
    updated.branchSpread = Math.max(10, Math.round(layer.branchSpread * uniformScale));
  }
  if (typeof layer.branchEndSize === 'number') {
    updated.branchEndSize = Math.max(4, Math.round(layer.branchEndSize * uniformScale));
  }
  if (layer.branchEndpoints && layer.branchEndpoints.length > 0) {
    updated.branchEndpoints = layer.branchEndpoints.map((p) => ({
      x: Math.round(p.x * uniformScale),
      y: Math.round(p.y * uniformScale),
    }));
  }

  // Preserve bar metrics
  if (typeof layer.barFontSize === 'number') {
    updated.barFontSize = Math.max(8, Math.round(layer.barFontSize * uniformScale));
  }
  if (typeof layer.barThickness === 'number') {
    updated.barThickness = Math.max(2, Math.round(layer.barThickness * uniformScale));
  }

  // Preserve array matrix metrics
  if (typeof layer.arrayItemSize === 'number') {
    updated.arrayItemSize = Math.max(4, Math.round(layer.arrayItemSize * uniformScale));
  }
  if (typeof layer.arrayGap === 'number') {
    updated.arrayGap = Math.max(0, Math.round(layer.arrayGap * uniformScale));
  }
  if (typeof layer.arrayItemBorderWidth === 'number') {
    updated.arrayItemBorderWidth = Math.max(0, Math.round(layer.arrayItemBorderWidth * uniformScale));
  }

  // Preserve card metrics
  if (typeof layer.cardBorderRadius === 'number') {
    updated.cardBorderRadius = Math.max(0, Math.round(layer.cardBorderRadius * uniformScale));
  }
  if (typeof layer.cardBorderWidth === 'number') {
    updated.cardBorderWidth = Math.max(0, Math.round(layer.cardBorderWidth * uniformScale));
  }
  if (typeof layer.cardSpread === 'number') {
    updated.cardSpread = Math.round(layer.cardSpread * uniformScale);
  }
  if (layer.cardItems && layer.cardItems.length > 0) {
    updated.cardItems = layer.cardItems.map((item) => ({
      ...item,
      borderWidth:
        typeof item.borderWidth === 'number'
          ? Math.max(0, Math.round(item.borderWidth * uniformScale))
          : item.borderWidth,
      borderRadius:
        typeof item.borderRadius === 'number'
          ? Math.max(0, Math.round(item.borderRadius * uniformScale))
          : item.borderRadius,
    }));
  }

  // Preserve pathDraw metrics
  if (typeof layer.pathDrawStrokeWidth === 'number') {
    updated.pathDrawStrokeWidth = Math.max(1, Math.round(layer.pathDrawStrokeWidth * uniformScale));
  }
  if (typeof layer.pathDrawTextFontSize === 'number') {
    updated.pathDrawTextFontSize = Math.max(8, Math.round(layer.pathDrawTextFontSize * uniformScale));
  }

  // Preserve button metrics
  if (typeof layer.btnFontSize === 'number') {
    updated.btnFontSize = Math.max(8, Math.round(layer.btnFontSize * uniformScale));
  }
  if (typeof layer.btnSubtextSize === 'number') {
    updated.btnSubtextSize = Math.max(6, Math.round(layer.btnSubtextSize * uniformScale));
  }
  if (typeof layer.btnBorderRadius === 'number') {
    updated.btnBorderRadius = Math.max(0, Math.round(layer.btnBorderRadius * uniformScale));
  }
  if (typeof layer.btnBorderWidth === 'number') {
    updated.btnBorderWidth = Math.max(0, Math.round(layer.btnBorderWidth * uniformScale));
  }

  // Preserve cursor metrics
  if (typeof layer.cursorSize === 'number') {
    updated.cursorSize = Math.max(8, Math.round(layer.cursorSize * uniformScale));
  }

  return updated;
}

export function MotionProvider({ children }: { children: React.ReactNode }) {
  const [layers, setLayers] = useState<Layer[]>([]);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [editingTextLayerId, setEditingTextLayerId] = useState<string | null>(null);
  const [selectedLayerIds, setSelectedLayerIdsState] = useState<string[]>([]);
  const [selectedKeyframe, setSelectedKeyframe] = useState<SelectedKeyframeRef | null>(null);
  const [selectedKeyframes, setSelectedKeyframes] = useState<SelectedKeyframeRef[]>([]);
  const [isAutoKeyframe, setIsAutoKeyframeState] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        return localStorage.getItem('motionfx_auto_keyframe') === 'true';
      } catch {
        return false;
      }
    }
    return false;
  });

  const toggleAutoKeyframe = useCallback(() => {
    setIsAutoKeyframeState((prev) => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('motionfx_auto_keyframe', String(next));
        } catch {}
      }
      return next;
    });
  }, []);

  const setIsAutoKeyframe = useCallback((val: boolean) => {
    setIsAutoKeyframeState(val);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('motionfx_auto_keyframe', String(val));
      } catch {}
    }
  }, []);
  const [isSnappingEnabled, setIsSnappingEnabledState] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('motionfx_snapping_enabled');
        return saved !== null ? saved === 'true' : true;
      } catch {
        return true;
      }
    }
    return true;
  });

  const toggleSnapping = useCallback(() => {
    setIsSnappingEnabledState((prev) => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('motionfx_snapping_enabled', String(next));
        } catch {}
      }
      return next;
    });
  }, []);

  const setIsSnappingEnabled = useCallback((val: boolean) => {
    setIsSnappingEnabledState(val);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('motionfx_snapping_enabled', String(val));
      } catch {}
    }
  }, []);

  const [currentTime, setCurrentTimeState] = useState<number>(0);
  const [duration, setDurationState] = useState<number>(5.0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isLooping, setIsLooping] = useState<boolean>(true);
  const [canvasBg, setCanvasBg] = useState<string>('#090b10');
  const [showGuides, setShowGuides] = useState<boolean>(true);
  const [canvasResolution, setCanvasResolutionState] = useState<CanvasResolution>({
    width: 800,
    height: 450,
  });
  const [isResolutionModalOpen, setIsResolutionModalOpen] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<ExportProgress>({
    isExporting: false,
    progress: 0,
    currentSec: 0,
    totalSec: 0,
    fps: 60,
  });

  // Compositions State
  const [compositions, setCompositions] = useState<Composition[]>([
    {
      id: 'comp_default',
      name: 'Blank Composition',
      layers: [],
      duration: 5.0,
      canvasBg: '#090b10',
      resolution: { width: 800, height: 450 },
      createdAt: Date.now(),
    },
  ]);
  const [activeCompId, setActiveCompId] = useState<string>('comp_default');
  const compositionsRef = useRef<Composition[]>(compositions);
  const activeCompIdRef = useRef<string>(activeCompId);
  compositionsRef.current = compositions;
  activeCompIdRef.current = activeCompId;

  const activeCompositionName = useMemo(() => {
    const active = compositions.find((c) => c.id === activeCompId);
    return active ? active.name : 'Blank Composition';
  }, [compositions, activeCompId]);

  const persistCompositions = useCallback((comps: Composition[], currentActiveId: string) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('motionfx_compositions', JSON.stringify(comps));
        localStorage.setItem('motionfx_active_comp_id', currentActiveId);
      } catch (e) {
        console.warn('Failed to persist compositions:', e);
      }
    }
  }, []);

  const [exportFps, setExportFpsState] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('motionfx_export_fps');
        if (saved) {
          const parsed = parseInt(saved, 10);
          if (parsed === 60 || parsed === 120 || parsed === 30) return parsed;
        }
      } catch {
        // ignore
      }
    }
    return 60;
  });

  const setExportFps = useCallback((fps: number) => {
    setExportFpsState(fps);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('motionfx_export_fps', String(fps));
      } catch {
        // ignore
      }
    }
  }, []);

  const [isExportSettingsOpen, setIsExportSettingsOpen] = useState<boolean>(false);
  const [isBuildShapeModalOpen, setIsBuildShapeModalOpen] = useState<boolean>(false);

  // 50-step Undo / Redo History Stacks
  const [undoStack, setUndoStack] = useState<HistorySnapshot[]>([]);
  const [redoStack, setRedoStack] = useState<HistorySnapshot[]>([]);

  // Refs for tracking synchronous state without stale closures
  const layersRef = useRef<Layer[]>(layers);
  layersRef.current = layers;
  const selectedLayerIdRef = useRef<string | null>(selectedLayerId);
  selectedLayerIdRef.current = selectedLayerId;
  const selectedLayerIdsRef = useRef<string[]>(selectedLayerIds);
  selectedLayerIdsRef.current = selectedLayerIds;
  const durationRef = useRef<number>(duration);
  durationRef.current = duration;
  const canvasBgRef = useRef<string>(canvasBg);
  canvasBgRef.current = canvasBg;
  const canvasResolutionRef = useRef<CanvasResolution>(canvasResolution);
  canvasResolutionRef.current = canvasResolution;
  const lastSnapshotTimeRef = useRef<number>(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const exporterRef = useRef<VideoExporter | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const currentTimeRef = useRef<number>(0);
  currentTimeRef.current = currentTime;

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
      selectedLayerIds: [...selectedLayerIdsRef.current],
      duration: durationRef.current,
      canvasBg: canvasBgRef.current,
      canvasResolution: { ...canvasResolutionRef.current },
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
        selectedLayerIds: [...selectedLayerIdsRef.current],
        duration: durationRef.current,
        canvasBg: canvasBgRef.current,
        canvasResolution: { ...canvasResolutionRef.current },
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
      if (targetSnapshot.selectedLayerIds) {
        setSelectedLayerIdsState(targetSnapshot.selectedLayerIds);
      } else {
        setSelectedLayerIdsState(
          targetSnapshot.selectedLayerId ? [targetSnapshot.selectedLayerId] : []
        );
      }
      if (targetSnapshot.duration !== undefined) setDurationState(targetSnapshot.duration);
      if (targetSnapshot.canvasBg !== undefined) setCanvasBg(targetSnapshot.canvasBg);
      if (targetSnapshot.canvasResolution) {
        setCanvasResolutionState(targetSnapshot.canvasResolution);
        try {
          localStorage.setItem(
            'motionfx_canvas_resolution',
            JSON.stringify(targetSnapshot.canvasResolution)
          );
        } catch { }
      }
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
        selectedLayerIds: [...selectedLayerIdsRef.current],
        duration: durationRef.current,
        canvasBg: canvasBgRef.current,
        canvasResolution: { ...canvasResolutionRef.current },
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
      if (targetSnapshot.selectedLayerIds) {
        setSelectedLayerIdsState(targetSnapshot.selectedLayerIds);
      } else {
        setSelectedLayerIdsState(
          targetSnapshot.selectedLayerId ? [targetSnapshot.selectedLayerId] : []
        );
      }
      if (targetSnapshot.duration !== undefined) setDurationState(targetSnapshot.duration);
      if (targetSnapshot.canvasBg !== undefined) setCanvasBg(targetSnapshot.canvasBg);
      if (targetSnapshot.canvasResolution) {
        setCanvasResolutionState(targetSnapshot.canvasResolution);
        try {
          localStorage.setItem(
            'motionfx_canvas_resolution',
            JSON.stringify(targetSnapshot.canvasResolution)
          );
        } catch { }
      }
      setSelectedKeyframe(null);

      return nextRedo;
    });
  }, []);


  // Change canvas resolution with proportional layer & border scaling
  const setCanvasResolution = useCallback(
    (newRes: CanvasResolution, scaleLayers: boolean = true) => {
      const validWidth = Math.max(100, Math.min(7680, Math.round(newRes.width) || 800));
      const validHeight = Math.max(100, Math.min(4320, Math.round(newRes.height) || 450));
      const finalized: CanvasResolution = { width: validWidth, height: validHeight };

      pushUndo(true);

      const oldRes = canvasResolutionRef.current;
      if (scaleLayers && oldRes.width > 0 && oldRes.height > 0) {
        const scaleX = validWidth / oldRes.width;
        const scaleY = validHeight / oldRes.height;

        setLayers((prevLayers) =>
          prevLayers.map((layer) => scaleLayerToResolution(layer, scaleX, scaleY, oldRes, finalized))
        );
      }

      setCanvasResolutionState(finalized);
      try {
        localStorage.setItem('motionfx_canvas_resolution', JSON.stringify(finalized));
      } catch (err) {
        console.warn('Failed to save resolution to localStorage:', err);
      }
    },
    [pushUndo]
  );

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
        editingTextLayerId,
      });
    },
    [layers, duration, canvasBg, showGuides, selectedLayerId, exportProgress.isExporting, editingTextLayerId]
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
      const valid = Math.max(0.5, Math.min(300, Math.round(d * 100) / 100 || 5.0));
      pushUndo(true);
      setDurationState(valid);
      if (currentTime > valid) setCurrentTimeState(valid);
      try {
        localStorage.setItem('motionfx_duration', valid.toString());
      } catch {}
    },
    [currentTime, pushUndo]
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
      const dt = Math.min(0.1, (now - lastTimeRef.current) / 1000);
      lastTimeRef.current = now;

      let nextTime = currentTimeRef.current + dt;
      let shouldStop = false;

      if (nextTime >= duration) {
        if (isLooping) {
          nextTime = 0;
        } else {
          nextTime = duration;
          shouldStop = true;
        }
      }

      currentTimeRef.current = nextTime;
      setCurrentTimeState(nextTime);

      if (shouldStop) {
        setIsPlaying(false);
      } else {
        animationFrameRef.current = requestAnimationFrame(loop);
      }
    };

    animationFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [isPlaying, duration, isLooping]);

  // Playback Controls
  const togglePlay = useCallback(() => {
    if (!isPlaying && currentTimeRef.current >= duration) {
      currentTimeRef.current = 0;
      setCurrentTimeState(0);
    }
    setIsPlaying((prev) => !prev);
  }, [isPlaying, duration]);

  const pausePlay = useCallback(() => setIsPlaying(false), []);

  const stopPlay = useCallback(() => {
    setIsPlaying(false);
    currentTimeRef.current = 0;
    setCurrentTimeState(0);
  }, []);

  const seekToStart = useCallback(() => {
    currentTimeRef.current = 0;
    setCurrentTimeState(0);
  }, []);

  const toggleLoop = useCallback(() => setIsLooping((v) => !v), []);

  // Layer Creation Functions
  const addShape = useCallback(
    (shapeType: ShapeType) => {
      pushUndo(true);
      const res = canvasResolutionRef.current;
      const sx = res.width / 800;
      const sy = res.height / 450;
      const us = Math.sqrt(sx * sy);
      const centerX = Math.round(res.width / 2);
      const centerY = Math.round(res.height / 2);
      const offset = (layers.length % 5) * Math.round(20 * us);
      const color = PALETTE[layers.length % PALETTE.length];

      let baseW = 130;
      let baseH = 130;
      let baseBorderW = 3;
      let baseRadius = 8;
      let layerName = `${shapeType.charAt(0).toUpperCase() + shapeType.slice(1)} ${layers.length + 1}`;

      if (shapeType === 'line') {
        baseW = 220;
        baseH = 24;
        baseBorderW = 4;
        baseRadius = 0;
      } else if (shapeType === 'rect') {
        baseW = 160;
        baseH = 120;
        baseRadius = 24;
      } else if (shapeType === 'pill') {
        baseW = 180;
        baseH = 90;
      } else if (shapeType === 'bar') {
        baseW = 280;
        baseH = 40;
        baseRadius = 14;
        baseBorderW = 2;
        layerName = `Progress Bar ${layers.length + 1}`;
      } else if (shapeType === 'branching') {
        baseW = 260;
        baseH = 160;
        baseBorderW = 3;
        layerName = `Branching Tree ${layers.length + 1}`;
      } else if (shapeType === 'pathFollower') {
        baseW = 340;
        baseH = 160;
        baseBorderW = 2;
        layerName = `Move Along Path ${layers.length + 1}`;
      } else if (shapeType === 'array') {
        baseW = 220;
        baseH = 180;
        baseBorderW = 2;
        layerName = `Array Matrix ${layers.length + 1}`;
      } else if (shapeType === 'card') {
        baseW = 240;
        baseH = 150;
        baseBorderW = 2;
        layerName = `Card Stack ${layers.length + 1}`;
      } else if (shapeType === 'pathDraw') {
        baseW = 320;
        baseH = 140;
        baseBorderW = 3;
        layerName = `Path Draw ${layers.length + 1}`;
      } else if (shapeType === 'button') {
        baseW = 160;
        baseH = 48;
        baseBorderW = 1;
        layerName = `Motion Button ${layers.length + 1}`;
      } else if (shapeType === 'cursor') {
        baseW = 160;
        baseH = 120;
        baseBorderW = 1;
        layerName = `Motion Cursor ${layers.length + 1}`;
      } else if (shapeType === 'custom') {
        baseW = 200;
        baseH = 160;
        baseBorderW = 2;
        layerName = `Custom Pen Shape ${layers.length + 1}`;
      }

      const newLayer: Layer = {
        id: uid(`shape_${shapeType}`),
        name: layerName,
        type: 'shape',
        shapeType,
        visible: true,
        width: Math.max(10, Math.round(baseW * sx)),
        height: Math.max(10, Math.round(baseH * sy)),
        sides: shapeType === 'star' ? 5 : shapeType === 'polygon' ? 6 : undefined,
        fill: shapeType === 'line' ? 'transparent' : color,
        stroke:
          shapeType === 'line'
            ? color
            : shapeType === 'bar'
            ? 'transparent'
            : shapeType === 'branching'
            ? color
            : '#ffffff',
        borderWidth: Math.max(1, Math.round(baseBorderW * us)),
        borderRadius: Math.max(0, Math.round(baseRadius * us)),
        borderStyle: 'solid',
        animateDash: false,
        easing: 'easeOutCubic',
        // Bar defaults
        barPercentage: shapeType === 'bar' ? 75 : undefined,
        barShape: shapeType === 'bar' ? 'horizontal' : undefined,
        barTrackColor: shapeType === 'bar' ? 'rgba(255, 255, 255, 0.12)' : undefined,
        barFillColor: shapeType === 'bar' ? color : undefined,
        barShowLabel: shapeType === 'bar' ? true : undefined,
        barLabelColor: shapeType === 'bar' ? '#ffffff' : undefined,
        barFontSize: shapeType === 'bar' ? 13 : undefined,
        barThickness: shapeType === 'bar' ? 14 : undefined,
        // Branching defaults
        branchCount: shapeType === 'branching' ? 4 : undefined,
        branchLength: shapeType === 'branching' ? 130 : undefined,
        branchSpread: shapeType === 'branching' ? 130 : undefined,
        branchPosition: shapeType === 'branching' ? 0 : undefined,
        branchTrunkLength: shapeType === 'branching' ? 50 : undefined,
        branchCurvature: shapeType === 'branching' ? 'curved' : undefined,
        branchDirection: shapeType === 'branching' ? 'right' : undefined,
        branchEndShape: shapeType === 'branching' ? 'circle' : undefined,
        branchEndSize: shapeType === 'branching' ? 8 : undefined,
        branchAnimated: shapeType === 'branching' ? true : undefined,
        branchAnimDuration: shapeType === 'branching' ? 2.5 : undefined,
        branchAnimLoop: shapeType === 'branching' ? 'loop' : undefined,
        // Path Follower, Path Curve & Pen Custom Shape defaults
        pathPoints: (shapeType === 'pathFollower' || shapeType === 'pathDraw' || shapeType === 'cursor')
          ? DEFAULT_PATH_POINTS.map((p) => ({ ...p }))
          : shapeType === 'custom'
          ? [
              { x: -50, y: 35 },
              { x: 0, y: -45, cp1x: -30, cp1y: -45, cp2x: -15, cp2y: -45 },
              { x: 50, y: 35, cp1x: 15, cp1y: -45, cp2x: 30, cp2y: 35 },
            ]
          : undefined,
        pathClosed: shapeType === 'custom' ? true : undefined,
        isPenEditing: shapeType === 'custom' ? true : undefined,
        followerCount: shapeType === 'pathFollower' ? 5 : undefined,
        followerType: shapeType === 'pathFollower' ? 'circle' : undefined,
        followerSize: shapeType === 'pathFollower' ? 22 : undefined,
        followerColor: shapeType === 'pathFollower' ? color : undefined,
        followerSpeed: shapeType === 'pathFollower' ? 3.0 : undefined,
        followerSpacing: shapeType === 'pathFollower' ? 0.14 : undefined,
        followerFadeStart: shapeType === 'pathFollower' ? 0.75 : undefined,
        followerFadeIn: shapeType === 'pathFollower' ? true : undefined,
        followerScaleDown: shapeType === 'pathFollower' ? true : undefined,
        followerOrientToPath: shapeType === 'pathFollower' ? true : undefined,
        showPathTrack: shapeType === 'pathFollower' ? true : undefined,
        pathTrackColor: shapeType === 'pathFollower' ? 'rgba(99, 102, 241, 0.4)' : undefined,
        pathTrackWidth: shapeType === 'pathFollower' ? 2.5 : undefined,
        pathTrackDashed: shapeType === 'pathFollower' ? true : undefined,
        // Array Matrix defaults
        arrayRows: shapeType === 'array' ? 4 : undefined,
        arrayCols: shapeType === 'array' ? 5 : undefined,
        arrayGap: shapeType === 'array' ? 14 : undefined,
        arrayShape: shapeType === 'array' ? 'circle' : undefined,
        arrayItemSize: shapeType === 'array' ? 22 : undefined,
        arrayCustomEmoji: shapeType === 'array' ? '⚡' : undefined,
        arrayAnimType: shapeType === 'array' ? 'pop' : undefined,
        arrayAnimDuration: shapeType === 'array' ? 2.5 : undefined,
        arrayAnimStagger: shapeType === 'array' ? 0.08 : undefined,
        arrayAnimLoop: shapeType === 'array' ? 'loop' : undefined,
        arrayRandomColor: shapeType === 'array' ? true : undefined,
        arrayItemBorderWidth: shapeType === 'array' ? 0 : undefined,
        arrayItemBorderColor: shapeType === 'array' ? '#ffffff' : undefined,
        arrayRandomSize: shapeType === 'array' ? false : undefined,
        arraySizeVariance: shapeType === 'array' ? 0.35 : undefined,
        arrayRandomRotation: shapeType === 'array' ? false : undefined,
        arrayItemRotation: shapeType === 'array' ? 0 : undefined,
        arrayElements: shapeType === 'array' ? [] : undefined,
        arrayElementSpawnMode: shapeType === 'array' ? 'cycle' : undefined,
        // Card Stack defaults
        cardCount: shapeType === 'card' ? 3 : undefined,
        cardTitle: shapeType === 'card' ? 'Motion Card' : undefined,
        cardSubtitle: shapeType === 'card' ? 'Interactive Card Stack' : undefined,
        cardBadge: shapeType === 'card' ? 'FEATURED' : undefined,
        cardAnimType: shapeType === 'card' ? 'fan' : undefined,
        cardAnimDuration: shapeType === 'card' ? 3.0 : undefined,
        cardSpread: shapeType === 'card' ? 24 : undefined,
        cardBorderRadius: shapeType === 'card' ? 16 : undefined,
        cardColor: shapeType === 'card' ? '#181822' : undefined,
        // Path Draw defaults
        pathDrawType: shapeType === 'pathDraw' ? 'wave' : undefined,
        pathDrawStrokeWidth: shapeType === 'pathDraw' ? 4 : undefined,
        pathDrawColor: shapeType === 'pathDraw' ? color : undefined,
        pathDrawDashed: shapeType === 'pathDraw' ? false : undefined,
        pathDrawArrow: shapeType === 'pathDraw' ? true : undefined,
        pathDrawAnimated: shapeType === 'pathDraw' ? true : undefined,
        pathDrawDuration: shapeType === 'pathDraw' ? 2.5 : undefined,
        pathDrawText: shapeType === 'pathDraw' ? 'CREATIVE MOTION' : undefined,
        pathDrawTextFontSize: shapeType === 'pathDraw' ? 13 : undefined,
        pathDrawTextColor: shapeType === 'pathDraw' ? '#ffffff' : undefined,
        pathDrawTextAnimation: shapeType === 'pathDraw' ? 'reveal' : undefined,
        // Button defaults
        btnStyle: shapeType === 'button' ? 'pill' : undefined,
        btnText: shapeType === 'button' ? 'Get Started' : undefined,
        btnSubtext: shapeType === 'button' ? '' : undefined,
        btnIcon: shapeType === 'button' ? 'arrow' : undefined,
        btnIconPosition: shapeType === 'button' ? 'left' : undefined,
        btnCustomEmoji: shapeType === 'button' ? '🚀' : undefined,
        btnState: shapeType === 'button' ? 'on' : undefined,
        btnColor: shapeType === 'button' ? color : undefined,
        btnOnColor: shapeType === 'button' ? '#10b981' : undefined,
        btnOffColor: shapeType === 'button' ? '#27272a' : undefined,
        btnKnobColor: shapeType === 'button' ? '#ffffff' : undefined,
        btnGradientEnd: shapeType === 'button' ? '#ec4899' : undefined,
        btnTextColor: shapeType === 'button' ? '#ffffff' : undefined,
        btnSubtextColor: shapeType === 'button' ? 'rgba(255, 255, 255, 0.65)' : undefined,
        btnBorderRadius: shapeType === 'button' ? 12 : undefined,
        btnBorderWidth: shapeType === 'button' ? 1 : undefined,
        btnBorderColor: shapeType === 'button' ? 'rgba(255, 255, 255, 0.25)' : undefined,
        btnGlow: shapeType === 'button' ? false : undefined,
        btnGlowColor: shapeType === 'button' ? color : undefined,
        btnAnimation: shapeType === 'button' ? 'pulseGlow' : undefined,
        btnAnimSpeed: shapeType === 'button' ? 1.5 : undefined,
        // Cursor defaults
        cursorType: shapeType === 'cursor' ? 'pointer' : undefined,
        cursorColor: shapeType === 'cursor' ? '#ffffff' : undefined,
        cursorSize: shapeType === 'cursor' ? 26 : undefined,
        cursorPathMode: shapeType === 'cursor' ? 'customPath' : undefined,
        cursorPathDuration: shapeType === 'cursor' ? 2.5 : undefined,
        cursorClickAnim: shapeType === 'cursor' ? 'ripple' : undefined,
        cursorClickInterval: shapeType === 'cursor' ? 2.0 : undefined,
        cursorClickTimes: shapeType === 'cursor' ? '0.8, 1.8, 2.8' : undefined,
        cursorBlinking: shapeType === 'cursor' ? false : undefined,
        cursorTrail: shapeType === 'cursor' ? true : undefined,
        cursorOrientToMotion: shapeType === 'cursor' ? true : undefined,
        showCursorPath: shapeType === 'cursor' ? true : undefined,
        cursorPathColor: shapeType === 'cursor' ? 'rgba(168, 85, 247, 0.45)' : undefined,
        x: centerX + offset - Math.round(40 * sx),
        y: centerY + offset - Math.round(40 * sy),
        scaleX: 1,
        scaleY: 1,
        rotation: 0,
        opacity: 1,
        keyframes: {
          x: [],
          y: [],
          scaleX: [],
          scaleY: [],
          rotation: [],
          opacity: [],
          ...(shapeType === 'bar'
            ? {
                barPercentage: [
                  { time: 0, value: 0 },
                  { time: 2.0, value: 100 },
                ],
              }
            : {}),
          ...(shapeType === 'branching'
            ? {
                branchGrowth: [
                  { time: 0, value: 0 },
                  { time: 2.0, value: 100 },
                ],
              }
            : {}),
          ...(shapeType === 'pathFollower'
            ? {
                followerProgress: [
                  { time: 0, value: 0 },
                  { time: 2.5, value: 100 },
                ],
              }
            : {}),
          ...(shapeType === 'array'
            ? {
                arrayProgress: [
                  { time: 0, value: 0 },
                  { time: 2.0, value: 100 },
                ],
              }
            : {}),
          ...(shapeType === 'card'
            ? {
                cardProgress: [
                  { time: 0, value: 0 },
                  { time: 2.0, value: 100 },
                ],
              }
            : {}),
          ...(shapeType === 'pathDraw'
            ? {
                pathDrawProgress: [
                  { time: 0, value: 0 },
                  { time: 2.0, value: 100 },
                ],
              }
            : {}),
          ...(shapeType === 'button'
            ? {
                buttonProgress: [
                  { time: 0, value: 0 },
                  { time: 1.5, value: 100 },
                ],
              }
            : {}),
          ...(shapeType === 'cursor'
            ? {
                cursorProgress: [
                  { time: 0, value: 0 },
                  { time: 2.5, value: 100 },
                ],
              }
            : {}),
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
      const res = canvasResolutionRef.current;
      const sx = res.width / 800;
      const sy = res.height / 450;
      const us = Math.sqrt(sx * sy);
      const centerX = Math.round(res.width / 2);
      const centerY = Math.round(res.height / 2);
      const offset = (layers.length % 5) * Math.round(20 * us);

      const scaledPath = scaleSvgPath(pathData, sx, sy);

      const newLayer: Layer = {
        id: uid('custom_shape'),
        name: name || `Custom Shape ${layers.length + 1}`,
        type: 'shape',
        shapeType: 'custom',
        pathData: scaledPath,
        visible: true,
        width: Math.max(40, Math.round(width * sx)),
        height: Math.max(40, Math.round(height * sy)),
        fill,
        stroke,
        borderWidth: Math.max(1, Math.round(3 * us)),
        borderRadius: 0,
        borderStyle: 'solid',
        animateDash: false,
        easing: 'easeOutCubic',
        x: centerX + offset - Math.round(30 * sx),
        y: centerY + offset - Math.round(30 * sy),
        scaleX: 1,
        scaleY: 1,
        rotation: 0,
        opacity: 1,
        keyframes: {
          x: [],
          y: [],
          scaleX: [],
          scaleY: [],
          rotation: [],
          opacity: [],
        },
      };

      setLayers((prev) => [newLayer, ...prev]);
      setSelectedLayerId(newLayer.id);
    },
    [layers.length, pushUndo]
  );

  const addText = useCallback(
    (textEffect: TextEffect = 'none') => {
      pushUndo(true);
      const res = canvasResolutionRef.current;
      const sx = res.width / 800;
      const sy = res.height / 450;
      const us = Math.sqrt(sx * sy);
      const centerX = Math.round(res.width / 2);
      const centerY = Math.round(res.height / 2);

      const newLayer: Layer = {
        id: uid('text'),
        name: `Text ${layers.length + 1}`,
        type: 'text',
        visible: true,
        text: 'MOTION FLOW',
        morphTarget: 'FUTURE DESIGN',
        fontSize: Math.max(12, Math.round(52 * us)),
        fontFamily: 'Inter',
        fontWeight: 'bold',
        fontStyle: 'normal',
        fill: '#ffffff',
        stroke: '#6366f1',
        borderWidth: 0,
        borderRadius: 0,
        borderStyle: 'none',
        animateDash: false,
        textEffect: textEffect || 'none',
        easing: 'easeOutCubic',
        width: Math.max(80, Math.round(340 * sx)),
        height: Math.max(20, Math.round(60 * sy)),
        x: centerX,
        y: centerY,
        scaleX: 1,
        scaleY: 1,
        rotation: 0,
        opacity: 1,
        keyframes: {
          x: [],
          y: [],
          scaleX: [],
          scaleY: [],
          rotation: [],
          opacity: [],
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
      const res = canvasResolutionRef.current;
      const sx = res.width / 800;
      const sy = res.height / 450;
      const us = Math.sqrt(sx * sy);
      const centerX = Math.round(res.width / 2);
      const centerY = Math.round(res.height / 2);

      const newLayer: Layer = {
        id: uid('img'),
        name,
        type: 'image',
        imageSrc: src,
        visible: true,
        width: Math.max(20, Math.round(w * sx)),
        height: Math.max(20, Math.round(h * sy)),
        fill: '#ffffff',
        stroke: '#ffffff',
        borderWidth: 0,
        borderRadius: Math.round(14 * us),
        borderStyle: 'none',
        animateDash: false,
        easing: 'easeOutCubic',
        x: centerX,
        y: centerY,
        scaleX: 1,
        scaleY: 1,
        rotation: 0,
        opacity: 1,
        keyframes: {
          x: [],
          y: [],
          scaleX: [],
          scaleY: [],
          rotation: [],
          opacity: [],
        },
      };

      setLayers((prev) => [newLayer, ...prev]);
      setSelectedLayerId(newLayer.id);
    },
    [pushUndo]
  );

  const addSticker = useCallback(
    (presetId?: string) => {
      pushUndo(true);
      const res = canvasResolutionRef.current;
      const sx = res.width / 800;
      const sy = res.height / 450;
      const centerX = Math.round(res.width / 2);
      const centerY = Math.round(res.height / 2);

      const preset = STICKER_PRESETS.find((p) => p.id === presetId) || STICKER_PRESETS[0];

      const newLayer: Layer = {
        id: uid('sticker'),
        name: `${preset.name} Sticker ${layers.length + 1}`,
        type: 'image',
        isSticker: true,
        stickerId: preset.id,
        imageSrc: preset.dataUrl,
        visible: true,
        width: Math.max(30, Math.round(130 * sx)),
        height: Math.max(30, Math.round(130 * sy)),
        fill: '#ffffff',
        stroke: '#ffffff',
        borderWidth: 0,
        borderRadius: 0,
        borderStyle: 'none',
        animateDash: false,
        easing: 'easeOutCubic',
        x: centerX,
        y: centerY,
        scaleX: 1,
        scaleY: 1,
        rotation: 0,
        opacity: 1,
        keyframes: {
          x: [],
          y: [],
          scaleX: [],
          scaleY: [],
          rotation: [],
          opacity: [],
        },
      };

      setLayers((prev) => [newLayer, ...prev]);
      setSelectedLayerId(newLayer.id);
      setSelectedLayerIdsState([newLayer.id]);
    },
    [layers.length, pushUndo]
  );

  // Layer Update & Management
  const selectLayer = useCallback(
    (id: string | null, isMulti?: boolean, isRange?: boolean) => {
      if (!id) {
        setSelectedLayerId(null);
        setSelectedLayerIdsState([]);
        setSelectedKeyframe(null);
        return;
      }

      if (isMulti) {
        setSelectedLayerIdsState((prev) => {
          const exists = prev.includes(id);
          const next = exists ? prev.filter((x) => x !== id) : [id, ...prev];
          setSelectedLayerId(next[0] || null);
          return next;
        });
        setSelectedKeyframe(null);
        return;
      }

      if (isRange && selectedLayerIdsRef.current.length > 0) {
        const allLayers = layersRef.current;
        const lastId = selectedLayerIdsRef.current[0];
        const idx1 = allLayers.findIndex((l) => l.id === lastId);
        const idx2 = allLayers.findIndex((l) => l.id === id);

        if (idx1 !== -1 && idx2 !== -1) {
          const start = Math.min(idx1, idx2);
          const end = Math.max(idx1, idx2);
          const rangeIds = allLayers.slice(start, end + 1).map((l) => l.id);
          setSelectedLayerIdsState(rangeIds);
          setSelectedLayerId(id);
          setSelectedKeyframe(null);
          return;
        }
      }

      setSelectedLayerId(id);
      setSelectedLayerIdsState([id]);
      setSelectedKeyframe(null);
    },
    []
  );

  const selectMultipleLayers = useCallback((ids: string[]) => {
    setSelectedLayerIdsState(ids);
    setSelectedLayerId(ids[0] || null);
    setSelectedKeyframe(null);
  }, []);

  const selectAllLayers = useCallback(() => {
    const allIds = layersRef.current.map((l) => l.id);
    setSelectedLayerIdsState(allIds);
    setSelectedLayerId(allIds[0] || null);
    setSelectedKeyframe(null);
  }, []);

  const clearSelectedLayers = useCallback(() => {
    setSelectedLayerIdsState([]);
    setSelectedLayerId(null);
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
          const newId = next[0]?.id || null;
          setSelectedLayerId(newId);
          setSelectedLayerIdsState(newId ? [newId] : []);
          setSelectedKeyframe(null);
        } else {
          setSelectedLayerIdsState((prevIds) => prevIds.filter((x) => x !== id));
        }
        return next;
      });
    },
    [pushUndo]
  );

  const deleteLayersBatch = useCallback(
    (ids: string[]) => {
      if (ids.length === 0) return;
      pushUndo(true);
      setLayers((prev) => {
        const next = prev.filter((l) => !ids.includes(l.id));
        const remaining = selectedLayerIdsRef.current.filter((x) => !ids.includes(x));
        const newId = remaining[0] || next[0]?.id || null;
        setSelectedLayerId(newId);
        setSelectedLayerIdsState(newId ? [newId] : []);
        setSelectedKeyframe(null);
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
        if (clone.x !== undefined) clone.x += 20;
        if (clone.y !== undefined) clone.y += 20;
        clone.keyframes.x?.forEach((k) => (k.value += 20));
        clone.keyframes.y?.forEach((k) => (k.value += 20));
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

  // Layer timeline trimming, moving & splitting (After Effects style)
  const trimLayer = useCallback(
    (id: string, startTime: number, endTime: number, skipSnapshot: boolean = false) => {
      if (!skipSnapshot) {
        pushUndo(false);
      }
      const dur = durationRef.current;
      const cleanStart = Math.max(0, Math.min(dur - 0.05, Math.round(startTime * 20) / 20));
      const cleanEnd = Math.max(cleanStart + 0.05, Math.min(dur, Math.round(endTime * 20) / 20));

      setLayers((prev) =>
        prev.map((l) => (l.id === id ? { ...l, startTime: cleanStart, endTime: cleanEnd } : l))
      );
    },
    [pushUndo]
  );

  const moveLayerTime = useCallback(
    (id: string, dt: number, skipSnapshot: boolean = false) => {
      if (!skipSnapshot) {
        pushUndo(false);
      }
      const dur = durationRef.current;
      setLayers((prev) =>
        prev.map((l) => {
          if (l.id !== id) return l;
          const currentStart = l.startTime ?? 0;
          const currentEnd = l.endTime ?? dur;
          const span = currentEnd - currentStart;

          let targetStart = currentStart + dt;
          let targetEnd = currentEnd + dt;

          if (targetStart < 0) {
            targetStart = 0;
            targetEnd = targetStart + span;
          } else if (targetEnd > dur) {
            targetEnd = dur;
            targetStart = Math.max(0, targetEnd - span);
          }

          const actualDt = targetStart - currentStart;

          // Shift all keyframes on this layer by actualDt
          const newKeyframes: Partial<Record<AnimatableProp, Keyframe[]>> = {};
          (Object.entries(l.keyframes) as [AnimatableProp, Keyframe[]][]).forEach(([prop, kfs]) => {
            if (kfs) {
              newKeyframes[prop] = kfs.map((kf) => ({
                ...kf,
                time: Math.max(0, Math.min(dur, Math.round((kf.time + actualDt) * 20) / 20)),
              }));
            }
          });

          return {
            ...l,
            startTime: Math.round(targetStart * 20) / 20,
            endTime: Math.round(targetEnd * 20) / 20,
            keyframes: newKeyframes,
          };
        })
      );
    },
    [pushUndo]
  );

  const splitLayerAtCurrentTime = useCallback(
    (layerId?: string) => {
      const targetId = layerId || selectedLayerIdRef.current;
      if (!targetId) return;

      const curTime = currentTimeRef.current;
      const dur = durationRef.current;

      setLayers((prev) => {
        const targetIdx = prev.findIndex((l) => l.id === targetId);
        if (targetIdx === -1) return prev;
        const target = prev[targetIdx];

        const start = target.startTime ?? 0;
        const end = target.endTime ?? dur;

        // Ensure current time is strictly within layer duration to allow cut
        if (curTime <= start + 0.05 || curTime >= end - 0.05) {
          return prev;
        }

        pushUndo(true);

        // Part 1: existing layer trimmed to [start, curTime]
        const part1Keyframes: Partial<Record<AnimatableProp, Keyframe[]>> = {};
        (Object.entries(target.keyframes) as [AnimatableProp, Keyframe[]][]).forEach(
          ([prop, kfs]) => {
            if (kfs) {
              part1Keyframes[prop] = kfs.filter((kf) => kf.time <= curTime);
            }
          }
        );

        const part1: Layer = {
          ...target,
          endTime: Math.round(curTime * 20) / 20,
          keyframes: part1Keyframes,
        };

        // Part 2: clone trimmed to [curTime, end]
        const part2Keyframes: Partial<Record<AnimatableProp, Keyframe[]>> = {};
        (Object.entries(target.keyframes) as [AnimatableProp, Keyframe[]][]).forEach(
          ([prop, kfs]) => {
            if (kfs) {
              part2Keyframes[prop] = kfs.filter((kf) => kf.time >= curTime);
            }
          }
        );

        const part2Id = uid(target.type);
        const part2: Layer = {
          ...JSON.parse(JSON.stringify(target)),
          id: part2Id,
          name: `${target.name} (Split)`,
          startTime: Math.round(curTime * 20) / 20,
          endTime: end,
          keyframes: part2Keyframes,
        };

        // Insert Part 2 directly next to Part 1
        const next = [...prev];
        next[targetIdx] = part1;
        next.splice(targetIdx, 0, part2);

        setSelectedLayerId(part2Id);
        setSelectedLayerIdsState([part2Id]);
        return next;
      });
    },
    [pushUndo]
  );

  const trimLayerInToCurrentTime = useCallback(
    (layerId?: string) => {
      const targetId = layerId || selectedLayerIdRef.current;
      if (!targetId) return;

      const curTime = currentTimeRef.current;
      const dur = durationRef.current;

      setLayers((prev) =>
        prev.map((l) => {
          if (l.id !== targetId) return l;
          const end = l.endTime ?? dur;
          if (curTime >= end - 0.05) return l;
          pushUndo(true);
          return {
            ...l,
            startTime: Math.round(curTime * 20) / 20,
          };
        })
      );
    },
    [pushUndo]
  );

  const trimLayerOutToCurrentTime = useCallback(
    (layerId?: string) => {
      const targetId = layerId || selectedLayerIdRef.current;
      if (!targetId) return;

      const curTime = currentTimeRef.current;

      setLayers((prev) =>
        prev.map((l) => {
          if (l.id !== targetId) return l;
          const start = l.startTime ?? 0;
          if (curTime <= start + 0.05) return l;
          pushUndo(true);
          return {
            ...l,
            endTime: Math.round(curTime * 20) / 20,
          };
        })
      );
    },
    [pushUndo]
  );

  // Top-level Layer Transitions (Fade In/Out & Scale In/Out - does not touch normal keyframes)
  const toggleFadeInOut = useCallback(
    (layerId?: string, durationSec: number = 0.5) => {
      const targetId = layerId || selectedLayerIdRef.current;
      if (!targetId) return;

      pushUndo(true);
      setLayers((prev) =>
        prev.map((l) => {
          if (l.id !== targetId) return l;
          const nextState = !l.fadeInOut;
          return {
            ...l,
            fadeInOut: nextState,
            fadeDuration: l.fadeDuration || durationSec,
          };
        })
      );
    },
    [pushUndo]
  );

  const toggleScaleInOut = useCallback(
    (layerId?: string, durationSec: number = 0.5) => {
      const targetId = layerId || selectedLayerIdRef.current;
      if (!targetId) return;

      pushUndo(true);
      setLayers((prev) =>
        prev.map((l) => {
          if (l.id !== targetId) return l;
          const nextState = !l.scaleInOut;
          return {
            ...l,
            scaleInOut: nextState,
            scaleDuration: l.scaleDuration || durationSec,
            scaleStartValue: l.scaleStartValue ?? 0,
          };
        })
      );
    },
    [pushUndo]
  );

  // Parenting & Grouping hierarchy
  const setLayerParent = useCallback(
    (layerId: string, parentId: string | null) => {
      pushUndo(true);
      setLayers((prev) => {
        const child = prev.find((l) => l.id === layerId);
        if (!child) return prev;
        if (parentId && (parentId === layerId || isDescendantOf(parentId, layerId, prev))) {
          return prev;
        }

        const childWorldTr = getLayerWorldTransformAtTime(child, prev, currentTime);

        if (!parentId) {
          // Unparent: local becomes world transform so position remains identical
          return prev.map((l) => {
            if (l.id !== layerId) return l;
            return {
              ...l,
              parentId: null,
              keyframes: {
                ...l.keyframes,
                x: [{ time: 0, value: Math.round(childWorldTr.x) }],
                y: [{ time: 0, value: Math.round(childWorldTr.y) }],
                scaleX: [{ time: 0, value: Math.round(childWorldTr.scaleX * 100) / 100 }],
                scaleY: [{ time: 0, value: Math.round(childWorldTr.scaleY * 100) / 100 }],
                rotation: [{ time: 0, value: Math.round(childWorldTr.rotation) }],
                opacity: [{ time: 0, value: Math.round(childWorldTr.opacity * 100) / 100 }],
              },
            };
          });
        }

        const parent = prev.find((l) => l.id === parentId);
        if (!parent) return prev;
        const parentWorldTr = getLayerWorldTransformAtTime(parent, prev, currentTime);

        // Convert child world to local coords relative to parent
        const dx = childWorldTr.x - parentWorldTr.x;
        const dy = childWorldTr.y - parentWorldTr.y;
        const rad = (-parentWorldTr.rotation * Math.PI) / 180;
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);

        const localX = Math.round((dx * cos - dy * sin) / Math.max(0.001, parentWorldTr.scaleX));
        const localY = Math.round((dx * sin + dy * cos) / Math.max(0.001, parentWorldTr.scaleY));
        const localScaleX =
          Math.round((childWorldTr.scaleX / Math.max(0.001, parentWorldTr.scaleX)) * 100) / 100;
        const localScaleY =
          Math.round((childWorldTr.scaleY / Math.max(0.001, parentWorldTr.scaleY)) * 100) / 100;
        const localRotation = Math.round(childWorldTr.rotation - parentWorldTr.rotation);
        const localOpacity =
          parentWorldTr.opacity > 0
            ? Math.round((childWorldTr.opacity / parentWorldTr.opacity) * 100) / 100
            : 1;

        return prev.map((l) => {
          if (l.id !== layerId) return l;
          return {
            ...l,
            parentId,
            keyframes: {
              ...l.keyframes,
              x: [{ time: 0, value: localX }],
              y: [{ time: 0, value: localY }],
              scaleX: [{ time: 0, value: localScaleX }],
              scaleY: [{ time: 0, value: localScaleY }],
              rotation: [{ time: 0, value: localRotation }],
              opacity: [{ time: 0, value: localOpacity }],
            },
          };
        });
      });
    },
    [currentTime, pushUndo]
  );

  const createGroup = useCallback(
    (name: string = 'Group', layerIds?: string[]): string => {
      pushUndo(true);
      const groupId = uid('grp');
      let cx = 400;
      let cy = 225;

      const ids =
        layerIds && layerIds.length > 0
          ? layerIds
          : selectedLayerIdsRef.current.length > 0
            ? selectedLayerIdsRef.current
            : selectedLayerIdRef.current
              ? [selectedLayerIdRef.current]
              : [];

      if (ids.length > 0) {
        const members = layersRef.current.filter((l) => ids.includes(l.id));
        if (members.length > 0) {
          let sumX = 0;
          let sumY = 0;
          members.forEach((m) => {
            const tr = getLayerWorldTransformAtTime(m, layersRef.current, currentTime);
            sumX += tr.x;
            sumY += tr.y;
          });
          cx = Math.round(sumX / members.length);
          cy = Math.round(sumY / members.length);
        }
      }

      const groupLayer: Layer = {
        id: groupId,
        name: name || `Group ${layersRef.current.filter((l) => l.isGroup).length + 1}`,
        type: 'group',
        isGroup: true,
        expanded: true,
        visible: true,
        width: 160,
        height: 120,
        fill: 'transparent',
        stroke: '#6366f1',
        borderWidth: 1,
        borderRadius: 8,
        borderStyle: 'none',
        animateDash: false,
        easing: 'easeOutCubic',
        keyframes: {
          x: [{ time: 0, value: cx }],
          y: [{ time: 0, value: cy }],
          scaleX: [{ time: 0, value: 1 }],
          scaleY: [{ time: 0, value: 1 }],
          rotation: [{ time: 0, value: 0 }],
          opacity: [{ time: 0, value: 1 }],
        },
      };

      setLayers((prev) => {
        const updated = prev.map((l) => {
          if (ids.includes(l.id)) {
            const curWorld = getLayerWorldTransformAtTime(l, prev, currentTime);
            return {
              ...l,
              parentId: groupId,
              groupId: groupId,
              keyframes: {
                ...l.keyframes,
                x: [{ time: 0, value: Math.round(curWorld.x - cx) }],
                y: [{ time: 0, value: Math.round(curWorld.y - cy) }],
              },
            };
          }
          return l;
        });
        return [groupLayer, ...updated];
      });

      setSelectedLayerId(groupId);
      setSelectedLayerIdsState([groupId]);
      return groupId;
    },
    [currentTime, pushUndo]
  );

  const addLayersToGroup = useCallback(
    (groupId: string, layerIds?: string[]) => {
      const ids =
        layerIds && layerIds.length > 0
          ? layerIds
          : selectedLayerIdsRef.current.length > 0
            ? selectedLayerIdsRef.current
            : selectedLayerIdRef.current
              ? [selectedLayerIdRef.current]
              : [];

      if (ids.length === 0) return;

      const group = layersRef.current.find((l) => l.id === groupId && l.type === 'group');
      if (!group) return;

      pushUndo(true);

      setLayers((prev) => {
        const targetGroup = prev.find((l) => l.id === groupId && l.type === 'group');
        if (!targetGroup) return prev;

        const groupWorldTr = getLayerWorldTransformAtTime(targetGroup, prev, currentTime);

        const updated = prev.map((l) => {
          // Do not group the group into itself, or if not in ids, or if circular loop
          if (!ids.includes(l.id) || l.id === groupId || isDescendantOf(groupId, l.id, prev)) {
            return l;
          }

          if (l.parentId === groupId) return l;

          const childWorldTr = getLayerWorldTransformAtTime(l, prev, currentTime);

          const dx = childWorldTr.x - groupWorldTr.x;
          const dy = childWorldTr.y - groupWorldTr.y;
          const rad = (-groupWorldTr.rotation * Math.PI) / 180;
          const cos = Math.cos(rad);
          const sin = Math.sin(rad);

          const localX = Math.round((dx * cos - dy * sin) / Math.max(0.001, groupWorldTr.scaleX));
          const localY = Math.round((dx * sin + dy * cos) / Math.max(0.001, groupWorldTr.scaleY));
          const localScaleX =
            Math.round((childWorldTr.scaleX / Math.max(0.001, groupWorldTr.scaleX)) * 100) / 100;
          const localScaleY =
            Math.round((childWorldTr.scaleY / Math.max(0.001, groupWorldTr.scaleY)) * 100) / 100;
          const localRotation = Math.round(childWorldTr.rotation - groupWorldTr.rotation);
          const localOpacity =
            groupWorldTr.opacity > 0
              ? Math.round((childWorldTr.opacity / groupWorldTr.opacity) * 100) / 100
              : 1;

          return {
            ...l,
            parentId: groupId,
            groupId: groupId,
            keyframes: {
              ...l.keyframes,
              x: [{ time: 0, value: localX }],
              y: [{ time: 0, value: localY }],
              scaleX: [{ time: 0, value: localScaleX }],
              scaleY: [{ time: 0, value: localScaleY }],
              rotation: [{ time: 0, value: localRotation }],
              opacity: [{ time: 0, value: localOpacity }],
            },
          };
        });

        // Ensure group is expanded
        return updated.map((l) => (l.id === groupId ? { ...l, expanded: true } : l));
      });

      setSelectedLayerId(groupId);
      setSelectedLayerIdsState([groupId]);
    },
    [currentTime, pushUndo]
  );

  const removeLayersFromGroup = useCallback(
    (layerIds?: string[]) => {
      const ids =
        layerIds && layerIds.length > 0
          ? layerIds
          : selectedLayerIdsRef.current.length > 0
            ? selectedLayerIdsRef.current
            : selectedLayerIdRef.current
              ? [selectedLayerIdRef.current]
              : [];

      if (ids.length === 0) return;

      pushUndo(true);

      setLayers((prev) => {
        return prev.map((l) => {
          if (!ids.includes(l.id) || !l.parentId) return l;

          const childWorldTr = getLayerWorldTransformAtTime(l, prev, currentTime);

          return {
            ...l,
            parentId: null,
            groupId: null,
            keyframes: {
              ...l.keyframes,
              x: [{ time: 0, value: Math.round(childWorldTr.x) }],
              y: [{ time: 0, value: Math.round(childWorldTr.y) }],
              scaleX: [{ time: 0, value: Math.round(childWorldTr.scaleX * 100) / 100 }],
              scaleY: [{ time: 0, value: Math.round(childWorldTr.scaleY * 100) / 100 }],
              rotation: [{ time: 0, value: Math.round(childWorldTr.rotation) }],
              opacity: [{ time: 0, value: Math.round(childWorldTr.opacity * 100) / 100 }],
            },
          };
        });
      });
    },
    [currentTime, pushUndo]
  );

  const ungroupLayer = useCallback(
    (groupId: string) => {
      pushUndo(true);
      setLayers((prev) => {
        return prev
          .filter((l) => l.id !== groupId)
          .map((l) => {
            if (l.parentId === groupId || l.groupId === groupId) {
              const worldTr = getLayerWorldTransformAtTime(l, prev, currentTime);
              return {
                ...l,
                parentId: null,
                groupId: null,
                keyframes: {
                  ...l.keyframes,
                  x: [{ time: 0, value: Math.round(worldTr.x) }],
                  y: [{ time: 0, value: Math.round(worldTr.y) }],
                  scaleX: [{ time: 0, value: Math.round(worldTr.scaleX * 100) / 100 }],
                  scaleY: [{ time: 0, value: Math.round(worldTr.scaleY * 100) / 100 }],
                  rotation: [{ time: 0, value: Math.round(worldTr.rotation) }],
                },
              };
            }
            return l;
          });
      });
      if (selectedLayerIdRef.current === groupId) {
        setSelectedLayerId(null);
      }
    },
    [currentTime, pushUndo]
  );

  const toggleGroupExpand = useCallback((groupId: string) => {
    setLayers((prev) =>
      prev.map((l) =>
        l.id === groupId ? { ...l, expanded: l.expanded === false ? true : false } : l
      )
    );
  }, []);

  const reorderLayersBatch = useCallback(
    (sourceIndex: number, targetIndex: number) => {
      if (sourceIndex === targetIndex) return;
      pushUndo(true);
      setLayers((prev) => {
        if (
          sourceIndex < 0 ||
          sourceIndex >= prev.length ||
          targetIndex < 0 ||
          targetIndex >= prev.length
        ) {
          return prev;
        }
        const next = [...prev];
        const [moved] = next.splice(sourceIndex, 1);
        next.splice(targetIndex, 0, moved);
        return next;
      });
    },
    [pushUndo]
  );

  const mergeSelectedLayers = useCallback(
    (layerIds?: string[]) => {
      const targetIds =
        layerIds && layerIds.length > 0
          ? layerIds
          : selectedLayerIdsRef.current.length > 0
          ? selectedLayerIdsRef.current
          : selectedLayerIdRef.current
          ? [selectedLayerIdRef.current]
          : [];
      if (targetIds.length < 2) return;

      pushUndo(true);

      const targetLayers = layersRef.current.filter((l) => targetIds.includes(l.id));
      if (targetLayers.length < 2) return;

      // 1. Calculate combined world bounding box at currentTime
      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;

      targetLayers.forEach((layer) => {
        const tr = getLayerWorldTransformAtTime(layer, layersRef.current, currentTime);
        const w = Math.max(20, (layer.width || 100) * Math.abs(tr.scaleX));
        const h = Math.max(20, (layer.height || 100) * Math.abs(tr.scaleY));
        const hw = w / 2;
        const hh = h / 2;

        minX = Math.min(minX, tr.x - hw);
        minY = Math.min(minY, tr.y - hh);
        maxX = Math.max(maxX, tr.x + hw);
        maxY = Math.max(maxY, tr.y + hh);
      });

      const pad = 6;
      minX = Math.floor(minX - pad);
      minY = Math.floor(minY - pad);
      maxX = Math.ceil(maxX + pad);
      maxY = Math.ceil(maxY + pad);

      const width = Math.max(40, maxX - minX);
      const height = Math.max(40, maxY - minY);
      const centerX = Math.round((minX + maxX) / 2);
      const centerY = Math.round((minY + maxY) / 2);

      // 2. Render target layers in natural bottom-to-top z-order onto offscreen canvas
      const offscreen = document.createElement('canvas');
      offscreen.width = width;
      offscreen.height = height;
      const offCtx = offscreen.getContext('2d');
      if (!offCtx) return;

      offCtx.save();
      // Translate so (minX, minY) maps to (0, 0)
      offCtx.translate(-minX, -minY);

      // Render layers from bottom to top (highest index to lowest index in layers array)
      for (let i = layersRef.current.length - 1; i >= 0; i--) {
        const lyr = layersRef.current[i];
        if (targetIds.includes(lyr.id) && lyr.visible) {
          renderSingleLayerToCanvas(offCtx, lyr, layersRef.current, currentTime, duration);
        }
      }

      offCtx.restore();

      const mergedDataUrl = offscreen.toDataURL('image/png');

      const mergedLayer: Layer = {
        id: uid('merged'),
        name: `Merged (${targetLayers.map((l) => l.name).slice(0, 2).join(' + ')}${targetLayers.length > 2 ? '...' : ''})`,
        type: 'image',
        imageSrc: mergedDataUrl,
        x: centerX,
        y: centerY,
        width,
        height,
        scaleX: 1,
        scaleY: 1,
        rotation: 0,
        opacity: 1,
        visible: true,
        locked: false,
        keyframes: {},
        easing: 'easeOutCubic',
        borderWidth: 0,
        borderRadius: 0,
        borderStyle: 'none',
        animateDash: false,
        fill: '#ffffff',
        stroke: '#ffffff',
      };

      const firstIndex = layersRef.current.findIndex((l) => targetIds.includes(l.id));
      const newLayers = layersRef.current.filter((l) => !targetIds.includes(l.id));
      const insertAt = firstIndex >= 0 ? Math.min(firstIndex, newLayers.length) : newLayers.length;
      newLayers.splice(insertAt, 0, mergedLayer);

      setLayers(newLayers);
      setSelectedLayerId(mergedLayer.id);
      setSelectedLayerIdsState([mergedLayer.id]);
    },
    [currentTime, duration, pushUndo]
  );

  const addCustomPenShape = useCallback(() => {
    addShape('custom');
  }, [addShape]);

  // Keyframe Actions
  const setAnimPropValue = useCallback(
    (layerId: string, prop: AnimatableProp, value: number, skipSnapshot: boolean = false) => {
      if (!skipSnapshot) {
        pushUndo(false);
      }
      setLayers((prev) =>
        prev.map((l) => {
          if (l.id !== layerId) return l;

          if (isAutoKeyframe) {
            return setOrUpdateKeyframe(l, prop, currentTime, value);
          }

          // Auto keyframe is OFF:
          // Check if there is an existing keyframe at currentTime (within 0.04s)
          const kfs = l.keyframes?.[prop] || [];
          const existingIdx = kfs.findIndex((k) => Math.abs(k.time - currentTime) < 0.04);
          if (existingIdx !== -1) {
            const updatedKfs = [...kfs];
            updatedKfs[existingIdx] = { ...updatedKfs[existingIdx], value };
            return {
              ...l,
              [prop]: value,
              keyframes: {
                ...l.keyframes,
                [prop]: updatedKfs,
              },
            };
          }

          // If this property has keyframes elsewhere, updating the value at this timestamp
          // must record a keyframe at currentTime so getInterpolatedValue reflects the new value
          if (kfs.length > 0) {
            return setOrUpdateKeyframe(l, prop, currentTime, value);
          }

          // No keyframes exist for this property: update base value without creating a keyframe
          return {
            ...l,
            [prop]: value,
          };
        })
      );
    },
    [currentTime, isAutoKeyframe, pushUndo]
  );

  const toggleKeyframe = useCallback(
    (layerId: string, prop: AnimatableProp) => {
      pushUndo(true);
      setLayers((prev) =>
        prev.map((layer) => {
          if (layer.id !== layerId) return layer;
          const kfs = layer.keyframes?.[prop] || [];
          const idx = kfs.findIndex((k) => Math.abs(k.time - currentTime) < 0.04);
          if (idx !== -1) {
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

  const addStartAndEndKeyframes = useCallback(
    (
      layerId: string,
      prop: AnimatableProp,
      startVal: number = 0,
      endVal: number = 100,
      durationSec: number = 2.0
    ) => {
      pushUndo(true);
      setLayers((prev) =>
        prev.map((layer) => {
          if (layer.id !== layerId) return layer;
          const targetDuration = Math.min(duration, Math.max(0.2, durationSec));
          let updated = setOrUpdateKeyframe(layer, prop, 0, startVal);
          updated = setOrUpdateKeyframe(updated, prop, targetDuration, endVal);
          return updated;
        })
      );
    },
    [duration, pushUndo]
  );

  const keyAllTransformProps = useCallback(
    (layerId: string) => {
      pushUndo(true);
      setLayers((prev) =>
        prev.map((layer) => {
          if (layer.id !== layerId) return layer;
          const tr = getLayerTransformAtTime(layer, currentTime);
          let updated = layer;
          (['x', 'y', 'scaleX', 'scaleY', 'rotation', 'opacity'] as const).forEach(
            (p) => {
              updated = setOrUpdateKeyframe(updated, p, currentTime, tr[p]);
            }
          );
          if (layer.shapeType === 'bar') {
            const barVal = getInterpolatedValue(layer, 'barPercentage', currentTime);
            updated = setOrUpdateKeyframe(updated, 'barPercentage', currentTime, barVal);
          } else if (layer.shapeType === 'pathDraw') {
            const pdVal = getInterpolatedValue(layer, 'pathDrawProgress', currentTime);
            updated = setOrUpdateKeyframe(updated, 'pathDrawProgress', currentTime, pdVal);
          } else if (layer.shapeType === 'array') {
            const arrVal = getInterpolatedValue(layer, 'arrayProgress', currentTime);
            updated = setOrUpdateKeyframe(updated, 'arrayProgress', currentTime, arrVal);
          } else if (layer.shapeType === 'cursor') {
            const curVal = getInterpolatedValue(layer, 'cursorProgress', currentTime);
            updated = setOrUpdateKeyframe(updated, 'cursorProgress', currentTime, curVal);
          } else if (layer.shapeType === 'branching') {
            const brVal = getInterpolatedValue(layer, 'branchGrowth', currentTime);
            updated = setOrUpdateKeyframe(updated, 'branchGrowth', currentTime, brVal);
          } else if (layer.shapeType === 'pathFollower') {
            const fVal = getInterpolatedValue(layer, 'followerProgress', currentTime);
            updated = setOrUpdateKeyframe(updated, 'followerProgress', currentTime, fVal);
          } else if (layer.shapeType === 'card') {
            const cVal = getInterpolatedValue(layer, 'cardProgress', currentTime);
            updated = setOrUpdateKeyframe(updated, 'cardProgress', currentTime, cVal);
          } else if (layer.shapeType === 'button') {
            const bVal = getInterpolatedValue(layer, 'buttonProgress', currentTime);
            updated = setOrUpdateKeyframe(updated, 'buttonProgress', currentTime, bVal);
          }
          return updated;
        })
      );
    },
    [currentTime, pushUndo]
  );

  const selectKeyframe = useCallback(
    (ref: SelectedKeyframeRef | null, multi: boolean = false) => {
      if (!ref) {
        setSelectedKeyframe(null);
        setSelectedKeyframes([]);
        return;
      }
      if (multi) {
        setSelectedKeyframes((prev) => {
          const exists = prev.some(
            (k) => k.layerId === ref.layerId && k.prop === ref.prop && k.index === ref.index
          );
          if (exists) {
            const filtered = prev.filter(
              (k) => !(k.layerId === ref.layerId && k.prop === ref.prop && k.index === ref.index)
            );
            setSelectedKeyframe(filtered.length > 0 ? filtered[0] : null);
            return filtered;
          } else {
            setSelectedKeyframe(ref);
            return [...prev, ref];
          }
        });
      } else {
        setSelectedKeyframe(ref);
        setSelectedKeyframes([ref]);
      }
    },
    []
  );

  const selectMultipleKeyframes = useCallback((refs: SelectedKeyframeRef[]) => {
    setSelectedKeyframes(refs);
    if (refs.length > 0) {
      setSelectedKeyframe(refs[0]);
    } else {
      setSelectedKeyframe(null);
    }
  }, []);

  const clearSelectedKeyframes = useCallback(() => {
    setSelectedKeyframe(null);
    setSelectedKeyframes([]);
  }, []);

  const deleteSelectedKeyframes = useCallback(() => {
    const targets =
      selectedKeyframes.length > 0
        ? selectedKeyframes
        : selectedKeyframe
          ? [selectedKeyframe]
          : [];
    if (targets.length === 0) return;

    pushUndo(true);

    const grouped = new Map<string, number[]>();
    targets.forEach(({ layerId, prop, index }) => {
      const key = `${layerId}:::${prop}`;
      const list = grouped.get(key) || [];
      list.push(index);
      grouped.set(key, list);
    });

    setLayers((prev) =>
      prev.map((layer) => {
        let updatedKeyframes = { ...layer.keyframes };
        let changed = false;

        (Object.keys(updatedKeyframes) as AnimatableProp[]).forEach((prop) => {
          const key = `${layer.id}:::${prop}`;
          const indices = grouped.get(key);
          if (indices && indices.length > 0) {
            changed = true;
            const sortedIndices = [...new Set(indices)].sort((a, b) => b - a);
            let list = [...(updatedKeyframes[prop] || [])];
            sortedIndices.forEach((idx) => {
              if (idx >= 0 && idx < list.length) {
                list.splice(idx, 1);
              }
            });
            updatedKeyframes[prop] = list;
          }
        });

        if (!changed) return layer;
        return {
          ...layer,
          keyframes: updatedKeyframes,
        };
      })
    );

    setSelectedKeyframe(null);
    setSelectedKeyframes([]);
  }, [selectedKeyframes, selectedKeyframe, pushUndo]);

  const deleteSelectedKeyframe = useCallback(() => {
    deleteSelectedKeyframes();
  }, [deleteSelectedKeyframes]);

  const deleteAllKeyframes = useCallback(
    (layerId: string) => {
      pushUndo(true);
      setLayers((prev) =>
        prev.map((l) => {
          if (l.id !== layerId) return l;
          const cur = getLayerTransformAtTime(l, currentTime);
          return {
            ...l,
            x: Math.round(cur.x),
            y: Math.round(cur.y),
            scaleX: Math.round(cur.scaleX * 100) / 100,
            scaleY: Math.round(cur.scaleY * 100) / 100,
            rotation: Math.round(cur.rotation),
            opacity: Math.round(cur.opacity * 100) / 100,
            keyframes: {
              x: [],
              y: [],
              scaleX: [],
              scaleY: [],
              rotation: [],
              opacity: [],
            },
          };
        })
      );
      setSelectedKeyframe(null);
      setSelectedKeyframes([]);
    },
    [currentTime, pushUndo]
  );

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
          const list = [...(layer.keyframes[prop] || [])];
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

  const moveMultipleKeyframes = useCallback(
    (
      moves: { layerId: string; prop: AnimatableProp; index: number; newTime: number }[],
      skipSnapshot: boolean = false
    ) => {
      if (moves.length === 0) return;
      if (!skipSnapshot) {
        pushUndo(false);
      }
      setLayers((prev) =>
        prev.map((layer) => {
          const layerMoves = moves.filter((m) => m.layerId === layer.id);
          if (layerMoves.length === 0) return layer;

          let updatedKeyframes = { ...layer.keyframes };
          layerMoves.forEach(({ prop, index, newTime }) => {
            const list = [...(updatedKeyframes[prop] || [])];
            if (list[index]) {
              const rounded = Math.round(newTime * 20) / 20;
              list[index] = { ...list[index], time: rounded };
              list.sort((a, b) => a.time - b.time);
              updatedKeyframes[prop] = list;
            }
          });

          return {
            ...layer,
            keyframes: updatedKeyframes,
          };
        })
      );
    },
    [pushUndo]
  );

  // Sync layers & settings to active composition
  useEffect(() => {
    const activeId = activeCompIdRef.current;
    const updated = compositionsRef.current.map((c) =>
      c.id === activeId ? { ...c, layers, duration, canvasBg } : c
    );
    compositionsRef.current = updated;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('motionfx_scene_layers', JSON.stringify(layers));
        localStorage.setItem('motionfx_compositions', JSON.stringify(updated));
      } catch {}
    }
  }, [layers, duration, canvasBg]);

  const switchComposition = useCallback(
    (targetId: string) => {
      const currentActiveId = activeCompIdRef.current;
      if (currentActiveId === targetId) return;

      pausePlay();
      pushUndo(true);

      const currentComps = compositionsRef.current;
      // Update leaving composition state
      const updatedComps = currentComps.map((c) =>
        c.id === currentActiveId
          ? { ...c, layers, duration, canvasBg, resolution: canvasResolutionRef.current }
          : c
      );

      const targetComp = updatedComps.find((c) => c.id === targetId);
      if (!targetComp) return;

      setCompositions(updatedComps);
      setActiveCompId(targetId);
      compositionsRef.current = updatedComps;
      activeCompIdRef.current = targetId;

      setLayers(targetComp.layers || []);
      setDurationState(targetComp.duration || 5.0);
      setCanvasBg(targetComp.canvasBg || '#090b10');
      if (targetComp.resolution) {
        setCanvasResolutionState(targetComp.resolution);
        canvasResolutionRef.current = targetComp.resolution;
      }
      setCurrentTimeState(0);
      setSelectedLayerId(targetComp.layers[0]?.id || null);
      setSelectedLayerIdsState([]);
      setSelectedKeyframe(null);

      persistCompositions(updatedComps, targetId);
    },
    [pausePlay, pushUndo, layers, duration, canvasBg, persistCompositions]
  );

  const createBlankComposition = useCallback(
    (name?: string) => {
      pausePlay();
      pushUndo(true);

      const currentActiveId = activeCompIdRef.current;
      const currentComps = compositionsRef.current;

      const updatedComps = currentComps.map((c) =>
        c.id === currentActiveId
          ? { ...c, layers, duration, canvasBg, resolution: canvasResolutionRef.current }
          : c
      );

      const blankCount =
        updatedComps.filter((c) => c.name.toLowerCase().includes('blank')).length + 1;
      const newComp: Composition = {
        id: uid('comp_blank'),
        name: name || `Blank Composition ${blankCount > 1 ? blankCount : ''}`.trim(),
        layers: [],
        duration: 5.0,
        canvasBg: '#090b10',
        resolution: canvasResolutionRef.current,
        createdAt: Date.now(),
      };

      const finalComps = [...updatedComps, newComp];
      setCompositions(finalComps);
      setActiveCompId(newComp.id);
      compositionsRef.current = finalComps;
      activeCompIdRef.current = newComp.id;

      setLayers([]);
      setDurationState(5.0);
      setCanvasBg('#090b10');
      setCurrentTimeState(0);
      setSelectedLayerId(null);
      setSelectedLayerIdsState([]);
      setSelectedKeyframe(null);

      persistCompositions(finalComps, newComp.id);
    },
    [pausePlay, pushUndo, layers, duration, canvasBg, persistCompositions]
  );

  const deleteComposition = useCallback(
    (id: string) => {
      const currentComps = compositionsRef.current;
      if (currentComps.length <= 1) {
        setLayers([]);
        setCurrentTimeState(0);
        setSelectedLayerId(null);
        return;
      }

      const nextComps = currentComps.filter((c) => c.id !== id);
      const activeId = activeCompIdRef.current;

      if (activeId === id) {
        const nextActive = nextComps[0];
        setCompositions(nextComps);
        setActiveCompId(nextActive.id);
        compositionsRef.current = nextComps;
        activeCompIdRef.current = nextActive.id;

        setLayers(nextActive.layers || []);
        setDurationState(nextActive.duration || 5.0);
        setCanvasBg(nextActive.canvasBg || '#090b10');
        setCurrentTimeState(0);
        setSelectedLayerId(nextActive.layers[0]?.id || null);
        persistCompositions(nextComps, nextActive.id);
      } else {
        setCompositions(nextComps);
        compositionsRef.current = nextComps;
        persistCompositions(nextComps, activeId);
      }
    },
    [persistCompositions]
  );

  const renameComposition = useCallback(
    (id: string, name: string) => {
      setCompositions((prev) => {
        const next = prev.map((c) => (c.id === id ? { ...c, name } : c));
        compositionsRef.current = next;
        persistCompositions(next, activeCompIdRef.current);
        return next;
      });
    },
    [persistCompositions]
  );

  // Template Loading (Preserves current composition and opens in dedicated composition)
  const loadTemplate = useCallback(
    (templateId: string, openInNewComp = true) => {
      const tmpl = TEMPLATES.find((item) => item.id === templateId) || TEMPLATES[0];
      pausePlay();
      pushUndo(true);

      const curRes = canvasResolutionRef.current;
      const sx = curRes.width / 800;
      const sy = curRes.height / 450;
      const baseRes: CanvasResolution = { width: 800, height: 450 };
      let newLayers = tmpl.createLayers();
      if (curRes.width !== 800 || curRes.height !== 450) {
        newLayers = newLayers.map((l) => scaleLayerToResolution(l, sx, sy, baseRes, curRes));
      }

      if (openInNewComp) {
        const currentActiveId = activeCompIdRef.current;
        const currentComps = compositionsRef.current;

        // Check if a composition for this template already exists
        const existingComp = currentComps.find(
          (c) => c.templateId === templateId || c.name === tmpl.name
        );

        if (existingComp) {
          switchComposition(existingComp.id);
          return;
        }

        // Save current active composition state first
        const updatedComps = currentComps.map((c) =>
          c.id === currentActiveId
            ? { ...c, layers, duration, canvasBg, resolution: curRes }
            : c
        );

        const newComp: Composition = {
          id: uid('comp_tmpl'),
          name: tmpl.name,
          templateId: tmpl.id,
          layers: newLayers,
          duration: tmpl.duration,
          canvasBg: tmpl.canvasBg,
          resolution: curRes,
          createdAt: Date.now(),
        };

        const finalComps = [...updatedComps, newComp];
        setCompositions(finalComps);
        setActiveCompId(newComp.id);
        compositionsRef.current = finalComps;
        activeCompIdRef.current = newComp.id;

        setLayers(newLayers);
        setDurationState(tmpl.duration);
        setCanvasBg(tmpl.canvasBg);
        setCurrentTimeState(0);
        setSelectedLayerId(newLayers[0]?.id || null);
        setSelectedKeyframe(null);

        persistCompositions(finalComps, newComp.id);
      } else {
        setDurationState(tmpl.duration);
        setCanvasBg(tmpl.canvasBg);
        setLayers(newLayers);
        setSelectedLayerId(newLayers[0]?.id || null);
        setSelectedKeyframe(null);
        setCurrentTimeState(0);
      }
    },
    [pausePlay, pushUndo, layers, duration, canvasBg, switchComposition, persistCompositions]
  );

  const importTemplateLayer = useCallback(
    (templateLayer: Layer, atTime?: number, atPos?: { x: number; y: number }) => {
      pushUndo(true);
      let clone: Layer = JSON.parse(JSON.stringify(templateLayer));
      clone.id = uid(templateLayer.type || 'tmpl');
      clone.name = `${templateLayer.name} (Template)`;
      clone.parentId = null;
      clone.groupId = null;

      const curRes = canvasResolutionRef.current;
      if (curRes.width !== 800 || curRes.height !== 450) {
        const sx = curRes.width / 800;
        const sy = curRes.height / 450;
        const baseRes: CanvasResolution = { width: 800, height: 450 };
        clone = scaleLayerToResolution(clone, sx, sy, baseRes, curRes);
      }

      if (atPos) {
        const origX = clone.keyframes.x?.[0]?.value ?? clone.x ?? Math.round(curRes.width / 2);
        const origY = clone.keyframes.y?.[0]?.value ?? clone.y ?? Math.round(curRes.height / 2);
        const dx = atPos.x - origX;
        const dy = atPos.y - origY;
        if (clone.x !== undefined) clone.x += dx;
        if (clone.y !== undefined) clone.y += dy;
        clone.keyframes.x?.forEach((k) => (k.value += dx));
        clone.keyframes.y?.forEach((k) => (k.value += dy));
      }

      if (atTime !== undefined && atTime > 0) {
        const allTimes = (['x', 'y', 'scaleX', 'scaleY', 'rotation', 'opacity'] as const).flatMap(
          (p) => clone.keyframes[p]?.map((k) => k.time) || []
        );
        if (allTimes.length > 0) {
          const minT = Math.min(...allTimes);
          const dt = atTime - minT;
          if (dt > 0) {
            (['x', 'y', 'scaleX', 'scaleY', 'rotation', 'opacity'] as const).forEach((p) => {
              clone.keyframes[p]?.forEach((k) => (k.time = Math.round((k.time + dt) * 20) / 20));
            });
          }
        }
      }

      setLayers((prev) => [clone, ...prev]);
      setSelectedLayerId(clone.id);
      setSelectedKeyframe(null);
    },
    [pushUndo]
  );

  const importTemplateAsGroup = useCallback(
    (templateId: string, customGroupName?: string) => {
      const tmpl = TEMPLATES.find((t) => t.id === templateId);
      if (!tmpl) return;

      pushUndo(true);
      const rawLayers = tmpl.createLayers();
      const groupId = uid('tmpl_grp');
      const curRes = canvasResolutionRef.current;
      const sx = curRes.width / 800;
      const sy = curRes.height / 450;
      const baseRes: CanvasResolution = { width: 800, height: 450 };

      let sumX = 0;
      let sumY = 0;
      let count = 0;

      const scaledClones: Layer[] = rawLayers.map((l) => {
        let clone: Layer = JSON.parse(JSON.stringify(l));
        clone.id = uid(clone.type || 'tmpl_layer');
        if (curRes.width !== 800 || curRes.height !== 450) {
          clone = scaleLayerToResolution(clone, sx, sy, baseRes, curRes);
        }
        const firstX = clone.keyframes.x?.[0]?.value ?? clone.x ?? 400;
        const firstY = clone.keyframes.y?.[0]?.value ?? clone.y ?? 225;
        sumX += firstX;
        sumY += firstY;
        count++;
        return clone;
      });

      const avgX = count > 0 ? Math.round(sumX / count) : Math.round(curRes.width / 2);
      const avgY = count > 0 ? Math.round(sumY / count) : Math.round(curRes.height / 2);

      const groupLayer: Layer = {
        id: groupId,
        name: customGroupName || `[Group] ${tmpl.name}`,
        type: 'group',
        isGroup: true,
        expanded: true,
        visible: true,
        width: Math.round(320 * sx),
        height: Math.round(220 * sy),
        fill: 'transparent',
        stroke: '#8b5cf6',
        borderWidth: 1.5,
        borderRadius: 8,
        borderStyle: 'dashed',
        animateDash: false,
        easing: 'easeOutCubic',
        keyframes: {
          x: [{ time: 0, value: avgX }],
          y: [{ time: 0, value: avgY }],
          scaleX: [{ time: 0, value: 1 }],
          scaleY: [{ time: 0, value: 1 }],
          rotation: [{ time: 0, value: 0 }],
          opacity: [{ time: 0, value: 1 }],
        },
      };

      const memberLayers = scaledClones.map((l) => {
        const adjustedKeyframes = { ...l.keyframes };
        if (adjustedKeyframes.x) {
          adjustedKeyframes.x = adjustedKeyframes.x.map((k) => ({
            ...k,
            value: Math.round(k.value - avgX),
          }));
        }
        if (adjustedKeyframes.y) {
          adjustedKeyframes.y = adjustedKeyframes.y.map((k) => ({
            ...k,
            value: Math.round(k.value - avgY),
          }));
        }

        return {
          ...l,
          parentId: groupId,
          groupId: groupId,
          keyframes: adjustedKeyframes,
        };
      });

      setLayers((prev) => [groupLayer, ...memberLayers, ...prev]);
      setSelectedLayerId(groupId);
      setSelectedLayerIdsState([groupId]);
      setSelectedKeyframe(null);
    },
    [pushUndo]
  );

  const importAllTemplatesAsGroups = useCallback(() => {
    pushUndo(true);
    // Reverse so first template is at top of stack
    const reversed = [...TEMPLATES].reverse();
    reversed.forEach((tmpl) => {
      importTemplateAsGroup(tmpl.id);
    });
  }, [pushUndo, importTemplateAsGroup]);

  const addCustomShapeLayer = useCallback(
    (shape: {
      name: string;
      pathData: string;
      width: number;
      height: number;
      fill: string;
      stroke: string;
      borderWidth?: number;
    }) => {
      pushUndo(true);
      const curRes = canvasResolutionRef.current;
      const newLayer: Layer = {
        id: uid('custom_shape'),
        name: shape.name || 'Custom Shape',
        type: 'shape',
        shapeType: 'custom',
        pathData: shape.pathData,
        visible: true,
        width: Math.max(20, Math.round(shape.width)),
        height: Math.max(20, Math.round(shape.height)),
        fill: shape.fill || '#6366f1',
        stroke: shape.stroke || '#ffffff',
        borderWidth: shape.borderWidth ?? 2,
        borderRadius: 0,
        borderStyle: 'solid',
        animateDash: false,
        easing: 'easeOutCubic',
        x: Math.round(curRes.width / 2),
        y: Math.round(curRes.height / 2),
        scaleX: 1,
        scaleY: 1,
        rotation: 0,
        opacity: 1,
        keyframes: {
          x: [],
          y: [],
          scaleX: [],
          scaleY: [],
          rotation: [],
          opacity: [],
        },
      };

      setLayers((prev) => [newLayer, ...prev]);
      setSelectedLayerId(newLayer.id);
      setSelectedKeyframe(null);
    },
    [pushUndo]
  );

  const clearScene = useCallback(() => {
    pushUndo(true);
    pausePlay();
    setLayers([]);
    setSelectedLayerId(null);
    setSelectedKeyframe(null);
    setCurrentTimeState(0);
  }, [pausePlay, pushUndo]);

  // Video Export (Supports 60 FPS, 120 FPS, and Custom Framerates)
  const startExport = useCallback(async (customFps?: number) => {
    const canvas = canvasRef.current;
    if (!canvas || layers.length === 0) return;

    const targetFps = customFps || exportFps || 60;

    pausePlay();
    setSelectedKeyframe(null);
    exporterRef.current = new VideoExporter();

    setExportProgress({
      isExporting: true,
      progress: 0,
      currentSec: 0,
      totalSec: duration,
      fps: targetFps,
    });

    try {
      await exporterRef.current.exportVideo({
        canvas,
        layers,
        duration,
        canvasBg,
        fps: targetFps,
        onProgress: (pct, cur, total, streamFps) => {
          setExportProgress({
            isExporting: true,
            progress: pct,
            currentSec: cur,
            totalSec: total,
            fps: streamFps || targetFps,
          });
        },
        onComplete: () => {
          setExportProgress({
            isExporting: false,
            progress: 100,
            currentSec: duration,
            totalSec: duration,
            fps: targetFps,
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
            fps: targetFps,
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
        fps: targetFps,
      });
    }
  }, [layers, duration, canvasBg, exportFps, pausePlay]);

  const cancelExport = useCallback(() => {
    if (exporterRef.current) {
      exporterRef.current.cancel();
      setExportProgress((prev) => ({
        isExporting: false,
        progress: 0,
        currentSec: 0,
        totalSec: 0,
        fps: prev.fps || 60,
      }));
    }
  }, []);

  // Initialize scene layers: restore from localStorage if present, or load Bento Grid on first visit
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Restore saved resolution if available
    let activeRes: CanvasResolution = { width: 800, height: 450 };
    const savedRes = localStorage.getItem('motionfx_canvas_resolution');
    if (savedRes) {
      try {
        const parsed = JSON.parse(savedRes);
        if (parsed && typeof parsed.width === 'number' && typeof parsed.height === 'number') {
          activeRes = parsed;
          setCanvasResolutionState(parsed);
        }
      } catch (err) {
        console.warn('Failed to parse saved canvas resolution:', err);
      }
    }

    // Restore saved duration if available
    const savedDur = localStorage.getItem('motionfx_duration');
    if (savedDur) {
      const parsedDur = parseFloat(savedDur);
      if (!isNaN(parsedDur) && parsedDur >= 0.5 && parsedDur <= 300) {
        setDurationState(parsedDur);
      }
    }

    let initialLayers: Layer[] = [];
    let initialDuration = 5.0;
    let initialBg = '#090b10';

    // Load saved compositions or default to a single Blank Composition
    const savedCompsRaw = localStorage.getItem('motionfx_compositions');
    const savedActiveId = localStorage.getItem('motionfx_active_comp_id');

    let loadedComps: Composition[] = [];
    if (savedCompsRaw) {
      try {
        const parsed = JSON.parse(savedCompsRaw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          loadedComps = parsed;
        }
      } catch (err) {
        console.error('Failed to parse saved compositions:', err);
      }
    }

    if (loadedComps.length === 0) {
      // DEFAULT TO A CLEAN BLANK COMPOSITION (User starts with empty canvas)
      loadedComps = [
        {
          id: 'comp_default',
          name: 'Blank Composition',
          layers: [],
          duration: 5.0,
          canvasBg: '#090b10',
          resolution: activeRes,
          createdAt: Date.now(),
        },
      ];
    }

    setCompositions(loadedComps);
    compositionsRef.current = loadedComps;

    const targetActiveId =
      savedActiveId && loadedComps.some((c) => c.id === savedActiveId)
        ? savedActiveId
        : loadedComps[0].id;

    setActiveCompId(targetActiveId);
    activeCompIdRef.current = targetActiveId;

    const activeComp = loadedComps.find((c) => c.id === targetActiveId) || loadedComps[0];
    initialLayers = activeComp.layers || [];
    initialDuration = activeComp.duration || 5.0;
    initialBg = activeComp.canvasBg || '#090b10';

    setDurationState(initialDuration);
    setCanvasBg(initialBg);

    // Check if user exported a custom shape from /builder
    let selectedId = initialLayers[0]?.id || null;
    const importedRaw = localStorage.getItem('motionfx_import_shape');

    if (importedRaw) {
      try {
        const item = JSON.parse(importedRaw);
        if (item && item.pathData) {
          const sx = activeRes.width / 800;
          const sy = activeRes.height / 450;
          const us = Math.sqrt(sx * sy);
          const customLayer: Layer = {
            id: uid('custom_shape'),
            name: item.name || 'Merged Custom Vector',
            type: 'shape',
            shapeType: 'custom',
            pathData: scaleSvgPath(item.pathData, sx, sy),
            visible: true,
            width: Math.max(40, Math.round((item.width || 180) * sx)),
            height: Math.max(40, Math.round((item.height || 180) * sy)),
            fill: item.fill || '#6366f1',
            stroke: item.stroke || '#ffffff',
            borderWidth: Math.max(1, Math.round(3 * us)),
            borderRadius: 0,
            borderStyle: 'solid',
            animateDash: false,
            easing: 'easeOutCubic',
            x: Math.round(activeRes.width / 2),
            y: Math.round(activeRes.height / 2),
            scaleX: 1,
            scaleY: 1,
            rotation: 0,
            opacity: 1,
            keyframes: {
              x: [],
              y: [],
              scaleX: [],
              scaleY: [],
              rotation: [],
              opacity: [],
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
        editingTextLayerId,
        setEditingTextLayerId,
        selectedLayerIds,
        selectedLayer,
        selectedKeyframe,
        currentTime,
        duration,
        isPlaying,
        isLooping,
        canvasBg,
        showGuides,
        canvasResolution,
        setCanvasResolution,
        isResolutionModalOpen,
        setIsResolutionModalOpen,
        exportProgress,
        canvasRef,
        addShape,
        addCustomShape,
        addText,
        addImage,
        addSticker,
        selectLayer,
        selectMultipleLayers,
        selectAllLayers,
        clearSelectedLayers,
        updateLayer,
        deleteLayer,
        deleteLayersBatch,
        duplicateLayer,
        reorderLayer,
        toggleLayerVisibility,
        trimLayer,
        moveLayerTime,
        splitLayerAtCurrentTime,
        trimLayerInToCurrentTime,
        trimLayerOutToCurrentTime,
        toggleFadeInOut,
        toggleScaleInOut,
        setLayerParent,
        createGroup,
        addLayersToGroup,
        removeLayersFromGroup,
        ungroupLayer,
        toggleGroupExpand,
        reorderLayersBatch,
        isAutoKeyframe,
        toggleAutoKeyframe,
        setIsAutoKeyframe,
        selectedKeyframes,
        selectMultipleKeyframes,
        clearSelectedKeyframes,
        setAnimPropValue,
        toggleKeyframe,
        addStartAndEndKeyframes,
        keyAllTransformProps,
        selectKeyframe,
        deleteSelectedKeyframe,
        deleteSelectedKeyframes,
        deleteAllKeyframes,
        moveKeyframeTime,
        moveMultipleKeyframes,
        setCurrentTime,
        setDuration,
        togglePlay,
        pausePlay,
        stopPlay,
        toggleLoop,
        seekToStart,
        setCanvasBg,
        setShowGuides,
        isSnappingEnabled,
        setIsSnappingEnabled,
        toggleSnapping,
        mergeSelectedLayers,
        addCustomPenShape,
        compositions,
        activeCompositionId: activeCompId,
        activeCompositionName,
        createBlankComposition,
        switchComposition,
        deleteComposition,
        renameComposition,
        loadTemplate,
        importTemplateLayer,
        importTemplateAsGroup,
        importAllTemplatesAsGroups,
        clearScene,
        isBuildShapeModalOpen,
        setIsBuildShapeModalOpen,
        addCustomShapeLayer,
        exportFps,
        setExportFps,
        isExportSettingsOpen,
        setIsExportSettingsOpen,
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
