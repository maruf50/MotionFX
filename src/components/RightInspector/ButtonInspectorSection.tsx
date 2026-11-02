'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Diamond,
  ArrowRight,
  Check,
  Plus,
  Play,
  Heart,
  Bell,
  Star,
  Download,
  ExternalLink,
  ShoppingCart,
  Smile,
  Palette,
  Sliders,
  Type,
  Eye,
  EyeOff,
  Zap,
} from 'lucide-react';
import { useMotion } from '@/context/MotionContext';
import {
  ButtonStyle,
  ButtonAnimation,
  ButtonIcon,
  ButtonIconPosition,
  BorderStyle,
} from '@/types/motion';
import { getInterpolatedValue } from '@/modules/keyframes/evaluator';
import { GOOGLE_FONTS_CATALOG, loadGoogleFont } from '@/modules/fonts/googleFonts';
import { ColorPickerWithAlpha } from './ColorPickerWithAlpha';

export function ButtonInspectorSection() {
  const {
    selectedLayer,
    updateLayer,
    setAnimPropValue,
    toggleKeyframe,
    addStartAndEndKeyframes,
    currentTime,
    isAutoKeyframe,
  } = useMotion();
  const [activeTab, setActiveTab] = useState<'shape' | 'motion'>('shape');

  if (!selectedLayer || selectedLayer.shapeType !== 'button') return null;

  const hasKeyframes = Boolean(selectedLayer.keyframes?.buttonProgress?.length);
  const progress = hasKeyframes
    ? getInterpolatedValue(selectedLayer, 'buttonProgress', currentTime)
    : (selectedLayer.buttonProgress ?? 100);

  const hasKf = selectedLayer.keyframes?.buttonProgress?.some(
    (k) => Math.abs(k.time - currentTime) < 0.04
  );

  const handleProgressChange = (val: number) => {
    if (hasKeyframes || isAutoKeyframe) {
      setAnimPropValue(selectedLayer.id, 'buttonProgress', val, true);
    } else {
      updateLayer(selectedLayer.id, { buttonProgress: val });
    }
  };

  const btnStyle: ButtonStyle = selectedLayer.btnStyle || 'pill';
  const text = selectedLayer.btnText ?? 'Button';
  const subtext = selectedLayer.btnSubtext ?? '';
  const hideText = selectedLayer.btnHideText ?? false;
  const fontSize = selectedLayer.btnFontSize ?? 14;
  const fontFamily = selectedLayer.btnFontFamily || 'Inter';
  const fontWeight = selectedLayer.btnFontWeight || 'bold';
  const icon: ButtonIcon = selectedLayer.btnIcon || 'arrow';
  const iconPos: ButtonIconPosition = selectedLayer.btnIconPosition || 'left';
  const customEmoji = selectedLayer.btnCustomEmoji || '⚡';
  const state = selectedLayer.btnState || 'on';
  const anim: ButtonAnimation = selectedLayer.btnAnimation || 'pulseGlow';
  const speed = selectedLayer.btnAnimSpeed ?? 1.5;

  const width = Math.round(selectedLayer.width || 160);
  const height = Math.round(selectedLayer.height || 48);

  const color = selectedLayer.btnColor || selectedLayer.fill || '#6366f1';
  const onColor = selectedLayer.btnOnColor || color;
  const offColor = selectedLayer.btnOffColor || '#27272a';
  const knobColor = selectedLayer.btnKnobColor || '#ffffff';
  const gradientEnd = selectedLayer.btnGradientEnd || '#ec4899';
  const textColor = selectedLayer.btnTextColor || '#ffffff';
  const subtextColor = selectedLayer.btnSubtextColor || 'rgba(255,255,255,0.65)';

  const borderRadius = selectedLayer.btnBorderRadius ?? 12;
  const borderWidth = selectedLayer.btnBorderWidth ?? 1;
  const borderColor = selectedLayer.btnBorderColor || 'rgba(255,255,255,0.25)';
  const borderStyle: BorderStyle = selectedLayer.borderStyle || 'solid';

  const glow = selectedLayer.btnGlow ?? false;
  const glowColor = selectedLayer.btnGlowColor || onColor;

  const styles: { id: ButtonStyle; label: string; desc: string }[] = [
    { id: 'pill', label: 'Pill', desc: 'Full capsule rounding' },
    { id: 'rounded', label: 'Rounded', desc: 'Custom radius' },
    { id: 'rect', label: 'Sharp Rect', desc: 'Zero border radius' },
    { id: 'chamfer', label: 'Chamfer', desc: 'Cyberpunk cut corners' },
    { id: 'gradient', label: 'Gradient', desc: 'Two-tone glowing CTA' },
    { id: 'outline', label: 'Outline', desc: 'Minimal stroked border' },
    { id: 'glass', label: 'Glassmorphic', desc: 'Frosted sheen layer' },
    { id: 'floating', label: 'Floating FAB', desc: 'Circular icon action' },
    { id: 'toggle', label: 'Toggle Switch', desc: 'Interactive state switch' },
  ];

  const sizePresets = [
    { label: 'SM', w: 120, h: 36 },
    { label: 'MD', w: 160, h: 48 },
    { label: 'LG', w: 200, h: 56 },
    { label: 'Wide', w: 280, h: 48 },
    { label: 'FAB', w: 52, h: 52 },
  ];

  const animations: { id: ButtonAnimation; label: string }[] = [
    { id: 'pulseGlow', label: 'Pulse Glow' },
    { id: 'shimmer', label: 'Shimmer Beam' },
    { id: 'clickPress', label: 'Click Press' },
    { id: 'bounce', label: 'Bounce Jump' },
    { id: 'ripple', label: 'Ripple Wave' },
    { id: 'toggleSwitch', label: 'Toggle Loop' },
  ];

  const icons: { id: ButtonIcon; label: string; icon: React.ReactNode }[] = [
    { id: 'arrow', label: 'Arrow', icon: <ArrowRight className="w-3.5 h-3.5" /> },
    { id: 'check', label: 'Check', icon: <Check className="w-3.5 h-3.5" /> },
    { id: 'sparkle', label: 'Sparkle', icon: <Sparkles className="w-3.5 h-3.5" /> },
    { id: 'plus', label: 'Plus', icon: <Plus className="w-3.5 h-3.5" /> },
    { id: 'play', label: 'Play', icon: <Play className="w-3.5 h-3.5" /> },
    { id: 'heart', label: 'Heart', icon: <Heart className="w-3.5 h-3.5" /> },
    { id: 'bell', label: 'Bell', icon: <Bell className="w-3.5 h-3.5" /> },
    { id: 'star', label: 'Star', icon: <Star className="w-3.5 h-3.5" /> },
    { id: 'download', label: 'Download', icon: <Download className="w-3.5 h-3.5" /> },
    { id: 'external', label: 'External', icon: <ExternalLink className="w-3.5 h-3.5" /> },
    { id: 'cart', label: 'Cart', icon: <ShoppingCart className="w-3.5 h-3.5" /> },
    { id: 'customEmoji', label: 'Emoji', icon: <Smile className="w-3.5 h-3.5" /> },
    { id: 'none', label: 'None', icon: <span className="text-[10px] text-zinc-500 font-mono">Ø</span> },
  ];

  const iconPositions: { id: ButtonIconPosition; label: string }[] = [
    { id: 'left', label: 'Left' },
    { id: 'right', label: 'Right' },
    { id: 'iconOnly', label: 'Icon Only' },
  ];

  const fontWeights = [
    { label: 'Regular (400)', val: '400' },
    { label: 'Medium (500)', val: '500' },
    { label: 'SemiBold (600)', val: '600' },
    { label: 'Bold (700)', val: 'bold' },
    { label: 'Black (900)', val: '900' },
  ];

  const popularFonts = GOOGLE_FONTS_CATALOG.slice(0, 10);

  return (
    <div className="bg-[#1a1a1e] p-2.5 rounded-lg border border-[#28282e] space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          Interactive Motion Button
        </span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => updateLayer(selectedLayer.id, { btnState: state === 'on' ? 'off' : 'on' })}
            className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold border transition cursor-pointer ${
              state === 'on'
                ? 'bg-emerald-950/70 text-emerald-300 border-emerald-600/60'
                : 'bg-zinc-800 text-zinc-400 border-zinc-700'
            }`}
          >
            {state.toUpperCase()}
          </button>
          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-purple-950/70 text-purple-300 border border-purple-700/50 uppercase">
            {btnStyle}
          </span>
        </div>
      </div>

      {/* Navigation Tabs (Content & Icon removed as requested) */}
      <div className="flex bg-[#121214] p-0.5 rounded border border-[#28282e] text-[10px] font-medium">
        <button
          type="button"
          onClick={() => setActiveTab('shape')}
          className={`flex-1 py-1 rounded transition text-center flex items-center justify-center gap-1 cursor-pointer ${
            activeTab === 'shape'
              ? 'bg-[#27272e] text-white shadow-sm font-semibold'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Palette className="w-3 h-3 text-purple-400" />
          Shape & Style
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('motion')}
          className={`flex-1 py-1 rounded transition text-center flex items-center justify-center gap-1 cursor-pointer ${
            activeTab === 'motion'
              ? 'bg-[#27272e] text-white shadow-sm font-semibold'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Zap className="w-3 h-3 text-amber-400" />
          Motion & State
        </button>
      </div>

      {/* TAB 1: SHAPE & STYLE */}
      {activeTab === 'shape' && (
        <div className="space-y-3">
          {/* Button Size (Integer fields) */}
          <div className="bg-[#141418] p-2 rounded border border-[#2a2a32] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-zinc-400 font-mono uppercase">Button Dimensions</span>
              <div className="flex gap-1">
                {sizePresets.map((sp) => (
                  <button
                    key={sp.label}
                    type="button"
                    onClick={() => updateLayer(selectedLayer.id, { width: sp.w, height: sp.h })}
                    className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-[#1c1c22] text-zinc-300 hover:bg-[#282830] border border-[#303038] cursor-pointer"
                  >
                    {sp.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-zinc-400 font-mono uppercase block mb-1">
                  Width
                </label>
                <div className="relative flex items-center">
                  <input
                    type="number"
                    step="1"
                    min="20"
                    max="1200"
                    value={width}
                    onChange={(e) =>
                      updateLayer(selectedLayer.id, {
                        width: Math.max(10, parseInt(e.target.value) || 0),
                      })
                    }
                    className="w-full bg-[#121214] border border-[#2c2c32] focus:border-purple-500 rounded px-2 py-1 pr-7 text-xs font-mono text-white outline-none"
                  />
                  <span className="absolute right-2 text-[10px] font-mono text-zinc-500 pointer-events-none">
                    px
                  </span>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-zinc-400 font-mono uppercase block mb-1">
                  Height
                </label>
                <div className="relative flex items-center">
                  <input
                    type="number"
                    step="1"
                    min="16"
                    max="600"
                    value={height}
                    onChange={(e) =>
                      updateLayer(selectedLayer.id, {
                        height: Math.max(10, parseInt(e.target.value) || 0),
                      })
                    }
                    className="w-full bg-[#121214] border border-[#2c2c32] focus:border-purple-500 rounded px-2 py-1 pr-7 text-xs font-mono text-white outline-none"
                  />
                  <span className="absolute right-2 text-[10px] font-mono text-zinc-500 pointer-events-none">
                    px
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Button Style Matrix */}
          <div>
            <label className="text-[10px] text-zinc-400 font-mono uppercase block mb-1.5">
              Button Shape & Style
            </label>
            <div className="grid grid-cols-3 gap-1">
              {styles.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  title={s.desc}
                  onClick={() => updateLayer(selectedLayer.id, { btnStyle: s.id })}
                  className={`py-1 px-1.5 rounded text-[10px] font-medium border text-center transition cursor-pointer flex flex-col items-center justify-center min-h-[38px] ${
                    btnStyle === s.id
                      ? 'bg-purple-600/30 text-purple-200 border-purple-500/70 shadow-sm shadow-purple-950/40'
                      : 'bg-[#121214] text-zinc-400 border-[#2c2c32] hover:bg-[#202026] hover:text-zinc-200'
                  }`}
                >
                  <span>{s.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Button Typography, Size, Fonts & Hide Options */}
          <div className="bg-[#141418] p-2 rounded border border-[#2a2a32] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-zinc-300 font-mono uppercase font-semibold flex items-center gap-1.5">
                <Type className="w-3.5 h-3.5 text-blue-400" />
                Button Typography & Label
              </span>
              <button
                type="button"
                onClick={() => updateLayer(selectedLayer.id, { btnHideText: !hideText })}
                className={`px-2 py-0.5 rounded text-[10px] font-medium border transition cursor-pointer flex items-center gap-1 ${
                  hideText
                    ? 'bg-amber-950/60 text-amber-300 border-amber-600/60'
                    : 'bg-[#1c1c22] text-zinc-300 border-[#303038] hover:bg-[#25252e]'
                }`}
                title={hideText ? 'Click to show text label' : 'Click to hide text label (icon/graphic only)'}
              >
                {hideText ? <EyeOff className="w-3 h-3 text-amber-400" /> : <Eye className="w-3 h-3 text-blue-400" />}
                <span>{hideText ? 'Text Hidden' : 'Hide Text'}</span>
              </button>
            </div>

            {!hideText && (
              <>
                {/* Labels Inputs */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[9px] text-zinc-400 uppercase font-mono block mb-1">
                      Button Text
                    </label>
                    <input
                      type="text"
                      value={text}
                      onChange={(e) => updateLayer(selectedLayer.id, { btnText: e.target.value })}
                      className="w-full bg-[#121214] border border-[#2c2c32] focus:border-purple-500 rounded px-2 py-1 text-xs text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] text-zinc-400 uppercase font-mono block mb-1">
                      Subtext / Badge
                    </label>
                    <input
                      type="text"
                      value={subtext}
                      placeholder="e.g. Free"
                      onChange={(e) => updateLayer(selectedLayer.id, { btnSubtext: e.target.value })}
                      className="w-full bg-[#121214] border border-[#2c2c32] focus:border-purple-500 rounded px-2 py-1 text-xs text-white outline-none"
                    />
                  </div>
                </div>

                {/* Font Size & Weight */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-zinc-400 block mb-1">Font Size</label>
                    <div className="relative flex items-center">
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={fontSize}
                        onChange={(e) =>
                          updateLayer(selectedLayer.id, {
                            btnFontSize: Math.max(1, parseInt(e.target.value) || 12),
                          })
                        }
                        className="w-full bg-[#121214] border border-[#2c2c32] focus:border-purple-500 rounded px-2 py-1 pr-7 text-xs font-mono text-white outline-none"
                        placeholder="Size"
                      />
                      <span className="absolute right-2 text-[10px] font-mono text-zinc-500 pointer-events-none">
                        px
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-zinc-400 block mb-1">Font Weight</label>
                    <select
                      value={String(fontWeight)}
                      onChange={(e) => updateLayer(selectedLayer.id, { btnFontWeight: e.target.value })}
                      className="w-full bg-[#121214] border border-[#2c2c32] focus:border-purple-500 rounded px-2 py-1 text-xs text-white outline-none cursor-pointer"
                    >
                      {fontWeights.map((w) => (
                        <option key={w.val} value={w.val} className="bg-[#18181c]">
                          {w.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Font Family Dropdown */}
                <div>
                  <label className="text-[10px] text-zinc-400 block mb-1">Font Family</label>
                  <select
                    value={fontFamily}
                    onChange={(e) => {
                      const selectedFont = e.target.value;
                      loadGoogleFont(selectedFont);
                      updateLayer(selectedLayer.id, { btnFontFamily: selectedFont });
                    }}
                    className="w-full bg-[#121214] border border-[#2c2c32] focus:border-purple-500 rounded px-2 py-1 text-xs text-white outline-none cursor-pointer"
                  >
                    {popularFonts.map((f) => (
                      <option key={f.name} value={f.name} className="bg-[#18181c]">
                        {f.name} ({f.category})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Text & Subtext Colors */}
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#232328]">
                  <div>
                    <label className="text-[9px] text-zinc-400 block mb-1">Text Color</label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={textColor}
                        onChange={(e) => updateLayer(selectedLayer.id, { btnTextColor: e.target.value })}
                        className="w-6 h-6 rounded border border-[#3a3a44] bg-transparent cursor-pointer"
                      />
                      <span className="text-[10px] font-mono text-zinc-300 uppercase">{textColor}</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-[9px] text-zinc-400 block mb-1">Subtext Color</label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={subtextColor.startsWith('#') ? subtextColor : '#a1a1aa'}
                        onChange={(e) =>
                          updateLayer(selectedLayer.id, { btnSubtextColor: e.target.value })
                        }
                        className="w-6 h-6 rounded border border-[#3a3a44] bg-transparent cursor-pointer"
                      />
                      <span className="text-[10px] font-mono text-zinc-400 truncate max-w-[65px]">
                        {subtextColor}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Icon Selection & Placement */}
          {btnStyle !== 'toggle' && (
            <div className="bg-[#141418] p-2 rounded border border-[#2a2a32] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-zinc-400 font-mono uppercase">Button Icon</span>
                {/* Placement pills */}
                <div className="flex gap-1">
                  {iconPositions.map((pos) => (
                    <button
                      key={pos.id}
                      type="button"
                      onClick={() => updateLayer(selectedLayer.id, { btnIconPosition: pos.id })}
                      className={`px-2 py-0.5 rounded text-[9px] font-mono border transition cursor-pointer ${
                        iconPos === pos.id
                          ? 'bg-purple-600/30 text-purple-200 border-purple-500/70 font-semibold'
                          : 'bg-[#1c1c22] text-zinc-400 border-[#303038]'
                      }`}
                    >
                      {pos.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Icon selector grid */}
              <div className="grid grid-cols-4 gap-1">
                {icons.map((ic) => (
                  <button
                    key={ic.id}
                    type="button"
                    onClick={() => updateLayer(selectedLayer.id, { btnIcon: ic.id })}
                    className={`py-1.5 px-1 rounded text-[10px] font-medium border flex items-center justify-center gap-1 transition cursor-pointer ${
                      icon === ic.id
                        ? 'bg-purple-600/30 text-purple-200 border-purple-500/70 shadow-sm'
                        : 'bg-[#121214] text-zinc-400 border-[#2c2c32] hover:bg-[#202026] hover:text-zinc-200'
                    }`}
                  >
                    {ic.icon}
                    <span className="truncate">{ic.label}</span>
                  </button>
                ))}
              </div>

              {/* Custom Emoji Input */}
              {icon === 'customEmoji' && (
                <div className="pt-1 border-t border-[#232328] flex items-center gap-2">
                  <label className="text-[10px] text-zinc-400 font-mono uppercase">Custom Emoji:</label>
                  <input
                    type="text"
                    value={customEmoji}
                    maxLength={4}
                    onChange={(e) => updateLayer(selectedLayer.id, { btnCustomEmoji: e.target.value })}
                    className="w-12 text-center bg-[#121214] border border-[#2c2c32] focus:border-purple-500 rounded px-1 py-0.5 text-base text-white outline-none"
                  />
                  <span className="text-[10px] text-zinc-500">Enter any emoji character</span>
                </div>
              )}
            </div>
          )}

          {/* On and Off Colors with Alpha */}
          <div className="bg-[#141418] p-2 rounded border border-[#2a2a32] space-y-2">
            <span className="text-[10px] text-zinc-400 font-mono uppercase block">On & Off Colors with Alpha</span>

            <div className="space-y-2">
              <ColorPickerWithAlpha
                label="ON Color & Alpha"
                color={onColor}
                onChange={(newOn) =>
                  updateLayer(selectedLayer.id, {
                    btnOnColor: newOn,
                    btnColor: newOn,
                    fill: newOn,
                  })
                }
              />

              <ColorPickerWithAlpha
                label="OFF Color & Alpha"
                color={offColor}
                onChange={(newOff) =>
                  updateLayer(selectedLayer.id, { btnOffColor: newOff })
                }
              />
            </div>

            {/* Gradient / Knob Colors */}
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#25252e]">
              <div>
                <label className="text-[9px] text-zinc-400 block mb-1">Gradient End</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={gradientEnd}
                    onChange={(e) => updateLayer(selectedLayer.id, { btnGradientEnd: e.target.value })}
                    className="w-6 h-6 rounded border border-[#3a3a44] bg-transparent cursor-pointer"
                  />
                  <span className="text-[9px] font-mono text-zinc-400 uppercase">{gradientEnd}</span>
                </div>
              </div>

              {btnStyle === 'toggle' && (
                <div>
                  <label className="text-[9px] text-zinc-400 block mb-1">Knob Color</label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={knobColor}
                      onChange={(e) => updateLayer(selectedLayer.id, { btnKnobColor: e.target.value })}
                      className="w-6 h-6 rounded border border-[#3a3a44] bg-transparent cursor-pointer"
                    />
                    <span className="text-[9px] font-mono text-zinc-400 uppercase">{knobColor}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Border Controls */}
          <div className="space-y-2 bg-[#141418] p-2 rounded border border-[#2a2a32]">
            <span className="text-[10px] text-zinc-400 font-mono uppercase block">Border & Outline</span>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-zinc-400 block mb-1">Border Thickness</label>
                <div className="relative flex items-center">
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={borderWidth}
                    onChange={(e) =>
                      updateLayer(selectedLayer.id, {
                        btnBorderWidth: Math.max(0, parseInt(e.target.value) || 0),
                      })
                    }
                    className="w-full bg-[#121214] border border-[#2c2c32] focus:border-purple-500 rounded px-2 py-1 pr-7 text-xs font-mono text-white outline-none"
                    placeholder="Border"
                  />
                  <span className="absolute right-2 text-[10px] font-mono text-zinc-500 pointer-events-none">
                    px
                  </span>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-zinc-400 block mb-1">Border Color</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={borderColor.startsWith('#') ? borderColor : '#ffffff'}
                    onChange={(e) => updateLayer(selectedLayer.id, { btnBorderColor: e.target.value })}
                    className="w-6 h-6 rounded border border-[#3a3a44] bg-transparent cursor-pointer"
                  />
                  <span className="text-[9px] font-mono text-zinc-400 truncate max-w-[70px]">
                    {borderColor}
                  </span>
                </div>
              </div>
            </div>

            {/* Corner Radius & Style */}
            {btnStyle !== 'pill' && btnStyle !== 'floating' && btnStyle !== 'toggle' && (
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#232328]">
                <div>
                  <div className="flex items-center justify-between text-[10px] text-zinc-400 mb-1">
                    <span>Corner Radius</span>
                    <span className="font-mono text-zinc-300 font-semibold">{borderRadius}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="40"
                    value={borderRadius}
                    onChange={(e) =>
                      updateLayer(selectedLayer.id, {
                        btnBorderRadius: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full accent-purple-500 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-zinc-400 block mb-1">Border Style</label>
                  <div className="grid grid-cols-3 gap-1">
                    {(['solid', 'dashed', 'dotted'] as BorderStyle[]).map((bs) => (
                      <button
                        key={bs}
                        type="button"
                        onClick={() => updateLayer(selectedLayer.id, { borderStyle: bs })}
                        className={`py-0.5 rounded text-[9px] font-mono border capitalize transition cursor-pointer ${
                          borderStyle === bs
                            ? 'bg-purple-600/30 text-purple-200 border-purple-500/70 font-semibold'
                            : 'bg-[#121214] text-zinc-400 border-[#2c2c32] hover:bg-[#202026]'
                        }`}
                      >
                        {bs}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Glow Shadow */}
            <div className="pt-1 border-t border-[#232328] flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <input
                  type="checkbox"
                  id="btnGlowCheck"
                  checked={glow}
                  onChange={(e) => updateLayer(selectedLayer.id, { btnGlow: e.target.checked })}
                  className="accent-purple-500 cursor-pointer"
                />
                <label htmlFor="btnGlowCheck" className="text-[10px] text-zinc-300 cursor-pointer">
                  Neon Glow Shadow
                </label>
              </div>

              {glow && (
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={glowColor}
                    onChange={(e) => updateLayer(selectedLayer.id, { btnGlowColor: e.target.value })}
                    className="w-5 h-5 rounded border border-[#3a3a44] bg-transparent cursor-pointer"
                  />
                  <span className="text-[9px] font-mono text-zinc-300 uppercase">{glowColor}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MOTION & STATE */}
      {activeTab === 'motion' && (
        <div className="space-y-3">
          {/* Toggle Switch Special Section */}
          {btnStyle === 'toggle' && (
            <div className="flex items-center justify-between bg-[#141418] p-2.5 rounded-lg border border-[#2a2a32]">
              <span className="text-xs text-zinc-300 font-medium">Toggle Switch State</span>
              <button
                type="button"
                onClick={() =>
                  updateLayer(selectedLayer.id, { btnState: state === 'on' ? 'off' : 'on' })
                }
                className={`px-3 py-1 rounded text-xs font-mono font-bold transition border cursor-pointer ${
                  state === 'on'
                    ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500/60'
                    : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                }`}
              >
                {state.toUpperCase()}
              </button>
            </div>
          )}

          {/* Keyframeable Button Motion Progress (Available for all Button Styles) */}
          <div className="bg-[#141418] p-2.5 rounded-lg border border-[#2a2a32] space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1">
              <div className="flex items-center gap-1.5">
                <span>Motion Progress</span>
                <button
                  type="button"
                  onClick={() => toggleKeyframe(selectedLayer.id, 'buttonProgress')}
                  title={hasKf ? 'Remove keyframe at playhead' : 'Add keyframe at playhead'}
                  className={`p-1 rounded transition cursor-pointer ${
                    hasKf
                      ? 'text-purple-400 bg-purple-950/60 hover:bg-purple-900/60'
                      : 'text-zinc-600 hover:text-zinc-300'
                  }`}
                >
                  <Diamond className={`w-3.5 h-3.5 ${hasKf ? 'fill-purple-400' : ''}`} />
                </button>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-purple-300 font-semibold">
                  {Math.round(progress)}%{btnStyle === 'toggle' ? ` (${progress >= 50 ? 'ON' : 'OFF'})` : ''}
                </span>
                <button
                  type="button"
                  onClick={() => addStartAndEndKeyframes(selectedLayer.id, 'buttonProgress', 0, 100, speed)}
                  className="text-[9px] px-1.5 py-0.5 rounded bg-[#1e1e24] hover:bg-purple-950 text-zinc-300 hover:text-purple-300 border border-[#303038] hover:border-purple-600 transition"
                  title="Add 0% start and 100% end keyframes"
                >
                  0%→100%
                </button>
              </div>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={(e) => {
                const val = parseFloat(e.target.value) || 0;
                handleProgressChange(val);
                if (btnStyle === 'toggle' && !selectedLayer.keyframes?.buttonProgress?.length) {
                  updateLayer(selectedLayer.id, {
                    btnState: val >= 50 ? 'on' : 'off',
                  });
                }
              }}
              className="w-full accent-purple-500 cursor-pointer"
            />
          </div>

          {/* Animation Effects */}
          <div>
            <label className="text-[10px] text-zinc-400 font-mono uppercase block mb-1.5">
              Motion Animation Effect
            </label>
            <div className="grid grid-cols-3 gap-1">
              {animations.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => updateLayer(selectedLayer.id, { btnAnimation: a.id })}
                  className={`py-1.5 px-1 rounded text-[10px] font-medium border text-center transition cursor-pointer ${
                    anim === a.id
                      ? 'bg-purple-600/30 text-purple-200 border-purple-500/70 shadow-sm'
                      : 'bg-[#121214] text-zinc-400 border-[#2c2c32] hover:bg-[#202026] hover:text-zinc-200'
                  }`}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>

          {/* Speed */}
          <div className="bg-[#141418] p-2 rounded border border-[#2a2a32]">
            <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1">
              <span>Animation Speed</span>
              <span className="font-mono text-purple-300 font-semibold">{speed.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.1"
              value={speed}
              onChange={(e) =>
                updateLayer(selectedLayer.id, {
                  btnAnimSpeed: parseFloat(e.target.value) || 1.5,
                })
              }
              className="w-full accent-purple-500 cursor-pointer"
            />
          </div>
        </div>
      )}
    </div>
  );
}
