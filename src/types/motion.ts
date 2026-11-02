export type AnimatableProp =
  | 'x'
  | 'y'
  | 'scaleX'
  | 'scaleY'
  | 'rotation'
  | 'opacity'
  | 'barPercentage'
  | 'branchGrowth'
  | 'followerProgress'
  | 'arrayProgress'
  | 'cardProgress'
  | 'pathDrawProgress'
  | 'buttonProgress'
  | 'cursorProgress'
  | 'textProgress'
  | 'filterIntensity'
  | 'graphProgress';

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
  | 'pathFollower'
  | 'array'
  | 'card'
  | 'pathDraw'
  | 'button'
  | 'cursor'
  | 'graph';

export type BarShape = 'horizontal' | 'vertical' | 'radial' | 'pill';
export type BranchCurvature = 'curved' | 'straight' | 'stepped';
export type BranchDirection = 'right' | 'left' | 'up' | 'down' | 'radial';
export type BranchEndShape = 'circle' | 'dot' | 'arrow' | 'square' | 'none';
export type FollowerType = 'circle' | 'star' | 'rect' | 'arrow' | 'emoji' | 'sparkle' | 'image';

// Array Matrix types
export type ArrayItemShape =
  | 'circle'
  | 'square'
  | 'rounded'
  | 'star'
  | 'dot'
  | 'emoji'
  | 'ring'
  | 'triangle'
  | 'diamond'
  | 'hexagon';

export type ArrayAnimType = 'pop' | 'fade' | 'drop' | 'wave' | 'ripple' | 'snake';
export type ArrayElementKind = 'shape' | 'text' | 'image' | 'icon';

export interface ArrayElementItem {
  id: string;
  kind: ArrayElementKind;
  shape?: ArrayItemShape;
  color?: string;
  borderColor?: string;
  borderWidth?: number;
  sizeRatio?: number;
  text?: string;
  textColor?: string;
  fontSize?: number;
  icon?: string;
  iconColor?: string;
  imageSrc?: string;
}

// Card Stack types
export type CardAnimType =
  | 'circularArray'
  | 'linearArray'
  | 'fallingStack'
  | 'stackSpread'
  | 'queue'
  | 'stack'
  | 'fan'
  | 'swipe'
  | 'stackShift'
  | 'cascade'
  | 'flip'
  | 'float';

export type CardShape =
  | 'squircle'
  | 'rounded'
  | 'rect'
  | 'circle'
  | 'pill'
  | 'triangle'
  | 'star'
  | 'hexagon'
  | 'chamfer'
  | 'glass';

export type CardImageMask =
  | 'none'
  | 'circle'
  | 'rect'
  | 'triangle'
  | 'star'
  | 'hexagon'
  | 'squircle';

export interface CardItem {
  id: string;
  title?: string;
  subtitle?: string;
  badge?: string;
  imageSrc?: string;
  imageMask?: CardImageMask;
  shape?: CardShape;
  color?: string;
  gradientEnd?: string;
  textColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
}

// Path Draw types
export type PathDrawType = 'arc' | 'wave' | 'spiral' | 'infinity' | 'straight' | 'custom';
export type PathDrawTextAnim = 'reveal' | 'travel' | 'wave' | 'typewriter' | 'none';
export type PathAnimStyle = 'writeOn' | 'laserBeam' | 'dashFlow' | 'pulseGlow' | 'dualDraw';

// Button types
export type ButtonStyle =
  | 'pill'
  | 'rounded'
  | 'rect'
  | 'chamfer'
  | 'gradient'
  | 'outline'
  | 'glass'
  | 'floating'
  | 'toggle';
export type ButtonAnimation = 'pulseGlow' | 'shimmer' | 'clickPress' | 'bounce' | 'ripple' | 'toggleSwitch';
export type ButtonIcon =
  | 'arrow'
  | 'check'
  | 'sparkle'
  | 'plus'
  | 'play'
  | 'heart'
  | 'bell'
  | 'star'
  | 'download'
  | 'external'
  | 'cart'
  | 'customEmoji'
  | 'none';
export type ButtonIconPosition = 'left' | 'right' | 'iconOnly';

// Cursor types
export type CursorType = 'pointer' | 'hand' | 'crosshair' | 'beam' | 'glowDot';
export type CursorPathMode = 'linear' | 'orbit' | 'customPath' | 'float';
export type CursorClickAnim = 'ripple' | 'press' | 'burst' | 'none';

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

export type LayerFilterType =
  | 'none'
  | 'blur'
  | 'glow'
  | 'wave'
  | 'blackAndWhite'
  | 'glitch'
  | 'noise'
  | 'shatter'
  | 'wobble';

