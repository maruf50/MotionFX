'use client';

import React from 'react';
import {
  GitBranch,
  CornerDownRight,
  Sparkles,
  RotateCcw,
  Play,
  Repeat,
  Activity,
  MousePointer2,
} from 'lucide-react';
import { useMotion } from '@/context/MotionContext';
import { BranchCurvature, BranchDirection, BranchEndShape } from '@/types/motion';

export function BranchingInspectorSection() {
  const { selectedLayer, updateLayer } = useMotion();

  if (!selectedLayer || selectedLayer.shapeType !== 'branching') return null;

  const branchCount = selectedLayer.branchCount ?? 4;
  const branchLength = selectedLayer.branchLength ?? 130;
  const branchSpread = selectedLayer.branchSpread ?? 130;
  const branchPosition = selectedLayer.branchPosition ?? 0;
  const trunkLength = selectedLayer.branchTrunkLength ?? 50;
  const curvature = selectedLayer.branchCurvature || 'curved';
  const direction = selectedLayer.branchDirection || 'right';
  const endShape = selectedLayer.branchEndShape || 'circle';
  const endSize = selectedLayer.branchEndSize ?? 8;

  // Animation & Growth properties
  const isAnimated = selectedLayer.branchAnimated !== false;
  const animDuration = selectedLayer.branchAnimDuration ?? 2.5;
  const animLoop = selectedLayer.branchAnimLoop || 'loop';
  const growth = Math.round((selectedLayer.branchGrowth ?? 1.0) * 100);
  const animateCount = selectedLayer.branchAnimateCount ?? false;
  const animateLength = selectedLayer.branchAnimateLength ?? false;
  const hasCustomEndpoints =
    selectedLayer.branchEndpoints && selectedLayer.branchEndpoints.length > 0;

  const handleResetEndpoints = () => {
    updateLayer(selectedLayer.id, { branchEndpoints: undefined });
  };

  return (
    <div className="bg-[#1a1a1e] p-2.5 rounded border border-[#28282e] space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
          <GitBranch className="w-3.5 h-3.5 text-purple-400" />
          Branching Motion
        </span>
        <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-700/50">
          {branchCount} BRANCHES
        </span>
      </div>

      {/* Interactive Cursor Movement Helper */}
      <div className="p-2 rounded bg-[#121215] border border-[#26262e] text-[10px] text-zinc-400 flex items-start gap-1.5">
        <MousePointer2 className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
        <div className="flex-1">
          <span>Click & drag branch endpoints directly on the canvas to move them freely.</span>
          {hasCustomEndpoints && (
            <div className="mt-1 flex items-center justify-between pt-1 border-t border-[#202026]">
              <span className="text-purple-300 font-mono">Custom Endpoints Active</span>
              <button
                type="button"
                onClick={handleResetEndpoints}
                className="flex items-center gap-1 py-0.5 px-1.5 rounded bg-[#1e1e24] hover:bg-[#282832] text-[9px] text-zinc-300 hover:text-white transition cursor-pointer"
                title="Reset branch endpoints to default symmetrical spread"
              >
                <RotateCcw className="w-2.5 h-2.5" />
                <span>Reset</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Default Branch Animation Section */}
      <div className="p-2.5 rounded bg-[#141417] border border-[#272730] space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-zinc-200 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-purple-400" />
            Branch Growth Animation
          </span>
          <input
            type="checkbox"
            checked={isAnimated}
            onChange={(e) =>
              updateLayer(selectedLayer.id, { branchAnimated: e.target.checked })
            }
            className="rounded accent-purple-500 cursor-pointer"
          />
        </div>

        {isAnimated ? (
          <div className="space-y-2 pt-1">
            {/* Speed / Duration */}
            <div>
              <div className="flex justify-between text-[10px] text-zinc-400 mb-1">
                <span>Growth Duration</span>
                <span className="font-mono text-purple-300">{animDuration}s</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="8.0"
                step="0.1"
                value={animDuration}
                onChange={(e) =>
                  updateLayer(selectedLayer.id, {
                    branchAnimDuration: parseFloat(e.target.value),
                  })
                }
                className="w-full accent-purple-500 cursor-pointer"
              />
            </div>

            {/* Loop Mode */}
            <div>
              <label className="text-[10px] text-zinc-400 block mb-1">Animation Loop Mode</label>
              <div className="grid grid-cols-3 gap-1">
                {[
                  { mode: 'loop', label: 'Loop' },
                  { mode: 'pingpong', label: 'Ping-Pong' },
                  { mode: 'once', label: 'Once' },
                ].map((item) => (
                  <button
                    key={item.mode}
                    type="button"
                    onClick={() =>
                      updateLayer(selectedLayer.id, {
                        branchAnimLoop: item.mode as 'loop' | 'pingpong' | 'once',
                      })
                    }
                    className={`py-1 rounded border text-[10px] transition text-center capitalize ${
                      animLoop === item.mode
                        ? 'bg-purple-600/30 border-purple-500 text-purple-200 font-bold'
                        : 'bg-[#18181e] border-[#2c2c36] text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Manual Growth Slider if Animation is Off */
          <div>
            <div className="flex justify-between text-[10px] text-zinc-400 mb-1">
              <span>Manual Growth Position</span>
              <span className="font-mono text-purple-300">{growth}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={growth}
              onChange={(e) =>
                updateLayer(selectedLayer.id, {
                  branchGrowth: parseInt(e.target.value, 10) / 100,
                })
              }
              className="w-full accent-purple-500 cursor-pointer"
            />
          </div>
        )}

        {/* Dynamic Property Animations */}
        <div className="space-y-1 pt-1.5 border-t border-[#22222a]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-zinc-300">Animate Branch Count (Spawning)</span>
            <input
              type="checkbox"
              checked={animateCount}
              onChange={(e) =>
                updateLayer(selectedLayer.id, { branchAnimateCount: e.target.checked })
              }
              className="rounded accent-purple-500 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[10px] text-zinc-300">Animate Length (Pulse / Breathing)</span>
            <input
              type="checkbox"
              checked={animateLength}
              onChange={(e) =>
                updateLayer(selectedLayer.id, { branchAnimateLength: e.target.checked })
              }
              className="rounded accent-purple-500 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Amount of Branches */}
      <div>
        <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
          <span>Amount of Branches</span>
          <span className="font-mono text-purple-300">{branchCount}</span>
        </div>
        <input
          type="range"
          min="1"
          max="16"
          step="1"
          value={branchCount}
          onChange={(e) =>
            updateLayer(selectedLayer.id, {
              branchCount: parseInt(e.target.value, 10),
            })
          }
          className="w-full accent-purple-500 cursor-pointer"
        />
      </div>

      {/* Branch Length */}
      <div>
        <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
          <span>Branch Length</span>
          <span className="font-mono text-purple-300">{branchLength}px</span>
        </div>
        <input
          type="range"
          min="20"
          max="400"
          step="5"
          value={branchLength}
          onChange={(e) =>
            updateLayer(selectedLayer.id, {
              branchLength: parseInt(e.target.value, 10),
            })
          }
          className="w-full accent-purple-500 cursor-pointer"
        />
      </div>

      {/* Branch Position (Split point along trunk) */}
      <div>
        <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
          <span>Branch Position (Offset)</span>
          <span className="font-mono text-purple-300">{branchPosition}px</span>
        </div>
        <input
          type="range"
          min="-100"
          max="100"
          step="5"
          value={branchPosition}
          onChange={(e) =>
            updateLayer(selectedLayer.id, {
              branchPosition: parseInt(e.target.value, 10),
            })
          }
          className="w-full accent-purple-500 cursor-pointer"
        />
      </div>

      {/* Branch Spread (Angle / Distance) */}
      <div>
        <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
          <span>Branch Spread / Width</span>
          <span className="font-mono text-purple-300">{branchSpread}px</span>
        </div>
        <input
          type="range"
          min="20"
          max="320"
          step="5"
          value={branchSpread}
          onChange={(e) =>
            updateLayer(selectedLayer.id, {
              branchSpread: parseInt(e.target.value, 10),
            })
          }
          className="w-full accent-purple-500 cursor-pointer"
        />
      </div>

      {/* Trunk Length */}
      <div>
        <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
          <span>Root Trunk Length</span>
          <span className="font-mono text-white">{trunkLength}px</span>
        </div>
        <input
          type="range"
          min="10"
          max="200"
          step="5"
          value={trunkLength}
          onChange={(e) =>
            updateLayer(selectedLayer.id, {
              branchTrunkLength: parseInt(e.target.value, 10),
            })
          }
          className="w-full accent-purple-500 cursor-pointer"
        />
      </div>

      {/* Curvature Mode */}
      <div>
        <label className="text-[11px] text-zinc-400 block mb-1.5">Line Curvature</label>
        <div className="grid grid-cols-3 gap-1">
          <button
            type="button"
            onClick={() => updateLayer(selectedLayer.id, { branchCurvature: 'curved' })}
            className={`py-1.5 px-2 rounded border text-[10px] flex items-center justify-center gap-1 transition ${
              curvature === 'curved'
                ? 'bg-purple-600/20 border-purple-500 text-purple-200 font-semibold'
                : 'bg-[#121214] border-[#2c2c32] text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span>Bézier</span>
          </button>

          <button
            type="button"
            onClick={() => updateLayer(selectedLayer.id, { branchCurvature: 'straight' })}
            className={`py-1.5 px-2 rounded border text-[10px] flex items-center justify-center gap-1 transition ${
              curvature === 'straight'
                ? 'bg-purple-600/20 border-purple-500 text-purple-200 font-semibold'
                : 'bg-[#121214] border-[#2c2c32] text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span>Straight</span>
          </button>

          <button
            type="button"
            onClick={() => updateLayer(selectedLayer.id, { branchCurvature: 'stepped' })}
            className={`py-1.5 px-2 rounded border text-[10px] flex items-center justify-center gap-1 transition ${
              curvature === 'stepped'
                ? 'bg-purple-600/20 border-purple-500 text-purple-200 font-semibold'
                : 'bg-[#121214] border-[#2c2c32] text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <CornerDownRight className="w-3 h-3" />
            <span>Elbow</span>
          </button>
        </div>
      </div>

      {/* Direction */}
      <div>
        <label className="text-[11px] text-zinc-400 block mb-1.5">Growth Direction</label>
        <div className="grid grid-cols-5 gap-1">
          {(['right', 'left', 'up', 'down', 'radial'] as BranchDirection[]).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => updateLayer(selectedLayer.id, { branchDirection: d })}
              className={`py-1 rounded border text-[9px] uppercase font-mono transition text-center ${
                direction === d
                  ? 'bg-purple-600/20 border-purple-500 text-purple-200 font-semibold'
                  : 'bg-[#121214] border-[#2c2c32] text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* End Tip Marker Shape */}
      <div>
        <label className="text-[11px] text-zinc-400 block mb-1.5">Branch Tip Markers</label>
        <div className="grid grid-cols-4 gap-1">
          {(['circle', 'arrow', 'square', 'none'] as BranchEndShape[]).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => updateLayer(selectedLayer.id, { branchEndShape: s })}
              className={`py-1 rounded border text-[10px] capitalize transition text-center ${
                endShape === s
                  ? 'bg-purple-600/20 border-purple-500 text-purple-200 font-semibold'
                  : 'bg-[#121214] border-[#2c2c32] text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* End Tip Size */}
      {endShape !== 'none' && (
        <div>
          <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
            <span>Tip Node Size</span>
            <span className="font-mono text-white">{endSize}px</span>
          </div>
          <input
            type="range"
            min="4"
            max="24"
            step="1"
            value={endSize}
            onChange={(e) =>
              updateLayer(selectedLayer.id, {
                branchEndSize: parseInt(e.target.value, 10),
              })
            }
            className="w-full accent-purple-500 cursor-pointer"
          />
        </div>
      )}

      {/* Colors & Thickness */}
      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#242428]">
        <div className="bg-[#121214] p-1.5 rounded border border-[#2c2c32] flex items-center justify-between">
          <span className="text-[11px] text-zinc-300">Line Color</span>
          <input
            type="color"
            value={selectedLayer.stroke || '#6366f1'}
            onChange={(e) =>
              updateLayer(selectedLayer.id, { stroke: e.target.value })
            }
            className="w-5 h-5 rounded cursor-pointer bg-transparent border-0"
          />
        </div>

        <div className="bg-[#121214] p-1.5 rounded border border-[#2c2c32] flex items-center justify-between">
          <span className="text-[11px] text-zinc-300">Node Color</span>
          <input
            type="color"
            value={selectedLayer.fill || '#6366f1'}
            onChange={(e) => updateLayer(selectedLayer.id, { fill: e.target.value })}
            className="w-5 h-5 rounded cursor-pointer bg-transparent border-0"
          />
        </div>
      </div>

      {/* Stroke Line Width */}
      <div>
        <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
          <span>Line Thickness</span>
          <span className="font-mono text-white">
            {selectedLayer.borderWidth || 3}px
          </span>
        </div>
        <input
          type="range"
          min="1"
          max="20"
          step="1"
          value={selectedLayer.borderWidth || 3}
          onChange={(e) =>
            updateLayer(selectedLayer.id, {
              borderWidth: parseInt(e.target.value, 10),
            })
          }
          className="w-full accent-purple-500 cursor-pointer"
        />
      </div>

      {/* Flow Animation */}
      <div className="flex items-center justify-between pt-1 border-t border-[#242428]">
        <span className="text-[11px] text-zinc-300">Animate Flow Along Branches</span>
        <input
          type="checkbox"
          checked={selectedLayer.animateDash}
          onChange={(e) =>
            updateLayer(selectedLayer.id, {
              animateDash: e.target.checked,
              borderStyle: e.target.checked ? 'dashed' : 'solid',
            })
          }
          className="rounded accent-purple-500 cursor-pointer"
        />
      </div>
    </div>
  );
}
