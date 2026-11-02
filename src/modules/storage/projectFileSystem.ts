import { Layer, CanvasResolution, Composition, MotionFXProjectFile } from '@/types/motion';
import { countTotalKeyframes } from '../keyframes/evaluator';

export interface BuildProjectParams {
  projectName: string;
  layers: Layer[];
  duration: number;
  fps: number;
  canvasResolution: CanvasResolution;
  canvasBg: string;
  compositions?: Composition[];
  activeCompositionId?: string;
}

export interface SaveResult {
  success: boolean;
  handle?: any | null;
  fileName: string;
  aborted?: boolean;
  error?: string;
}

export interface OpenResult {
  success: boolean;
  projectData?: MotionFXProjectFile;
  handle?: any | null;
  fileName?: string;
  aborted?: boolean;
  error?: string;
}

function sanitizeFileName(name: string): string {
  return name.replace(/[/\\?%*:|"<>]/g, '-').trim() || 'Untitled Animation';
}

/**
 * Builds standard MotionFX Project JSON structure from runtime state.
 */
export function buildProjectJSON(params: BuildProjectParams): MotionFXProjectFile {
  const totalLayers = params.layers.length;
  const totalKeyframes = params.layers.reduce((sum, l) => sum + countTotalKeyframes(l), 0);

  return {
    format: 'motionfx-animation',
    version: '1.0',
    exportedAt: new Date().toISOString(),
    projectName: params.projectName || 'Untitled Animation',
    canvasResolution: {
      width: params.canvasResolution.width,
      height: params.canvasResolution.height,
    },
    duration: params.duration,
    fps: params.fps || 60,
    canvasBg: params.canvasBg || '#18181c',
    layers: params.layers,
    compositions: params.compositions,
    activeCompositionId: params.activeCompositionId,
    metadata: {
      app: 'MotionFX Studio',
      totalLayers,
      totalKeyframes,
    },
  };
}

/**
 * Parses and validates incoming JSON text into a clean MotionFXProjectFile.
 * Handles full MotionFX project files, raw layer arrays, and composition formats.
 */
export function parseProjectJSON(jsonString: string): { isValid: boolean; data?: MotionFXProjectFile; error?: string } {
  try {
    const raw = JSON.parse(jsonString);

    if (!raw) {
      return { isValid: false, error: 'Empty JSON content' };
    }

    let parsedLayers: Layer[] = [];
    let projectName = 'Imported Project';
    let duration = 5.0;
    let fps = 60;
    let canvasBg = '#18181c';
    let canvasResolution: CanvasResolution = { width: 1920, height: 1080 };
    let compositions: Composition[] | undefined = undefined;
    let activeCompositionId: string | undefined = undefined;

    // Case 1: Standard MotionFXProjectFile
    if (raw.format === 'motionfx-animation' || (raw.layers && Array.isArray(raw.layers))) {
      parsedLayers = raw.layers;
      if (raw.projectName) projectName = raw.projectName;
      if (typeof raw.duration === 'number' && raw.duration > 0) duration = raw.duration;
      if (typeof raw.fps === 'number' && raw.fps > 0) fps = raw.fps;
      if (raw.canvasBg) canvasBg = raw.canvasBg;
      if (raw.canvasResolution?.width && raw.canvasResolution?.height) {
        canvasResolution = {
          width: raw.canvasResolution.width,
          height: raw.canvasResolution.height,
        };
      }
      if (Array.isArray(raw.compositions)) compositions = raw.compositions;
      if (raw.activeCompositionId) activeCompositionId = raw.activeCompositionId;
    }
    // Case 2: Raw Array of Layers
    else if (Array.isArray(raw)) {
      parsedLayers = raw;
      projectName = 'Imported Layers';
    }
    // Case 3: Single Composition Object
    else if (raw.name && Array.isArray(raw.layers)) {
      parsedLayers = raw.layers;
      projectName = raw.name;
      if (typeof raw.duration === 'number') duration = raw.duration;
      if (raw.canvasBg) canvasBg = raw.canvasBg;
      if (raw.resolution) canvasResolution = raw.resolution;
    } else {
      return { isValid: false, error: 'JSON does not contain recognizable animation layers' };
    }

    // Sanitize layers to ensure valid structure
    const sanitizedLayers: Layer[] = parsedLayers.map((l, idx) => {
      return {
        ...l,
        id: l.id || `layer_${Date.now()}_${idx}`,
        name: l.name || `Layer ${idx + 1}`,
        type: l.type || 'shape',
        visible: l.visible !== false,
        keyframes: l.keyframes || {
          x: [],
          y: [],
          scaleX: [],
          scaleY: [],
          rotation: [],
          opacity: [],
        },
      };
    });

    const projectData: MotionFXProjectFile = {
      format: 'motionfx-animation',
      version: '1.0',
      exportedAt: new Date().toISOString(),
      projectName,
      canvasResolution,
      duration,
      fps,
      canvasBg,
      layers: sanitizedLayers,
      compositions,
      activeCompositionId,
      metadata: {
        app: 'MotionFX Studio',
        totalLayers: sanitizedLayers.length,
        totalKeyframes: sanitizedLayers.reduce((acc, l) => acc + countTotalKeyframes(l), 0),
      },
    };

    return { isValid: true, data: projectData };
  } catch (err: any) {
    return { isValid: false, error: err?.message || 'Invalid JSON syntax' };
  }
}

/**
 * Saves project to file.
 * Uses File System Access API (showSaveFilePicker) if supported, or falls back to browser download.
 * If existingHandle is provided and forceSaveAs is false, writes directly to the existing file without dialog.
 */
export async function saveProjectToFile(
  projectData: MotionFXProjectFile,
  existingHandle?: any | null,
  forceSaveAs: boolean = false
): Promise<SaveResult> {
  const jsonContent = JSON.stringify(projectData, null, 2);
  const baseName = sanitizeFileName(projectData.projectName || 'Project');
  const defaultFileName = `${baseName}.motionfx.json`;

  // 1. Direct write to existing FileHandle (Quick Save Ctrl+S)
  if (existingHandle && !forceSaveAs && typeof existingHandle.createWritable === 'function') {
    try {
      const writable = await existingHandle.createWritable();
      await writable.write(jsonContent);
      await writable.close();
      return {
        success: true,
        handle: existingHandle,
        fileName: existingHandle.name || defaultFileName,
      };
    } catch (err: any) {
      console.warn('Failed to write to existing file handle, falling back to Save As:', err);
      // Fall through to showSaveFilePicker / download
    }
  }

  // 2. Native File System Access API Save Dialog (showSaveFilePicker)
  if (typeof (window as any).showSaveFilePicker === 'function') {
    try {
      const handle = await (window as any).showSaveFilePicker({
        suggestedName: defaultFileName,
        types: [
          {
            description: 'MotionFX Animation Project (*.motionfx.json)',
            accept: {
              'application/json': ['.json', '.motionfx.json'],
            },
          },
        ],
      });

      const writable = await handle.createWritable();
      await writable.write(jsonContent);
      await writable.close();

      return {
        success: true,
        handle,
        fileName: handle.name || defaultFileName,
      };
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return { success: false, aborted: true, fileName: defaultFileName };
      }
      console.warn('showSaveFilePicker failed, falling back to download:', err);
      // Fall through to browser download fallback
    }
  }

  // 3. Browser Download Fallback via Blob
  try {
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = defaultFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);

    return {
      success: true,
      handle: null,
      fileName: defaultFileName,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Download failed',
      fileName: defaultFileName,
    };
  }
}

