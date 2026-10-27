# Changelog

All notable changes and features of the **MotionFX Studio** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.8.0] - 2026-10-27

### Added
- **Customizable Animation Duration Controller**:
  - Ability to set arbitrary custom durations from `0.5s` up to `300.0s` (5 minutes) directly in the timeline transport toolbar.
  - **Direct Numeric Input**: Type any custom duration (e.g., `2.5s`, `4.2s`, `12s`, `45s`) with real-time blur/Enter validation and auto-clamping.
  - **Quick Steppers (`-` / `+`)**: Increment or decrement timeline duration by ±0.5s with single clicks.
  - **Duration Presets Dropdown**: Fast one-click selection of 9 popular animation timings (`1.0s`, `2.5s`, `3.0s`, `5.0s`, `8.0s`, `10.0s`, `15.0s`, `30.0s`, `60.0s`) plus custom input trigger.
  - **Adaptive Timeline Ruler (`TimeRuler`)**:
    - Dynamically calculates major and minor tick intervals based on total duration:
      - `<= 6s`: 0.5s minor ticks, 1.0s labeled major ticks.
      - `<= 15s`: 1.0s minor ticks, 2.0s labeled major ticks.
      - `<= 30s`: 2.0s minor ticks, 5.0s labeled major ticks.
      - `<= 60s`: 5.0s minor ticks, 10.0s labeled major ticks.
      - `> 60s`: 10.0s minor ticks, 30.0s labeled major ticks.
    - Guarantees the final end-of-timeline tick always renders cleanly at 100%.
  - **Undo / Redo & Local Storage Integration**:
    - Duration adjustments automatically push to the 50-step undo/redo stack.
    - Custom duration is persisted to `localStorage` (`motionfx_duration`) and restored across sessions.
    - Synchronized with video exporter so custom durations render accurately to WebM/MP4.

---

## [1.7.0] - 2026-10-27

### Added
- **Multi-Layer Selection System**:
  - Select multiple layers simultaneously via:
    - **Interactive checkboxes** (`[✓]` / `[ ]`) directly on each layer row in the Scene Layers list.
    - **`Ctrl`/`Cmd` + Click** to toggle individual layers into or out of selection.
    - **`Shift` + Click** to select a continuous range of layers between two items.
    - **Select All / Deselect All** toggle button (`CheckSquare`) in the panel header.
  - Active multi-selection highlighting with glowing selection badges across all selected items.
- **Add Multiple Layers to Existing or New Groups**:
  - **New Group from Selected**: Group multiple selected layers into a new organizational group with one click (`FolderPlus`).
  - **Add to Existing Group (`FolderInput`)**:
    - Dropdown menu in the Layers Stack and the Right Inspector displaying all existing groups in the scene with their current member counts.
    - Seamlessly moves all selected layers into the chosen group while maintaining exact world space positioning and keyframe coordinates using 2D affine parent transforms.
    - Automatically expands the target group so newly inserted layers are immediately visible.
  - **Multi-Selection Action Banner**:
    - Appears when multiple layers are selected, offering fast access to **New Group**, **Add to Group ▾**, **Ungroup**, **Batch Delete**, and **Deselect All**.
- **Dedicated Multi-Select Inspector (`MultiSelectSection`)**:
  - When multiple layers are selected, the Right Inspector switches to a focused multi-selection dashboard.
  - Displays interactive chip badges for each selected layer with quick removal (`x`).
  - Group management panel with custom group naming input and existing group assignment selector.
  - One-click batch delete for all selected layers.

---

## [1.6.0] - 2026-10-27

