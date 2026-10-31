# MotionFX Codebase File Index

This file tracks every source file in the project, its purpose, exports, and relationships. It is updated whenever codebase changes are made.

---

## 1. Application Root & Routing (`src/app/`)

| File | Purpose | Key Exports / Roles | Notes / Recent Changes |
|------|---------|---------------------|------------------------|
| `src/app/layout.tsx` | Next.js root layout | `RootLayout`, metadata, fonts | Sets dark theme font variables and base body styling. |
| `src/app/page.tsx` | Main studio page | `MotionGraphicsStudioPage` | Houses `Header`, `LeftSidebar`, `CanvasStage`, `RightInspector`, `Timeline`, and modals. Features draggable resizing handles for Left Sidebar, Right Inspector, and Timeline with localStorage persistence. |
| `src/app/builder/page.tsx` | Vector Shape Builder Studio | `ShapeBuilderStudioPage` | Dedicated vector shape creation / boolean operations suite. |
| `src/app/globals.css` | Global styling and Tailwind | Tailwind base utilities, checkerboard patterns, keyframe diamond styles | Styling for timeline lanes, canvas checkered background, and diamonds. |
| `src/app/favicon.ico` | App icon | Asset | Application favicon. |

---

## 2. Core Context & State (`src/context/`)

| File | Purpose | Key Exports / Roles | Notes / Recent Changes |
|------|---------|---------------------|------------------------|
| `src/context/MotionContext.tsx` | Master state provider for the entire motion graphics engine | `MotionProvider`, `useMotion`, `MotionContext` | Manages layers, playhead (`currentTime`, `duration`), playback, undo/redo history, multi-selection, group hierarchy, keyframing actions. Supports `isAutoKeyframe` (auto-records keyframes on movement), `selectedKeyframes` (multi-keyframe selection), and `deleteSelectedKeyframes` / `moveMultipleKeyframes`. New layers initialize with empty keyframes (`[]`). |

---

## 3. Data Types (`src/types/`)

| File | Purpose | Key Exports / Roles | Notes / Recent Changes |
|------|---------|---------------------|------------------------|
| `src/types/motion.ts` | Central TypeScript interfaces & types | `Layer`, `Keyframe`, `AnimatableProp`, `TransformState`, `SelectedKeyframeRef`, `CanvasResolution`, etc. | Defines the layer schema including base transforms (`x`, `y`, `scaleX`, `scaleY`, `rotation`, `opacity`), grouping, path follower, bar/branching configs, and templates. |

---

## 4. Keyframe & Animation Modules (`src/modules/`)

| File | Purpose | Key Exports / Roles | Notes / Recent Changes |
|------|---------|---------------------|------------------------|
| `src/modules/keyframes/evaluator.ts` | Interpolation and keyframe math | `getInterpolatedValue`, `getLayerTransformAtTime`, `getLayerWorldTransformAtTime`, `setOrUpdateKeyframe`, `removeKeyframeAtIndex`, `isDescendantOf` | Evaluates properties across keyframes with easing curves. Falls back to layer base transforms when no keyframes exist. Supports 0 keyframes. |
| `src/modules/easing/easings.ts` | Mathematical easing curves | `Easings`, `EasingName`, cubic bezier / elastic / bounce equations | Provides easing equations for smooth interpolation between keyframe timestamps. |
| `src/modules/renderers/engine.ts` | High-performance HTML5 Canvas rendering engine | `renderSceneToCanvas` | Renders all visible layers, handles parent/world transform compositions, selection bounding boxes, rotation handles, and scale anchors. |
| `src/modules/renderers/shapes.ts` | Shape rasterizer | `renderShape` | Draws rectangles, circles, stars, polygons, badges, speech bubbles, and custom SVG paths. |
| `src/modules/renderers/text.ts` | Text rendering and kinetic typography | `renderText` | Renders styled text, text shadows, and animations (typewriter, wave, bounce, neon glow, blur in, split char). |
| `src/modules/renderers/bar.ts` | Data bar & progress graph renderer | `renderBar` | Draws animated progress bars, circular meters, battery gauges, segmented bars. |
| `src/modules/renderers/branching.ts` | Mind map / tree branching renderer | `renderBranching` | Draws curved/straight branch lines, tree nodes, and branching endpoints. |
| `src/modules/renderers/pathFollower.ts` | Move along path / particle follower | `renderPathFollower` | Animates objects/emojis along curved bezier paths with orientation and fade. |
| `src/modules/renderers/media.ts` | Image layer renderer | `renderImage` | Draws image assets with borders and transforms. |
| `src/modules/templates/index.ts` | Built-in design templates | `TEMPLATES`, `getTemplateById` | Pre-configured motion templates (Bento Grid, Kinetic Text, Promo, Product Showcase, etc.). |
| `src/modules/fonts/googleFonts.ts` | Google Fonts catalog & loader | `GOOGLE_FONTS`, `loadGoogleFont` | Dynamically injects Google Fonts for typography layers. |
| `src/modules/export/videoExporter.ts` | Video/GIF rendering engine | `renderProjectToWebM`, `renderProjectToMp4` | Encodes canvas frames into WebM/MP4 video files at target FPS and resolution. |
| `src/modules/assets/stickers.ts` | Pre-bundled sticker & vector graphics | Sticker SVG definitions | Stock graphics for fast composition. |

---