/**
 * Opens project from a JSON file.
 * If fileInput is provided, reads it directly.
 * Otherwise uses window.showOpenFilePicker or falls back to hidden input[type="file"].
 */
export async function openProjectFromFile(fileInput?: File): Promise<OpenResult> {
  // 1. Direct file input provided (Drag & Drop or pre-selected)
  if (fileInput) {
    try {
      const text = await fileInput.text();
      const res = parseProjectJSON(text);
      if (!res.isValid || !res.data) {
        return { success: false, error: res.error || 'Invalid file format' };
      }
      return {
        success: true,
        projectData: res.data,
        handle: null,
        fileName: fileInput.name,
      };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to read file' };
    }
  }

  // 2. Native File System Access API Open Dialog (showOpenFilePicker)
  if (typeof (window as any).showOpenFilePicker === 'function') {
    try {
      const handles = await (window as any).showOpenFilePicker({
        multiple: false,
        types: [
          {
            description: 'MotionFX Animation Project (*.json)',
            accept: {
              'application/json': ['.json', '.motionfx.json'],
            },
          },
        ],
      });

      if (!handles || handles.length === 0) {
        return { success: false, aborted: true };
      }

      const handle = handles[0];
      const file = await handle.getFile();
      const text = await file.text();
      const res = parseProjectJSON(text);

      if (!res.isValid || !res.data) {
        return { success: false, error: res.error || 'Invalid file format' };
      }

      return {
        success: true,
        projectData: res.data,
        handle,
        fileName: file.name,
      };
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return { success: false, aborted: true };
      }
      console.warn('showOpenFilePicker failed, falling back to input:', err);
      // Fall through to hidden input fallback
    }
  }

  // 3. Fallback using hidden <input type="file">
  return new Promise<OpenResult>((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) {
        resolve({ success: false, aborted: true });
        return;
      }
      try {
        const text = await file.text();
        const res = parseProjectJSON(text);
        if (!res.isValid || !res.data) {
          resolve({ success: false, error: res.error || 'Invalid file format' });
          return;
        }
        resolve({
          success: true,
          projectData: res.data,
          handle: null,
          fileName: file.name,
        });
      } catch (err: any) {
        resolve({ success: false, error: err?.message || 'Failed to parse JSON file' });
      }
    };

    input.oncancel = () => {
      resolve({ success: false, aborted: true });
    };

    input.click();
  });
}

/**
 * Exports clean, standalone animation JSON suitable for embedding or external engines.
 */
export function exportAnimationJSON(projectData: MotionFXProjectFile) {
  const animationPayload = {
    format: 'motionfx-animation',
    version: '1.0',
    exportedAt: new Date().toISOString(),
    name: projectData.projectName,
    duration: projectData.duration,
    fps: projectData.fps,
    resolution: projectData.canvasResolution,
    canvasBg: projectData.canvasBg,
    layers: projectData.layers,
  };

  const jsonContent = JSON.stringify(animationPayload, null, 2);
  const baseName = sanitizeFileName(projectData.projectName || 'Animation');
  const fileName = `${baseName}.animation.json`;

  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