### Added
- **Canvas Resolution & Aspect Ratio Manager (`ResolutionModal`)**:
  - Interactive resolution badges in the Top Header and on the Canvas Stage opening the resolution modal.
  - **Most Used Resolution Presets**:
    - **16:9 Landscape Video**: 1920 × 1080 (1080p Full HD - Standard), 1280 × 720 (720p HD), 3840 × 2160 (4K Ultra HD), and 800 × 450 (Default preview).
    - **9:16 Vertical Video**: 1080 × 1920 (Full HD Vertical for TikTok, Instagram Reels, YouTube Shorts), 720 × 1280 (HD Story format).
    - **1:1 Square & 4:5 Portrait**: 1080 × 1080 (Instagram Feed / Square), 1080 × 1350 (Instagram 4:5 Portrait Feed).
    - **21:9 Ultrawide**: 2560 × 1080 (Cinema Ultrawide Banners & Video).
  - **Custom Resolution Support**:
    - Pixel-exact width (100px - 7680px) and height (100px - 4320px) numeric inputs.
    - Orientation swap button (`⇄`) to instantly flip between Landscape and Portrait dimensions.
    - Live computed aspect ratio indicator (e.g., `16:9`, `9:16`, `1:1`, `4:5`, `21:9`, `3:2`).
    - Quick-ratio base size buttons for rapid switching.
  - **Scale Existing Layers to Fit Option**:
    - Optional smart scaling checkbox: automatically recalibrates layer positions (`x`, `y`), dimensions (`width`, `height`), keyframes, and text font sizes proportionally to fit inside the new canvas viewport.
  - **Responsive Stage & Export Integration**:
    - Canvas Stage automatically applies dynamic aspect-ratio CSS container formatting without distorting coordinates.
    - Video Exporter renders and captures WebM/MP4 video at the exact chosen resolution with high-bitrate scaling (up to 16 Mbps for 4K).
  - **50-Step Undo/Redo & Persistence**:
    - Canvas resolution modifications are recorded in the 50-step undo/redo history and saved in `localStorage`.

---

## [1.5.0] - 2026-10-27

### Added
- **Hierarchical Layer Parenting Mechanism**:
  - Implemented 2D affine hierarchical world transform calculation (`getLayerWorldTransformAtTime`).
  - Child layers inherit parent transforms: movement, rotation, scale, and opacity.
  - Smooth coordinate conversion prevents positional jumps when assigning or clearing parents.
  - Cycle detection (`isDescendantOf`) prevents circular parenting loops.
  - Inspector **Hierarchy & Parenting** section with parent layer dropdown and clear button.
  - Visual parent badge (`↳ Parent Name`) in the Scene Layers list.
- **Drag-and-Drop Scene Layer Reordering**:
  - Native HTML5 drag-and-drop handles (`GripVertical`) in the layer stack for effortless reordering.
  - Realtime drop indicator lines with batch index reordering (`reorderLayersBatch`).
- **Drag-and-Drop Layers from Templates to Main Scene**:
  - New **Templates Library** panel in the Left Sidebar.
  - Browse all built-in templates (Bento Grid, Kinetic Type, Logo Reveal, Dynamic Toast) and expand to inspect their constituent animatable layers.
  - Drag any template layer directly onto the **Canvas Stage** (spawns at exact drop coordinates) or onto the **Timeline** (spawns at dropped timestamp).
  - Quick `+ Add to Scene` button on each template layer.
- **Layer Grouping System**:
  - One-click **Group Layer** button (`FolderPlus`) to encapsulate selected layers into an organizational group.
  - Group container with customizable name, collapse/expand toggle (`FolderOpen`/`Folder`), and child indentation.
  - Moving or animating the group moves all child layers simultaneously.
  - One-click **Ungroup** button (`FolderMinus`) restores layers to independent canvas coordinates without shifting position.
- **Delete All Keyframes Option**:
  - Dedicated **Clear Keyframes** button (`RotateCcw`) in the inspector and layer stack.
  - Freezes current evaluated pose at playhead into a clean static keyframe and deletes all other keyframes.
- **Line Shape in Add Elements**:
  - Added **Line** primitive (`shapeType: 'line'`) to the elements palette with custom stroke, width, color, and animated dashed/dotted marching ants styling.

---

## [1.4.0] - 2026-10-27

### Added
- **50-Step Undo / Redo Mechanism**:
  - Full bidirectional history stack preserving up to 50 granular mutation snapshots (`MAX_HISTORY_STEPS = 50`).
  - Supports undoing and redoing across all scene actions:
    - Layer creations (Shapes, Custom Vector Shapes, Kinetic Text, PNG Assets).
    - Layer deletions, duplicates, and reordering.
    - Transform adjustments and property updates.
    - Keyframe actions (inserting, toggling, moving keyframe times, and deleting keyframes).
    - Scene clearance and template switching.
  - Smart transaction snapshotting with drag-start capture and mutation coalescing to prevent rapid dragging or slider adjustments from exhausting the 50-step buffer.
- **Top Header Undo / Redo Controls**:
  - Dedicated **Undo** and **Redo** button group in the top studio bar with `Undo2` and `Redo2` icons.
  - Active step count badge indicating current history depth (e.g. `1` up to `50` steps).
  - Contextual tooltips displaying hotkeys and current recorded step counts.
