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
    deleteSelectedKeyframe,
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
    <div className="h-10 bg-[#090a0f] border-b border-[#1e2130] px-4 flex items-center justify-between shrink-0 select-none">
      {/* Left Transport Buttons */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={seekToStart}
          title="Jump to Start"
          className="w-7 h-7 rounded bg-[#171925] hover:bg-[#2b2f44] text-slate-300 flex items-center justify-center transition cursor-pointer"
        >
          <SkipBack className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={togglePlay}
          className="w-8 h-7 rounded bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shadow-md shadow-indigo-600/30 transition cursor-pointer"
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
          className="w-7 h-7 rounded bg-[#171925] hover:bg-[#2b2f44] text-slate-300 flex items-center justify-center transition cursor-pointer"
        >
          <Square className="w-3 h-3 fill-slate-300" />
        </button>

        <button
          onClick={toggleLoop}
          title={isLooping ? 'Looping Enabled' : 'Looping Disabled'}
          className={`w-7 h-7 rounded border transition cursor-pointer flex items-center justify-center ${
            isLooping
              ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40'
              : 'bg-[#171925] text-slate-500 border-transparent hover:text-slate-300'
          }`}
        >
          <Repeat className="w-3.5 h-3.5" />
        </button>

        <div className="h-4 w-[1px] bg-[#1e2130] mx-1.5"></div>

        {/* Timecode Readout */}
        <div className="font-mono text-xs bg-[#11131c] px-2.5 py-0.5 rounded border border-[#1e2130] text-amber-400">
          <span>{currentTime.toFixed(2).padStart(5, '0')}s</span>
          <span className="text-slate-600"> / </span>
          <span className="text-slate-400">{duration.toFixed(2).padStart(5, '0')}s</span>
        </div>
      </div>

      {/* Center Keyframe Action Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => selectedLayerId && keyAllTransformProps(selectedLayerId)}
          disabled={!selectedLayerId}
          className="text-xs px-2.5 py-1 rounded bg-[#1e2130] hover:bg-[#2b2f44] disabled:opacity-30 disabled:cursor-not-allowed text-amber-300 border border-[#2b2f44] flex items-center gap-1.5 transition cursor-pointer"
        >
          <Diamond className="w-3 h-3 fill-amber-400 text-amber-400" />
          <span>Add Keyframe at Playhead</span>
        </button>

        <button
          onClick={deleteSelectedKeyframe}
          disabled={!selectedKeyframe}
          className="text-xs px-2.5 py-1 rounded bg-[#1e2130] hover:bg-red-950/70 text-slate-300 hover:text-red-300 disabled:opacity-30 disabled:cursor-not-allowed border border-[#2b2f44] transition flex items-center gap-1 cursor-pointer"
          title="Delete the currently selected keyframe"
        >
          <X className="w-3.5 h-3.5" />
          <span>Delete Keyframe</span>
        </button>
      </div>

      {/* Right Custom Duration Controller */}
      <div className="relative flex items-center gap-1.5" ref={durationDropdownRef}>
        <div className="flex items-center gap-1 bg-[#121420] px-2 py-0.5 rounded-lg border border-[#2b2f44] text-xs">
          <Clock className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <span className="text-slate-400 font-medium">Duration:</span>

          {/* Stepper Minus */}
          <button
            type="button"
            onClick={() => handleStepDuration(-0.5)}
            className="w-4 h-4 rounded bg-[#1e2236] hover:bg-[#2b3049] text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer text-xs"
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
              className="w-11 bg-[#090a0f] border border-[#2b2f44] focus:border-indigo-500 rounded px-1 py-0.5 text-xs text-white text-right outline-none font-mono"
              title="Type custom duration in seconds and press Enter"
            />
            <span className="text-slate-400 ml-0.5">s</span>
          </div>

          {/* Stepper Plus */}
          <button
            type="button"
            onClick={() => handleStepDuration(0.5)}
            className="w-4 h-4 rounded bg-[#1e2236] hover:bg-[#2b3049] text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer text-xs"
            title="Increase duration by 0.5s"
          >
            +
          </button>

          {/* Presets Dropdown Toggle */}
          <button
            type="button"
            onClick={() => setIsDurationDropdownOpen((prev) => !prev)}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-[#1e2236] transition cursor-pointer ml-0.5"
            title="Choose from duration presets or enter custom seconds"
          >
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>
        </div>

        {/* Duration Presets Dropdown Menu */}
        {isDurationDropdownOpen && (
          <div className="absolute right-0 bottom-full mb-1.5 w-64 bg-[#121420] border border-[#2b2f44] rounded-xl shadow-2xl p-2.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
            <div className="px-2 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider border-b border-[#1e2130] flex items-center justify-between mb-2">
              <span>Duration Presets</span>
              <span className="font-mono text-indigo-300">{duration.toFixed(1)}s active</span>
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
                    className={`px-2 py-1 rounded-md text-center font-mono text-xs transition cursor-pointer ${
                      isActive
                        ? 'bg-indigo-600 text-white font-bold'
                        : 'bg-[#181a29] text-slate-300 hover:bg-[#22253a] hover:text-white'
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>

            <div className="pt-2 border-t border-[#1e2130]">
              <label className="text-[10px] text-slate-400 block mb-1">
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
                  className="flex-1 bg-[#090a0f] border border-[#2b2f44] focus:border-indigo-500 rounded-lg px-2.5 py-1 text-xs text-white font-mono outline-none"
                  placeholder="e.g. 7.5"
                />
                <button
                  type="button"
                  onClick={() => applyCustomDuration(customInput)}
                  className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg text-xs transition cursor-pointer shrink-0"
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