## 5. UI Components (`src/components/`)

### Main Stage & Workspace
| File | Purpose | Key Exports / Roles | Notes / Recent Changes |
|------|---------|---------------------|------------------------|
| `src/components/Header.tsx` | Top studio navigation bar | `Header` | Undo/redo buttons, resolution switcher, zoom controls, export trigger, custom shape builder link. |
| `src/components/CanvasStage/index.tsx` | Interactive stage & canvas viewport | `CanvasStage` | Manages canvas rendering loop, selection marquee, on-canvas dragging, direct text inline editing, scaling, rotating, and guide overlays. |
| `src/components/ResolutionModal.tsx` | Canvas aspect ratio & dimensions modal | `ResolutionModal` | Presets (16:9, 9:16, 1:1, 4:5, 4K, 1080p, etc.). |
| `src/components/BuildShapeModal.tsx` | Quick shape builder popup | `BuildShapeModal` | Fast custom SVG shape creation. |
| `src/components/ExportModal.tsx` | Video export progress modal | `ExportModal` | Frame-by-frame export progress and download. |
| `src/components/ExportSettingsModal.tsx` | Video export configuration modal | `ExportSettingsModal` | Resolution, FPS, bitrate, and format choices. |

### Left Sidebar (`src/components/LeftSidebar/`)
| File | Purpose | Key Exports / Roles | Notes / Recent Changes |
|------|---------|---------------------|------------------------|
| `src/components/LeftSidebar/index.tsx` | Left dock tab manager | `LeftSidebar` | Resizable container housing Elements, Layers, and Templates tabs. |
| `src/components/LeftSidebar/AddElementsPanel.tsx` | Element picker palette | `AddElementsPanel` | Buttons to insert shapes, text, images, stickers, path followers, bars, and trees. |
| `src/components/LeftSidebar/LayersStackPanel.tsx` | Layer hierarchy & order stack | `LayersStackPanel` | Layer list, drag-and-drop reordering, grouping, parenting, visibility/lock toggles. |
| `src/components/LeftSidebar/TemplatesBrowserPanel.tsx` | Template selector | `TemplatesBrowserPanel` | Template cards for instant loading or importing as groups. |

### Right Inspector (`src/components/RightInspector/`)
| File | Purpose | Key Exports / Roles | Notes / Recent Changes |
|------|---------|---------------------|------------------------|
| `src/components/RightInspector/index.tsx` | Property inspector container | `RightInspector` | Resizable dock hosting sections based on selected layer type. |
| `src/components/RightInspector/TransformSection.tsx` | Transform controls | `TransformSection` | Inputs for X, Y, Scale, Rotation, Opacity, and individual keyframe toggles. |
| `src/components/RightInspector/ShapeStyleSection.tsx` | Styling options | `ShapeStyleSection` | Fill, stroke, border width, border radius, dashing, easing. |
| `src/components/RightInspector/TextEffectSection.tsx` | Typography inspector | `TextEffectSection` | Text string, font family, font size, weight, and animation effects. |
| `src/components/RightInspector/ParentHierarchySection.tsx` | Parenting inspector | `ParentHierarchySection` | Select parent layer to establish transform hierarchy. |
| `src/components/RightInspector/MultiSelectSection.tsx` | Batch inspector | `MultiSelectSection` | Align, distribute, and group multiple selected layers. |
| `src/components/RightInspector/BarInspectorSection.tsx` | Bar shape inspector | `BarInspectorSection` | Progress percentage, bar thickness, label settings. |
| `src/components/RightInspector/BranchingInspectorSection.tsx` | Branching tree inspector | `BranchingInspectorSection` | Branch count, spread, curvature, length. |
| `src/components/RightInspector/PathFollowerInspectorSection.tsx` | Motion path inspector | `PathFollowerInspectorSection` | Follower speed, emoji, orientation, track path editor. |

### Timeline & Sequencer (`src/components/Timeline/`)
| File | Purpose | Key Exports / Roles | Notes / Recent Changes |
|------|---------|---------------------|------------------------|
| `src/components/Timeline/index.tsx` | Sequencer dock container | `Timeline` | Resizable height container with Transport Controls, Time Ruler, and Tracks. |
| `src/components/Timeline/TransportControls.tsx` | Playback & Keyframe toolbar | `TransportControls` | Play, pause, stop, loop, timecode, duration stepper, "Add Keyframe at Playhead", "Auto Keyframe" toggle (with live indicator & localStorage persistence), and dynamic single/multi "Delete Keyframes" button. |
| `src/components/Timeline/TimeRuler.tsx` | Timeline top time ruler | `TimeRuler` | Second ticks, frame indicators, and click/drag time scrubber. |
| `src/components/Timeline/TimelineTracks.tsx` | Track lanes & keyframe sequencer | `TimelineTracks` | Single synchronized scroll container for layer names and track lanes. Supports box-selection (marquee drag) of keyframes across tracks, multi-keyframe moving/dragging in sync, visual selection highlighting (`.selected` glow), and keyboard shortcuts (`Delete`/`Backspace`). |

### Common Helpers (`src/components/common/`)
| File | Purpose | Key Exports / Roles | Notes / Recent Changes |
|------|---------|---------------------|------------------------|
| `src/components/common/GoogleFontPicker.tsx` | Google Fonts selector | `GoogleFontPicker` | Searchable font dropdown with live preview. |
