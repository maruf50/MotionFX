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
  Diamond,
} from 'lucide-react';
import { useMotion } from '@/context/MotionContext';
import { BranchCurvature, BranchDirection, BranchEndShape } from '@/types/motion';
import { getInterpolatedValue } from '@/modules/keyframes/evaluator';
import { ColorPickerWithAlpha } from './ColorPickerWithAlpha';

export function BranchingInspectorSection() {
  const {
    selectedLayer,
    updateLayer,
    setAnimPropValue,
    toggleKeyframe,
    addStartAndEndKeyframes,
    currentTime,
    isAutoKeyframe,
  } = useMotion();

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
  const animateCount = selectedLayer.branchAnimateCount ?? false;
  const animateLength = selectedLayer.branchAnimateLength ?? false;
  const hasCustomEndpoints =
    selectedLayer.branchEndpoints && selectedLayer.branchEndpoints.length > 0;

  const hasGrowthKeyframes = Boolean(selectedLayer.keyframes?.branchGrowth?.length);
  const growthVal = hasGrowthKeyframes
    ? getInterpolatedValue(selectedLayer, 'branchGrowth', currentTime)
    : (selectedLayer.branchGrowth !== undefined
        ? (selectedLayer.branchGrowth <= 1 && selectedLayer.branchGrowth > 0
            ? selectedLayer.branchGrowth * 100
            : selectedLayer.branchGrowth)
        : 100);

  const hasKfAtPlayhead = selectedLayer.keyframes?.branchGrowth?.some(
    (k) => Math.abs(k.time - currentTime) < 0.04
  );

  const handleGrowthChange = (val: number) => {
    if (selectedLayer.branchAnimated && !hasGrowthKeyframes) {
      updateLayer(selectedLayer.id, { branchAnimated: false });
    }
    if (hasGrowthKeyframes || isAutoKeyframe) {
      setAnimPropValue(selectedLayer.id, 'branchGrowth', val, true);
    } else {
      updateLayer(selectedLayer.id, { branchGrowth: val });
    }
  };

  const handleToggleGrowthKeyframe = () => {
    if (selectedLayer.branchAnimated) {
      updateLayer(selectedLayer.id, { branchAnimated: false });
    }
    toggleKeyframe(selectedLayer.id, 'branchGrowth');
  };

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

      {/* Branch Lifetime & Keyframe Animation */}
      <div className="p-2.5 rounded bg-[#141417] border border-[#272730] space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-zinc-200 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-purple-400" />
              Branch Lifetime & Growth
            </span>
            <button
              type="button"
              onClick={handleToggleGrowthKeyframe}
              title={
                hasKfAtPlayhead
                  ? 'Remove lifetime keyframe at playhead'
                  : 'Add lifetime keyframe at playhead'
              }
              className={`p-1 rounded transition cursor-pointer ${
                hasKfAtPlayhead
                  ? 'text-purple-400 bg-purple-950/60 hover:bg-purple-900/60'
                  : 'text-zinc-600 hover:text-zinc-300'
              }`}
            >
              <Diamond className={`w-3 h-3 ${hasKfAtPlayhead ? 'fill-purple-400' : ''}`} />
            </button>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-mono font-bold text-purple-300">
              {Math.round(growthVal)}%
            </span>
            <button
              type="button"
              onClick={() => {
                updateLayer(selectedLayer.id, { branchAnimated: false });
                addStartAndEndKeyframes(selectedLayer.id, 'branchGrowth', 0, 100, animDuration);
              }}
              className="text-[9px] px-1.5 py-0.5 rounded bg-[#1e1e24] hover:bg-purple-950 text-zinc-300 hover:text-purple-300 border border-[#303038] hover:border-purple-600 transition"
              title="Add 0% start and 100% end keyframes"
            >
              0%→100%
            </button>
          </div>
        </div>

        {/* Mode Selector: Keyframed Lifetime vs Auto Loop */}
        <div className="grid grid-cols-2 gap-1 bg-[#101012] p-0.5 rounded border border-[#242428]">
          <button
            type="button"
            onClick={() => updateLayer(selectedLayer.id, { branchAnimated: false })}
            className={`py-1 rounded text-[10px] font-medium transition ${
              !selectedLayer.branchAnimated
                ? 'bg-purple-600/30 text-purple-200 border border-purple-500/50 font-bold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Keyframed Lifetime
          </button>
          <button
            type="button"
            onClick={() => updateLayer(selectedLayer.id, { branchAnimated: true })}
            className={`py-1 rounded text-[10px] font-medium transition ${
              selectedLayer.branchAnimated
                ? 'bg-purple-600/30 text-purple-200 border border-purple-500/50 font-bold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Auto Loop Timer
          </button>
        </div>

        {/* Lifetime Slider (operable across modes) */}
        <div>
          <div className="flex justify-between text-[10px] text-zinc-400 mb-1">
            <span>Growth Lifetime (Start → End)</span>
            <span className="font-mono text-purple-300">{Math.round(growthVal)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={growthVal}
            onChange={(e) => handleGrowthChange(parseFloat(e.target.value) || 0)}
            className="w-full accent-purple-500 cursor-pointer"
          />

          {/* Quick Presets */}
          <div className="grid grid-cols-5 gap-1 mt-1.5">
            {[
              { val: 0, label: '0% Start' },
              { val: 25, label: '25%' },
              { val: 50, label: '50%' },
              { val: 75, label: '75%' },
              { val: 100, label: '100% Full' },
            ].map((p) => (
              <button
                key={p.val}
                type="button"
                onClick={() => handleGrowthChange(p.val)}
                className={`py-0.5 rounded text-[9px] font-mono transition border ${
                  Math.round(growthVal) === p.val
                    ? 'bg-purple-600/30 text-purple-200 border-purple-500/60 font-bold'
                    : 'bg-[#121214] text-zinc-400 border-[#2c2c32] hover:bg-[#202026] hover:text-zinc-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Organic Blossom Options */}
        <div className="space-y-1.5 pt-1.5 border-t border-[#22222a]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-zinc-300">Grow Trunk from Root First</span>
            <input
              type="checkbox"
              checked={selectedLayer.branchGrowTrunk !== false}
              onChange={(e) =>
                updateLayer(selectedLayer.id, { branchGrowTrunk: e.target.checked })
              }
              className="rounded accent-purple-500 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[10px] text-zinc-300">Stagger Branch Blossoming</span>
            <input
              type="checkbox"
              checked={selectedLayer.branchStagger ?? false}
              onChange={(e) =>
                updateLayer(selectedLayer.id, { branchStagger: e.target.checked })
              }
              className="rounded accent-purple-500 cursor-pointer"
            />
          </div>
        </div>

        {/* If in Auto Loop Mode, show loop controls */}
        {selectedLayer.branchAnimated && (
          <div className="space-y-2 pt-2 border-t border-[#22222a]">
            <div>
              <div className="flex justify-between text-[10px] text-zinc-400 mb-1">
                <span>Loop Cycle Duration</span>
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

            <div>
              <label className="text-[10px] text-zinc-400 block mb-1">Loop Style</label>
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
        )}

        {/* Dynamic Property Oscillations */}
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

      {/* Colors & Thickness with Alpha */}
      <div className="space-y-2 pt-1 border-t border-[#242428]">
        <ColorPickerWithAlpha
          label="Line Color & Alpha"
          color={selectedLayer.stroke || '#6366f1'}
          onChange={(newStroke) => updateLayer(selectedLayer.id, { stroke: newStroke })}
        />

        <ColorPickerWithAlpha
          label="Node Color & Alpha"
          color={selectedLayer.fill || '#6366f1'}
          onChange={(newFill) => updateLayer(selectedLayer.id, { fill: newFill })}
        />
      </div>

      {/* Stroke Line Width */}
      <div>
        <div className="flex justify-between items-center text-[11px] text-zinc-400 mb-1.5">
          <span>Line Thickness</span>
          <div className="flex items-center gap-1">
            {[1, 3, 6, 12].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => updateLayer(selectedLayer.id, { borderWidth: t })}
                className={`px-1.5 py-0.5 rounded text-[9px] font-mono border transition cursor-pointer ${
                  (selectedLayer.borderWidth || 3) === t
                    ? 'bg-purple-600/30 text-purple-200 border-purple-500/60 font-semibold'
                    : 'bg-[#121214] text-zinc-400 border-[#2c2c32] hover:bg-[#1e1e24] hover:text-white'
                }`}
              >
                {t}px
              </button>
            ))}
          </div>
        </div>
        <div className="relative flex items-center">
          <input
            type="number"
            min="1"
            step="1"
            value={selectedLayer.borderWidth || 3}
            onChange={(e) =>
              updateLayer(selectedLayer.id, {
                borderWidth: Math.max(1, parseInt(e.target.value, 10) || 1),
              })
            }
            className="w-full bg-[#121214] border border-[#2c2c32] focus:border-purple-500 rounded px-2.5 py-1.5 pr-8 text-xs font-mono text-white outline-none"
            placeholder="Enter line thickness (px)"
          />
          <span className="absolute right-2.5 text-[10px] font-mono text-zinc-500 pointer-events-none">
            px
          </span>
        </div>
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
