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

export type ShapeType =
  | 'rect'
  | 'circle'
  | 'star'
  | 'polygon'
  | 'pill'
  | 'custom'
  | 'line'
  | 'bar'
  | 'branching'
  | 'pathFollower';

export type BarShape = 'horizontal' | 'vertical' | 'radial' | 'pill';
export type BranchCurvature = 'curved' | 'straight' | 'stepped';
export type BranchDirection = 'right' | 'left' | 'up' | 'down' | 'radial';
export type BranchEndShape = 'circle' | 'dot' | 'arrow' | 'square' | 'none';
export type FollowerType = 'circle' | 'star' | 'rect' | 'arrow' | 'emoji' | 'sparkle' | 'image';

export interface PathPoint {
  x: number;
  y: number;
  cp1x?: number;
  cp1y?: number;
  cp2x?: number;
  cp2y?: number;
}

export type BorderStyle = 'solid' | 'dashed' | 'dotted' | 'none';

export type TextEffect =
  | 'none'
  | 'typewriter'
  | 'morph'
  | 'wave'
  | 'cascade'
  | 'neonPulse';

export type LayerType = 'shape' | 'text' | 'image' | 'group';

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
  // Parenting & Grouping hierarchy
  parentId?: string | null;
  groupId?: string | null;
  groupName?: string;
  isGroup?: boolean;
  expanded?: boolean;
  // Custom vector path
  pathData?: string;
  // Text specific
  text?: string;
  morphTarget?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string | number;
  fontStyle?: 'normal' | 'italic';
  textEffect?: TextEffect;
  // Image / PNG specific
  imageSrc?: string | null;
  // Bar shape properties
  barPercentage?: number; // 0 to 100
  barShape?: BarShape;
  barTrackColor?: string;
  barFillColor?: string;
  barShowLabel?: boolean;
  barLabelColor?: string;
  barFontSize?: number;
  barThickness?: number;
  barAnimated?: boolean;
  // Branching shape properties
  branchCount?: number;
  branchLength?: number;
  branchSpread?: number;
  branchPosition?: number;
  branchTrunkLength?: number;
  branchCurvature?: BranchCurvature;
  branchDirection?: BranchDirection;
  branchEndShape?: BranchEndShape;
  branchEndSize?: number;
  branchEndpoints?: Array<{ x: number; y: number }>;
  branchAnimated?: boolean;
  branchAnimDuration?: number;
  branchAnimLoop?: 'loop' | 'pingpong' | 'once';
  branchGrowth?: number; // 0 to 1
  branchAnimateCount?: boolean;
  branchAnimateLength?: boolean;
  // Move Along Path (Path Follower) properties
  pathPoints?: PathPoint[];
  followerCount?: number;
  followerType?: FollowerType;
  followerEmoji?: string;
  followerImageSrc?: string | null;
  followerSize?: number;
  followerColor?: string;
  followerSpeed?: number; // seconds per cycle
  followerSpacing?: number; // stagger / spacing 0 - 1
  followerFadeStart?: number; // 0.0 - 1.0 (where fade out starts, e.g. 0.70)
  followerFadeIn?: boolean;
  followerScaleDown?: boolean;
  followerOrientToPath?: boolean;
  showPathTrack?: boolean;
  pathTrackColor?: string;
  pathTrackWidth?: number;
  pathTrackDashed?: boolean;
  isPenEditing?: boolean;
  // Base transform properties (used when keyframes are empty)
  x?: number;
  y?: number;
  scaleX?: number;
  scaleY?: number;
  rotation?: number;
  opacity?: number;
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
  fps?: number;
}

export interface CanvasResolution {
  width: number;
  height: number;
}
