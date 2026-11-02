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
| `src/context/MotionContext.tsx` | Master state provider for the entire motion graphics engine | `MotionProvider`, `useMotion`, `MotionContext` | Manages layers, multi-composition system (`compositions`, `activeCompositionId`, `switchComposition`, `createBlankComposition`, `deleteComposition`, `renameComposition`), default blank composition on launch (empty canvas, 5s), safe template loading, initial start & end keyframes for all 8 special shapes (`bar`, `branching`, `pathFollower`, `array`, `card`, `pathDraw`, `button`, `cursor`), `addStartAndEndKeyframes` helper, keyframing actions (`toggleKeyframe`, `setAnimPropValue`), and reversible isotropic resolution scaling. |

---

## 3. Data Types (`src/types/`)

| File | Purpose | Key Exports / Roles | Notes / Recent Changes |
|------|---------|---------------------|------------------------|
| `src/types/motion.ts` | Central TypeScript interfaces & types | `Layer`, `Composition`, `Keyframe`, `AnimatableProp`, `TransformState`, `SelectedKeyframeRef`, `CanvasResolution`, `ArrayItemShape`, `ArrayAnimType`, `CardAnimType`, `CardShape`, `CardItem`, `PathDrawType`, `PathAnimStyle`, `PathDrawTextAnim`, `ButtonStyle`, `ButtonAnimation`, `ButtonIcon`, `CursorType`, `CursorPathMode`, `CursorClickAnim`, `PathPoint`, etc. | Defines the layer schema, multi-composition interface (`Composition`), base transforms (`x`, `y`, `scaleX`, `scaleY`, `rotation`, `opacity`), top-level In/Out transitions (`fadeInOut`, `fadeDuration`, `scaleInOut`, `scaleDuration`, `scaleStartValue`), and animatable properties for all 8 special motion shapes. |

---

## 4. Keyframe & Animation Modules (`src/modules/`)

