'use client';

import React from 'react';
import {
  Play,
  Pause,
  Square,
  SkipBack,
  Repeat,
  Diamond,
  X,
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

  return (
    <div className="h-10 bg-[#090a0f] border-b border-[#1e2130] px-4 flex items-center justify-between shrink-0">
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

      {/* Right Duration Selector */}
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <span>Duration:</span>
        <select
          value={duration}
          onChange={(e) => setDuration(parseFloat(e.target.value))}
          className="bg-[#11131c] border border-[#2b2f44] rounded px-2 py-0.5 font-mono text-xs text-white outline-none cursor-pointer"
        >
          <option value="3">3.0s</option>
          <option value="5">5.0s</option>
          <option value="8">8.0s</option>
          <option value="10">10.0s</option>
        </select>
      </div>
    </div>
  );
}
