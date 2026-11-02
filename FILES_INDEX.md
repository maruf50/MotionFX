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
| `src/context/MotionContext.tsx` | Master state provider for the entire motion graphics engine | `MotionProvider`, `useMotion`, `MotionContext` | Manages layers, multi-composition system (`compositions`, `activeCompositionId`, `switchComposition`, `createBlankComposition`, `deleteComposition`, `renameComposition`), default blank composition on launch (empty canvas, 5s), safe template loading, initial start & end keyframes for all 8 special shapes (`bar`, `branching`, `pathFollower`, `array`, `card`, `pathDraw`, `button`, `cursor`), `addStartAndEndKeyframes` helper, keyframing actions (`toggleKeyframe`, `setAnimPropValue`), and isotropic layer creation and resolution scaling so objects maintain exact 1:1 aspect ratios in vertical (9:16) and square (1:1) resolutions without vertical elongation. |

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
| `src/modules/renderers/engine.ts` | High-performance HTML5 Canvas rendering engine | `renderSceneToCanvas` | Renders all visible layers, handles parent/world transform compositions, selection bounding boxes, rotation handles, scale anchors, and interactive bezier curve handles for `pathFollower`, custom `pathDraw`, and custom `cursor`. Features resolution-independent gizmo scaling (`gizmoScale`) so handles, stems, borders, and anchors maintain constant screen size and visibility across vertical (9:16), horizontal (16:9), square (1:1), and 4K resolutions. |
| `src/modules/renderers/shapes.ts` | Shape rasterizer | `renderShape` | Draws rectangles, circles, stars, polygons, badges, speech bubbles, and dispatches special shape renderers (`bar`, `branching`, `pathFollower`, `array`, `card`, `pathDraw`, `button`, `cursor`). |
| `src/modules/renderers/text.ts` | Text rendering and kinetic typography | `renderText` | Renders styled text, text shadows, and animations (typewriter, wave, bounce, neon glow, blur in, split char). Supports keyframable text animation progress (`textProgress`) across 0% to 100%. |
| `src/modules/renderers/filters.ts` | Top-level layer filter & FX post-processing | `applyLayerFilter` | High-performance canvas filters for all layer types: Glow, Wave, Black & White, Glitch, Noise, Shatter, and Wobble, fully keyframable with 0-100% intensity (`filterIntensity`). |
| `src/modules/renderers/bar.ts` | Data bar & progress graph renderer | `renderBarShape` | Draws animated progress bars, circular meters, battery gauges, segmented bars. Supports keyframing `barPercentage` via `getInterpolatedValue`. |
| `src/modules/renderers/branching.ts` | Mind map / tree branching renderer | `renderBranchingShape` | Draws curved/straight branch lines, tree nodes, and branching endpoints. Supports keyframing `branchGrowth` lifetime (0-100%) from start to end, root-first trunk growth (`branchGrowTrunk`), and staggered organic blossoming (`branchStagger`). |
| `src/modules/renderers/pathFollower.ts` | Move along path / particle follower | `renderPathFollower`, `buildSampledPath`, `getPointAtProgress`, `PATH_PRESETS`, `DEFAULT_PATH_POINTS` | Animates objects/emojis along curved bezier paths with orientation and fade. Exports path sampling utilities reused across motion modules. |
| `src/modules/renderers/array.ts` | Array & Grid Matrix motion renderer | `renderArrayShape` | Renders customizable rows x cols item matrices with spring pop, wave, ripple, drop, and custom emoji spawning. Supports custom element layers (shapes, texts, icons, images), borders, random sizes, and random rotations. Supports keyframing `arrayProgress`. |
| `src/modules/renderers/card.ts` | Card stack motion renderer | `renderCardShape` | Renders multi-card decks with customizable shapes (rounded, chamfer, sharp rect, pill, frosted glass), layer system (`cardItems`) supporting individual images, titles, shapes, and borders per card, and keyframe-aware opacity animation (multiplies `tr.opacity`). |
| `src/modules/renderers/pathDraw.ts` | Path draw & text flow renderer | `renderPathDrawShape` | Renders write-on stroke line animations (arc, wave, spiral, infinity, custom bezier), interactive Pen Tool spline point specification, styles (`writeOn`, `laserBeam`, `dashFlow`, `pulseGlow`), and kinetic text flowing along curve. |
| `src/modules/renderers/button.ts` | Interactive button motion renderer | `renderButtonShape` | Renders customizable button shapes: pill, rounded, sharp rect, cyberpunk chamfer, two-tone gradient, outline, frosted glassmorphism, floating circular FAB, and toggle switch. Supports button width/height sizing, border width, border color, corner radius, solid/dashed/dotted stroke styling, neon glow shadows, dedicated ON color and OFF color states with smooth toggle track transitions, knob color, vector icons (13 variants), icon placements (left, right, icon-only), ripple wave & pulse animations, and keyframable `buttonProgress` switch states. |
| `src/modules/renderers/cursor.ts` | Motion cursor & flight renderer | `renderCursorShape` | Renders customizable cursors (pointer, hand, crosshair, beam, dot), custom spline paths along `pathPoints`, tangent flight orient-to-motion, explicit click timestamp parsing (`cursorClickTimes`), visible flight trajectory guide, and keyframed `cursorProgress`. Includes non-negative modulo protection and radius clamping against IndexSizeError during playback. |
| `src/modules/renderers/graph.ts` | Graph & Chart motion renderer | `renderGraphShape` | Renders animated data charts: Column, Bar, Line, Area, Pie/Donut, and Combo graphs. Driven by keyframable `graphProgress` (0-100%), smooth bezier splines, gradient area fills, radial donut cuts, and custom data input series. |
| `src/modules/renderers/media.ts` | Image layer renderer | `renderImage` | Draws image assets with borders and transforms. |
| `src/modules/templates/index.ts` | Built-in design templates | `TEMPLATES`, `getTemplateById` | Pre-configured motion templates (Bento Grid, Kinetic Text, Promo, Product Showcase, etc.). |
| `src/modules/fonts/googleFonts.ts` | Google Fonts catalog & loader | `GOOGLE_FONTS`, `loadGoogleFont` | Dynamically injects Google Fonts for typography layers. |
| `src/modules/export/videoExporter.ts` | Video/GIF rendering engine | `renderProjectToWebM`, `renderProjectToMp4` | Encodes canvas frames into WebM/MP4 video files at target FPS and resolution. |
| `src/modules/storage/projectFileSystem.ts` | Project JSON file system & serialization | `buildProjectJSON`, `saveProjectToFile`, `openProjectFromFile`, `exportAnimationJSON` | File system engine for saving projects (`Ctrl+S`), Save As (`Ctrl+Shift+S`), opening projects (`Ctrl+O`), and exporting standalone animation JSON files. Supports File System Access API with fallback to browser downloads and canvas drag-and-drop file loading. |
| `src/modules/assets/stickers.ts` | Pre-bundled sticker & vector graphics | `STICKER_PRESETS`, `createEmojiSticker`, `svgToDataUrl` | Catalog of scalable SVG badge, reaction, tech, and popular sticker presets, plus dynamic custom emoji SVG badge generator. |

