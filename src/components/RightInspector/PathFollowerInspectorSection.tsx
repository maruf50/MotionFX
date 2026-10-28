'use client';

import React, { useRef } from 'react';
import {
  Route,
  PenTool,
  Sparkles,
  Sliders,
  Eye,
  Circle,
  Star,
  ArrowRight,
  Upload,
  Plus,
  Trash2,
  RotateCcw,
  Maximize2,
  Smile,
  Layers,
} from 'lucide-react';
import { useMotion } from '@/context/MotionContext';
import { FollowerType, PathPoint } from '@/types/motion';
import { PATH_PRESETS } from '@/modules/renderers/pathFollower';
import { STICKER_PRESETS } from '@/modules/assets/stickers';

const EMOJI_PRESETS = ['✨', '🚀', '🔥', '⭐', '💎', '💫', '🟣', '⚡', '🛸', '🎯'];

export function PathFollowerInspectorSection() {
  const { selectedLayer, updateLayer } = useMotion();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!selectedLayer || selectedLayer.shapeType !== 'pathFollower') return null;

  const points = selectedLayer.pathPoints || [];
  const followerCount = selectedLayer.followerCount ?? 5;
  const followerType: FollowerType = selectedLayer.followerType || 'circle';
  const followerSize = selectedLayer.followerSize ?? 22;
  const followerSpeed = selectedLayer.followerSpeed ?? 3.0;
  const followerSpacing = selectedLayer.followerSpacing ?? 0.14;
  const fadeStart = Math.round((selectedLayer.followerFadeStart ?? 0.75) * 100);
  const fadeIn = selectedLayer.followerFadeIn ?? true;
  const scaleDown = selectedLayer.followerScaleDown ?? true;
  const orientToPath = selectedLayer.followerOrientToPath ?? true;
  const showTrack = selectedLayer.showPathTrack !== false;
  const isPenEditing = selectedLayer.isPenEditing ?? false;

  const handleApplyPreset = (presetKey: string) => {
    const preset = PATH_PRESETS[presetKey];
    if (preset) {
      updateLayer(selectedLayer.id, {
        pathPoints: preset.map((p) => ({ ...p })),
      });
    }
  };

  const handleAddAnchorPoint = () => {
    const last = points[points.length - 1] || { x: 0, y: 0 };
    const secondLast = points[points.length - 2] || { x: -50, y: 0 };
    const dx = last.x - secondLast.x || 60;
    const dy = last.y - secondLast.y || 0;
    const newPoint: PathPoint = {
      x: last.x + dx,
      y: last.y + dy,
      cp1x: last.x + dx * 0.4,
      cp1y: last.y + dy * 0.4,
      cp2x: last.x + dx * 0.7,
      cp2y: last.y + dy * 0.7,
    };
    updateLayer(selectedLayer.id, {
      pathPoints: [...points, newPoint],
    });
  };

  const handleRemovePoint = (idx: number) => {
    if (points.length <= 2) return;
    const updated = points.filter((_, i) => i !== idx);
    updateLayer(selectedLayer.id, { pathPoints: updated });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        updateLayer(selectedLayer.id, {
          followerType: 'image',
          followerImageSrc: dataUrl,
        });
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div className="bg-[#1a1a1e] p-2.5 rounded border border-[#28282e] space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
          <Route className="w-3.5 h-3.5 text-purple-400" />
          Move Along Path
        </span>
        <button
          type="button"
          onClick={() =>
            updateLayer(selectedLayer.id, { isPenEditing: !isPenEditing })
          }
          className={`flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded border transition cursor-pointer ${
            isPenEditing
              ? 'bg-purple-600 text-white border-purple-400 font-bold shadow-sm shadow-purple-500/50'
              : 'bg-[#121214] text-zinc-400 border-[#2c2c32] hover:text-white'
          }`}
          title="Toggle interactive pen editing on the canvas"
        >
          <PenTool className="w-3 h-3" />
          <span>{isPenEditing ? 'PEN ACTIVE' : 'EDIT PATH'}</span>
        </button>
      </div>

      {/* Path Presets Bar */}
      <div>
        <label className="text-[11px] text-zinc-400 block mb-1">Path Presets</label>
        <div className="grid grid-cols-3 gap-1">
          {[
            { key: 'wave', label: 'Wave' },
            { key: 'sCurve', label: 'S-Curve' },
            { key: 'loop', label: 'Loop' },
            { key: 'arc', label: 'Arc' },
            { key: 'circle', label: 'Circle' },
            { key: 'rect', label: 'Rect' },
            { key: 'poly', label: 'Poly' },
            { key: 'zigzag', label: 'Zigzag' },
            { key: 'spiral', label: 'Spiral' },
          ].map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => handleApplyPreset(item.key)}
              className="py-1 rounded bg-[#121214] hover:bg-[#202026] border border-[#2c2c32] hover:border-purple-500/50 text-[10px] text-zinc-300 transition"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Follower Count & Speed */}
      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#242428]">
        <div>
          <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
            <span>Item Count</span>
            <span className="font-mono text-purple-300">{followerCount}</span>
          </div>
          <input
            type="range"
            min="1"
            max="20"
            step="1"
            value={followerCount}
            onChange={(e) =>
              updateLayer(selectedLayer.id, {
                followerCount: parseInt(e.target.value, 10),
              })
            }
            className="w-full accent-purple-500 cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
            <span>Cycle Speed</span>
            <span className="font-mono text-purple-300">{followerSpeed}s</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="8.0"
            step="0.1"
            value={followerSpeed}
            onChange={(e) =>
              updateLayer(selectedLayer.id, {
                followerSpeed: parseFloat(e.target.value),
              })
            }
            className="w-full accent-purple-500 cursor-pointer"
          />
        </div>
      </div>

      {/* Follower Spacing / Stagger */}
      <div>
        <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
          <span>Stagger / Spacing Between Items</span>
          <span className="font-mono text-white">
            {Math.round(followerSpacing * 100)}%
          </span>
        </div>
        <input
          type="range"
          min="0.02"
          max="0.4"
          step="0.01"
          value={followerSpacing}
          onChange={(e) =>
            updateLayer(selectedLayer.id, {
              followerSpacing: parseFloat(e.target.value),
            })
          }
          className="w-full accent-purple-500 cursor-pointer"
        />
      </div>

      {/* Follower Type Selector */}
      <div className="pt-2 border-t border-[#242428]">
        <label className="text-[11px] text-zinc-400 block mb-1.5">
          Follower Shape / Media
        </label>
        <div className="grid grid-cols-4 gap-1 mb-2">
          {[
            { type: 'circle', label: 'Circle' },
            { type: 'star', label: 'Star' },
            { type: 'sparkle', label: 'Sparkle' },
            { type: 'arrow', label: 'Arrow' },
            { type: 'rect', label: 'Pill' },
            { type: 'emoji', label: 'Emoji' },
            { type: 'image', label: 'Image' },
          ].map((item) => (
            <button
              key={item.type}
              type="button"
              onClick={() =>
                updateLayer(selectedLayer.id, {
                  followerType: item.type as FollowerType,
                })
              }
              className={`py-1 rounded border text-[10px] capitalize transition text-center ${
                followerType === item.type
                  ? 'bg-purple-600/20 border-purple-500 text-purple-200 font-semibold'
                  : 'bg-[#121214] border-[#2c2c32] text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* If Emoji Type */}
        {followerType === 'emoji' && (
          <div className="space-y-1.5 p-2 rounded bg-[#121214] border border-[#2c2c32]">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-zinc-400">Quick Emojis:</span>
              <div className="flex gap-1 flex-wrap">
                {EMOJI_PRESETS.map((em) => (
                  <button
                    key={em}
                    type="button"
                    onClick={() =>
                      updateLayer(selectedLayer.id, { followerEmoji: em })
                    }
                    className="w-6 h-6 rounded bg-[#1c1c20] hover:bg-[#282830] text-xs transition"
                  >
                    {em}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-zinc-400">Custom:</span>
              <input
                type="text"
                value={selectedLayer.followerEmoji || '✨'}
                onChange={(e) =>
                  updateLayer(selectedLayer.id, { followerEmoji: e.target.value })
                }
                className="w-16 bg-[#1a1a1e] border border-[#303038] text-center rounded text-sm py-0.5 outline-none"
              />
            </div>
          </div>
        )}

        {/* If Image Type */}
        {followerType === 'image' && (
          <div className="space-y-2 p-2 rounded bg-[#121214] border border-[#2c2c32]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-zinc-400">Follower PNG / Sticker</span>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1 py-1 px-2 rounded bg-purple-600/20 text-purple-300 border border-purple-500/40 text-[10px] hover:bg-purple-600/30 transition cursor-pointer"
              >
                <Upload className="w-3 h-3" />
                <span>Upload Custom</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </div>

            {/* Sticker Presets for fast selection */}
            <div className="flex gap-1.5 items-center">
              <span className="text-[9px] text-zinc-500">Preset:</span>
              {STICKER_PRESETS.map((stk) => (
                <button
                  key={stk.id}
                  type="button"
                  onClick={() =>
                    updateLayer(selectedLayer.id, {
                      followerImageSrc: stk.dataUrl,
                      followerType: 'image',
                    })
                  }
                  className="w-6 h-6 rounded bg-[#1c1c20] hover:bg-[#25252b] border border-[#28282e] text-xs flex items-center justify-center transition"
                  title={`Use ${stk.name}`}
                >
                  {stk.emoji}
                </button>
              ))}
            </div>

            {selectedLayer.followerImageSrc && (
              <div className="flex items-center gap-2 pt-1 border-t border-[#242428]">
                <img
                  src={selectedLayer.followerImageSrc}
                  alt="Follower item"
                  className="w-7 h-7 object-contain rounded bg-black/40 border border-white/10"
                />
                <span className="text-[10px] text-emerald-400">Custom Image Active</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Follower Size & Color */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
            <span>Item Size</span>
            <span className="font-mono text-white">{followerSize}px</span>
          </div>
          <input
            type="range"
            min="8"
            max="80"
            step="1"
            value={followerSize}
            onChange={(e) =>
              updateLayer(selectedLayer.id, {
                followerSize: parseInt(e.target.value, 10),
              })
            }
            className="w-full accent-purple-500 cursor-pointer"
          />
        </div>

        <div className="bg-[#121214] p-1.5 rounded border border-[#2c2c32] flex items-center justify-between self-end">
          <span className="text-[11px] text-zinc-300">Item Color</span>
          <input
            type="color"
            value={selectedLayer.followerColor || selectedLayer.fill || '#38bdf8'}
            onChange={(e) =>
              updateLayer(selectedLayer.id, {
                followerColor: e.target.value,
                fill: e.target.value,
              })
            }
            className="w-5 h-5 rounded cursor-pointer bg-transparent border-0"
          />
        </div>
      </div>

      {/* Customizable Fade-Away Transition Section */}
      <div className="pt-2 border-t border-[#242428] space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-zinc-300 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-purple-400" />
            Fade Away at End
          </span>
          <span className="text-[10px] font-mono text-purple-300">
            from {fadeStart}% to 100%
          </span>
        </div>

        {/* Fade Start Position */}
        <div>
          <div className="flex justify-between text-[10px] text-zinc-400 mb-1">
            <span>Fade Out Threshold</span>
            <span className="font-mono text-white">Starts at {fadeStart}%</span>
          </div>
          <input
            type="range"
            min="40"
            max="95"
            step="1"
            value={fadeStart}
            onChange={(e) =>
              updateLayer(selectedLayer.id, {
                followerFadeStart: parseInt(e.target.value, 10) / 100,
              })
            }
            className="w-full accent-purple-500 cursor-pointer"
          />
        </div>

        {/* Transition Options */}
        <div className="space-y-1 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-zinc-400">Smooth Fade In at Start</span>
            <input
              type="checkbox"
              checked={fadeIn}
              onChange={(e) =>
                updateLayer(selectedLayer.id, { followerFadeIn: e.target.checked })
              }
              className="rounded accent-purple-500 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[10px] text-zinc-400">Shrink as it Fades (Scale Down)</span>
            <input
              type="checkbox"
              checked={scaleDown}
              onChange={(e) =>
                updateLayer(selectedLayer.id, { followerScaleDown: e.target.checked })
              }
              className="rounded accent-purple-500 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[10px] text-zinc-400">Orient to Path (Rotate along curve)</span>
            <input
              type="checkbox"
              checked={orientToPath}
              onChange={(e) =>
                updateLayer(selectedLayer.id, {
                  followerOrientToPath: e.target.checked,
                })
              }
              className="rounded accent-purple-500 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Guide Path Track Appearance */}
      <div className="pt-2 border-t border-[#242428] space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-zinc-300">Show Guide Path Line</span>
          <input
            type="checkbox"
            checked={showTrack}
            onChange={(e) =>
              updateLayer(selectedLayer.id, { showPathTrack: e.target.checked })
            }
            className="rounded accent-purple-500 cursor-pointer"
          />
        </div>

        {showTrack && (
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-[#121214] p-1.5 rounded border border-[#2c2c32] flex items-center justify-between">
              <span className="text-[10px] text-zinc-300">Track Color</span>
              <input
                type="color"
                value={selectedLayer.pathTrackColor || '#6366f1'}
                onChange={(e) =>
                  updateLayer(selectedLayer.id, { pathTrackColor: e.target.value })
                }
                className="w-4 h-4 rounded cursor-pointer bg-transparent border-0"
              />
            </div>

            <div className="flex items-center justify-between bg-[#121214] px-2 py-1 rounded border border-[#2c2c32]">
              <span className="text-[10px] text-zinc-300">Dashed Flow</span>
              <input
                type="checkbox"
                checked={selectedLayer.pathTrackDashed ?? true}
                onChange={(e) =>
                  updateLayer(selectedLayer.id, {
                    pathTrackDashed: e.target.checked,
                  })
                }
                className="rounded accent-purple-500 cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>

      {/* Anchor Points List & Pen Action */}
      <div className="pt-2 border-t border-[#242428] space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold text-zinc-400">
            Anchor Points ({points.length})
          </span>
          <button
            type="button"
            onClick={handleAddAnchorPoint}
            className="flex items-center gap-1 py-0.5 px-1.5 rounded bg-purple-600/20 text-purple-300 hover:bg-purple-600/30 border border-purple-500/40 text-[9px] transition cursor-pointer"
          >
            <Plus className="w-2.5 h-2.5" />
            <span>Add Point</span>
          </button>
        </div>

        <div className="max-h-24 overflow-y-auto space-y-1 pr-1">
          {points.map((pt, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-1 rounded bg-[#121214] border border-[#242428] text-[9px] font-mono text-zinc-400"
            >
              <span>
                P{idx + 1}: ({Math.round(pt.x)}, {Math.round(pt.y)})
              </span>
              {points.length > 2 && (
                <button
                  type="button"
                  onClick={() => handleRemovePoint(idx)}
                  className="text-zinc-500 hover:text-red-400 p-0.5 transition"
                  title="Remove point"
                >
                  <Trash2 className="w-2.5 h-2.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
