import { AnimatableProp, Keyframe, Layer, TransformState } from '@/types/motion';
import { Easings } from '../easing/easings';

export function uid(prefix: string = 'lyr'): string {
  return `${prefix}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Evaluates an animatable property value at time `t` (in seconds)
 * using the layer's configured easing interpolation.
 */
export function getInterpolatedValue(layer: Layer, prop: AnimatableProp, t: number): number {
  const kfs = layer.keyframes?.[prop];
  if (!kfs || kfs.length === 0) {
    if (prop === 'scaleX' || prop === 'scaleY' || prop === 'opacity') {
      return (layer[prop] as number | undefined) ?? 1;
    }
    if (prop === 'barPercentage') {
      return (layer.barPercentage as number | undefined) ?? 75;
    }
    if (prop === 'branchGrowth') {
      const raw = layer.branchGrowth;
      if (raw === undefined) return 100;
      return raw <= 1 && raw > 0 ? raw * 100 : raw;
    }
    if (prop === 'followerProgress') {
      return (layer.followerProgress as number | undefined) ?? 100;
    }
    if (prop === 'arrayProgress') {
      return (layer.arrayProgress as number | undefined) ?? 100;
    }
    if (prop === 'cardProgress') {
      return (layer.cardProgress as number | undefined) ?? 100;
    }
    if (prop === 'pathDrawProgress') {
      return (layer.pathDrawProgress as number | undefined) ?? 100;
    }
    if (prop === 'buttonProgress') {
      return (layer.buttonProgress as number | undefined) ?? 100;
    }
    if (prop === 'cursorProgress') {
      return (layer.cursorProgress as number | undefined) ?? 100;
    }
    if (prop === 'textProgress') {
      return (layer.textProgress as number | undefined) ?? 100;
    }
    if (prop === 'filterIntensity') {
      return (layer.filterIntensity as number | undefined) ?? 100;
    }
    if (prop === 'graphProgress') {
      return (layer.graphProgress as number | undefined) ?? 100;
    }
    if (prop === 'audioVolume') {
      return (layer.audioVolume as number | undefined) ?? 80;
    }
    if (prop === 'audioPitch') {
      return (layer.audioPitch as number | undefined) ?? 1.0;
    }
    return (layer[prop] as number | undefined) ?? 0;
  }
  if (kfs.length === 1 || t <= kfs[0].time) return kfs[0].value;
  if (t >= kfs[kfs.length - 1].time) return kfs[kfs.length - 1].value;

  for (let i = 0; i < kfs.length - 1; i++) {
    const k1 = kfs[i];
    const k2 = kfs[i + 1];
    if (t >= k1.time && t <= k2.time) {
      const span = k2.time - k1.time;
      if (span <= 0.0001) return k2.value;
      const rawProgress = (t - k1.time) / span;
      const easeFn = Easings[layer.easing] || Easings.easeOutCubic;
      const easedProgress = easeFn(Math.max(0, Math.min(1, rawProgress)));
      return k1.value + (k2.value - k1.value) * easedProgress;
    }
  }

  return kfs[kfs.length - 1].value;
}

/**
 * Returns the full 2D transform state for a layer at timestamp `t`.
 * Applies top-level Fade In/Out and Scale In/Out transitions without modifying
 * or overwriting the layer's normal keyframes.
 */
export function getLayerTransformAtTime(layer: Layer, t: number): TransformState {
  let x = getInterpolatedValue(layer, 'x', t);
  let y = getInterpolatedValue(layer, 'y', t);
  let scaleX = getInterpolatedValue(layer, 'scaleX', t);
  let scaleY = getInterpolatedValue(layer, 'scaleY', t);
  let rotation = getInterpolatedValue(layer, 'rotation', t);
  let opacity = Math.max(0, Math.min(1, getInterpolatedValue(layer, 'opacity', t)));

  const start = layer.startTime ?? 0;
  const end = layer.endTime ?? 5.0;
  const layerSpan = Math.max(0.001, end - start);

  // 1. Top-Level Fade In / Out Transition (modulates opacity without touching keyframes)
  if (layer.fadeInOut) {
    const fadeDur = Math.min(layer.fadeDuration ?? 0.5, layerSpan / 2);
    if (fadeDur > 0) {
      const tRel = t - start;
      const tFromEnd = end - t;
      const easeFn = Easings[layer.easing] || Easings.easeOutCubic;

      let factorIn = 1.0;
      let factorOut = 1.0;

      if (!layer.fadeOutOnly && tRel >= 0 && tRel < fadeDur) {
        factorIn = easeFn(Math.max(0, Math.min(1, tRel / fadeDur)));
      }
      if (!layer.fadeInOnly && tFromEnd >= 0 && tFromEnd < fadeDur) {
        factorOut = easeFn(Math.max(0, Math.min(1, tFromEnd / fadeDur)));
      }

      const fadeMultiplier = Math.max(0, Math.min(1, factorIn * factorOut));
      opacity = opacity * fadeMultiplier;
    }
  }

  // 2. Top-Level Scale In / Out Transition (modulates scale without touching keyframes)
  if (layer.scaleInOut) {
    const scaleDur = Math.min(layer.scaleDuration ?? 0.5, layerSpan / 2);
    const startVal = layer.scaleStartValue ?? 0;
    if (scaleDur > 0) {
      const tRel = t - start;
      const tFromEnd = end - t;
      const easeFn = Easings[layer.easing] || Easings.easeOutCubic;

      let factorIn = 1.0;
      let factorOut = 1.0;

      if (!layer.scaleOutOnly && tRel >= 0 && tRel < scaleDur) {
        const p = easeFn(Math.max(0, Math.min(1, tRel / scaleDur)));
        factorIn = startVal + (1.0 - startVal) * p;
      }
      if (!layer.scaleInOnly && tFromEnd >= 0 && tFromEnd < scaleDur) {
        const p = easeFn(Math.max(0, Math.min(1, tFromEnd / scaleDur)));
        factorOut = startVal + (1.0 - startVal) * p;
      }

      const scaleMultiplier = Math.max(0, factorIn * factorOut);
      scaleX = scaleX * scaleMultiplier;
      scaleY = scaleY * scaleMultiplier;
    }
  }

  return {
    x,
    y,
    scaleX,
    scaleY,
    rotation,
    opacity,
  };
}

/**
 * Checks whether candidateParentId is a descendant of layerId (to prevent cycles).
 */
export function isDescendantOf(
  candidateParentId: string,
  layerId: string,
  allLayers: Layer[]
): boolean {
  if (candidateParentId === layerId) return true;
  let current = allLayers.find((l) => l.id === candidateParentId);
  const visited = new Set<string>();
  while (current && current.parentId) {
    if (current.parentId === layerId) return true;
    if (visited.has(current.parentId)) break;
    visited.add(current.parentId);
    current = allLayers.find((l) => l.id === current?.parentId);
  }
  return false;
}

/**
 * Returns the hierarchical World 2D transform for a layer at timestamp `t`,
 * composing through all ancestor parents up the chain.
 */
export function getLayerWorldTransformAtTime(
  layer: Layer,
  allLayers: Layer[],
  t: number,
  visited: Set<string> = new Set()
): TransformState {
  const localTr = getLayerTransformAtTime(layer, t);
  if (!layer.parentId || visited.has(layer.id)) {
    return localTr;
  }

  const parent = allLayers.find((l) => l.id === layer.parentId);
  if (!parent || parent.id === layer.id) {
    return localTr;
  }

  visited.add(layer.id);
  const parentWorldTr = getLayerWorldTransformAtTime(parent, allLayers, t, visited);

  // Compose transforms: ParentWorld * ChildLocal
  const rad = (parentWorldTr.rotation * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);

  const scaledX = localTr.x * parentWorldTr.scaleX;
  const scaledY = localTr.y * parentWorldTr.scaleY;

  const worldX = parentWorldTr.x + (scaledX * cos - scaledY * sin);
  const worldY = parentWorldTr.y + (scaledX * sin + scaledY * cos);
  const worldScaleX = parentWorldTr.scaleX * localTr.scaleX;
  const worldScaleY = parentWorldTr.scaleY * localTr.scaleY;
  const worldRotation = parentWorldTr.rotation + localTr.rotation;
  const worldOpacity = Math.max(0, Math.min(1, parentWorldTr.opacity * localTr.opacity));

  return {
    x: worldX,
    y: worldY,
    scaleX: worldScaleX,
    scaleY: worldScaleY,
    rotation: worldRotation,
    opacity: worldOpacity,
  };
}

/**
 * Sets or updates a keyframe at time `t` with snapping (0.05s increments).
 */
export function setOrUpdateKeyframe(
  layer: Layer,
  prop: AnimatableProp,
  time: number,
  value: number
): Layer {
  const roundedTime = Math.round(time * 20) / 20; // 0.05s precision
  const list = [...(layer.keyframes?.[prop] || [])];
  const existingIdx = list.findIndex(k => Math.abs(k.time - roundedTime) < 0.04);

  if (existingIdx !== -1) {
    list[existingIdx] = { time: roundedTime, value };
  } else {
    // If keyframes were empty and time > 0.05s, anchor at time 0 with layer's base value
    if (list.length === 0 && roundedTime > 0.05) {
      const baseVal = getInterpolatedValue(layer, prop, 0);
      list.push({ time: 0, value: baseVal });
    }
    list.push({ time: roundedTime, value });
    list.sort((a, b) => a.time - b.time);
  }

  return {
    ...layer,
    [prop]: value,
    keyframes: {
      ...layer.keyframes,
      [prop]: list,
    },
  };
}

/**
 * Removes a keyframe at `index` on `prop`. Allows removing down to 0 keyframes.
 */
export function removeKeyframeAtIndex(
  layer: Layer,
  prop: AnimatableProp,
  index: number
): Layer {
  const list = [...(layer.keyframes?.[prop] || [])];
  if (index < 0 || index >= list.length) return layer;
  const removedVal = list[index].value;
  list.splice(index, 1);
  return {
    ...layer,
    [prop]: list.length > 0 ? (layer[prop] ?? list[0].value) : removedVal,
    keyframes: {
      ...layer.keyframes,
      [prop]: list,
    },
  };
}

/**
 * Helper to count total keyframes on a layer across all properties.
 */
export function countTotalKeyframes(layer: Layer): number {
  return Object.values(layer.keyframes).reduce((acc, arr) => acc + arr.length, 0);
}

/**
 * Checks if a keyframe exists around `time` on a specific track.
 */
export function hasKeyframeAtTime(
  layer: Layer,
  prop: AnimatableProp,
  time: number,
  tolerance = 0.04
): boolean {
  return layer.keyframes[prop]?.some(k => Math.abs(k.time - time) < tolerance) ?? false;
}
