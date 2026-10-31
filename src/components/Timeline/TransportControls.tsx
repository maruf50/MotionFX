'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  Square,
  SkipBack,
  Repeat,
  Diamond,
  X,
  Clock,
  ChevronDown,
} from 'lucide-react';
import { useMotion } from '@/context/MotionContext';

export function TransportControls() {
  const {
    isPlaying,
    togglePlay,
    stopPlay,
    seekToStart,
    isLooping,
    toggleLoop,
    currentTime,
    duration,
    setDuration,
    selectedLayerId,
    keyAllTransformProps,
    selectedKeyframe,
    selectedKeyframes,
    deleteSelectedKeyframes,
    isAutoKeyframe,
    toggleAutoKeyframe,
  } = useMotion();

  const [customInput, setCustomInput] = useState<string>(duration.toString());
  const [isDurationDropdownOpen, setIsDurationDropdownOpen] = useState<boolean>(false);
  const durationDropdownRef = useRef<HTMLDivElement | null>(null);

  // Synchronize input when duration updates from templates, undo/redo, etc.
  useEffect(() => {
    setCustomInput(duration.toString());
  }, [duration]);

  // Click outside to close presets dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        durationDropdownRef.current &&
        !durationDropdownRef.current.contains(e.target as Node)
      ) {
        setIsDurationDropdownOpen(false);
      }
    };
    if (isDurationDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDurationDropdownOpen]);

  const applyCustomDuration = (val: string) => {
    const parsed = parseFloat(val);
    if (!isNaN(parsed) && parsed > 0) {
      const clamped = Math.max(0.5, Math.min(300, Math.round(parsed * 10) / 10));
      setDuration(clamped);
      setCustomInput(clamped.toString());
    } else {
      setCustomInput(duration.toString());
    }
    setIsDurationDropdownOpen(false);
  };

  const handleStepDuration = (delta: number) => {
    const next = Math.max(0.5, Math.min(300, Math.round((duration + delta) * 10) / 10));
    setDuration(next);
    setCustomInput(next.toString());
  };

  return (
    <div className="h-10 bg-[#121214] border-b border-[#242428] px-3.5 flex items-center justify-between shrink-0 select-none">
      {/* Left Transport Buttons */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={seekToStart}
          title="Jump to Start"
          className="w-7 h-7 rounded bg-[#1c1c20] hover:bg-[#25252b] text-zinc-300 hover:text-white border border-[#28282e] hover:border-purple-500/40 flex items-center justify-center transition cursor-pointer"
        >
          <SkipBack className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={togglePlay}
          className="w-8 h-7 rounded bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center shadow-md shadow-purple-950/50 transition cursor-pointer"
          title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
        >
          {isPlaying ? (
            <Pause className="w-3.5 h-3.5 fill-white" />
          ) : (
            <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
          )}
        </button>

        <button
          onClick={stopPlay}
          title="Stop Playback"
          className="w-7 h-7 rounded bg-[#1c1c20] hover:bg-[#25252b] text-zinc-300 hover:text-white border border-[#28282e] hover:border-purple-500/40 flex items-center justify-center transition cursor-pointer"
        >
          <Square className="w-3 h-3 fill-zinc-300" />
        </button>

        <button
          onClick={toggleLoop}
          title={isLooping ? 'Looping Enabled' : 'Looping Disabled'}
          className={`w-7 h-7 rounded border transition cursor-pointer flex items-center justify-center ${
            isLooping
              ? 'bg-purple-600/20 text-purple-300 border-purple-500/40'
              : 'bg-[#1c1c20] text-zinc-500 border-[#28282e] hover:text-zinc-300'
          }`}
        >
          <Repeat className="w-3.5 h-3.5" />
        </button>

        <div className="h-4 w-[1px] bg-[#242428] mx-1.5"></div>

        {/* Timecode Readout */}
        <div className="font-mono text-xs bg-[#0d0d0f] px-2.5 py-0.5 rounded border border-[#242428] text-zinc-300">
          <span className="text-white font-bold">{currentTime.toFixed(2).padStart(5, '0')}s</span>
          <span className="text-zinc-600"> / </span>
          <span className="text-zinc-400">{duration.toFixed(2).padStart(5, '0')}s</span>
        </div>
      </div>

      {/* Center Keyframe Action Buttons */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => selectedLayerId && keyAllTransformProps(selectedLayerId)}
          disabled={!selectedLayerId}
          className="text-xs px-2.5 py-1 rounded bg-[#1c1c20] hover:bg-[#25252b] disabled:opacity-30 disabled:cursor-not-allowed text-zinc-200 hover:text-purple-300 border border-[#28282e] hover:border-purple-500/40 flex items-center gap-1.5 transition cursor-pointer"
          title="Insert keyframes for all transform properties at current playhead"
        >
          <Diamond className="w-3 h-3 fill-purple-400 text-purple-400" />
          <span>Add Keyframe at Playhead</span>
        </button>

        {/* Auto Keyframe Toggle */}
        <button
          onClick={toggleAutoKeyframe}
          className={`text-xs px-2.5 py-1 rounded border flex items-center gap-1.5 transition cursor-pointer ${
            isAutoKeyframe
              ? 'bg-rose-950/40 text-rose-300 border-rose-500/60 shadow-sm shadow-rose-950/50'
              : 'bg-[#1c1c20] hover:bg-[#25252b] text-zinc-400 hover:text-zinc-200 border-[#28282e]'
          }`}
          title={
            isAutoKeyframe
              ? 'Auto-keyframe is ENABLED: Every transform change automatically creates a keyframe at playhead'
              : 'Auto-keyframe is DISABLED: Transform changes modify base properties without adding keyframes'
          }
        >
          <span
            className={`w-2 h-2 rounded-full transition-colors ${
              isAutoKeyframe ? 'bg-rose-500 animate-pulse' : 'bg-zinc-600'
            }`}
          />
          <span className="font-medium">Auto Keyframe</span>
          <span
            className={`text-[9px] px-1 py-0.2 rounded font-mono uppercase font-bold ${
              isAutoKeyframe ? 'bg-rose-500/20 text-rose-300' : 'bg-zinc-800 text-zinc-500'
            }`}
          >
            {isAutoKeyframe ? 'ON' : 'OFF'}
          </span>
        </button>

        {/* Delete Keyframe(s) */}
        <button
          onClick={deleteSelectedKeyframes}
          disabled={!selectedKeyframe && selectedKeyframes.length === 0}
          className="text-xs px-2.5 py-1 rounded bg-[#1c1c20] hover:bg-rose-950/50 text-zinc-300 hover:text-rose-300 disabled:opacity-30 disabled:cursor-not-allowed border border-[#28282e] hover:border-rose-900/40 transition flex items-center gap-1 cursor-pointer"
          title={
            selectedKeyframes.length > 1
              ? `Delete ${selectedKeyframes.length} selected keyframes`
              : 'Delete the selected keyframe'
          }
        >
          <X className="w-3.5 h-3.5" />
          <span>
            {selectedKeyframes.length > 1
              ? `Delete Keyframes (${selectedKeyframes.length})`
              : 'Delete Keyframe'}
          </span>
        </button>
      </div>

      {/* Right Custom Duration Controller */}
      <div className="relative flex items-center gap-1.5" ref={durationDropdownRef}>
        <div className="flex items-center gap-1 bg-[#18181c] px-2 py-0.5 rounded border border-[#28282e] text-xs">
          <Clock className="w-3.5 h-3.5 text-purple-400 shrink-0" />
          <span className="text-zinc-400 font-medium">Duration:</span>

          {/* Stepper Minus */}
          <button
            type="button"
            onClick={() => handleStepDuration(-0.5)}
            className="w-4 h-4 rounded bg-[#222227] hover:bg-[#2c2c32] text-zinc-300 hover:text-white flex items-center justify-center transition cursor-pointer text-xs"
            title="Decrease duration by 0.5s"
          >
            -
          </button>

          {/* Direct Custom Number Input */}
          <div className="flex items-center font-mono">
            <input
              type="number"
              min="0.5"
              max="300"
              step="0.5"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              onBlur={() => applyCustomDuration(customInput)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  applyCustomDuration(customInput);
                  (e.target as HTMLInputElement).blur();
                }
              }}
              className="w-11 bg-[#101012] border border-[#2c2c32] focus:border-purple-500 rounded px-1 py-0.5 text-xs text-white text-right outline-none font-mono"
              title="Type custom duration in seconds and press Enter"
            />
            <span className="text-zinc-400 ml-0.5">s</span>
          </div>

          {/* Stepper Plus */}
          <button
            type="button"
            onClick={() => handleStepDuration(0.5)}
            className="w-4 h-4 rounded bg-[#222227] hover:bg-[#2c2c32] text-zinc-300 hover:text-white flex items-center justify-center transition cursor-pointer text-xs"
            title="Increase duration by 0.5s"
          >
            +
          </button>

          {/* Presets Dropdown Toggle */}
          <button
            type="button"
            onClick={() => setIsDurationDropdownOpen((prev) => !prev)}
            className="p-1 rounded text-zinc-400 hover:text-white hover:bg-[#222227] transition cursor-pointer ml-0.5"
            title="Choose from duration presets or enter custom seconds"
          >
            <ChevronDown className="w-3 h-3 text-zinc-400" />
          </button>
        </div>

        {/* Duration Presets Dropdown Menu */}
        {isDurationDropdownOpen && (
          <div className="absolute right-0 bottom-full mb-1.5 w-64 bg-[#18181c] border border-[#2b2b32] rounded-xl shadow-2xl p-2.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
            <div className="px-2 py-1 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider border-b border-[#242428] flex items-center justify-between mb-2">
              <span>Duration Presets</span>
              <span className="font-mono text-purple-300">{duration.toFixed(1)}s active</span>
            </div>

            <div className="grid grid-cols-3 gap-1.5 mb-2.5">
              {[
                { label: '1.0s', val: 1.0 },
                { label: '2.5s', val: 2.5 },
                { label: '3.0s', val: 3.0 },
                { label: '5.0s', val: 5.0 },
                { label: '8.0s', val: 8.0 },
                { label: '10.0s', val: 10.0 },
                { label: '15.0s', val: 15.0 },
                { label: '30.0s', val: 30.0 },
                { label: '60.0s', val: 60.0 },
              ].map((p) => {
                const isActive = Math.abs(duration - p.val) < 0.05;
                return (
                  <button
                    key={p.val}
                    type="button"
                    onClick={() => {
                      setDuration(p.val);
                      setCustomInput(p.val.toString());
                      setIsDurationDropdownOpen(false);
                    }}
                    className={`px-2 py-1 rounded text-center font-mono text-xs transition cursor-pointer ${
                      isActive
                        ? 'bg-purple-600 text-white font-bold'
                        : 'bg-[#121214] text-zinc-300 hover:bg-[#222228] hover:text-white border border-[#242428]'
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>

            <div className="pt-2 border-t border-[#242428]">
              <label className="text-[10px] text-zinc-400 block mb-1">
                Custom Duration (0.5s – 300s):
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min="0.5"
                  max="300"
                  step="0.1"
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      applyCustomDuration(customInput);
                    }
                  }}
                  className="flex-1 bg-[#101012] border border-[#2c2c32] focus:border-purple-500 rounded px-2.5 py-1 text-xs text-white font-mono outline-none"
                  placeholder="e.g. 7.5"
                />
                <button
                  type="button"
                  onClick={() => applyCustomDuration(customInput)}
                  className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded text-xs transition cursor-pointer shrink-0"
                >
                  Set
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