---

## 5. UI Components (`src/components/`)

### Main Stage & Workspace
| File | Purpose | Key Exports / Roles | Notes / Recent Changes |
|------|---------|---------------------|------------------------|
| `src/components/Header.tsx` | Top studio navigation bar | `Header` | Styled MotionFX logo with glowing bold typography. Houses dedicated File System menu (Save Project `Ctrl+S`, Save As `Ctrl+Shift+S`, Open / Import JSON `Ctrl+O`, Export Animation JSON), Quick Save button, Composition Switcher, "New Blank" composition button, Templates dropdown, Resolution modal trigger, Canvas Snapping (`Magnet`) toggle button with keyboard shortcut (S), undo/redo, FPS settings, and video export. Hidden/removed previous Build Shape studio button. |
| `src/components/CanvasStage/index.tsx` | Interactive stage & canvas viewport | `CanvasStage` | Manages canvas rendering loop, selection marquee, on-canvas dragging with smart alignment snapping (canvas center, edges, and other layer positions) and cyan dashed snap guide lines, direct text inline editing, scaling, rotating, interactive bezier control points for `custom`, `pathFollower`, `pathDraw`, and `cursor`, pen tool anchor creation (`isPenEditing`), keyboard shortcuts (`S` for snap toggle, `Ctrl+E` for merge layers), and resolution-independent gizmo hit-testing matching `engine.ts` so transform handles are equally easy to grab in vertical/portrait formats. |
| `src/components/ResolutionModal.tsx` | Canvas aspect ratio & dimensions modal | `ResolutionModal` | Presets (16:9, 9:16, 1:1, 4:5, 4K, 1080p, etc.). |
| `src/components/BuildShapeModal.tsx` | Quick shape builder popup | `BuildShapeModal` | Fast custom SVG shape creation. |
| `src/components/ExportModal.tsx` | Video export progress modal | `ExportModal` | Frame-by-frame export progress and download. |
| `src/components/ExportSettingsModal.tsx` | Video export configuration modal | `ExportSettingsModal` | Resolution, FPS, bitrate, and format choices. |

