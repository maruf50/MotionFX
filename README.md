# MotionFX Studio 🎬✨

A modern, browser-based mini motion graphics creator web application built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, and the **HTML5 Canvas 2D API**.

Create custom geometric shapes with rounded and dotted borders, kinetic typography, PNG sticker animations, keyframe sequences, and export everything directly to video.

---

## 🚀 Features

- **Geometric Shapes**: Rectangles, Circles, Stars (custom points), Polygons (3–12 sides), and Pills.
- **Round & Dotted Borders**: Interactive border radius with vertex smoothing, solid, dashed, and dotted styles with animated marching ants flow.
- **Transform & Keyframing**: Keyframe position (X/Y), scale (X/Y), rotation, and opacity with 6 easing curves (Ease Out, Ease In/Out, Back Out, Elastic, Bounce, Linear).
- **Trendy Templates**:
  - *Bento Grid Pop*: Bouncy staggered cards with dotted and dashed borders.
  - *Kinetic Typography*: Morphing headline with orbiting dotted rings and sine wave subtitles.
  - *Logo Reveal Badge*: Rotating dashed hexagon with a gleaming gold star emblem.
  - *Dynamic Island Toast*: Modern iOS/macOS styled slide-in card with icon and badge.
- **Kinetic Text Effects**: Typewriter with blinking cursor, Cyber Morph/Glitch Scramble, Sine Wave Dance, Letter Pop Cascade, and Glowing Neon Pulsar.
- **PNG & Sticker Support**: Upload custom PNG/SVG/JPEG/WebP images with auto-aspect ratio and rounded borders, plus 6 built-in vector stickers.
- **Interactive Timeline Sequencer**: Scrubber playhead, time ruler, timecode readout, and draggable keyframe diamonds on layer tracks.
- **Video Export**: High-framerate 60 FPS HTML5 Canvas stream capture with `MediaRecorder` encoding and automatic download.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, Turbopack)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Canvas Effects**: [Canvas Confetti](https://www.npmjs.com/package/canvas-confetti)
- **Export Engine**: HTML5 Canvas `captureStream` + `MediaRecorder`

---

## 📁 Modular Project Structure

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

---

## 🚦 Getting Started

1. **Clone the repository**:
   ```bash
   git clone https://github.com/maruf50/MotionFX.git
   cd MotionFX
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Open in browser**:
   Navigate to [http://localhost:3000](http://localhost:3000).

---

## 📜 Changelog

See [CHANGELOG.md](CHANGELOG.md) for detailed release notes and feature lists for v1.0.0.

---

## 📄 License

MIT
