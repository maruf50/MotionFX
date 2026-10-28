'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Type, Search, Check, ChevronDown, Sparkles } from 'lucide-react';
import {
  GOOGLE_FONTS_CATALOG,
  FONT_CATEGORIES,
  FontCategoryId,
  loadGoogleFont,
  GoogleFont,
} from '@/modules/fonts/googleFonts';

interface GoogleFontPickerProps {
  value?: string;
  onChange: (fontFamily: string) => void;
  compact?: boolean;
}

export function GoogleFontPicker({
  value = 'Inter',
  onChange,
  compact = false,
}: GoogleFontPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<FontCategoryId>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Preload currently selected font
  useEffect(() => {
    if (value) {
      loadGoogleFont(value);
    }
  }, [value]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  const filteredFonts = useMemo(() => {
    return GOOGLE_FONTS_CATALOG.filter((font) => {
      const matchesCategory =
        selectedCategory === 'all' || font.category === selectedCategory;
      const matchesSearch =
        search.trim() === '' ||
        font.name.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, search]);

  // Load preview fonts on hover or list render
  const handleMouseEnterFont = (fontName: string) => {
    loadGoogleFont(fontName);
  };

  const handleSelectFont = (fontName: string) => {
    loadGoogleFont(fontName);
    onChange(fontName);
    setIsOpen(false);
  };

  return (
    <div className="relative font-sans" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full bg-[#121214] border border-[#2c2c32] hover:border-purple-500/60 rounded px-2.5 py-1.5 text-xs text-white flex items-center justify-between gap-2 transition cursor-pointer ${
          isOpen ? 'ring-1 ring-purple-500 border-purple-500' : ''
        }`}
        title="Choose a free Google Font"
      >
        <div className="flex items-center gap-2 truncate">
          <Type className="w-3.5 h-3.5 text-purple-400 shrink-0" />
          <span
            className="truncate font-medium text-zinc-100"
            style={{ fontFamily: value ? `"${value}", sans-serif` : 'inherit' }}
          >
            {value || 'Inter'}
          </span>
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-zinc-400 shrink-0 transition-transform ${
            isOpen ? 'rotate-180 text-purple-400' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={`absolute left-0 mt-1 bg-[#161619] border border-[#2d2d35] rounded-xl shadow-2xl z-50 p-2.5 flex flex-col gap-2 animate-in fade-in zoom-in-95 duration-100 ${
            compact ? 'w-64 -top-80' : 'w-72 max-h-96'
          }`}
          style={{ minWidth: '260px' }}
        >
          {/* Header & Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search 35+ Google Fonts..."
              className="w-full bg-[#101012] border border-[#28282e] focus:border-purple-500 rounded-lg pl-8 pr-2 py-1.5 text-xs text-white placeholder-zinc-500 outline-none"
            />
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none text-[10px]">
            {FONT_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2 py-0.5 rounded-full shrink-0 transition cursor-pointer font-medium ${
                  selectedCategory === cat.id
                    ? 'bg-purple-600 text-white font-semibold'
                    : 'bg-[#1f1f24] text-zinc-400 hover:text-white hover:bg-[#282830]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Font List */}
          <div className="overflow-y-auto max-h-56 space-y-0.5 pr-1 divide-y divide-[#222228]/50">
            {filteredFonts.length === 0 ? (
              <div className="py-6 text-center text-xs text-zinc-500">
                No fonts matching &ldquo;{search}&rdquo;
              </div>
            ) : (
              filteredFonts.map((font) => {
                const isSelected = value === font.name;
                return (
                  <button
                    key={font.name}
                    type="button"
                    onMouseEnter={() => handleMouseEnterFont(font.name)}
                    onClick={() => handleSelectFont(font.name)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between gap-2 transition cursor-pointer group ${
                      isSelected
                        ? 'bg-purple-600/20 text-purple-200 border border-purple-500/30'
                        : 'hover:bg-[#202026] text-zinc-300 hover:text-white'
                    }`}
                  >
                    <div className="flex flex-col truncate">
                      <span
                        className="text-sm truncate"
                        style={{ fontFamily: `"${font.name}", sans-serif` }}
                      >
                        {font.name}
                      </span>
                      <span className="text-[9px] text-zinc-500 capitalize tracking-wider flex items-center gap-1">
                        {font.popular && (
                          <span className="text-amber-400 text-[8px] flex items-center gap-0.5">
                            <Sparkles className="w-2.5 h-2.5" /> Popular
                          </span>
                        )}
                        <span>{font.category}</span>
                      </span>
                    </div>

                    {isSelected && (
                      <Check className="w-4 h-4 text-purple-400 shrink-0" />
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Footer note */}
          <div className="pt-1 border-t border-[#25252b] text-[10px] text-zinc-500 flex items-center justify-between">
            <span>Free Google Fonts</span>
            <span className="font-mono text-zinc-400">{filteredFonts.length} available</span>
          </div>
        </div>
      )}
    </div>
  );
}