- **Global Keyboard Shortcuts**:
  - `Ctrl+Z` / `Cmd+Z`: Undo previous step.
  - `Ctrl+Y` / `Ctrl+Shift+Z` / `Cmd+Shift+Z`: Redo step.
  - Native protection to ignore shortcuts when typing inside text inputs, textareas, or selects.

---

## [1.3.1] - 2026-10-27

### Fixed
- **Canvas Text Font Size Rendering**:
  - Fixed an issue where changing font size in the inspector only expanded the selection bounding box without resizing the text on the canvas.
  - Root cause was the use of CSS custom variable `var(--font-geist-sans)` inside HTML5 Canvas `ctx.font`, which is rejected by browser canvas 2D parsers and caused font assignments to silently fall back to default $10\text{px}$.
  - Replaced with a valid canvas font stack (`bold ${fontSize}px "Geist", "Inter", -apple-system, sans-serif`).
  - Added a smooth dual slider and numeric input in the Inspector for continuous font size adjustment ($12\text{px}$ to $200\text{px}$).

---

## [1.3.0] - 2026-10-27

### Added
- **Move, Scale, and Rotate Controls in Shape Builder**:
  - Independent 2D transformation controls per vector shape layer.
  - **Move**: Direct on-canvas dragging with selection tool plus numeric Position X and Y precision inputs.
  - **Scale**: Interactive slider ($0.2\times$ to $3.0\times$) for instantaneous shape resizing.
  - **Rotate**: Rotation slider ($0^\circ$ to $360^\circ$) and quick $+90^\circ$ rotation button.
  - **Alignment & Transforms**: One-click Center in Canvas (`Crosshair`) and Flip Horizontal / Vertical buttons.

### Fixed
- **Circle & Primitive Shapes Geometry**:
  - Completely re-engineered the Bézier curve point generator for Circle primitives using exact quadrant-matched cubic Bézier control points and Kappa ($0.5522847$). Circles now spawn perfectly round, symmetrical, and smooth without any distortion.
  - Corrected rectangle, star, polygon, and heart primitive point sequences.
- **Scene Layers & Timeline Persistence for Merged Shapes**:
  - Resolved an issue where merged shapes from `/builder` did not persist or appear in the timeline upon returning to the studio.
  - Custom merged shapes are now prepended to the scene layers, auto-saved to persistent storage, rendered on the canvas, and immediately assigned keyframe diamonds on the bottom timeline tracks ready for animation.

---

## [1.2.0] - 2026-10-27

### Added
- **Primitive Shapes in Shape Builder (`/builder`)**:
  - One-click primitives toolbar: **Rectangle** (cubic Bézier box), **Circle** (cubic Bézier 4-arc circle with Kappa approximation), **Star** (inner/outer radius points), **Polygon** (regular hexagons/polygons), and **Line**.
  - Primitive shapes can be added multiple times and combined with pen and freehand paths.
- **Layer Stack System in Shape Builder**:
  - Full multi-layer manager inside the vector builder workstation.
  - Layer operations: reorder up/down, duplicate, delete, and visibility toggle (`Eye`/`EyeOff`).
  - Per-layer properties: individual fill, stroke, stroke width, opacity, and open/close path toggle.
- **Compound Layer Merging (`Merge & Add to Scene`)**:
  - In-builder layer merging tool (`Merge` button) that combines visible shape layers into a single compound path.
  - Global bounding box calculation and multi-contour SVG path serialization (`Path2D`).
  - Primary **"Merge & Add to Scene"** button that merges all visible vector layers and exports them as a single animatable layer in the main MotionFX scene.

---

## [1.1.0] - 2026-10-27

### Added
- **Build Shape Studio (`/builder`)**:
  - Dedicated vector creation workstation inspired by Adobe Illustrator.
  - **Vector Pen Tool (P)**: Click to place anchor vertices, click & drag to pull Bézier tangent handles, snap-to-grid alignment, and click start vertex to close path.
  - **Freehand Brush / Pencil Tool (B)**: Smooth freehand vector stroke drawing.
  - **Eraser Tool (E)**: Interactive circular eraser to delete anchor vertices and path segments with customizable radius.
  - **Direct Node Selection Tool (A)**: Select and drag individual anchor points and curve control handles.
  - **Geometric Presets**: Instant vector templates for Lightning Bolt ⚡, Shield Crest 🛡️, Heart ❤️, and Speech Bubble 💬.
  - **Path Controls**: Fill and stroke color pickers, stroke width, open/close path toggle, millimetric grid snapping, and SVG path code preview.
  - **1-Click "Add to Scene Layers"**: Automatically exports custom vector path into the MotionFX animation canvas as a custom shape layer with full keyframing capabilities.
