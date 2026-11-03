'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Volume2,
  VolumeX,
  Play,
  Square,
  Sparkles,
  Upload,
  Clock,
  Repeat,
  Zap,
  Sliders,
  Disc,
} from 'lucide-react';
import { useMotion } from '@/context/MotionContext';
import {
  SOUND_EFFECTS_CATALOG,
  SoundEffectMeta,
  playSoundEffect,
  playCustomAudio,
  getWaveformPreview,
} from '@/modules/audio/audioEngine';
import { SoundEffectType } from '@/types/motion';

export function AudioInspectorSection() {
  const { selectedLayer, updateLayer, currentTime } = useMotion();
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const stopHandleRef = useRef<(() => void) | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!selectedLayer || selectedLayer.type !== 'audio') {
    return null;
  }

  const currentSfx = selectedLayer.soundEffect || 'whoosh';
  const volume = typeof selectedLayer.audioVolume === 'number' ? selectedLayer.audioVolume : 80;
  const pitch = typeof selectedLayer.audioPitch === 'number' ? selectedLayer.audioPitch : 1.0;
  const isMuted = Boolean(selectedLayer.audioMuted);
  const isLoop = Boolean(selectedLayer.audioLoop);
  const isCustom = selectedLayer.audioType === 'custom';
  const startTime = selectedLayer.startTime ?? 0;
  const endTime = selectedLayer.endTime ?? 5;
  const duration = Math.max(0.1, endTime - startTime);

  // Stop any active preview when layer changes or unmounts
  useEffect(() => {
    return () => {
      if (stopHandleRef.current) {
        stopHandleRef.current();
        stopHandleRef.current = null;
      }
    };
  }, [selectedLayer.id]);

  const handleStopPreview = () => {
    if (stopHandleRef.current) {
      stopHandleRef.current();
      stopHandleRef.current = null;
    }
    setIsPlayingPreview(false);
  };

  const handlePlayPreview = async (sfxOverride?: SoundEffectType) => {
    handleStopPreview();

    const targetSfx = sfxOverride || currentSfx;
    setIsPlayingPreview(true);

    if (isCustom && selectedLayer.audioCustomUrl && !sfxOverride) {
      const handle = await playCustomAudio(
        selectedLayer.audioCustomUrl,
        isMuted ? 0 : volume,
        pitch,
        0,
        isLoop
      );
      stopHandleRef.current = handle.stop;
    } else {
      const meta = SOUND_EFFECTS_CATALOG.find((s) => s.type === targetSfx);
      const estDuration = (meta?.duration || 0.5) / pitch;

      const handle = playSoundEffect(targetSfx, isMuted ? 0 : volume, pitch);
      stopHandleRef.current = handle.stop;

      setTimeout(() => {
        setIsPlayingPreview(false);
        stopHandleRef.current = null;
      }, (estDuration + 0.1) * 1000);
    }
  };

  const handleSelectSfx = (meta: SoundEffectMeta) => {
    const sfxDuration = meta.duration;
    updateLayer(selectedLayer.id, {
      soundEffect: meta.type,
      audioType: 'sfx',
      name: `Audio: ${meta.label}`,
      endTime: Math.min(startTime + sfxDuration, 30),
    });
    // Audition immediately
    handlePlayPreview(meta.type);
  };

  const handleCustomAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      if (!dataUrl) return;

      const audio = new Audio();
      audio.onloadedmetadata = () => {
        const audioDuration = isFinite(audio.duration) ? audio.duration : 3.0;
        updateLayer(selectedLayer.id, {
          audioType: 'custom',
          audioCustomUrl: dataUrl,
          audioCustomName: file.name,
          name: `Audio: ${file.name.substring(0, 16)}`,
          audioDuration,
          endTime: startTime + audioDuration,
        });
      };
      audio.src = dataUrl;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const waveformPeaks = getWaveformPreview(currentSfx, 42);

  return (
    <div className="bg-[#1a1a1e] rounded border border-[#28282e] p-3 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#242428]">
        <div className="flex items-center gap-1.5">
          <Volume2 className="w-4 h-4 text-pink-400" />
          <span className="text-xs font-semibold text-zinc-200">Audio & Sound FX</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-pink-950/40 text-pink-300 border border-pink-500/30">
            {isCustom ? 'Custom File' : currentSfx.toUpperCase()}
          </span>

          <button
            onClick={() => (isPlayingPreview ? handleStopPreview() : handlePlayPreview())}
            className={`p-1 rounded flex items-center gap-1 text-[10px] font-semibold transition cursor-pointer ${
              isPlayingPreview
                ? 'bg-pink-600 text-white animate-pulse'
                : 'bg-pink-950/60 hover:bg-pink-900/80 text-pink-200 border border-pink-500/40'
            }`}
            title={isPlayingPreview ? 'Stop Audio' : 'Audition / Play Sound'}
          >
            {isPlayingPreview ? (
              <>
                <Square className="w-3 h-3 fill-white" />
                <span>Stop</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3 fill-pink-300" />
                <span>Audition</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Waveform Visualization Banner */}
      <div className="bg-[#111216] p-2.5 rounded border border-[#252733] flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-[10px] text-zinc-400">
          <span className="flex items-center gap-1 text-zinc-300">
            <Disc className="w-3 h-3 text-pink-400 animate-spin" />
            {isCustom ? selectedLayer.audioCustomName || 'Custom File' : `${currentSfx.toUpperCase()} WAVEFORM`}
          </span>
          <span className="font-mono text-zinc-500">{duration.toFixed(2)}s duration</span>
        </div>

        {/* Waveform Bars */}
        <div className="h-10 flex items-center justify-between gap-[2px] px-1 bg-[#0c0d12] rounded border border-white/5 overflow-hidden">
          {waveformPeaks.map((peak, idx) => {
            const h = Math.max(3, Math.round(peak * 34));
            return (
              <div
                key={idx}
                style={{ height: `${h}px` }}
                className={`flex-1 rounded-full transition-all duration-150 ${
                  isPlayingPreview
                    ? 'bg-gradient-to-t from-pink-600 to-pink-300 shadow-sm shadow-pink-500/50'
                    : 'bg-gradient-to-t from-pink-900/60 to-pink-500/40'
                }`}
              />
            );
          })}
        </div>
      </div>

      {/* Sound Effects Catalog Grid */}
      <div>
        <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-1.5 flex items-center justify-between">
          <span>Sound Effects Presets</span>
          <span className="text-[9px] text-zinc-500 font-normal">Click to assign & audition</span>
        </div>

        <div className="grid grid-cols-2 gap-1.5 max-h-56 overflow-y-auto pr-0.5">
          {SOUND_EFFECTS_CATALOG.map((meta) => {
            const isSelected = !isCustom && currentSfx === meta.type;
            return (
              <button
                key={meta.type}
                type="button"
                onClick={() => handleSelectSfx(meta)}
                className={`p-2 rounded text-left transition flex items-start gap-2 border cursor-pointer ${
                  isSelected
                    ? 'bg-pink-950/50 border-pink-500/60 text-white shadow-sm shadow-pink-950/40'
                    : 'bg-[#14151b] hover:bg-[#1c1d26] border-[#252733] text-zinc-300'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded flex items-center justify-center shrink-0 mt-0.5 ${
                    isSelected ? 'bg-pink-500 text-white' : 'bg-pink-500/10 text-pink-400'
                  }`}
                >
                  {meta.type === 'whoosh' && <Zap className="w-3.5 h-3.5" />}
                  {meta.type === 'click' && <Volume2 className="w-3.5 h-3.5" />}
                  {meta.type === 'jump' && <Sparkles className="w-3.5 h-3.5" />}
                  {meta.type === 'fade' && <Sliders className="w-3.5 h-3.5" />}
                  {meta.type === 'grow' && <Zap className="w-3.5 h-3.5" />}
                  {meta.type === 'pop' && <Disc className="w-3.5 h-3.5" />}
                  {meta.type === 'chime' && <Sparkles className="w-3.5 h-3.5" />}
                  {meta.type === 'impact' && <Volume2 className="w-3.5 h-3.5" />}
                  {meta.type === 'laser' && <Zap className="w-3.5 h-3.5" />}
                  {meta.type === 'swish' && <Zap className="w-3.5 h-3.5" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold truncate">{meta.label}</span>
                    <span className="text-[9px] font-mono text-zinc-500 shrink-0">{meta.duration}s</span>
                  </div>
                  <p className="text-[8px] text-zinc-400 line-clamp-1">{meta.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Audio Upload Row */}
      <div className="pt-2 border-t border-[#242428] flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded bg-[#14151b] hover:bg-[#1c1d26] border border-[#252733] hover:border-pink-500/40 text-xs text-zinc-300 transition cursor-pointer"
        >
          <Upload className="w-3.5 h-3.5 text-pink-400" />
          <span>Upload Audio (MP3/WAV)</span>
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          className="hidden"
          onChange={handleCustomAudioUpload}
        />
      </div>

      {/* Volume & Pitch Controls */}
      <div className="space-y-2.5 pt-2 border-t border-[#242428]">
        {/* Volume Slider */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-zinc-400 flex items-center gap-1">
              <Volume2 className="w-3 h-3 text-pink-400" />
              Volume
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => updateLayer(selectedLayer.id, { audioMuted: !isMuted })}
                className={`p-1 rounded text-[10px] cursor-pointer transition ${
                  isMuted ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'text-zinc-400 hover:text-white'
                }`}
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>
              <span className="font-mono text-white text-xs">{isMuted ? 'MUTED' : `${volume}%`}</span>
            </div>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={isMuted ? 0 : volume}
            disabled={isMuted}
            onChange={(e) => updateLayer(selectedLayer.id, { audioVolume: Number(e.target.value) })}
            className="w-full h-1.5 bg-[#121214] rounded-lg appearance-none cursor-pointer accent-pink-500"
          />
        </div>

        {/* Pitch / Speed Slider */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-zinc-400 flex items-center gap-1">
              <Sliders className="w-3 h-3 text-pink-400" />
              Pitch & Speed
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => updateLayer(selectedLayer.id, { audioPitch: 1.0 })}
                className="text-[9px] px-1 py-0.5 rounded bg-[#121214] text-zinc-400 hover:text-white border border-[#2c2c32] cursor-pointer"
                title="Reset to 1.0x"
              >
                1.0x
              </button>
              <span className="font-mono text-white text-xs">{pitch.toFixed(2)}x</span>
            </div>
          </div>
          <input
            type="range"
            min={0.5}
            max={2.0}
            step={0.05}
            value={pitch}
            onChange={(e) => updateLayer(selectedLayer.id, { audioPitch: Number(e.target.value) })}
            className="w-full h-1.5 bg-[#121214] rounded-lg appearance-none cursor-pointer accent-pink-500"
          />
        </div>
      </div>

      {/* Timing, Trim & Playhead Alignment */}
      <div className="space-y-2 pt-2 border-t border-[#242428]">
        <div className="flex items-center justify-between text-[11px] text-zinc-400">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-pink-400" />
            Timeline Placement
          </span>
          <button
            type="button"
            onClick={() => {
              const currentDur = Math.max(0.1, (selectedLayer.endTime ?? 5) - (selectedLayer.startTime ?? 0));
              updateLayer(selectedLayer.id, {
                startTime: currentTime,
                endTime: currentTime + currentDur,
              });
            }}
            className="text-[9px] px-1.5 py-0.5 rounded bg-pink-950/40 hover:bg-pink-900/60 text-pink-300 border border-pink-500/30 cursor-pointer transition"
            title="Snap audio start time to current timeline playhead"
          >
            Snap to Playhead ({currentTime.toFixed(2)}s)
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-[#121214] p-1.5 rounded border border-[#2c2c32] flex items-center justify-between">
            <span className="text-[10px] text-zinc-500">In (Start)</span>
            <input
              type="number"
              step="0.05"
              min="0"
              value={Number(startTime.toFixed(2))}
              onChange={(e) => {
                const val = Math.max(0, parseFloat(e.target.value) || 0);
                updateLayer(selectedLayer.id, { startTime: val });
              }}
              className="w-14 bg-transparent text-right font-mono text-white outline-none"
            />
          </div>

          <div className="bg-[#121214] p-1.5 rounded border border-[#2c2c32] flex items-center justify-between">
            <span className="text-[10px] text-zinc-500">Out (End)</span>
            <input
              type="number"
              step="0.05"
              min="0.1"
              value={Number(endTime.toFixed(2))}
              onChange={(e) => {
                const val = Math.max(startTime + 0.05, parseFloat(e.target.value) || startTime + 0.1);
                updateLayer(selectedLayer.id, { endTime: val });
              }}
              className="w-14 bg-transparent text-right font-mono text-white outline-none"
            />
          </div>
        </div>

        {/* Loop toggle */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] text-zinc-400 flex items-center gap-1">
            <Repeat className="w-3 h-3 text-pink-400" />
            Looping
          </span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isLoop}
              onChange={(e) => updateLayer(selectedLayer.id, { audioLoop: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-7 h-4 bg-[#25252b] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-pink-600"></div>
          </label>
        </div>
      </div>
    </div>
  );
}