### Left Sidebar (`src/components/LeftSidebar/`)
| File | Purpose | Key Exports / Roles | Notes / Recent Changes |
|------|---------|---------------------|------------------------|
| `src/components/LeftSidebar/index.tsx` | Left dock tab manager | `LeftSidebar` | Resizable container housing Elements, Layers, and Templates tabs. |
| `src/components/LeftSidebar/AddElementsPanel.tsx` | Element picker palette | `AddElementsPanel` | Buttons to insert standard shapes (Line, Rect, Circle, Star, Poly, Pill, and Pen Tool for custom vector shapes), text, upload images, add Stickers (opens inspector catalog), and 8 Special Shapes & Motions (Bar, Branching, Path Move, Array, Cards, Path Draw, Button, Cursor). Hidden/removed previous Build Shape studio option. |
| `src/components/LeftSidebar/LayersStackPanel.tsx` | Layer hierarchy & order stack | `LayersStackPanel` | Layer list, drag-and-drop reordering, grouping, parenting, visibility/lock toggles, 1-click Merge button for combining multiple selected layers into a single rasterized image layer (`mergeSelectedLayers`), active filter badges (Glow, Wave, B&W, Glitch, etc.), and quick Scene Layer Filter FX dropdown menu (`Wand2`). |
| `src/components/LeftSidebar/TemplatesBrowserPanel.tsx` | Template selector | `TemplatesBrowserPanel` | Template cards for safe exploration. Includes "Open as Comp" (opens template in dedicated composition without touching current work) and "Add as Group" (inserts into current scene as an isolated group folder). |

### Right Inspector (`src/components/RightInspector/`)
| File | Purpose | Key Exports / Roles | Notes / Recent Changes |
|------|---------|---------------------|------------------------|
| `src/components/RightInspector/index.tsx` | Property inspector container | `RightInspector` | Resizable dock hosting sections based on selected layer type. |
| `src/components/RightInspector/ColorPickerWithAlpha.tsx` | Color picker with alpha transparency | `ColorPickerWithAlpha`, `parseColorAndAlpha`, `formatColorWithAlpha` | Universal color picker with native RGB hex selection, real-time alpha/transparency slider (0–100%), checkerboard transparency swatch, and quick opacity presets (0%, 25%, 50%, 75%, 100%). |
| `src/components/RightInspector/TransformSection.tsx` | Transform controls | `TransformSection` | Inputs for X, Y, Scale, Rotation, Opacity, individual keyframe toggles, interpolation easing dropdown, and top-level In/Out Transitions (Fade In/Out and Scale In/Out toggles with customizable duration sliders). |
| `src/components/RightInspector/ShapeStyleSection.tsx` | Styling options | `ShapeStyleSection` | Fill & Stroke with alpha transparency via `ColorPickerWithAlpha`, uncapped manual input for border thickness (px), border radius, dashing, and on-canvas Pen Tool controls for custom vector shapes. |
| `src/components/RightInspector/TextEffectSection.tsx` | Typography inspector | `TextEffectSection` | Text string, font family, manual input based font size with quick preset pills (24, 48, 72, 120, 200px) and free uncapped manual typing, font weight, kinetic animation effects, Text Color & Alpha transparency, and keyframable Animation Progress. |
| `src/components/RightInspector/FilterInspectorSection.tsx` | Top-level Layer Filter & FX inspector | `FilterInspectorSection` | Universal top-level filter panel for all layer types: Glow, Wave, Black & White, Glitch, Noise, Shatter, and Wobble with 0-100% keyframable intensity slider, diamond toggle, and filter-specific parameters (glow radius/color, wave frequency/amplitude/speed, contrast, glitch slices/speed, noise density, shatter spread/pieces, wobble speed/amount). |
| `src/components/RightInspector/ParentHierarchySection.tsx` | Parenting inspector | `ParentHierarchySection` | Select parent layer to establish transform hierarchy. |
| `src/components/RightInspector/MultiSelectSection.tsx` | Batch inspector | `MultiSelectSection` | Align, distribute, and group multiple selected layers. Includes 1-click "Merge Layers" action card (combines selected layers into 1 rasterized layer, also mapped to `Ctrl+E`). |
| `src/components/RightInspector/BarInspectorSection.tsx` | Bar shape inspector | `BarInspectorSection` | Progress percentage, manual input based track thickness with quick preset chips (8, 14, 24, 40px), uncapped manual font size input, label settings, and keyframing diamond toggle button with auto-keyframing support. |
| `src/components/RightInspector/BranchingInspectorSection.tsx` | Branching tree inspector | `BranchingInspectorSection` | Branch count, spread, curvature, length. Includes keyframable Branch Lifetime & Growth slider (0-100%), manual input based line thickness with quick preset chips (1, 3, 6, 12px), animation mode switcher, root-first trunk growth toggle, and staggered organic branch blossoming. |
| `src/components/RightInspector/PathFollowerInspectorSection.tsx` | Motion path inspector | `PathFollowerInspectorSection` | Follower speed, emoji, orientation, guide track color & manual input line thickness, and track path editor. |
| `src/components/RightInspector/ArrayInspectorSection.tsx` | Array matrix inspector | `ArrayInspectorSection` | Sub-tabs for Elements, Shape & Style, and Grid & Motion. Custom element layer pool, manual input based border thickness, random size variance, and random rotation. |
| `src/components/RightInspector/CardInspectorSection.tsx` | Card stack inspector | `CardInspectorSection` | Tabbed inspector (`Stack & Motion`, `Card Layers`, `Shape & Border`). Card shape geometry picker, card layer system with individual card image uploads, manual input based border thickness, and animated card opacity support. |
| `src/components/RightInspector/PathDrawInspectorSection.tsx` | Path draw inspector | `PathDrawInspectorSection` | Dedicated Pen Tool control bar with active on-canvas point editing banner, reset points, custom bezier spline specification, line write-on progress keyframing, manual input based path thickness, and kinetic text on path with manual input based font size. |
| `src/components/RightInspector/ButtonInspectorSection.tsx` | Motion button inspector | `ButtonInspectorSection` | Streamlined tabbed inspector (`Shape & Style`, `Motion & State`). Consolidates rich typography controls: manual input based font size with full creative freedom, font weight, Google Font family dropdown, manual input based border thickness, dedicated ON/OFF color pickers, and toggle switch keyframe diamond. |
| `src/components/RightInspector/StickerInspectorSection.tsx` | Sticker & graphic inspector | `StickerInspectorSection` | Dedicated sticker customization panel: category tabs, SVG sticker preset picker grid, custom emoji sticker generator, size presets & uniform slider, manual input based border thickness and corner radius controls, plus direct custom PNG upload. |
| `src/components/RightInspector/CursorInspectorSection.tsx` | Motion cursor inspector | `CursorInspectorSection` | Cursor types (pointer, hand, crosshair, beam, dot), flight path modes (custom spline, orbit, linear, float), Pen Tool canvas spline editor, flight progress keyframing diamond toggle, explicit click timestamps input, orient-to-motion toggle, and show trajectory track toggle. |
| `src/components/RightInspector/GraphInspectorSection.tsx` | Graph & Chart motion inspector | `GraphInspectorSection` | Tabbed inspector (`Presets`, `Data`, `Styles`) for animated graphs: Column, Bar, Line, Area, Pie/Donut, and Combo charts. Supports 0-100% keyframable animation slider with diamond toggle and 0% -> 100% 2s transition builder, editable data point table with color swatches, sample data presets, curve interpolation modes, and geometry styling. |
| `src/components/RightInspector/FilterInspectorSection.tsx` | Top-level layer filter FX inspector | `FilterInspectorSection` | Full inspector for 8 procedural top-level layer filters (Blur, Glow, Wave, Black & White, Glitch, Noise, Shatter, Wobble) with monochromatic vector icons, 0-100% keyframable intensity slider, diamond toggle, and 0% -> 100% 2s transition builder. |

