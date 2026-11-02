'use client';

import React, { useState, useRef } from 'react';
import {
  Layers,
  Sparkles,
  Image as ImageIcon,
  Sliders,
  Palette,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Upload,
  Square,
  Eye,
  Diamond,
  X,
  CircleDot,
  Star,
  Triangle,
  Hexagon,
  Shapes,
} from 'lucide-react';
import { useMotion } from '@/context/MotionContext';
import { CardAnimType, CardShape, CardItem, CardImageMask, BorderStyle } from '@/types/motion';
import { uid, getInterpolatedValue } from '@/modules/keyframes/evaluator';
import { ColorPickerWithAlpha } from './ColorPickerWithAlpha';

export function CardInspectorSection() {
  const {
    selectedLayer,
    updateLayer,
    setAnimPropValue,
    toggleKeyframe,
    addStartAndEndKeyframes,
    currentTime,
    isAutoKeyframe,
  } = useMotion();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cardLayerFileInputRef = useRef<HTMLInputElement | null>(null);
  const [activeTab, setActiveTab] = useState<'stack' | 'image' | 'layers' | 'shape'>('stack');
  const [selectedCardIdx, setSelectedCardIdx] = useState<number>(0);

  if (!selectedLayer || selectedLayer.shapeType !== 'card') return null;

  const hasKeyframes = Boolean(selectedLayer.keyframes?.cardProgress?.length);
  const progress = hasKeyframes
    ? getInterpolatedValue(selectedLayer, 'cardProgress', currentTime)
    : (selectedLayer.cardProgress ?? 100);

  const hasKf = selectedLayer.keyframes?.cardProgress?.some(
    (k) => Math.abs(k.time - currentTime) < 0.04
  );

  const handleProgressChange = (val: number) => {
    if (hasKeyframes || isAutoKeyframe) {
      setAnimPropValue(selectedLayer.id, 'cardProgress', val, true);
    } else {
      updateLayer(selectedLayer.id, { cardProgress: val });
    }
  };

  const count = selectedLayer.cardCount ?? 3;
  const title = selectedLayer.cardTitle || '';
  const subtitle = selectedLayer.cardSubtitle || '';
  const badge = selectedLayer.cardBadge || '';
  const showContent = selectedLayer.cardShowContent ?? false;
  const animType: CardAnimType = selectedLayer.cardAnimType || 'stackSpread';
  const duration = selectedLayer.cardAnimDuration ?? 3.0;
  const spread = selectedLayer.cardSpread ?? 32;
  const radius = selectedLayer.cardBorderRadius ?? 22;
  const cardColor = selectedLayer.cardColor || '#6366f1';
  const gradientEnd = selectedLayer.cardGradientEnd || '#181826';
  const cardShape: CardShape = selectedLayer.cardShape || 'squircle';
  const borderWidth = selectedLayer.cardBorderWidth ?? 2;
  const borderColor = selectedLayer.cardBorderColor || 'rgba(255, 255, 255, 0.25)';
  const borderStyle: BorderStyle = selectedLayer.cardBorderStyle || 'solid';
  const globalImageSrc = selectedLayer.cardImageSrc || '';
  const globalImageMask: CardImageMask = selectedLayer.cardImageMask || 'none';

  const cardItems: CardItem[] = selectedLayer.cardItems || [];

  const animOptions: { id: CardAnimType; label: string; desc: string }[] = [
    { id: 'stackSpread', label: 'Stack Spread', desc: 'Cards spread dynamically from center' },
    { id: 'circularArray', label: 'Circular Array', desc: 'Radial circular ring arrangement' },
    { id: 'linearArray', label: 'Linear Array', desc: 'Horizontal linear row expansion' },
    { id: 'fallingStack', label: 'Falling Stack', desc: 'Cascading drops from above into stack' },
    { id: 'queue', label: 'Queue', desc: 'Perspective queue advancing forward' },
    { id: 'stack', label: '3D Stack', desc: 'Layered depth offset stack' },
    { id: 'fan', label: 'Fan Out', desc: 'Curved radial fan spread' },
    { id: 'cascade', label: 'Cascade', desc: 'Diagonal cascading steps' },
    { id: 'swipe', label: 'Swipe Loop', desc: 'Card swipe cycle' },
    { id: 'flip', label: '3D Flip', desc: 'Tilting card flip' },
    { id: 'float', label: 'Float Wave', desc: 'Organic floating wave' },
  ];

  const shapes: { id: CardShape; label: string; icon: string }[] = [
    { id: 'squircle', label: 'Squircle (Smooth)', icon: '▢' },
    { id: 'rounded', label: 'Rounded Rect', icon: '▢' },
    { id: 'rect', label: 'Sharp Rect', icon: '▭' },
    { id: 'circle', label: 'Circle / Oval', icon: '○' },
    { id: 'pill', label: 'Capsule Pill', icon: '⬭' },
    { id: 'triangle', label: 'Triangle', icon: '△' },
    { id: 'star', label: 'Star (5-pt)', icon: '★' },
    { id: 'hexagon', label: 'Hexagon', icon: '⬡' },
    { id: 'chamfer', label: 'Chamfer Cut', icon: '⧠' },
    { id: 'glass', label: 'Frosted Glass', icon: '✦' },
  ];

  const masks: { id: CardImageMask; label: string; icon: React.ReactNode }[] = [
    { id: 'none', label: 'Full Bleed (Card)', icon: <Square className="w-3.5 h-3.5" /> },
    { id: 'circle', label: 'Circle Mask', icon: <CircleDot className="w-3.5 h-3.5" /> },
    { id: 'rect', label: 'Rectangle Mask', icon: <Square className="w-3.5 h-3.5" /> },
    { id: 'triangle', label: 'Triangle Mask', icon: <Triangle className="w-3.5 h-3.5" /> },
    { id: 'star', label: 'Star Mask', icon: <Star className="w-3.5 h-3.5" /> },
    { id: 'hexagon', label: 'Hexagon Mask', icon: <Hexagon className="w-3.5 h-3.5" /> },
    { id: 'squircle', label: 'Squircle Mask', icon: <Shapes className="w-3.5 h-3.5" /> },
  ];

  const handleAddCard = () => {
    const newCard: CardItem = {
      id: uid('card_item'),
      title: `Card ${cardItems.length + 1}`,
      subtitle: '',
      badge: '',
      shape: cardShape,
      color: cardColor,
      gradientEnd: gradientEnd,
      borderColor: borderColor,
      borderWidth: borderWidth,
      borderRadius: radius,
    };
    const updated = [...cardItems, newCard];
    updateLayer(selectedLayer.id, { cardItems: updated, cardCount: updated.length });
    setSelectedCardIdx(updated.length - 1);
  };

  const handleUpdateCard = (idx: number, updates: Partial<CardItem>) => {
    const updated = [...cardItems];
    if (!updated[idx]) return;
    updated[idx] = { ...updated[idx], ...updates };
    updateLayer(selectedLayer.id, { cardItems: updated });
  };

  const handleDeleteCard = (idx: number) => {
    const updated = cardItems.filter((_, i) => i !== idx);
    updateLayer(selectedLayer.id, { cardItems: updated, cardCount: Math.max(2, updated.length) });
    if (selectedCardIdx >= updated.length) {
      setSelectedCardIdx(Math.max(0, updated.length - 1));
    }
  };

  const handleMoveCard = (idx: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= cardItems.length) return;
    const updated = [...cardItems];
    const temp = updated[idx];
    updated[idx] = updated[targetIdx];
    updated[targetIdx] = temp;
    updateLayer(selectedLayer.id, { cardItems: updated });
    setSelectedCardIdx(targetIdx);
  };

  const handleGlobalImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        if (dataUrl) {
          updateLayer(selectedLayer.id, { cardImageSrc: dataUrl });
        }
      };
      reader.onerror = () => {
        console.error('Failed to read image file');
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Failed to upload image:', err);
    }
    e.target.value = '';
  };

  const handleCardLayerImageUpload = (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        if (dataUrl) {
          if (!cardItems || cardItems.length === 0 || !cardItems[idx]) {
            const newCard: CardItem = {
              id: uid('card_item'),
              title: `Card 1`,
              subtitle: '',
              badge: '',
              shape: cardShape,
              color: cardColor,
              gradientEnd: gradientEnd,
              borderColor: borderColor,
              borderWidth: borderWidth,
              borderRadius: radius,
              imageSrc: dataUrl,
            };
            const updated = cardItems && cardItems.length > 0 ? [...cardItems] : [];
            if (updated[idx]) {
              updated[idx] = { ...updated[idx], imageSrc: dataUrl };
            } else {
              updated.push(newCard);
            }
            updateLayer(selectedLayer.id, { cardItems: updated, cardCount: updated.length });
            setSelectedCardIdx(Math.max(0, updated.length - 1));
          } else {
            handleUpdateCard(idx, { imageSrc: dataUrl });
          }
        }
      };
      reader.onerror = () => {
        console.error('Failed to read image file');
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Failed to upload image:', err);
    }
    e.target.value = '';
  };

  return (
    <div className="bg-[#1a1a1e] p-2.5 rounded-lg border border-[#28282e] space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-purple-400" />
          Cards & Motion
        </span>
        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-purple-950/70 text-purple-300 border border-purple-700/50 uppercase">
          {cardItems.length > 0 ? `${cardItems.length} LAYERS` : `${count} CARDS`}
        </span>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-4 bg-[#121214] p-0.5 rounded border border-[#28282e] text-[10px] font-medium">
        <button
          type="button"
          onClick={() => setActiveTab('stack')}
          className={`py-1 rounded transition text-center flex items-center justify-center gap-1 cursor-pointer ${
            activeTab === 'stack'
              ? 'bg-[#27272e] text-white shadow-sm font-semibold'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Sliders className="w-3 h-3 text-purple-400" />
          <span>Motion</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('shape')}
          className={`py-1 rounded transition text-center flex items-center justify-center gap-1 cursor-pointer ${
            activeTab === 'shape'
              ? 'bg-[#27272e] text-white shadow-sm font-semibold'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Palette className="w-3 h-3 text-amber-400" />
          <span>Shape</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('image')}
          className={`py-1 rounded transition text-center flex items-center justify-center gap-1 cursor-pointer ${
            activeTab === 'image'
              ? 'bg-[#27272e] text-white shadow-sm font-semibold'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <ImageIcon className="w-3 h-3 text-emerald-400" />
          <span>Image & Mask</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('layers')}
          className={`py-1 rounded transition text-center flex items-center justify-center gap-1 cursor-pointer ${
            activeTab === 'layers'
              ? 'bg-[#27272e] text-white shadow-sm font-semibold'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Layers className="w-3 h-3 text-blue-400" />
          <span>Deck ({cardItems.length || count})</span>
        </button>
      </div>

      {/* TAB 1: STACK & ANIMATION PRESETS */}
      {activeTab === 'stack' && (
        <div className="space-y-3">
          {/* Keyframeable 0-100% Motion Progress Slider */}
          <div className="bg-[#141418] p-2.5 rounded border border-[#2a2a32] space-y-2">
            <div className="flex items-center justify-between text-[11px] text-zinc-300">
              <div className="flex items-center gap-1.5 font-medium">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>Animation Progress</span>
                <button
                  type="button"
                  onClick={() => toggleKeyframe(selectedLayer.id, 'cardProgress')}
                  title={hasKf ? 'Remove keyframe at playhead' : 'Add keyframe at playhead'}
                  className={`p-1 rounded transition cursor-pointer ${
                    hasKf
                      ? 'text-purple-400 bg-purple-950/60 hover:bg-purple-900/60'
                      : 'text-zinc-600 hover:text-zinc-300'
                  }`}
                >
                  <Diamond className={`w-3 h-3 ${hasKf ? 'fill-purple-400' : ''}`} />
                </button>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-purple-300 font-semibold">{Math.round(progress)}%</span>
                <button
                  type="button"
                  onClick={() => addStartAndEndKeyframes(selectedLayer.id, 'cardProgress', 0, 100, duration)}
                  className="text-[9px] px-1.5 py-0.5 rounded bg-[#1e1e24] hover:bg-purple-950 text-zinc-300 hover:text-purple-300 border border-[#303038] hover:border-purple-600 transition cursor-pointer"
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
              step="1"
              value={Math.round(progress)}
              onChange={(e) => handleProgressChange(parseInt(e.target.value, 10))}
              className="w-full accent-purple-500 cursor-pointer"
            />
          </div>

          {/* Animation Presets */}
          <div>
            <label className="text-[10px] text-zinc-400 font-mono uppercase block mb-1.5">
              Animation Presets
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {animOptions.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  title={a.desc}
                  onClick={() => updateLayer(selectedLayer.id, { cardAnimType: a.id })}
                  className={`py-1.5 px-2 rounded text-[10px] font-medium border text-left transition cursor-pointer flex flex-col justify-center ${
                    animType === a.id
                      ? 'bg-purple-600/30 text-purple-200 border-purple-500/70 shadow-sm'
                      : 'bg-[#121214] text-zinc-400 border-[#2c2c32] hover:bg-[#202026] hover:text-zinc-200'
                  }`}
                >
                  <span className="font-semibold">{a.label}</span>
                  <span className="text-[8px] text-zinc-500 truncate">{a.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Spread, Duration & Count */}
          <div className="grid grid-cols-3 gap-2 bg-[#141418] p-2 rounded border border-[#2a2a32]">
            <div>
              <label className="text-[10px] text-zinc-400 block mb-1">Spread (px)</label>
              <div className="relative flex items-center">
                <input
                  type="number"
                  min="0"
                  step="2"
                  value={spread}
                  onChange={(e) =>
                    updateLayer(selectedLayer.id, { cardSpread: parseInt(e.target.value, 10) || 0 })
                  }
                  className="w-full bg-[#121214] border border-[#2c2c32] focus:border-purple-500 rounded px-2 py-1 pr-6 text-xs font-mono text-white outline-none"
                />
                <span className="absolute right-1.5 text-[9px] font-mono text-zinc-500 pointer-events-none">px</span>
              </div>
            </div>

            <div>
              <label className="text-[10px] text-zinc-400 block mb-1">Duration (s)</label>
              <div className="relative flex items-center">
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={duration}
                  onChange={(e) =>
                    updateLayer(selectedLayer.id, { cardAnimDuration: Math.max(0.2, parseFloat(e.target.value) || 3) })
                  }
                  className="w-full bg-[#121214] border border-[#2c2c32] focus:border-purple-500 rounded px-2 py-1 pr-5 text-xs font-mono text-white outline-none"
                />
                <span className="absolute right-1.5 text-[9px] font-mono text-zinc-500 pointer-events-none">s</span>
              </div>
            </div>

            <div>
              <label className="text-[10px] text-zinc-400 block mb-1">Card Count</label>
              <input
                type="number"
                min="2"
                max="12"
                value={count}
                onChange={(e) =>
                  updateLayer(selectedLayer.id, { cardCount: Math.max(2, Math.min(12, parseInt(e.target.value, 10) || 3)) })
                }
                className="w-full bg-[#121214] border border-[#2c2c32] focus:border-purple-500 rounded px-2 py-1 text-xs text-white outline-none font-mono"
              />
            </div>
          </div>

          {/* Optional Text / Badge Toggle */}
          <div className="p-2 rounded bg-[#141418] border border-[#2a2a32] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-zinc-300 font-medium">Show Text & Badge Overlay</span>
              <input
                type="checkbox"
                checked={showContent}
                onChange={(e) => updateLayer(selectedLayer.id, { cardShowContent: e.target.checked })}
                className="rounded accent-purple-500 cursor-pointer"
              />
            </div>

            {showContent && (
              <div className="space-y-2 pt-1 border-t border-[#242428]/60">
                <div>
                  <label className="text-[9px] text-zinc-400 uppercase font-mono block mb-0.5">Title</label>
                  <input
                    type="text"
                    value={title}
                    placeholder="Enter card title"
                    onChange={(e) => updateLayer(selectedLayer.id, { cardTitle: e.target.value })}
                    className="w-full bg-[#121214] border border-[#2c2c32] focus:border-purple-500 rounded px-2 py-1 text-xs text-white outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[9px] text-zinc-400 uppercase font-mono block mb-0.5">Subtitle</label>
                    <input
                      type="text"
                      value={subtitle}
                      placeholder="Subtitle"
                      onChange={(e) => updateLayer(selectedLayer.id, { cardSubtitle: e.target.value })}
                      className="w-full bg-[#121214] border border-[#2c2c32] focus:border-purple-500 rounded px-2 py-1 text-xs text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] text-zinc-400 uppercase font-mono block mb-0.5">Badge</label>
                    <input
                      type="text"
                      value={badge}
                      placeholder="FEATURED"
                      onChange={(e) => updateLayer(selectedLayer.id, { cardBadge: e.target.value })}
                      className="w-full bg-[#121214] border border-[#2c2c32] focus:border-purple-500 rounded px-2 py-1 text-xs text-white outline-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: SHAPE, BORDER & COLOR */}
      {activeTab === 'shape' && (
        <div className="space-y-3">
          {/* Card Shape Selector */}
          <div>
            <label className="text-[10px] text-zinc-400 font-mono uppercase block mb-1.5">
              Card Shape Geometry
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {shapes.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => updateLayer(selectedLayer.id, { cardShape: s.id })}
                  className={`py-1.5 px-2 rounded text-[10px] font-medium border text-left transition cursor-pointer flex items-center gap-1.5 ${
                    cardShape === s.id
                      ? 'bg-purple-600/30 text-purple-200 border-purple-500/70 shadow-sm font-semibold'
                      : 'bg-[#121214] text-zinc-400 border-[#2c2c32] hover:bg-[#202026] hover:text-zinc-200'
                  }`}
                >
                  <span className="text-purple-400 font-mono">{s.icon}</span>
                  <span className="truncate">{s.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Size (Width & Height) */}
          <div className="grid grid-cols-2 gap-2 bg-[#141418] p-2 rounded border border-[#2a2a32]">
            <div>
              <label className="text-[10px] text-zinc-400 block mb-1">Card Width</label>
              <div className="relative flex items-center">
                <input
                  type="number"
                  min="20"
                  step="5"
                  value={selectedLayer.width || 240}
                  onChange={(e) => updateLayer(selectedLayer.id, { width: Math.max(20, parseInt(e.target.value, 10) || 240) })}
                  className="w-full bg-[#121214] border border-[#2c2c32] focus:border-purple-500 rounded px-2 py-1 pr-7 text-xs font-mono text-white outline-none"
                />
                <span className="absolute right-2 text-[10px] font-mono text-zinc-500 pointer-events-none">px</span>
              </div>
            </div>
            <div>
              <label className="text-[10px] text-zinc-400 block mb-1">Card Height</label>
              <div className="relative flex items-center">
                <input
                  type="number"
                  min="20"
                  step="5"
                  value={selectedLayer.height || 150}
                  onChange={(e) => updateLayer(selectedLayer.id, { height: Math.max(20, parseInt(e.target.value, 10) || 150) })}
                  className="w-full bg-[#121214] border border-[#2c2c32] focus:border-purple-500 rounded px-2 py-1 pr-7 text-xs font-mono text-white outline-none"
                />
                <span className="absolute right-2 text-[10px] font-mono text-zinc-500 pointer-events-none">px</span>
              </div>
            </div>
          </div>

          {/* Border & Corner Radius */}
          <div className="bg-[#141418] p-2 rounded border border-[#2a2a32] space-y-2">
            <span className="text-[10px] text-zinc-400 font-mono uppercase block">Border & Corners</span>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-zinc-400 block mb-1">Border Thickness</label>
                <div className="relative flex items-center">
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={borderWidth}
                    onChange={(e) => updateLayer(selectedLayer.id, { cardBorderWidth: Math.max(0, parseFloat(e.target.value) || 0) })}
                    className="w-full bg-[#121214] border border-[#2c2c32] focus:border-purple-500 rounded px-2 py-1 pr-7 text-xs font-mono text-white outline-none"
                  />
                  <span className="absolute right-2 text-[10px] font-mono text-zinc-500 pointer-events-none">px</span>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-zinc-400 block mb-1">Corner Radius</label>
                <div className="relative flex items-center">
                  <input
                    type="number"
                    min="0"
                    step="2"
                    value={radius}
                    onChange={(e) => updateLayer(selectedLayer.id, { cardBorderRadius: Math.max(0, parseInt(e.target.value, 10) || 0) })}
                    className="w-full bg-[#121214] border border-[#2c2c32] focus:border-purple-500 rounded px-2 py-1 pr-7 text-xs font-mono text-white outline-none"
                  />
                  <span className="absolute right-2 text-[10px] font-mono text-zinc-500 pointer-events-none">px</span>
                </div>
              </div>
            </div>

            <div>
              <label className="text-[10px] text-zinc-400 block mb-1">Border Style</label>
              <div className="grid grid-cols-4 gap-1">
                {(['solid', 'dashed', 'dotted', 'none'] as BorderStyle[]).map((bs) => (
                  <button
                    key={bs}
                    type="button"
                    onClick={() => updateLayer(selectedLayer.id, { cardBorderStyle: bs })}
                    className={`py-1 rounded text-[9px] font-mono border capitalize transition cursor-pointer ${
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

            <ColorPickerWithAlpha
              label="Border Color & Alpha"
              color={borderColor}
              onChange={(c) => updateLayer(selectedLayer.id, { cardBorderColor: c })}
            />
          </div>

          {/* Colors */}
          <div className="space-y-2 bg-[#141418] p-2 rounded border border-[#2a2a32]">
            <span className="text-[10px] text-zinc-400 font-mono uppercase block">Card Colors & Gradient</span>
            <ColorPickerWithAlpha
              label="Card Color"
              color={cardColor}
              onChange={(c) => updateLayer(selectedLayer.id, { cardColor: c })}
            />
            <ColorPickerWithAlpha
              label="Gradient End Color"
              color={gradientEnd}
              onChange={(c) => updateLayer(selectedLayer.id, { cardGradientEnd: c })}
            />
          </div>
        </div>
      )}

      {/* TAB 3: IMAGE IN CARD & MASKS */}
      {activeTab === 'image' && (
        <div className="space-y-3">
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleGlobalImageUpload}
            className="hidden"
          />

          <div className="bg-[#141418] p-2.5 rounded border border-[#2a2a32] space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-zinc-200 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
                Image in Card
              </span>
              {globalImageSrc && (
                <button
                  type="button"
                  onClick={() => updateLayer(selectedLayer.id, { cardImageSrc: undefined })}
                  className="text-[10px] text-zinc-400 hover:text-red-400 flex items-center gap-1 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                  Remove
                </button>
              )}
            </div>

            {/* Image Preview or Upload Button */}
            {globalImageSrc ? (
              <div className="flex items-center gap-2 p-1.5 rounded bg-[#101012] border border-[#2a2a32]">
                <img
                  src={globalImageSrc}
                  alt="Card asset"
                  className="w-12 h-12 rounded object-cover border border-purple-500/50"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] text-zinc-300 font-mono block truncate">Card Image Active</span>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[9px] text-purple-400 hover:text-purple-300 underline cursor-pointer mt-0.5"
                  >
                    Replace Image
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2.5 rounded border border-dashed border-[#3a3a46] hover:border-purple-500 bg-[#101014] text-zinc-400 hover:text-zinc-200 text-xs transition cursor-pointer flex flex-col items-center justify-center gap-1"
              >
                <Upload className="w-4 h-4 text-purple-400" />
                <span>Upload Card Image</span>
              </button>
            )}
          </div>

          {/* Mask Options */}
          <div>
            <label className="text-[10px] text-zinc-400 font-mono uppercase block mb-1.5">
              Default Mask Shape
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {masks.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => updateLayer(selectedLayer.id, { cardImageMask: m.id })}
                  className={`py-1.5 px-2 rounded text-[10px] font-medium border text-left transition cursor-pointer flex items-center gap-1.5 ${
                    globalImageMask === m.id
                      ? 'bg-emerald-600/25 text-emerald-200 border-emerald-500/70 shadow-sm font-semibold'
                      : 'bg-[#121214] text-zinc-400 border-[#2c2c32] hover:bg-[#202026] hover:text-zinc-200'
                  }`}
                >
                  <span className="text-emerald-400">{m.icon}</span>
                  <span className="truncate">{m.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: CARD DECK LAYERS SYSTEM */}
      {activeTab === 'layers' && (
        <div className="space-y-3">
          <input
            type="file"
            ref={cardLayerFileInputRef}
            accept="image/*"
            onChange={(e) => handleCardLayerImageUpload(e, selectedCardIdx)}
            className="hidden"
          />

          <div className="flex items-center justify-between">
            <span className="text-[10px] text-zinc-400 font-mono uppercase">
              Individual Card Customization
            </span>
            <button
              type="button"
              onClick={handleAddCard}
              className="text-[10px] px-2 py-0.5 rounded bg-purple-600 hover:bg-purple-500 text-white transition cursor-pointer flex items-center gap-1 shadow-sm"
            >
              <Plus className="w-3 h-3" />
              Add Layer
            </button>
          </div>

          {/* Cards List */}
          <div className="space-y-1 max-h-48 overflow-y-auto pr-0.5">
            {cardItems.map((item, idx) => (
              <div
                key={item.id || idx}
                onClick={() => setSelectedCardIdx(idx)}
                className={`p-1.5 rounded border transition cursor-pointer flex items-center justify-between ${
                  selectedCardIdx === idx
                    ? 'bg-purple-950/40 border-purple-500/70 text-purple-200'
                    : 'bg-[#131316] border-[#25252c] text-zinc-400 hover:bg-[#1a1a20]'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-[#1e1e26] text-purple-300">
                    #{idx + 1}
                  </span>
                  <span className="text-xs font-medium truncate">
                    {item.title || `Card Layer ${idx + 1}`}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMoveCard(idx, 'up');
                    }}
                    disabled={idx === 0}
                    className="p-1 rounded text-zinc-400 hover:text-white disabled:opacity-20 cursor-pointer"
                  >
                    <ChevronUp className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMoveCard(idx, 'down');
                    }}
                    disabled={idx === cardItems.length - 1}
                    className="p-1 rounded text-zinc-400 hover:text-white disabled:opacity-20 cursor-pointer"
                  >
                    <ChevronDown className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCard(idx);
                    }}
                    className="p-1 rounded text-zinc-500 hover:text-red-400 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Active Card Layer Editor */}
          {cardItems.length > 0 && cardItems[selectedCardIdx] && (
            <div className="bg-[#141418] p-2.5 rounded border border-[#2a2a32] space-y-2">
              <span className="text-[10px] text-purple-300 font-mono uppercase block font-semibold">
                Editing Card #{selectedCardIdx + 1}
              </span>

              <div>
                <label className="text-[9px] text-zinc-400 uppercase font-mono block mb-0.5">Title</label>
                <input
                  type="text"
                  value={cardItems[selectedCardIdx].title || ''}
                  placeholder={`Card ${selectedCardIdx + 1}`}
                  onChange={(e) => handleUpdateCard(selectedCardIdx, { title: e.target.value })}
                  className="w-full bg-[#101012] border border-[#2c2c32] focus:border-purple-500 rounded px-2 py-0.5 text-xs text-white outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <ColorPickerWithAlpha
                  label="Card Background Color"
                  color={cardItems[selectedCardIdx].color || cardColor}
                  onChange={(val) => handleUpdateCard(selectedCardIdx, { color: val })}
                />
                <ColorPickerWithAlpha
                  label="Card Border Color"
                  color={cardItems[selectedCardIdx].borderColor || borderColor}
                  onChange={(val) => handleUpdateCard(selectedCardIdx, { borderColor: val })}
                />
              </div>

              <button
                type="button"
                onClick={() => cardLayerFileInputRef.current?.click()}
                className="w-full py-1.5 rounded bg-[#1c1c24] hover:bg-[#252530] text-zinc-300 text-[10px] font-medium border border-[#30303c] transition cursor-pointer flex items-center justify-center gap-1"
              >
                <Upload className="w-3 h-3 text-purple-400" />
                <span>Upload Layer Image</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