- **Add Elements Panel Integration**:
  - Added high-visibility **"Build Shape"** studio navigation button in the left sidebar palette.
- **Custom Vector Renderer**:
  - Enhanced shape engine to natively render custom SVG paths (`Path2D`) supporting rounded borders, solid/dashed/dotted borders, and animated marching ants.

### Fixed
- **Timeline Dragging & Real-Time Cursor Tracking**:
  - Resolved timeline playhead sticking issue by binding window-level mousemove and mouseup listeners to both the TimeRuler and TimelineTracks area.
  - Enabled direct drag interaction on the top playhead scrubber handle.
  - Eliminated CSS transition latency on the playhead element for 60 FPS real-time cursor tracking.

---

## [1.0.0] - 2026-10-27

### Initial Release — MotionFX Studio v1.0

A modular, browser-based motion graphics creator web application built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, and the **HTML5 Canvas 2D API**.

---

### Key Features & Capabilities

#### 1. Geometric Shapes & Advanced Border Styling
- **Shape Types**:
  - **Rectangle**: Configurable width, height, and rounded corners.
  - **Circle / Ellipse**: Smooth path rendering with dual radius controls.
  - **Star**: Custom point counts (3 to 12 points) with inner/outer radius geometry and rounded star tips.
  - **Polygon**: Regular n-sided polygons (triangles, pentagons, hexagons, octagons) with vertex arc rounding.
  - **Pill / Capsule**: Automatic radius calculation based on shortest dimension.
- **Border Options**:
  - **Round Borders (Border Radius)**: Live slider ($0$ to $150\text{px}$) with vertex smoothing (`arcTo`).
  - **Border Styles**: Solid, Dashed, Dotted, or None.
  - **Border Width**: Numeric width controls up to $40\text{px}$.
  - **Animated Flow (Marching Ants)**: Dynamic `lineDashOffset` animation for dashed and dotted borders.
  - **Fill & Stroke**: Dual color picker support for fill and stroke outlines.

#### 2. Transforms & Keyframe Engine
- **Animatable Properties**:
  - **Position (X, Y)**: Real-time dragging directly on the canvas or numeric precision input.
  - **Scale (Scale X, Scale Y)**: Independent or proportional scaling with sub-pixel precision.
  - **Rotation**: Full $360^\circ$ rotation around layer center.
  - **Opacity**: Alpha transparency from $0.00$ to $1.00$.
- **Keyframe Controls**:
  - **Individual Diamond Toggles**: Toggle or update keyframes for specific channels at the current playhead.
  - **Key All Transform**: One-click action to record keyframes across all transform properties simultaneously.
  - **Snapping**: Automatic $0.05\text{s}$ time snapping for clean keyframe placement.
- **Interpolation Easing Curves**:
  - `Smooth Ease Out (easeOutCubic)`
  - `Ease In & Out (easeInOutCubic)`
  - `Linear`
  - `Overshoot Pop (backOut)`
  - `Elastic Spring`
  - `Bounce Drop`

#### 3. Kinetic Text Effects Engine
- **Effect Modes**:
  - **Typewriter**: Progressive character reveal with a blinking block cursor (`▍`).
  - **Cyber Morph / Scramble Glitch**: Smoothly transitions from an initial phrase to a target phrase using glyph scrambling (`!@#$%^&*<>[]{}`).
  - **Sine Wave Dance**: Per-character undulating wave animation with phase offset.
  - **Letter Pop Cascade**: Staggered overshoot bouncy pop-in for individual letters.
  - **Neon Pulsar**: Glowing text outline with animated pulsating shadow intensity.
- **Customization**:
  - Font size controls ($12\text{px}$ to $180\text{px}$).
  - Text color and stroke customization.
  - Target phrase field for morph animations.

#### 4. Custom PNG & Sticker Asset Pipeline
- **PNG / Image Upload**:
  - File picker accepting `.png`, `.jpg`, `.jpeg`, `.svg`, and `.webp`.
  - Automatic aspect ratio calculation and canvas scaling.
  - Image caching to prevent canvas re-render lag.
  - Supports rounded borders (canvas clipping) and custom border strokes.