| File | Purpose | Key Exports / Roles | Notes / Recent Changes |
|------|---------|---------------------|------------------------|
| `src/modules/keyframes/evaluator.ts` | Interpolation and keyframe math | `getInterpolatedValue`, `getLayerTransformAtTime`, `getLayerWorldTransformAtTime`, `setOrUpdateKeyframe`, `removeKeyframeAtIndex`, `isDescendantOf` | Evaluates properties across keyframes with easing curves. Falls back to layer base values when no keyframes exist. Evaluates top-level Fade In/Out and Scale In/Out transitions multiplicatively on top of base transforms without modifying or overwriting normal keyframes. |
| `src/modules/easing/easings.ts` | Mathematical easing curves | `Easings`, `EasingName`, cubic bezier / elastic / bounce equations | Provides easing equations for smooth interpolation between keyframe timestamps. |
| `src/modules/renderers/engine.ts` | High-performance HTML5 Canvas rendering engine | `renderSceneToCanvas` | Renders all visible layers, handles parent/world transform compositions, selection bounding boxes, rotation handles, scale anchors, and interactive bezier curve handles for `pathFollower`, custom `pathDraw`, and custom `cursor`. |
| `src/modules/renderers/shapes.ts` | Shape rasterizer | `renderShape` | Draws rectangles, circles, stars, polygons, badges, speech bubbles, and dispatches special shape renderers (`bar`, `branching`, `pathFollower`, `array`, `card`, `pathDraw`, `button`, `cursor`). |
| `src/modules/renderers/text.ts` | Text rendering and kinetic typography | `renderText` | Renders styled text, text shadows, and animations (typewriter, wave, bounce, neon glow, blur in, split char). |
| `src/modules/renderers/bar.ts` | Data bar & progress graph renderer | `renderBarShape` | Draws animated progress bars, circular meters, battery gauges, segmented bars. Supports keyframing `barPercentage` via `getInterpolatedValue`. |
| `src/modules/renderers/branching.ts` | Mind map / tree branching renderer | `renderBranchingShape` | Draws curved/straight branch lines, tree nodes, and branching endpoints. Supports keyframing `branchGrowth` lifetime (0-100%) from start to end, root-first trunk growth (`branchGrowTrunk`), and staggered organic blossoming (`branchStagger`). |
| `src/modules/renderers/pathFollower.ts` | Move along path / particle follower | `renderPathFollower`, `buildSampledPath`, `getPointAtProgress`, `PATH_PRESETS`, `DEFAULT_PATH_POINTS` | Animates objects/emojis along curved bezier paths with orientation and fade. Exports path sampling utilities reused across motion modules. |
| `src/modules/renderers/array.ts` | Array & Grid Matrix motion renderer | `renderArrayShape` | Renders customizable rows x cols item matrices with spring pop, wave, ripple, drop, and custom emoji spawning. Supports custom element layers (shapes, texts, icons, images), borders, random sizes, and random rotations. Supports keyframing `arrayProgress`. |
| `src/modules/renderers/card.ts` | Card stack motion renderer | `renderCardShape` | Renders multi-card decks with customizable shapes (rounded, chamfer, sharp rect, pill, frosted glass), layer system (`cardItems`) supporting individual images, titles, shapes, and borders per card, and keyframe-aware opacity animation (multiplies `tr.opacity`). |
| `src/modules/renderers/pathDraw.ts` | Path draw & text flow renderer | `renderPathDrawShape` | Renders write-on stroke line animations (arc, wave, spiral, infinity, custom bezier), interactive Pen Tool spline point specification, styles (`writeOn`, `laserBeam`, `dashFlow`, `pulseGlow`), and kinetic text flowing along curve. |
| `src/modules/renderers/button.ts` | Interactive button motion renderer | `renderButtonShape` | Renders customizable button shapes: pill, rounded, sharp rect, cyberpunk chamfer, two-tone gradient, outline, frosted glassmorphism, floating circular FAB, and toggle switch. Supports button width/height sizing, border width, border color, corner radius, solid/dashed/dotted stroke styling, neon glow shadows, dedicated ON color and OFF color states with smooth toggle track transitions, knob color, vector icons (13 variants), icon placements (left, right, icon-only), ripple wave & pulse animations, and keyframable `buttonProgress` switch states. |
| `src/modules/renderers/cursor.ts` | Motion cursor & flight renderer | `renderCursorShape` | Renders customizable cursors (pointer, hand, crosshair, beam, dot), custom spline paths along `pathPoints`, tangent flight orient-to-motion, explicit click timestamp parsing (`cursorClickTimes`), visible flight trajectory guide, and keyframed `cursorProgress`. Includes non-negative modulo protection and radius clamping against IndexSizeError during playback. |
| `src/modules/renderers/media.ts` | Image layer renderer | `renderImage` | Draws image assets with borders and transforms. |
| `src/modules/templates/index.ts` | Built-in design templates | `TEMPLATES`, `getTemplateById` | Pre-configured motion templates (Bento Grid, Kinetic Text, Promo, Product Showcase, etc.). |
| `src/modules/fonts/googleFonts.ts` | Google Fonts catalog & loader | `GOOGLE_FONTS`, `loadGoogleFont` | Dynamically injects Google Fonts for typography layers. |
| `src/modules/export/videoExporter.ts` | Video/GIF rendering engine | `renderProjectToWebM`, `renderProjectToMp4` | Encodes canvas frames into WebM/MP4 video files at target FPS and resolution. |
| `src/modules/assets/stickers.ts` | Pre-bundled sticker & vector graphics | `STICKER_PRESETS`, `createEmojiSticker`, `svgToDataUrl` | Catalog of scalable SVG badge, reaction, tech, and popular sticker presets, plus dynamic custom emoji SVG badge generator. |

---

## 5. UI Components (`src/components/`)

### Main Stage & Workspace
| File | Purpose | Key Exports / Roles | Notes / Recent Changes |
|------|---------|---------------------|------------------------|
| `src/components/Header.tsx` | Top studio navigation bar | `Header` | Styled MotionFX logo with glowing bold typography. Houses Composition Switcher, "New Blank" composition button, Templates dropdown, Resolution modal trigger, Canvas Snapping (`Magnet`) toggle button with keyboard shortcut (S), undo/redo, FPS settings, and video export. Hidden/removed previous Build Shape studio button. |
| `src/components/CanvasStage/index.tsx` | Interactive stage & canvas viewport | `CanvasStage` | Manages canvas rendering loop, selection marquee, on-canvas dragging with smart alignment snapping (canvas center, edges, and other layer positions) and cyan dashed snap guide lines, direct text inline editing, scaling, rotating, interactive bezier control points for `custom`, `pathFollower`, `pathDraw`, and `cursor`, pen tool anchor creation (`isPenEditing`), and keyboard shortcuts (`S` for snap toggle, `Ctrl+E` for merge layers). |
| `src/components/ResolutionModal.tsx` | Canvas aspect ratio & dimensions modal | `ResolutionModal` | Presets (16:9, 9:16, 1:1, 4:5, 4K, 1080p, etc.). |
| `src/components/BuildShapeModal.tsx` | Quick shape builder popup | `BuildShapeModal` | Fast custom SVG shape creation. |
| `src/components/ExportModal.tsx` | Video export progress modal | `ExportModal` | Frame-by-frame export progress and download. |
| `src/components/ExportSettingsModal.tsx` | Video export configuration modal | `ExportSettingsModal` | Resolution, FPS, bitrate, and format choices. |

