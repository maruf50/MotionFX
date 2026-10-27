import confetti from 'canvas-confetti';
import { Layer } from '@/types/motion';
import { renderSceneAtTime } from '../renderers/engine';

export interface ExporterOptions {
  canvas: HTMLCanvasElement;
  layers: Layer[];
  duration: number; // in seconds
  canvasBg: string;
  fps?: number;
  onProgress: (progress: number, currentSec: number, totalSec: number) => void;
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
      const recorderOptions: MediaRecorderOptions = {
        videoBitsPerSecond: isUltraRes ? 16000000 : 8000000, // 16 Mbps for 4K/UHD, 8 Mbps for FHD
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
        a.download = `MotionFX_Animation_${Date.now()}.${ext}`;
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

      this.recorder.start();

      const startTime = performance.now();
      const step = (now: number) => {
        if (this.isCancelled) return;
        const elapsed = (now - startTime) / 1000;

        if (elapsed < duration) {
          const pct = Math.min(99, Math.round((elapsed / duration) * 100));
          onProgress(pct, elapsed, duration);

          // Render frame without selection gizmos or alignment grids
          renderSceneAtTime(ctx, canvas.width, canvas.height, layers, elapsed, duration, {
            canvasBg,
            showGuides: false,
            selectedLayerId: null,
            hideSelectionGizmo: true,
          });

          requestAnimationFrame(step);
        } else {
          // Render final frame
          renderSceneAtTime(ctx, canvas.width, canvas.height, layers, duration, duration, {
            canvasBg,
            showGuides: false,
            selectedLayerId: null,
            hideSelectionGizmo: true,
          });

          onProgress(100, duration, duration);

          // Allow the recorder buffer to ingest last frame before stopping
          setTimeout(() => {
            if (this.recorder && this.recorder.state !== 'inactive') {
              this.recorder.stop();
            }
          }, 150);
        }
      };

      requestAnimationFrame(step);
    } catch (err: unknown) {
      onError(err instanceof Error ? err : new Error(String(err)));
    }
  }
}