- **Built-in Vector Sticker Presets**:
  - 🚀 **Rocket** (Speed & Launch badge)
  - ✨ **Magic Sparkle** (Gleam badge)
  - 👑 **VIP Crown** (Gold emblem)
  - ⚡ **Bolt Power** (Energy polygon)
  - 🔥 **Flame** (Fire element)
  - 💎 **Diamond Pro** (Cyan dashed diamond)

#### 5. Trendy Motion Graphics Templates
One-click pre-configured templates accessible from the header:
- **Bento Grid Pop**: Modern UI bento grid cards popping up with staggered bouncy spring timing, rounded borders, dashed accents, and a floating star badge.
- **Kinetic Typography**: Morphing cyber headline text accompanied by a rotating dotted orbit ring and undulating sine wave subtitles.
- **Logo Reveal Badge**: Rotating dashed hexagon with an inner 8-point gold star emblem and letter pop cascade title reveal.
- **Dynamic Island Toast**: Modern iOS/macOS style dark notification card sliding down with spring overshoot, custom PNG app icon, and status badge.

#### 6. Interactive Bottom Timeline & Sequencer
- **Transport Controls**:
  - Jump to Start, Play / Pause (toggleable via `Spacebar`), Stop, and Loop toggle.
  - Duration Selector: Select between $3\text{s}$, $5\text{s}$, $8\text{s}$, and $10\text{s}$ project timelines.
  - Hundredth-second timecode readout (e.g. `02.40s / 05.00s`).
- **Time Ruler**:
  - Half-second and full-second graduation ticks with time labels.
  - Click or scrub anywhere along the ruler to immediately seek the playhead.
- **Keyframe Tracks**:
  - Left pane listing all scene layers and animated properties.
  - Right pane with timeline lanes displaying keyframe diamonds (`♦`) positioned by percentage.
  - **Draggable Keyframes**: Click and drag any keyframe diamond directly along the lane to re-time animations.
  - **Keyframe Selection & Deletion**: Highlight selected diamonds with a gold glow; delete using the toolbar button or `Delete` / `Backspace` key.
- **Playhead**:
  - Smooth vertical playhead line with scrubber handle indicating exact playback position.

#### 7. Canvas Video Export (WebM / MP4)
- **High-Framerate Video Capture**: Uses HTML5 Canvas `captureStream(60)` and `MediaRecorder` at $8\text{ Mbps}$ bitrate.
- **Rendering Progress Dialog**: Real-time progress bar showing render percentage ($0\%$ to $100\%$) and elapsed time.
- **Clean Output**: Automatically hides selection gizmos, alignment guides, and crosshairs during export rendering.
- **Automatic Download**: Packages and downloads `MotionFX_Animation_<timestamp>.webm` directly to the user's computer.
- **Confetti Celebration**: Triggers particle confetti upon render completion.

---

### Architecture & Modularity

The project is structured into self-contained modules to facilitate adding or removing features:

```
src/
├── types/
│   └── motion.ts                 # Central data models and TypeScript contracts
├── modules/
│   ├── easing/
│   │   └── easings.ts            # Mathematical interpolation curves
│   ├── keyframes/
│   │   └── evaluator.ts          # Keyframe evaluation, interpolation & mutations
│   ├── renderers/
│   │   ├── shapes.ts             # Shape drawing routines (rect, circle, star, poly, pill)
│   │   ├── text.ts               # Kinetic text effect plugins
│   │   ├── media.ts              # Image and PNG loader, cache & clipping
│   │   └── engine.ts             # Canvas composition, guides & selection gizmos
│   ├── assets/
│   │   └── stickers.ts           # Sticker presets registry
│   ├── templates/
│   │   └── index.ts              # Template registry
│   └── export/
│       └── videoExporter.ts      # Canvas captureStream & MediaRecorder export engine
├── context/
│   └── MotionContext.tsx         # Unified state store and action dispatchers (useMotion hook)
├── components/
│   ├── Header.tsx                # Studio header & global actions
│   ├── LeftSidebar/              # Elements palette & scene layer manager
│   ├── CanvasStage/              # Interactive canvas stage & drag-to-position
│   ├── RightInspector/           # Property panels (Transform, Shape, Text)
│   ├── Timeline/                 # Transport controls, ruler, lanes & keyframe editor
│   └── ExportModal.tsx           # Export progress dialog
└── app/
    ├── layout.tsx                # HTML shell & font definitions
    ├── globals.css               # Studio dark theme & custom styling
    └── page.tsx                  # Root Next.js page assembly
```
