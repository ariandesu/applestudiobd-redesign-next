"use client";

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Phone, 
  MessageCircle, 
  ShieldCheck, 
  Search, 
  X, 
  MapPin, 
  BatteryMedium,
  ArrowRight
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
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
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

  return (
    <div className="min-h-screen bg-cream text-charcoal overflow-x-hidden relative">
      {/* Light Rays Background */}
      <LightRays
        raysOrigin="top-center"
        raysColor="#b4a896"
        raysSpeed={0.5}
        lightSpread={1.0}
        rayLength={1.8}
        pulsating={true}
        followMouse={true}
        mouseInfluence={0.15}
        className="fixed inset-0"
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
            <div className="flex items-center gap-4">
              <a href="tel:+8801748405669" className="hidden sm:flex items-center gap-2 text-sm font-medium hover:text-indigo-premium transition">
                <Phone className="w-4 h-4" /> Call
              </a>
              <a href="https://wa.me/8801748405669" className="bg-indigo-premium text-white px-4 py-2 rounded-full text-sm font-semibold hover:opacity-90 transition active:scale-95 flex items-center gap-2">
                <MessageCircle className="w-4 h-4" /> WhatsApp
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
              Bangladesh's most transparent Apple price list. 56+ rigorously inspected, 
              fully certified devices backed by a 2-year service guarantee.
            </motion.p>
          </div>
        </section>

        {/* Filters */}
        <div className="sticky top-[72px] z-40 bg-cream/80 backdrop-blur-md border-b border-slate-100 py-4 px-6">
          <div className="max-w-7xl mx-auto flex flex-col gap-4">
            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
              {categories.map(cat => (
                <button 
                  key={cat.id} 
                  onClick={() => setCurrentCategory(cat.id)}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap border",
                    currentCategory === cat.id ? "bg-charcoal text-white border-charcoal shadow-lg" : "bg-white text-slate-600 border-slate-200 hover:border-indigo-premium"
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {budgets.map(b => (
                  <button 
                    key={b.id} 
                    onClick={() => setCurrentBudget(b.id)}
                    className={cn(
                      "px-3 py-1 rounded-full text-[11px] font-medium transition-all whitespace-nowrap border",
                      currentBudget === b.id ? "bg-indigo-premium text-white border-indigo-premium" : "bg-white text-slate-500 border-slate-200 hover:border-indigo-premium"
                    )}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
              <div className="relative w-full sm:flex-1 sm:max-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input 
                  type="text" 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..." 
                  className="w-full pl-9 pr-4 py-1.5 rounded-full border border-slate-200 bg-white text-xs focus:outline-none focus:ring-1 focus:ring-indigo-premium transition" 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Grid */}
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
      className="group bg-white border border-slate-100 rounded-[32px] p-6 transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-2"
    >
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
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-xl font-medium">{product.name}</h3>
          <div className="flex items-center gap-1 text-indigo-premium">
            <BatteryMedium className="w-3 h-3" />
            <span className="text-[10px] font-bold">{product.batteryHealth || '85%+'}</span>
          </div>
        </div>
        <p className="text-slate-500 text-sm font-light line-clamp-2 min-h-[40px]">{product.description}</p>
        <div className="pt-4 flex items-center justify-between border-t border-slate-50">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Price</p>
            <p className="text-lg font-serif font-semibold">{product.priceDisplay}</p>
          </div>
          <a 
            href={`https://wa.me/8801748405669?text=Hi Apple Studio BD, I am interested in ${product.name}`} 
            target="_blank" 
            className="p-3 rounded-full bg-indigo-premium text-white hover:scale-110 transition-transform shadow-lg shadow-indigo-500/30"
          >
            <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </div>
    </motion.div>
  );
}