### Left Sidebar (`src/components/LeftSidebar/`)
| File | Purpose | Key Exports / Roles | Notes / Recent Changes |
|------|---------|---------------------|------------------------|
| `src/components/LeftSidebar/index.tsx` | Left dock tab manager | `LeftSidebar` | Resizable container housing Elements, Layers, and Templates tabs. |
| `src/components/LeftSidebar/AddElementsPanel.tsx` | Element picker palette | `AddElementsPanel` | Buttons to insert standard shapes (Line, Rect, Circle, Star, Poly, Pill, and Pen Tool for custom vector shapes), text, upload images, add Stickers (opens inspector catalog), and 8 Special Shapes & Motions (Bar, Branching, Path Move, Array, Cards, Path Draw, Button, Cursor). Hidden/removed previous Build Shape studio option. |
| `src/components/LeftSidebar/LayersStackPanel.tsx` | Layer hierarchy & order stack | `LayersStackPanel` | Layer list, drag-and-drop reordering, grouping, parenting, visibility/lock toggles, and 1-click Merge button for combining multiple selected layers into a single rasterized image layer (`mergeSelectedLayers`). |
| `src/components/LeftSidebar/TemplatesBrowserPanel.tsx` | Template selector | `TemplatesBrowserPanel` | Template cards for safe exploration. Includes "Open as Comp" (opens template in dedicated composition without touching current work) and "Add as Group" (inserts into current scene as an isolated group folder). |

### Right Inspector (`src/components/RightInspector/`)
| File | Purpose | Key Exports / Roles | Notes / Recent Changes |
|------|---------|---------------------|------------------------|
| `src/components/RightInspector/index.tsx` | Property inspector container | `RightInspector` | Resizable dock hosting sections based on selected layer type. |
| `src/components/RightInspector/ColorPickerWithAlpha.tsx` | Color picker with alpha transparency | `ColorPickerWithAlpha`, `parseColorAndAlpha`, `formatColorWithAlpha` | Universal color picker with native RGB hex selection, real-time alpha/transparency slider (0–100%), checkerboard transparency swatch, and quick opacity presets (0%, 25%, 50%, 75%, 100%). |
| `src/components/RightInspector/TransformSection.tsx` | Transform controls | `TransformSection` | Inputs for X, Y, Scale, Rotation, Opacity, individual keyframe toggles, interpolation easing dropdown, and top-level In/Out Transitions (Fade In/Out and Scale In/Out toggles with customizable duration sliders). |
| `src/components/RightInspector/ShapeStyleSection.tsx` | Styling options | `ShapeStyleSection` | Fill & Stroke with alpha transparency via `ColorPickerWithAlpha`, border width, border radius, dashing, and on-canvas Pen Tool controls (Edit Vertices toggle, Open/Close path toggle, and vertex reset) for custom vector shapes. |
| `src/components/RightInspector/TextEffectSection.tsx` | Typography inspector | `TextEffectSection` | Text string, font family, font size, weight, kinetic animation effects, and Text Color & Alpha transparency. |
| `src/components/RightInspector/ParentHierarchySection.tsx` | Parenting inspector | `ParentHierarchySection` | Select parent layer to establish transform hierarchy. |
| `src/components/RightInspector/MultiSelectSection.tsx` | Batch inspector | `MultiSelectSection` | Align, distribute, and group multiple selected layers. Includes 1-click "Merge Layers" action card (combines selected layers into 1 rasterized layer, also mapped to `Ctrl+E`). |
| `src/components/RightInspector/BarInspectorSection.tsx` | Bar shape inspector | `BarInspectorSection` | Progress percentage, bar thickness, label settings, and keyframing diamond toggle button with auto-keyframing support. Supports free slider movement when unkeyframed and smooth keyframe recording when keyframed. |
| `src/components/RightInspector/BranchingInspectorSection.tsx` | Branching tree inspector | `BranchingInspectorSection` | Branch count, spread, curvature, length. Includes keyframable Branch Lifetime & Growth slider (0-100%) with diamond keyframe toggle button, quick presets (0%, 25%, 50%, 75%, 100%), animation mode switcher (Keyframed Lifetime vs Auto Loop Timer), root-first trunk growth toggle, and staggered organic branch blossoming. |
| `src/components/RightInspector/PathFollowerInspectorSection.tsx` | Motion path inspector | `PathFollowerInspectorSection` | Follower speed, emoji, orientation, track path editor. |
| `src/components/RightInspector/ArrayInspectorSection.tsx` | Array matrix inspector | `ArrayInspectorSection` | Sub-tabs for Elements, Shape & Style, and Grid & Motion. Custom element layer pool (Shapes, Texts, Icons, Images) with add/delete, spawn distribution mode (Cycle or Random), border width/color, random size variance, and random rotation. Keyframable progress diamond toggle with auto-keyframing support. |
| `src/components/RightInspector/CardInspectorSection.tsx` | Card stack inspector | `CardInspectorSection` | Tabbed inspector (`Stack & Motion`, `Card Layers`, `Shape & Border`). Card shape geometry picker (rounded, chamfer, sharp rect, pill, glassmorphic), card layer system (`cardItems`) with add/move/delete, individual card image uploads, per-card shape/colors/borders, global border width & radius sliders, and animated card opacity support. |
| `src/components/RightInspector/PathDrawInspectorSection.tsx` | Path draw inspector | `PathDrawInspectorSection` | Dedicated Pen Tool control bar with 1-click active on-canvas point editing banner, reset points, custom bezier spline specification, predefined geometries (wave, arc, spiral, infinity, straight line), line write-on progress keyframing, and kinetic text on path. |
| `src/components/RightInspector/ButtonInspectorSection.tsx` | Motion button inspector | `ButtonInspectorSection` | Streamlined tabbed inspector (`Shape & Style`, `Motion & State`). Removed empty Content & Icon tab and consolidated rich typography controls into `Shape & Style`: hide button text toggle (`btnHideText`), text and subtext inputs, font size slider (`btnFontSize`), Google Font family dropdown (`btnFontFamily`), font weight selector (`btnFontWeight`), text & subtext color pickers, and integrated icon picker (13 icons, left/right/icon-only placement, custom emoji). Shape selectors (pill, rounded, sharp rect, chamfer cut-corners, gradient, outline, glassmorphism, floating FAB, toggle switch), integer pixel inputs for Width & Height with quick size presets, dedicated ON/OFF color pickers, knob color, border styling, and toggle switch keyframe diamond. |
| `src/components/RightInspector/StickerInspectorSection.tsx` | Sticker & graphic inspector | `StickerInspectorSection` | Dedicated sticker customization panel: category tabs (Popular, Badges, Reactions, Tech), SVG sticker preset picker grid, custom emoji sticker generator with shape selection (squircle, circle, hexagon, transparent) and gradient colors, size presets & uniform slider, frame border width/color and corner radius controls, plus direct custom PNG upload. |
| `src/components/RightInspector/CursorInspectorSection.tsx` | Motion cursor inspector | `CursorInspectorSection` | Cursor types (pointer, hand, crosshair, beam, dot), flight path modes (custom spline, orbit, linear, float), Pen Tool canvas spline editor, flight progress keyframing diamond toggle, explicit click timestamps input, orient-to-motion toggle, and show trajectory track toggle. |

