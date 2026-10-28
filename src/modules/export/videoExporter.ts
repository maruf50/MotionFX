import confetti from 'canvas-confetti';
import { Layer } from '@/types/motion';
import { renderSceneAtTime } from '../renderers/engine';
import { loadGoogleFont } from '../fonts/googleFonts';

export interface ExporterOptions {
  canvas: HTMLCanvasElement;
  layers: Layer[];
  duration: number; // in seconds
  canvasBg: string;
  fps?: number;
  onProgress: (progress: number, currentSec: number, totalSec: number, fps: number) => void;
  onComplete: () => void;
  onError: (err: Error) => void;
}

export class VideoExporter {
  private isCancelled = false;
  private recorder: MediaRecorder | null = null;

  public cancel() {
    this.isCancelled = true;
    if (this.recorder && this.recorder.state !== 'inactive') {
      try {
        this.recorder.stop();
      } catch (e) {
        console.warn('Recorder stop error during cancel:', e);
      }
    }
  }

  public async exportVideo(opts: ExporterOptions): Promise<void> {
    this.isCancelled = false;
    const { canvas, layers, duration, canvasBg, fps = 60, onProgress, onComplete, onError } = opts;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      onError(new Error('Canvas 2D context not available'));
      return;
    }

    try {
      // Ensure all Google Fonts used by text layers are loaded before rendering frames
      const textLayers = layers.filter((l) => l.type === 'text' && l.fontFamily);
      await Promise.all(textLayers.map((l) => loadGoogleFont(l.fontFamily!)));
      if (typeof document !== 'undefined' && 'fonts' in document) {
        await (document as any).fonts.ready;
      }
      // 1. Detect supported MIME type
      let mimeType = 'video/webm;codecs=vp9';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm;codecs=vp8';
      }
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm';
      }
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/mp4';
      }
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = ''; // Let browser pick default
      }

      const stream = canvas.captureStream(fps);
      const isUltraRes = canvas.width >= 2500 || canvas.height >= 2500;
      const isHighFps = fps >= 120;
      // Scale bitrate for 120 FPS and 4K ultra-resolutions to prevent compression artifacts
      const bitrate = isUltraRes
        ? (isHighFps ? 28000000 : 16000000) // 28 Mbps for 120fps UHD, 16 Mbps for 60fps UHD
        : (isHighFps ? 18000000 : 9000000);  // 18 Mbps for 120fps FHD, 9 Mbps for 60fps FHD

      const recorderOptions: MediaRecorderOptions = {
        videoBitsPerSecond: bitrate,
      };
      if (mimeType) {
        recorderOptions.mimeType = mimeType;
      }

      this.recorder = new MediaRecorder(stream, recorderOptions);
      const chunks: Blob[] = [];

      this.recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      this.recorder.onstop = () => {
        if (this.isCancelled) return;
        const blobType = this.recorder?.mimeType || 'video/webm';
        const ext = blobType.includes('mp4') ? 'mp4' : 'webm';
        const blob = new Blob(chunks, { type: blobType });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `MotionFX_${fps}fps_${Date.now()}.${ext}`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);

        // Confetti celebration
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch {
          // ignore
        }

        onComplete();
      };

      const totalFrames = Math.max(1, Math.round(duration * fps));
      const frameIntervalMs = 1000 / fps;
      const videoTrack = stream.getVideoTracks()[0] as any;

      this.recorder.start();

      let currentFrame = 0;

      const renderNextFrame = () => {
        if (this.isCancelled) return;

        const frameTime = Math.min(duration, currentFrame / fps);
        const pct = Math.min(99, Math.round((currentFrame / totalFrames) * 100));
        onProgress(pct, frameTime, duration, fps);

        // Render deterministic frame at exact timestamp frameTime
        renderSceneAtTime(ctx, canvas.width, canvas.height, layers, frameTime, duration, {
          canvasBg,
          showGuides: false,
          selectedLayerId: null,
          hideSelectionGizmo: true,
        });

        // Request track capture if browser supports manual capture
        if (typeof videoTrack?.requestFrame === 'function') {
          try {
            videoTrack.requestFrame();
          } catch {
            // ignore
          }
        }

        currentFrame++;

        if (currentFrame <= totalFrames) {
          // Deliver next frame at accurate frame cadence so encoder captures each frame
          setTimeout(renderNextFrame, frameIntervalMs);
        } else {
          // Render final duration frame
          renderSceneAtTime(ctx, canvas.width, canvas.height, layers, duration, duration, {
            canvasBg,
            showGuides: false,
            selectedLayerId: null,
            hideSelectionGizmo: true,
          });

          if (typeof videoTrack?.requestFrame === 'function') {
            try {
              videoTrack.requestFrame();
            } catch {
              // ignore
            }
          }

          onProgress(100, duration, duration, fps);

          // Allow recorder buffer to flush trailing frames
          setTimeout(() => {
            if (this.recorder && this.recorder.state !== 'inactive') {
              this.recorder.stop();
            }
          }, Math.max(250, Math.round(frameIntervalMs * 4)));
        }
      };

      // Kick off deterministic frame encoding
      renderNextFrame();
    } catch (err: unknown) {
      onError(err instanceof Error ? err : new Error(String(err)));
    }
  }
}
