"use client";

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Phone,
  MessageCircle,
  Search,
  X,
  BatteryMedium,
  SlidersHorizontal,
  ChevronDown,
  RotateCcw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import data from '@/data/data.json';
import { type Product, type SiteData } from '@/lib/constants';
import LightRays from '@/components/LightRays';

const SiteData = data as SiteData;

export default function Home() {
  const [currentCategory, setCurrentCategory] = useState('all');
  const [currentBudget, setCurrentBudget] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const filteredProducts = useMemo(() => {
    let list = [...SiteData.products];
    if (currentCategory !== 'all') list = list.filter(p => p.category === currentCategory);
    if (currentBudget !== 'all') list = list.filter(p => p.budgetBracket === currentBudget);
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(p => (p.name || '').toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q));
    }
    if (sortBy === 'price_asc') list.sort((a, b) => a.numericPrice - b.numericPrice);
    else if (sortBy === 'price_desc') list.sort((a, b) => b.numericPrice - a.numericPrice);
    return list;
  }, [currentCategory, currentBudget, searchQuery, sortBy]);

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'macbook_m', label: 'M-Series' },
    { id: 'macbook_intel', label: 'Intel' },
    { id: 'imac', label: 'iMac' },
    { id: 'mac_mini', label: 'Mini' },
    { id: 'ipad', label: 'iPad' },
    { id: 'accessories', label: 'Accessories' },
  ];

  const budgets = [
    { id: 'all', label: 'All' },
    { id: 'under_30k', label: '< ৳30K' },
    { id: '30_50k', label: '৳30-50K' },
    { id: '50_90k', label: '৳50-90K' },
    { id: '90_130k', label: '৳90-130K' },
    { id: 'above_130k', label: '> ৳130K' },
  ];

  const currentCategoryLabel = categories.find(c => c.id === currentCategory)?.label || 'All';
  const currentBudgetLabel = budgets.find(b => b.id === currentBudget)?.label || 'All';
  const hasActiveFilters = currentCategory !== 'all' || currentBudget !== 'all';

  return (
    <div className="min-h-screen bg-cream text-charcoal overflow-x-clip relative">
      {/* Light Rays Background (from /Users/mahirfaisal/Downloads/prompts_bundle/light-rays-background) */}
      <LightRays
        raysOrigin="top-center"
        raysColor="#b4a896"
        raysSpeed={0.8}
        lightSpread={1.2}
        rayLength={2.5}
        pulsating={true}
        fadeDistance={1.2}
        saturation={0.85}
        followMouse={true}
        mouseInfluence={0.15}
        noiseAmount={0.02}
        distortion={0.05}
        className="fixed inset-0 pointer-events-none"
      />

      {/* Content Layer */}
      <div className="relative z-10">
        {/* Header */}
        <nav className="fixed top-0 w-full z-50 bg-cream/70 backdrop-blur-xl border-b border-slate-200/50">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="w-9 h-9 rounded-full bg-charcoal text-cream flex items-center justify-center font-serif text-lg">A</div>
              <span className="font-serif text-lg font-semibold tracking-tight">Apple Studio <span className="italic text-indigo-premium">BD</span></span>
            </div>
            
            <div className="flex items-center gap-6">
              <a href="tel:+8801748405669" className="hidden sm:flex items-center gap-2 text-sm font-medium hover:text-indigo-premium transition">
                <Phone className="w-4 h-4" />
                <span>Call</span>
              </a>
              <a 
                href="https://wa.me/8801748405669" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-indigo-premium hover:bg-indigo-700 text-white px-5 py-2 rounded-full text-xs font-semibold tracking-wide shadow-lg shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>
        </nav>

        {/* Hero */}
        <section className="relative pt-32 pb-20 px-6">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="inline-block px-3 py-1 rounded-full bg-warm-gold/10 text-charcoal text-[10px] font-bold tracking-widest uppercase border border-warm-gold/30"
            >
              Verified Dhanmondi Store
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="text-4xl sm:text-6xl lg:text-7xl font-serif font-medium leading-[1.1] tracking-tight"
            >
              Organic Intelligence. <br />
              <span className="italic text-indigo-premium">Pure Transparency.</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto font-light leading-relaxed"
            >
              Bangladesh&apos;s most transparent Apple price list. 56+ rigorously inspected, 
              fully certified devices backed by a 2-year service guarantee.
            </motion.p>
          </div>
        </section>

        {/* Sticky Filters Section */}
        <div className="sticky top-[68px] z-40 bg-cream/80 backdrop-blur-md border-b border-slate-100 py-3.5 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            {/* Mobile View: Search + Filter Dropdown Menu */}
            <div className="flex sm:hidden flex-col gap-2.5">
              <div className="flex items-center gap-2">
                {/* Search Input */}
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    value={searchQuery} 
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search devices..." 
                    className="w-full pl-9 pr-8 py-2 rounded-2xl border border-slate-200/80 bg-white/90 text-xs text-charcoal placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-premium transition" 
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Filter Dropdown Menu Button */}
                <button
                  type="button"
                  onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
                  className={cn(
                    "flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-medium border transition-all shrink-0",
                    isMobileFilterOpen 
                      ? "bg-charcoal text-white border-charcoal shadow-md"
                      : hasActiveFilters
                        ? "bg-indigo-50 text-indigo-premium border-indigo-200 shadow-sm"
                        : "bg-white/90 text-slate-700 border-slate-200/80 hover:border-slate-300"
                  )}
                  aria-expanded={isMobileFilterOpen}
                  aria-label="Filter products dropdown"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Filters</span>
                  {hasActiveFilters && (
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-premium" />
                  )}
                  <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-200", isMobileFilterOpen && "rotate-180")} />
                </button>
              </div>

              {/* Active filters summary pills on mobile */}
              {hasActiveFilters && !isMobileFilterOpen && (
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] scrollbar-none">
                  <span className="text-slate-400 font-medium whitespace-nowrap text-[10px]">Active:</span>
                  {currentCategory !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-charcoal text-white text-[10px] whitespace-nowrap">
                      {currentCategoryLabel}
                      <button onClick={() => setCurrentCategory('all')} className="hover:opacity-75">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {currentBudget !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-premium text-white text-[10px] whitespace-nowrap">
                      {currentBudgetLabel}
                      <button onClick={() => setCurrentBudget('all')} className="hover:opacity-75">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  <button
                    onClick={() => { setCurrentCategory('all'); setCurrentBudget('all'); }}
                    className="text-slate-400 hover:text-indigo-premium text-[10px] underline ml-1 whitespace-nowrap"
                  >
                    Clear
                  </button>
                </div>
              )}

              {/* Mobile Filter Dropdown Menu Container */}
              <AnimatePresence>
                {isMobileFilterOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: -6 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -6 }}
                    transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden bg-white/95 backdrop-blur-xl border border-slate-200 rounded-3xl p-4 shadow-2xl space-y-4"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="font-serif text-sm font-semibold text-charcoal">Filters</span>
                        <span className="text-[11px] text-slate-400">({filteredProducts.length} devices)</span>
                      </div>
                      {hasActiveFilters && (
                        <button
                          onClick={() => { setCurrentCategory('all'); setCurrentBudget('all'); }}
                          className="flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-indigo-premium"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Reset</span>
                        </button>
                      )}
                    </div>

                    {/* Category Filter Dropdown */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500">
                          Product Category
                        </label>
                        <span className="text-[11px] font-medium text-indigo-premium">{currentCategoryLabel}</span>
                      </div>

                      {/* Dropdown Select */}
                      <div className="relative">
                        <select
                          value={currentCategory}
                          onChange={(e) => setCurrentCategory(e.target.value)}
                          className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 pr-10 text-xs font-medium text-charcoal focus:outline-none focus:ring-1 focus:ring-indigo-premium"
                        >
                          {categories.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.label} {c.id === 'all' ? `(${SiteData.products.length})` : `(${SiteData.products.filter(p => p.category === c.id).length})`}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      </div>

                      {/* Touch Pills for quick selection */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {categories.map((cat) => (
                          <button
                            key={cat.id}
                            onClick={() => setCurrentCategory(cat.id)}
                            className={cn(
                              "px-3 py-1 rounded-full text-[11px] font-medium transition-all border",
                              currentCategory === cat.id
                                ? "bg-charcoal text-white border-charcoal shadow-sm"
                                : "bg-slate-50 text-slate-600 border-slate-200/70 hover:bg-slate-100"
                            )}
                          >
                            {cat.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Price Range Filter Dropdown */}
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500">
                          Price Range
                        </label>
                        <span className="text-[11px] font-medium text-indigo-premium">{currentBudgetLabel}</span>
                      </div>

                      {/* Dropdown Select */}
                      <div className="relative">
                        <select
                          value={currentBudget}
                          onChange={(e) => setCurrentBudget(e.target.value)}
                          className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 pr-10 text-xs font-medium text-charcoal focus:outline-none focus:ring-1 focus:ring-indigo-premium"
                        >
                          {budgets.map((b) => (
                            <option key={b.id} value={b.id}>
                              {b.label} {b.id === 'all' ? `(${SiteData.products.length})` : `(${SiteData.products.filter(p => p.budgetBracket === b.id).length})`}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      </div>

                      {/* Touch Pills for quick selection */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {budgets.map((b) => (
                          <button
                            key={b.id}
                            onClick={() => setCurrentBudget(b.id)}
                            className={cn(
                              "px-3 py-1 rounded-full text-[11px] font-medium transition-all border",
                              currentBudget === b.id
                                ? "bg-indigo-premium text-white border-indigo-premium shadow-sm"
                                : "bg-slate-50 text-slate-600 border-slate-200/70 hover:bg-slate-100"
                            )}
                          >
                            {b.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Close / Done Action */}
                    <div className="pt-2">
                      <button
                        onClick={() => setIsMobileFilterOpen(false)}
                        className="w-full py-2.5 rounded-2xl bg-charcoal text-white text-xs font-semibold hover:bg-charcoal/90 transition shadow-md"
                      >
                        Done • View {filteredProducts.length} Devices
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Desktop View: Studio Control Bar */}
            <div className="hidden sm:block space-y-3">
              {/* Top Row: Categories Segmented Control + Search */}
              <div className="flex items-center justify-between gap-4">
                {/* Segmented Category Tabs */}
                <div className="inline-flex items-center p-1 rounded-full bg-stone-200/50 border border-stone-200/80 backdrop-blur-sm shadow-inner overflow-x-auto scrollbar-none max-w-full shrink-0">
                  {categories.map((cat) => {
                    const count = cat.id === 'all' 
                      ? SiteData.products.length 
                      : SiteData.products.filter(p => p.category === cat.id).length;
                    const isActive = currentCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setCurrentCategory(cat.id)}
                        className={cn(
                          "relative px-3.5 lg:px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap shrink-0 select-none",
                          isActive
                            ? "bg-charcoal text-white shadow-sm font-semibold"
                            : "text-slate-600 hover:text-charcoal hover:bg-white/60"
                        )}
                      >
                        <span className="whitespace-nowrap">{cat.label}</span>
                        <span
                          className={cn(
                            "text-[10px] px-1.5 py-0.2 rounded-full font-mono",
                            isActive ? "bg-white/20 text-white" : "bg-stone-300/60 text-slate-500"
                          )}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Search Input */}
                <div className="relative min-w-[200px] w-64 lg:w-72 shrink-0">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search 56 verified devices..."
                    className="w-full pl-9 pr-8 py-2 rounded-full border border-stone-200/90 bg-white/90 text-xs text-charcoal placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-premium focus:border-indigo-premium transition shadow-xs"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Bottom Row: Budget Filters + Sort Dropdown + Device Counter */}
              <div className="flex items-center justify-between gap-4 pt-1.5 border-t border-stone-200/50">
                {/* Left: Budget Bracket Filter */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                    Budget
                  </span>
                  <div className="inline-flex items-center gap-1 p-0.5 rounded-full bg-stone-200/40 border border-stone-200/60 overflow-x-auto scrollbar-none">
                    {budgets.map((b) => {
                      const isActive = currentBudget === b.id;
                      return (
                        <button
                          key={b.id}
                          onClick={() => setCurrentBudget(b.id)}
                          className={cn(
                            "px-3 py-1 rounded-full text-[11px] transition-all duration-200 font-medium whitespace-nowrap",
                            isActive
                              ? "bg-charcoal text-white shadow-xs font-semibold"
                              : "text-slate-600 hover:text-charcoal hover:bg-white/60"
                          )}
                        >
                          {b.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Clear/Reset button if filters active */}
                  {hasActiveFilters && (
                    <button
                      onClick={() => { setCurrentCategory('all'); setCurrentBudget('all'); setSearchQuery(''); }}
                      className="inline-flex items-center gap-1 ml-2 text-[11px] text-slate-500 hover:text-indigo-premium font-medium transition"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset</span>
                    </button>
                  )}
                </div>

                {/* Right: Sort Dropdown & Results Counter */}
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400 font-light hidden lg:inline">
                    Showing <span className="font-medium text-charcoal">{filteredProducts.length}</span> devices
                  </span>

                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="appearance-none bg-white/90 border border-stone-200/90 rounded-full pl-3.5 pr-8 py-1.5 text-xs font-medium text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-premium cursor-pointer transition shadow-xs"
                    >
                      <option value="featured">Sort: Featured</option>
                      <option value="price_asc">Price: Low to High</option>
                      <option value="price_desc">Price: High to Low</option>
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <main className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </AnimatePresence>
          </div>
          {filteredProducts.length === 0 && (
            <div className="text-center py-20">
              <p className="text-slate-500 font-light">No devices found matching your criteria.</p>
              <button
                onClick={() => { setCurrentCategory('all'); setCurrentBudget('all'); setSearchQuery(''); }}
                className="mt-4 px-5 py-2 rounded-full bg-charcoal text-white text-xs font-medium hover:bg-slate-800 transition"
              >
                Reset Filters
              </button>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="bg-charcoal text-cream pt-20 pb-12 px-6 rounded-t-[40px]">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <h2 className="text-3xl font-serif font-medium">Visit our showroom.</h2>
              <p className="text-slate-400 font-light leading-relaxed max-w-md">
                Level 3, Shop 3056, Rifles Square, Shimanto Shambhar Mall, Dhanmondi, Dhaka, Bangladesh.
                Open everyday 11:00 AM – 8:30 PM (Closed Tuesdays).
              </p>
              <div className="flex items-center gap-4">
                <a href="https://wa.me/8801748405669" className="bg-indigo-premium text-white px-6 py-3 rounded-full text-sm font-semibold flex items-center gap-2 hover:opacity-90 transition">
                  <MessageCircle className="w-4 h-4" /> Request Visit
                </a>
                <a href="tel:+8801748405669" className="px-6 py-3 rounded-full border border-slate-700 text-sm font-semibold hover:bg-slate-800 transition">
                  Call Store
                </a>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-8 text-sm">
              <div className="space-y-4">
                <p className="font-serif text-lg">Service</p>
                <ul className="space-y-2 text-slate-400 font-light">
                  <li>10-Day Replacement</li>
                  <li>2-Year Service Warranty</li>
                  <li>OEM Certification</li>
                </ul>
              </div>
              <div className="space-y-4">
                <p className="font-serif text-lg">Socials</p>
                <ul className="space-y-2 text-slate-400 font-light">
                  <li>
                    <a href={SiteData.storeInfo.socials.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-cream transition">Facebook</a>
                  </li>
                  <li>
                    <a href={SiteData.storeInfo.socials.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-cream transition">Instagram</a>
                  </li>
                  <li>
                    <a href={SiteData.storeInfo.socials.tiktok} target="_blank" rel="noopener noreferrer" className="hover:text-cream transition">TikTok</a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
            <p>© 2026 Apple Studio BD. All rights reserved.</p>
            <p>Designed with Organic Fluid Intelligence</p>
          </div>
        </footer>
      </div>
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="group bg-white border border-slate-100 rounded-[32px] p-6 transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-2 flex flex-col justify-between"
    >
      <div>
        <div className="aspect-square rounded-2xl bg-slate-50 overflow-hidden mb-6 relative">
          <Image 
            src={product.imageUrl} 
            alt={product.name} 
            fill
            sizes="(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 30vw"
            className="object-contain p-6 group-hover:scale-105 transition-transform duration-700"
            onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80'; }}
          />
          <div className="absolute top-4 right-4 px-2 py-1 rounded-full bg-white/80 backdrop-blur text-[10px] font-bold text-indigo-premium border border-indigo-100">
            {product.badge || 'Verified'}
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-serif text-xl font-medium min-w-0">{product.name}</h3>
            <div className="flex items-center gap-1 text-indigo-premium shrink-0 whitespace-nowrap">
              <BatteryMedium className="w-3 h-3" />
              <span className="text-[10px] font-bold">{product.batteryHealth || '85%+'}</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 font-light line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>
      </div>

      <div className="pt-6 mt-6 flex items-center justify-between gap-3 border-t border-slate-100">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Price</p>
          <p className="text-lg font-serif font-semibold text-charcoal">{product.priceDisplay}</p>
        </div>
        <a 
          href={`https://wa.me/8801748405669?text=${encodeURIComponent(`Hi Apple Studio BD, I am interested in ${product.name} (${product.priceDisplay})`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-full bg-indigo-premium text-white text-xs font-semibold hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/25 transition-all shrink-0"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          <span>Know more in WhatsApp</span>
        </a>
      </div>
    </motion.div>
  );
}
