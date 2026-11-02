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
} from 'lucide-react';
import { useMotion } from '@/context/MotionContext';
import { CardAnimType, CardShape, CardItem, BorderStyle } from '@/types/motion';
import { uid, getInterpolatedValue } from '@/modules/keyframes/evaluator';

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
  const [activeTab, setActiveTab] = useState<'stack' | 'layers' | 'shape'>('stack');
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
  const title = selectedLayer.cardTitle || 'Motion Card';
  const subtitle = selectedLayer.cardSubtitle || 'Interactive Card Stack';
  const badge = selectedLayer.cardBadge || 'FEATURED';
  const animType = selectedLayer.cardAnimType || 'fan';
  const duration = selectedLayer.cardAnimDuration ?? 3.0;
  const spread = selectedLayer.cardSpread ?? 24;
  const radius = selectedLayer.cardBorderRadius ?? 16;
  const cardColor = selectedLayer.cardColor || '#181822';
  const cardShape: CardShape = selectedLayer.cardShape || 'rounded';
  const borderWidth = selectedLayer.cardBorderWidth ?? 1.5;
  const borderColor = selectedLayer.cardBorderColor || 'rgba(168, 85, 247, 0.6)';
  const borderStyle: BorderStyle = selectedLayer.cardBorderStyle || 'solid';

  const cardItems: CardItem[] = selectedLayer.cardItems || [];

  const animOptions: { id: CardAnimType; label: string }[] = [
    { id: 'fan', label: 'Fan Out' },
    { id: 'swipe', label: 'Swipe Loop' },
    { id: 'stackShift', label: 'Depth Shift' },
    { id: 'cascade', label: 'Cascade' },
    { id: 'flip', label: '3D Flip' },
    { id: 'float', label: 'Float Wave' },
  ];

  const shapes: { id: CardShape; label: string }[] = [
    { id: 'rounded', label: 'Rounded' },
    { id: 'chamfer', label: 'Chamfer' },
    { id: 'rect', label: 'Sharp Rect' },
    { id: 'pill', label: 'Pill' },
    { id: 'glass', label: 'Glassmorphic' },
  ];

  const handleAddCard = () => {
    const newCard: CardItem = {
      id: uid('card_item'),
      title: `Card ${cardItems.length + 1}`,
      subtitle: 'Custom Layer Item',
      badge: 'NEW',
      shape: cardShape,
      color: '#1a1829',
      gradientEnd: '#12101f',
      borderColor: 'rgba(168, 85, 247, 0.5)',
      borderWidth: 1.5,
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

  const handleCardImageUpload = (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (!dataUrl) return;
      if (cardItems.length > 0 && cardItems[idx]) {
        handleUpdateCard(idx, { imageSrc: dataUrl });
      } else {
        updateLayer(selectedLayer.id, { cardImageSrc: dataUrl });
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div className="bg-[#1a1a1e] p-2.5 rounded-lg border border-[#28282e] space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-purple-400" />
          Card Stack & Layer System
        </span>
        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-purple-950/70 text-purple-300 border border-purple-700/50 uppercase">
          {cardItems.length > 0 ? `${cardItems.length} LAYERS` : `${count} CARDS`}
        </span>
      </div>

      {/* Tabs */}
      <div className="flex bg-[#121214] p-0.5 rounded border border-[#28282e] text-[10px] font-medium">
        <button
          type="button"
          onClick={() => setActiveTab('stack')}
          className={`flex-1 py-1 rounded transition text-center flex items-center justify-center gap-1 cursor-pointer ${
            activeTab === 'stack'
              ? 'bg-[#27272e] text-white shadow-sm font-semibold'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Sliders className="w-3 h-3 text-purple-400" />
          Stack & Motion
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('layers')}
          className={`flex-1 py-1 rounded transition text-center flex items-center justify-center gap-1 cursor-pointer ${
            activeTab === 'layers'
              ? 'bg-[#27272e] text-white shadow-sm font-semibold'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Layers className="w-3 h-3 text-blue-400" />
          Card Layers ({cardItems.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('shape')}
          className={`flex-1 py-1 rounded transition text-center flex items-center justify-center gap-1 cursor-pointer ${
            activeTab === 'shape'
              ? 'bg-[#27272e] text-white shadow-sm font-semibold'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Palette className="w-3 h-3 text-amber-400" />
          Shape & Border
        </button>
      </div>

      {/* TAB 1: STACK & MOTION */}
      {activeTab === 'stack' && (
        <div className="space-y-3">
          {/* Card Content Inputs (Global / Front Card) */}
          <div className="space-y-2 bg-[#141418] p-2 rounded border border-[#2a2a32]">
            <div>
              <label className="text-[10px] text-zinc-400 uppercase font-mono block mb-1">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => updateLayer(selectedLayer.id, { cardTitle: e.target.value })}
                className="w-full bg-[#121214] border border-[#2c2c32] focus:border-purple-500 rounded px-2 py-1 text-xs text-white outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] text-zinc-400 uppercase font-mono block mb-1">Subtitle</label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => updateLayer(selectedLayer.id, { cardSubtitle: e.target.value })}
                className="w-full bg-[#121214] border border-[#2c2c32] focus:border-purple-500 rounded px-2 py-1 text-xs text-white outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-zinc-400 uppercase font-mono block mb-1">Badge</label>
                <input
                  type="text"
                  value={badge}
                  onChange={(e) => updateLayer(selectedLayer.id, { cardBadge: e.target.value })}
                  className="w-full bg-[#121214] border border-[#2c2c32] focus:border-purple-500 rounded px-2 py-1 text-xs text-white outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-zinc-400 uppercase font-mono block mb-1">Cards Count</label>
                <input
                  type="number"
                  min="2"
                  max="8"
                  value={count}
                  onChange={(e) =>
                    updateLayer(selectedLayer.id, { cardCount: parseInt(e.target.value, 10) || 3 })
                  }
                  className="w-full bg-[#121214] border border-[#2c2c32] focus:border-purple-500 rounded px-2 py-1 text-xs text-white outline-none font-mono"
                />
              </div>
            </div>
          </div>

          {/* Animation Style */}
          <div>
            <label className="text-[10px] text-zinc-400 font-mono uppercase block mb-1.5">
              Stack Animation Style
            </label>
            <div className="grid grid-cols-3 gap-1">
              {animOptions.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => updateLayer(selectedLayer.id, { cardAnimType: a.id })}
                  className={`py-1.5 px-1 rounded text-[10px] font-medium border text-center transition cursor-pointer ${
                    animType === a.id
                      ? 'bg-purple-600/30 text-purple-200 border-purple-500/70 shadow-sm'
                      : 'bg-[#121214] text-zinc-400 border-[#2c2c32] hover:bg-[#202026] hover:text-zinc-200'
                  }`}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>

          {/* Spread & Duration */}
          <div className="grid grid-cols-2 gap-2 bg-[#141418] p-2 rounded border border-[#2a2a32]">
            <div>
              <div className="flex items-center justify-between text-[10px] text-zinc-400 mb-1">
                <span>Spread</span>
                <span className="font-mono text-zinc-200 font-semibold">{spread}px</span>
              </div>
              <input
                type="range"
                min="8"
                max="60"
                value={spread}
                onChange={(e) =>
                  updateLayer(selectedLayer.id, { cardSpread: parseInt(e.target.value, 10) || 24 })
                }
                className="w-full accent-purple-500 cursor-pointer"
              />
            </div>
            <div>
              <div className="flex items-center justify-between text-[10px] text-zinc-400 mb-1">
                <span>Duration</span>
                <span className="font-mono text-zinc-200 font-semibold">{duration.toFixed(1)}s</span>
              </div>
              <input
                type="range"
                min="1"
                max="8"
                step="0.5"
                value={duration}
                onChange={(e) =>
                  updateLayer(selectedLayer.id, {
                    cardAnimDuration: parseFloat(e.target.value) || 3,
                  })
                }
                className="w-full accent-purple-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Keyframeable Card Motion Progress */}
          <div className="bg-[#141418] p-2 rounded border border-[#2a2a32] space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-zinc-400">
              <div className="flex items-center gap-1.5">
                <span>Card Motion Progress</span>
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
              step="1"
              value={Math.round(progress)}
              onChange={(e) => handleProgressChange(parseInt(e.target.value, 10))}
              className="w-full accent-purple-500 cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* TAB 2: CARD LAYERS SYSTEM */}
      {activeTab === 'layers' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-zinc-400 font-mono uppercase">
              Custom Card Stack Layers
            </span>
            <button
              type="button"
              onClick={handleAddCard}
              className="px-2 py-0.5 rounded bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-semibold transition cursor-pointer flex items-center gap-1 shadow-sm"
            >
              <Plus className="w-3 h-3" />
              <span>Add Card</span>
            </button>
          </div>

          {/* Cards List */}
          {cardItems.length === 0 ? (
            <div className="p-3 bg-[#121214] rounded border border-dashed border-[#2f2f38] text-center space-y-2">
              <p className="text-[11px] text-zinc-400">
                No individual card layers added yet. By default, the stack renders virtual duplicate cards.
              </p>
              <button
                type="button"
                onClick={() => {
                  const initial: CardItem[] = [
                    {
                      id: uid('card_item'),
                      title: title || 'Motion Card 1',
                      subtitle: subtitle || 'Feature Card',
                      badge: badge || 'PRIMARY',
                      shape: cardShape,
                      color: cardColor,
                      gradientEnd: '#1b1429',
                      borderWidth: 1.5,
                      borderColor: borderColor,
                      borderRadius: radius,
                    },
                    {
                      id: uid('card_item'),
                      title: 'Card Layer 2',
                      subtitle: 'Interactive Depth',
                      badge: 'STACK',
                      shape: cardShape,
                      color: '#1a1828',
                      gradientEnd: '#11101d',
                      borderWidth: 1.5,
                      borderColor: 'rgba(255,255,255,0.15)',
                      borderRadius: radius,
                    },
                    {
                      id: uid('card_item'),
                      title: 'Card Layer 3',
                      subtitle: 'Background Layer',
                      badge: 'BACK',
                      shape: cardShape,
                      color: '#14141e',
                      gradientEnd: '#0e0e16',
                      borderWidth: 1.5,
                      borderColor: 'rgba(255,255,255,0.1)',
                      borderRadius: radius,
                    },
                  ];
                  updateLayer(selectedLayer.id, { cardItems: initial, cardCount: 3 });
                }}
                className="px-2.5 py-1 rounded bg-purple-600/30 text-purple-200 border border-purple-500/60 text-xs font-semibold hover:bg-purple-600/40 cursor-pointer"
              >
                Convert Stack to 3 Custom Layers
              </button>
            </div>
          ) : (
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-0.5">
              {cardItems.map((item, idx) => {
                const isSelected = selectedCardIdx === idx;
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedCardIdx(idx)}
                    className={`p-1.5 rounded border transition cursor-pointer flex items-center justify-between gap-1.5 ${
                      isSelected
                        ? 'bg-purple-900/30 border-purple-500/70'
                        : 'bg-[#121214] border-[#28282e] hover:bg-[#1a1a20]'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      {item.imageSrc ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.imageSrc}
                          alt="card thumb"
                          className="w-6 h-6 rounded object-cover border border-purple-500/40 shrink-0"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded bg-[#202028] flex items-center justify-center shrink-0 text-[10px] text-purple-400 font-mono font-bold">
                          #{idx + 1}
                        </div>
                      )}
                      <div className="truncate text-left">
                        <span className="text-[11px] font-semibold text-zinc-200 block truncate">
                          {item.title || `Card ${idx + 1}`}
                        </span>
                        <span className="text-[9px] text-zinc-500 font-mono uppercase block">
                          {item.shape || 'rounded'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMoveCard(idx, 'up');
                        }}
                        disabled={idx === 0}
                        className="p-1 rounded text-zinc-400 hover:text-white disabled:opacity-30 cursor-pointer"
                        title="Move Up"
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
                        className="p-1 rounded text-zinc-400 hover:text-white disabled:opacity-30 cursor-pointer"
                        title="Move Down"
                      >
                        <ChevronDown className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCard(idx);
                        }}
                        className="p-1 rounded text-zinc-500 hover:text-red-400 transition cursor-pointer"
                        title="Delete Card"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Active Card Layer Editor */}
          {cardItems.length > 0 && cardItems[selectedCardIdx] && (
            <div className="bg-[#141418] p-2 rounded border border-[#2a2a32] space-y-2">
              <span className="text-[10px] text-purple-300 font-mono uppercase block font-semibold">
                Editing Card #{selectedCardIdx + 1}: {cardItems[selectedCardIdx].title}
              </span>

              {/* Title & Badge */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[9px] text-zinc-400 font-mono uppercase block mb-0.5">
                    Title
                  </label>
                  <input
                    type="text"
                    value={cardItems[selectedCardIdx].title}
                    onChange={(e) => handleUpdateCard(selectedCardIdx, { title: e.target.value })}
                    className="w-full bg-[#101012] border border-[#2c2c32] focus:border-purple-500 rounded px-2 py-0.5 text-xs text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-zinc-400 font-mono uppercase block mb-0.5">
                    Badge
                  </label>
                  <input
                    type="text"
                    value={cardItems[selectedCardIdx].badge || ''}
                    onChange={(e) => handleUpdateCard(selectedCardIdx, { badge: e.target.value })}
                    className="w-full bg-[#101012] border border-[#2c2c32] focus:border-purple-500 rounded px-2 py-0.5 text-xs text-white outline-none"
                  />
                </div>
              </div>

              {/* Card Image Upload */}
              <div>
                <label className="text-[9px] text-zinc-400 font-mono uppercase block mb-1">
                  Card Image (Thumbnail / Background)
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 py-1 px-2 rounded bg-[#1c1c22] hover:bg-[#25252e] border border-[#303038] text-xs text-zinc-200 transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Upload className="w-3 h-3 text-purple-400" />
                    <span>
                      {cardItems[selectedCardIdx].imageSrc ? 'Replace Image' : 'Upload Image as Card'}
                    </span>
                  </button>
                  {cardItems[selectedCardIdx].imageSrc && (
                    <button
                      type="button"
                      onClick={() => handleUpdateCard(selectedCardIdx, { imageSrc: undefined })}
                      className="px-2 py-1 rounded text-[10px] text-red-400 hover:text-red-300 border border-red-900/40 bg-red-950/20 cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/svg+xml,image/webp"
                  className="hidden"
                  onChange={(e) => handleCardImageUpload(e, selectedCardIdx)}
                />
              </div>

              {/* Card Shape for this item */}
              <div>
                <label className="text-[9px] text-zinc-400 font-mono uppercase block mb-1">
                  Card Shape
                </label>
                <div className="grid grid-cols-5 gap-1">
                  {shapes.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => handleUpdateCard(selectedCardIdx, { shape: s.id })}
                      className={`py-1 text-[9px] font-mono rounded border text-center transition cursor-pointer ${
                        (cardItems[selectedCardIdx].shape || 'rounded') === s.id
                          ? 'bg-purple-600/30 text-purple-200 border-purple-500/70 font-semibold'
                          : 'bg-[#18181c] text-zinc-400 border-[#2b2b32]'
                      }`}
                    >
                      {s.label.slice(0, 5)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Card Fill & Border Color */}
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#232328]">
                <div>
                  <label className="text-[9px] text-zinc-400 block mb-0.5">Card Color</label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={cardItems[selectedCardIdx].color || cardColor}
                      onChange={(e) => handleUpdateCard(selectedCardIdx, { color: e.target.value })}
                      className="w-6 h-6 rounded border border-[#3a3a44] bg-transparent cursor-pointer"
                    />
                    <span className="text-[9px] font-mono text-zinc-400 truncate">
                      {cardItems[selectedCardIdx].color || cardColor}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-[9px] text-zinc-400 block mb-0.5">Border Color</label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={cardItems[selectedCardIdx].borderColor || borderColor}
                      onChange={(e) =>
                        handleUpdateCard(selectedCardIdx, { borderColor: e.target.value })
                      }
                      className="w-6 h-6 rounded border border-[#3a3a44] bg-transparent cursor-pointer"
                    />
                    <span className="text-[9px] font-mono text-zinc-400 truncate">
                      {cardItems[selectedCardIdx].borderColor || borderColor}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: SHAPE & BORDER */}
      {activeTab === 'shape' && (
        <div className="space-y-3">
          {/* Card Shape Selector */}
          <div>
            <label className="text-[10px] text-zinc-400 font-mono uppercase block mb-1.5">
              Card Shape Geometry
            </label>
            <div className="grid grid-cols-3 gap-1">
              {shapes.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => updateLayer(selectedLayer.id, { cardShape: s.id })}
                  className={`py-1.5 px-1 rounded text-[10px] font-medium border text-center transition cursor-pointer ${
                    cardShape === s.id
                      ? 'bg-purple-600/30 text-purple-200 border-purple-500/70 shadow-sm'
                      : 'bg-[#121214] text-zinc-400 border-[#2c2c32] hover:bg-[#202026] hover:text-zinc-200'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Border Controls */}
          <div className="bg-[#141418] p-2 rounded border border-[#2a2a32] space-y-2">
            <span className="text-[10px] text-zinc-400 font-mono uppercase block">
              Card Border & Corner Radius
            </span>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-zinc-400 block mb-1">Border Thickness</label>
                <div className="relative flex items-center">
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={borderWidth}
                    onChange={(e) =>
                      updateLayer(selectedLayer.id, {
                        cardBorderWidth: Math.max(0, parseFloat(e.target.value) || 0),
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
                    value={borderColor.startsWith('#') ? borderColor : '#a855f7'}
                    onChange={(e) => updateLayer(selectedLayer.id, { cardBorderColor: e.target.value })}
                    className="w-6 h-6 rounded border border-[#3a3a44] bg-transparent cursor-pointer"
                  />
                  <span className="text-[9px] font-mono text-zinc-400 truncate max-w-[65px]">
                    {borderColor}
                  </span>
                </div>
              </div>
            </div>

            {/* Corner Radius & Style */}
            {cardShape !== 'pill' && cardShape !== 'rect' && (
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#232328]">
                <div>
                  <div className="flex items-center justify-between text-[10px] text-zinc-400 mb-1">
                    <span>Corner Radius</span>
                    <span className="font-mono text-zinc-300 font-semibold">{radius}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="40"
                    value={radius}
                    onChange={(e) =>
                      updateLayer(selectedLayer.id, {
                        cardBorderRadius: parseInt(e.target.value, 10) || 0,
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
                        onClick={() => updateLayer(selectedLayer.id, { cardBorderStyle: bs })}
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
          </div>

          {/* Opacity Animation Reminder */}
          <div className="bg-[#141418] p-2 rounded border border-[#2a2a32] flex items-center gap-2">
            <Eye className="w-4 h-4 text-purple-400 shrink-0" />
            <div className="text-[10px] text-zinc-400 leading-tight">
              <span className="text-zinc-200 font-semibold">Card Opacity Animation:</span> You can
              now add keyframes to <span className="font-mono text-purple-300">Opacity</span> in
              the Transform panel above or timeline to animate the cards fading smoothly!
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