### Timeline & Sequencer (`src/components/Timeline/`)
| File | Purpose | Key Exports / Roles | Notes / Recent Changes |
|------|---------|---------------------|------------------------|
| `src/components/Timeline/index.tsx` | Master timeline sequencer | `Timeline` | Playback transport controls, playhead scrubber, zoom slider, "Add Keyframe at Playhead" button, "Auto Keyframe" toggle button, and track lanes. Supports After Effects keyboard shortcuts: `Ctrl+Shift+D` to split layer at playhead, `[` to trim in-point to playhead, `]` to trim out-point to playhead, Space to play/pause, Delete/Backspace to delete keyframe or layer. |
| `src/components/Timeline/TimelineHeader.tsx` | Playhead time ruler & timecode | `TimelineHeader` | Displays time markers in seconds, clickable playhead scrubbing, and zoom scaling. |
| `src/components/Timeline/TimelineTracks.tsx` | Layer lanes & keyframe diamonds | `TimelineTracks` | After Effects style interactive layer bars with trimming, dragging, transition badges (`Fade`, `Scale`), and expandable property sub-tracks. Clicking any layer expands it downwards to reveal dedicated, color-coded rows for each keyframed property (Position X, Position Y, Scale, Rotation, Opacity, Special Motions) with real-time value readouts, diamond toggles, and individual keyframe diamond dragging and marquee selection. |
| `src/components/Timeline/TransportControls.tsx` | Playback and timeline action toolbar | `TransportControls` | Transport buttons (Play, Pause, Stop, Seek Start, Loop), timecode display, custom duration dropdown, Add Keyframe, Auto-Keyframe toggle, Delete Keyframe(s), 1-click Split Layer button (`Scissors`), Trim In-Point (`[`), Trim Out-Point (`]`), and 1-click Top-Level Transitions: **Fade In/Out** (`Sparkles`) and **Scale In/Out** (`Maximize2`). |
