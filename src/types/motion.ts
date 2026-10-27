export type AnimatableProp = 'x' | 'y' | 'scaleX' | 'scaleY' | 'rotation' | 'opacity';

export interface Keyframe {
  time: number; // in seconds
  value: number;
}

export type EasingType =
  | 'linear'
  | 'easeOutCubic'
  | 'easeInOutCubic'
  | 'backOut'
  | 'elastic'
  | 'bounce';

export type ShapeType = 'rect' | 'circle' | 'star' | 'polygon' | 'pill';

export type BorderStyle = 'solid' | 'dashed' | 'dotted' | 'none';

export type TextEffect =
  | 'none'
  | 'typewriter'
  | 'morph'
  | 'wave'
  | 'cascade'
  | 'neonPulse';

export type LayerType = 'shape' | 'text' | 'image';

export interface Layer {
  id: string;
  name: string;
  type: LayerType;
  shapeType?: ShapeType;
  visible: boolean;
  locked?: boolean;
  width: number;
  height: number;
  sides?: number; // for star and polygon
  fill: string;
  stroke: string;
  borderWidth: number;
  borderRadius: number; // for rounded borders
  borderStyle: BorderStyle; // solid, dashed, dotted
  animateDash: boolean; // marching ants flow
  easing: EasingType;
  // Text specific
  text?: string;
  morphTarget?: string;
  fontSize?: number;
  textEffect?: TextEffect;
  // Image / PNG specific
  imageSrc?: string | null;
  // Animatable tracks
  keyframes: Record<AnimatableProp, Keyframe[]>;
}

export interface TransformState {
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
  rotation: number;
  opacity: number;
}

export interface SelectedKeyframeRef {
  layerId: string;
  prop: AnimatableProp;
  index: number;
}

export interface MotionTemplate {
  id: string;
  name: string;
  description: string;
  badge?: string;
  duration: number;
  canvasBg: string;
  createLayers: () => Layer[];
}

export interface ExportProgress {
  isExporting: boolean;
  progress: number;
  currentSec: number;
  totalSec: number;
}