### Timeline & Sequencer (`src/components/Timeline/`)
| File | Purpose | Key Exports / Roles | Notes / Recent Changes |
|------|---------|---------------------|------------------------|
| `src/components/Timeline/index.tsx` | Master timeline sequencer | `Timeline` | Playback transport controls, playhead scrubber, zoom slider, "Add Keyframe at Playhead" button, "Auto Keyframe" toggle button, and track lanes. Supports After Effects keyboard shortcuts: `Ctrl+Shift+D` to split layer at playhead, `[` to trim in-point to playhead, `]` to trim out-point to playhead, Space to play/pause, Delete/Backspace to delete keyframe or layer. |
| `src/components/Timeline/TimelineHeader.tsx` | Playhead time ruler & timecode | `TimelineHeader` | Displays time markers in seconds, clickable playhead scrubbing, and zoom scaling. |
| `src/components/Timeline/TimelineTracks.tsx` | Layer lanes & keyframe diamonds | `TimelineTracks` | After Effects style interactive layer bars for every layer with Left trim handle (In-point), Right trim handle (Out-point), draggable layer body that shifts entire layer span in time while maintaining synchronous keyframe offsets, and visual In/Out transition badges (`Fade`, `Scale`). Double-click jumps playhead to layer in-point. Supports keyframe diamond dragging, box marquee selection, and background click-to-scrub. |
| `src/components/Timeline/TransportControls.tsx` | Playback and timeline action toolbar | `TransportControls` | Transport buttons (Play, Pause, Stop, Seek Start, Loop), timecode display, custom duration dropdown, Add Keyframe, Auto-Keyframe toggle, Delete Keyframe(s), 1-click Split Layer button (`Scissors`), Trim In-Point (`[`), Trim Out-Point (`]`), and 1-click Top-Level Transitions: **Fade In/Out** (`Sparkles`) and **Scale In/Out** (`Maximize2`). |