export type GraphType = 'column' | 'bar' | 'line' | 'area' | 'pie' | 'combo';

export interface GraphDataItem {
  id: string;
  label: string;
  value: number;
  color?: string;
  secondaryValue?: number; // for Combo chart line overlay
}

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
  fillAlpha?: number; // 0 to 100
  stroke: string;
  strokeAlpha?: number; // 0 to 100
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
  pathClosed?: boolean;
  // Text specific
  text?: string;
  morphTarget?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string | number;
  fontStyle?: 'normal' | 'italic';
  textEffect?: TextEffect;
  textProgress?: number; // 0 to 100% keyframable animation progress
  // Image / PNG / Sticker specific
  imageSrc?: string | null;
  isSticker?: boolean;
  stickerId?: string;
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
  branchGrowth?: number; // 0 to 100 (percentage)
  branchStagger?: boolean;
  branchGrowTrunk?: boolean;
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
  followerProgress?: number; // 0 to 100 (for keyframing path follower)

  // 1. Array Matrix Animation properties
  arrayRows?: number;
  arrayCols?: number;
  arrayGap?: number;
  arrayShape?: ArrayItemShape;
  arrayItemSize?: number;
  arrayCustomEmoji?: string;
  arrayAnimType?: ArrayAnimType;
  arrayAnimDuration?: number;
  arrayAnimStagger?: number;
  arrayAnimLoop?: 'loop' | 'pingpong' | 'once';
  arrayRandomColor?: boolean;
  arrayProgress?: number; // 0 to 100
  arrayElements?: ArrayElementItem[];
  arrayElementSpawnMode?: 'cycle' | 'random';
  arrayItemBorderColor?: string;
  arrayItemBorderWidth?: number;
  arrayRandomSize?: boolean;
  arraySizeVariance?: number; // 0.1 to 0.8 (default ~0.35)
  arrayRandomRotation?: boolean;
  arrayItemRotation?: number;

  // 2. Card Stack Animation properties
  cardCount?: number;
  cardTitle?: string;
  cardSubtitle?: string;
  cardBadge?: string;
  cardImageSrc?: string | null;
  cardImageMask?: CardImageMask;
  cardShowContent?: boolean;
  cardColor?: string;
  cardGradientEnd?: string;
  cardShape?: CardShape;
  cardBorderRadius?: number;
  cardBorderWidth?: number;
  cardBorderColor?: string;
  cardBorderStyle?: BorderStyle;
  cardAnimType?: CardAnimType;
  cardAnimDuration?: number;
  cardSpread?: number;
  cardAnimLoop?: 'loop' | 'pingpong' | 'once';
  cardItems?: CardItem[];
  cardProgress?: number; // 0 to 100 (for keyframing card stack motion)

  // 3. Path Draw & Text on Path properties
  pathDrawType?: PathDrawType;
  pathDrawStrokeWidth?: number;
  pathDrawColor?: string;
  pathDrawDashed?: boolean;
  pathDrawArrow?: boolean;
  pathDrawProgress?: number; // 0 to 100
  pathDrawAnimated?: boolean;
  pathDrawDuration?: number;
  pathDrawLoop?: 'once' | 'loop' | 'pingpong';
  pathDrawText?: string;
  pathDrawTextFontSize?: number;
  pathDrawTextColor?: string;
  pathDrawTextOffset?: number;
  pathDrawTextAnimation?: PathDrawTextAnim;
  pathAnimStyle?: PathAnimStyle;

  // 4. Interactive Button properties
  btnStyle?: ButtonStyle;
  btnText?: string;
  btnSubtext?: string;
  btnHideText?: boolean;
  btnFontSize?: number;
  btnFontFamily?: string;
  btnFontWeight?: string | number;
  btnSubtextSize?: number;
  btnIcon?: ButtonIcon;
  btnIconPosition?: ButtonIconPosition;
  btnCustomEmoji?: string;
  btnState?: 'on' | 'off';
  btnColor?: string;
  btnOnColor?: string;
  btnOffColor?: string;
  btnKnobColor?: string;
  btnGradientEnd?: string;
  btnTextColor?: string;
  btnSubtextColor?: string;
  btnBorderRadius?: number;
  btnBorderWidth?: number;
  btnBorderColor?: string;
  btnGlow?: boolean;
  btnGlowColor?: string;
  btnAnimation?: ButtonAnimation;
  btnAnimSpeed?: number;
  buttonProgress?: number; // 0 to 100

  // 5. Cursor Motion properties
  cursorType?: CursorType;
  cursorColor?: string;
  cursorSize?: number;
  cursorPathMode?: CursorPathMode;
  cursorStartPos?: { x: number; y: number };
  cursorEndPos?: { x: number; y: number };
  cursorPathDuration?: number;
  cursorClickAnim?: CursorClickAnim;
  cursorClickInterval?: number;
  cursorClickTimes?: string;
  cursorBlinking?: boolean;
  cursorBlinkRate?: number;
  cursorTrail?: boolean;
  cursorOrientToMotion?: boolean;
  showCursorPath?: boolean;
  cursorPathColor?: string;
  cursorProgress?: number; // 0 to 100

  // Base transform properties (used when keyframes are empty)
  x?: number;
  y?: number;
  scaleX?: number;
  scaleY?: number;
  rotation?: number;
  opacity?: number;
  // Timeline in/out range (After Effects style layer bar & trimming)
  startTime?: number; // in seconds, defaults to 0
  endTime?: number;   // in seconds, defaults to composition duration
  // Top-level Layer Transitions (Fade In/Out & Scale In/Out - applied on top level without modifying normal keyframes)
  fadeInOut?: boolean;
  fadeDuration?: number; // in seconds (defaults to 0.5s or half of layer duration)
  fadeInOnly?: boolean;
  fadeOutOnly?: boolean;
  scaleInOut?: boolean;
  scaleDuration?: number; // in seconds (defaults to 0.5s or half of layer duration)
  scaleStartValue?: number; // starting scale factor (defaults to 0)
  scaleInOnly?: boolean;
  scaleOutOnly?: boolean;
  // Top-level Layer Filters (Glow, Wave, Black & White, Glitch, Noise, Shatter, Wobble, Blur)
  filterType?: LayerFilterType;
  filterIntensity?: number; // 0 to 100% (keyframable via 'filterIntensity')
  // Blur properties
  filterBlurRadius?: number; // 1 to 60px
  // Glow properties
  filterGlowColor?: string;
  filterGlowRadius?: number; // 5 to 60px
  // Wave properties
  filterWaveFrequency?: number; // 1 to 20
  filterWaveAmplitude?: number; // 2 to 50
  filterWaveSpeed?: number; // 1 to 15
  // Black and White properties
  filterBwContrast?: number; // 50 to 200%
  // Glitch properties
  filterGlitchAmount?: number; // 2 to 40
  filterGlitchSlices?: number; // 3 to 20
  filterGlitchSpeed?: number; // 1 to 30
  // Noise properties
  filterNoiseDensity?: number; // 10 to 100
  filterNoiseColor?: boolean;
  // Shatter properties
  filterShatterPieces?: number; // 4 to 36
  filterShatterSpread?: number; // 10 to 200
  // Wobble properties
  filterWobbleSpeed?: number; // 1 to 20
  filterWobbleAmount?: number; // 2 to 30
  // Graph Shape & Motion properties
  graphShowCard?: boolean; // Toggle background card shape and border frame
  graphType?: GraphType; // 'column' | 'bar' | 'line' | 'area' | 'pie' | 'combo'
  graphData?: GraphDataItem[];
  graphProgress?: number; // 0 to 100% (keyframable via 'graphProgress')
  graphShowLabels?: boolean;
  graphShowValues?: boolean;
  graphShowGrid?: boolean;
  graphShowAxes?: boolean;
  graphLineCurvature?: 'straight' | 'smooth' | 'step';
  graphLineWidth?: number;
  graphBarRadius?: number;
  graphDonutHole?: number; // 0 to 80% (inner cutout radius for Pie -> Donut)
  graphShowLegend?: boolean;
  graphShowDots?: boolean;
  graphDotSize?: number;
  graphGridColor?: string;
  graphAxisColor?: string;
  graphTextColor?: string;
  graphBarSpacing?: number;
  // Animatable tracks
  keyframes: Partial<Record<AnimatableProp, Keyframe[]>>;
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

export interface Composition {
  id: string;
  name: string;
  layers: Layer[];
  duration: number;
  canvasBg: string;
  resolution?: CanvasResolution;
  templateId?: string;
  createdAt?: number;
}

export interface MotionFXProjectFile {
  format: 'motionfx-animation';
  version: '1.0';
  exportedAt: string;
  projectName: string;
  canvasResolution: CanvasResolution;
  duration: number;
  fps: number;
  canvasBg: string;
  layers: Layer[];
  compositions?: Composition[];
  activeCompositionId?: string;
  metadata?: {
    app: string;
    totalLayers: number;
    totalKeyframes: number;
  };
}
