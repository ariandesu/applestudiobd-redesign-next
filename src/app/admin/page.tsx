"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Package,
  Plus,
  Search,
  LogOut,
  Edit3,
  Trash2,
  X,
  Upload,
  Image as ImageIcon,
  ExternalLink,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { type Product } from '@/lib/constants';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [authChecking, setAuthChecking] = useState(true);
  const [adminUser, setAdminUser] = useState('admin');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Uploading state
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    numericPrice: 0,
    category: 'macbook_m',
    imageUrl: '',
    badge: '',
    batteryHealth: '5Hr +',
    heartNote: 'Grade A+',
    inStock: true,
  });

  // Delete Confirmation Modal
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Status banners
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    // Check auth
    fetch('/api/admin/me')
      .then(async res => {
        if (!res.ok) {
          router.replace('/admin/login');
          return;
        }
        const data = await res.json();
        if (data.user?.username) setAdminUser(data.user.username);
        setAuthChecking(false);
        fetchProducts();
      })
      .catch(() => {
        router.replace('/admin/login');
      });
  }, [router]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data.success && Array.isArray(data.products)) {
        setProducts(data.products);
      }
    } catch {
      showNotify('error', 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const showNotify = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  };

  const filteredProducts = useMemo(() => {
    let list = [...products];
    if (categoryFilter !== 'all') {
      list = list.filter(p => p.category === categoryFilter);
    }
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(p => (p.name || '').toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q));
    }
    return list;
  }, [products, categoryFilter, searchQuery]);

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showNotify('error', 'Image size must be less than 5MB');
      return;
    }

    try {
      setUploading(true);
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        setFormData(prev => ({ ...prev, imageUrl: base64String }));
        setUploading(false);
        showNotify('success', 'Image loaded successfully!');
      };
      reader.onerror = () => {
        setUploading(false);
        showNotify('error', 'Failed to read image file');
      };
      reader.readAsDataURL(file);
    } catch {
      setUploading(false);
      showNotify('error', 'Failed to upload image');
    }
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      numericPrice: 0,
      category: 'macbook_m',
      imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80',
      badge: 'Verified',
      batteryHealth: '5Hr +',
      heartNote: 'Grade A+',
      inStock: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      description: product.description || '',
      price: product.price || String(product.numericPrice || ''),
      numericPrice: product.numericPrice || 0,
      category: product.category || 'macbook_m',
      imageUrl: product.imageUrl || '',
      badge: product.badge || '',
      batteryHealth: product.batteryHealth || '',
      heartNote: product.heartNote || '',
      inStock: product.inStock !== false,
    });
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const numericPrice = parseInt(String(formData.price).replace(/\D/g, ''), 10) || formData.numericPrice || 0;
      const payload = {
        ...formData,
        numericPrice,
      };

      const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save product');

      showNotify('success', editingProduct ? 'Product updated successfully!' : 'New product added successfully!');
      setIsModalOpen(false);
      fetchProducts();
    } catch (err: unknown) {
      if (err instanceof Error) showNotify('error', err.message);
      else showNotify('error', 'Failed to save product');
    }
  };

  const handleDeleteProduct = async (id: number) => {
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete');

      showNotify('success', 'Product deleted successfully.');
      setDeletingId(null);
      fetchProducts();
    } catch (err: unknown) {
      if (err instanceof Error) showNotify('error', err.message);
      else showNotify('error', 'Failed to delete product');
    }
  };

  if (authChecking) {
    return (
      <div className="min-h-screen bg-stone-900 text-stone-300 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 font-sans">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-6 right-6 z-50 animate-fade-in-up">
          <div className={cn(
            "px-5 py-3 rounded-2xl border text-xs font-semibold shadow-2xl flex items-center gap-2",
            notification.type === 'success' 
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300 backdrop-blur-xl"
              : "bg-rose-500/10 border-rose-500/30 text-rose-300 backdrop-blur-xl"
          )}>
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-stone-950/80 backdrop-blur-xl border-b border-stone-800">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-serif font-bold text-sm">
              A
            </div>
            <div>
              <span className="font-serif text-base font-semibold tracking-tight text-white">Apple Studio BD</span>
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full ml-2 font-mono">Admin CMS</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-medium text-stone-400 hover:text-white transition px-3 py-1.5 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Live Site</span>
            </a>
            <div className="h-4 w-px bg-stone-800" />
            <div className="flex items-center gap-3">
              <span className="text-xs text-stone-300 hidden sm:inline">Signed in as <strong className="text-white">{adminUser}</strong></span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 hover:bg-rose-500/20 text-xs font-medium transition cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Dashboard Title & Actions Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
          <div>
            <h1 className="text-2xl font-serif font-medium text-white">Inventory Management</h1>
            <p className="text-xs text-stone-400 font-light mt-1">
              Manage product price list, stock status, specs, and add new arrivals instantly.
            </p>
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold tracking-wide transition shadow-lg shadow-indigo-600/25 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        </div>

        {/* Filters & Search Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Categories Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'all', label: 'All Products' },
              { id: 'macbook_m', label: 'M-Series' },
              { id: 'macbook_intel', label: 'Intel Macs' },
              { id: 'imac', label: 'iMac' },
              { id: 'mac_mini', label: 'Mac Mini' },
              { id: 'ipad', label: 'iPad' },
              { id: 'accessories', label: 'Accessories' },
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id)}
                className={cn(
                  "px-3.5 py-1.5 rounded-xl text-xs font-medium transition whitespace-nowrap border cursor-pointer",
                  categoryFilter === cat.id
                    ? "bg-white text-stone-950 border-white font-semibold shadow"
                    : "bg-white/5 text-stone-400 border-white/10 hover:bg-white/10 hover:text-white"
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-9 pr-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-stone-100 placeholder:text-stone-500 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400 transition"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-xl shadow-2xl">
          <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between text-xs text-stone-400">
            <span>Showing <strong className="text-white">{filteredProducts.length}</strong> products</span>
            <span>Live database synchronized</span>
          </div>

          {loading ? (
            <div className="py-20 text-center text-stone-400 text-xs">Loading products...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-20 text-center space-y-3">
              <Package className="w-8 h-8 text-stone-600 mx-auto" />
              <p className="text-xs text-stone-400">No products found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/5 text-stone-400 uppercase font-mono tracking-wider border-b border-white/10">
                  <tr>
                    <th className="py-3 px-4">ID</th>
                    <th className="py-3 px-4">Product</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Price</th>
                    <th className="py-3 px-4">Badge</th>
                    <th className="py-3 px-4">Battery</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-white/[0.02] transition group">
                      <td className="py-3 px-4 font-mono text-stone-500">#{p.id}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-stone-800 overflow-hidden relative shrink-0 border border-white/10">
                            <Image
                              src={p.imageUrl}
                              alt={p.name}
                              fill
                              sizes="40px"
                              className="object-contain p-1"
                              onError={(e) => { (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=100'; }}
                            />
                          </div>
                          <div>
                            <p className="font-serif font-medium text-stone-100 max-w-xs truncate">{p.name}</p>
                            <p className="text-[10px] text-stone-400 truncate max-w-xs">{p.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] text-stone-300 font-mono">
                          {p.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-serif font-semibold text-emerald-400">
                        {p.priceDisplay || `৳ ${p.numericPrice?.toLocaleString()}`}
                      </td>
                      <td className="py-3 px-4">
                        {p.badge ? (
                          <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-semibold">
                            {p.badge}
                          </span>
                        ) : (
                          <span className="text-stone-500">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-stone-300 font-mono text-[11px]">
                        {p.batteryHealth || '-'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(p)}
                            className="p-2 rounded-xl bg-white/5 hover:bg-indigo-600/20 text-stone-300 hover:text-indigo-300 border border-white/10 transition cursor-pointer"
                            title="Edit Product"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingId(p.id)}
                            className="p-2 rounded-xl bg-white/5 hover:bg-rose-600/20 text-stone-300 hover:text-rose-300 border border-white/10 transition cursor-pointer"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-stone-800">
              <h2 className="font-serif text-lg font-medium text-white">
                {editingProduct ? `Edit Product #${editingProduct.id}` : 'Add New Product'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-stone-400 hover:text-white p-1 rounded-xl bg-white/5 border border-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-stone-400 mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. MacBook Air M2 13.3 inch 8-256GB"
                  required
                  className="w-full px-4 py-2.5 rounded-2xl bg-white/5 border border-stone-700 text-stone-100 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-stone-400 mb-1">
                    Price (Display & Numeric) *
                  </label>
                  <input
                    type="text"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="e.g. 115000 or ৳ 1,15,000"
                    required
                    className="w-full px-4 py-2.5 rounded-2xl bg-white/5 border border-stone-700 text-stone-100 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-stone-400 mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-stone-900 border border-stone-700 text-stone-100 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value="macbook_m">M-Series (MacBook)</option>
                    <option value="macbook_intel">Intel Macs</option>
                    <option value="imac">iMac</option>
                    <option value="mac_mini">Mac Mini</option>
                    <option value="ipad">iPad</option>
                    <option value="accessories">Accessories</option>
                  </select>
                </div>
              </div>

              {/* Image Upload / URL Section */}
              <div className="space-y-2">
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-stone-400">
                  Product Image (Upload File or URL) *
                </label>
                
                <div className="flex flex-col sm:flex-row gap-3 items-center">
                  {/* Image Preview Box */}
                  <div className="w-16 h-16 rounded-2xl bg-stone-800 border border-stone-700 relative overflow-hidden shrink-0 flex items-center justify-center">
                    {formData.imageUrl ? (
                      <Image
                        src={formData.imageUrl}
                        alt="Preview"
                        fill
                        sizes="64px"
                        className="object-contain p-1"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=100'; }}
                      />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-stone-500" />
                    )}
                  </div>

                  <div className="flex-1 w-full space-y-2">
                    {/* URL Input */}
                    <input
                      type="text"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      placeholder="Paste image URL (https://...) or upload below"
                      required
                      className="w-full px-4 py-2 rounded-2xl bg-white/5 border border-stone-700 text-stone-100 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />

                    {/* File Upload Button */}
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageFileChange}
                        accept="image/*"
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-stone-200 text-xs font-medium border border-stone-700 transition cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{uploading ? 'Processing Image...' : 'Upload Image File (JPG/PNG)'}</span>
                      </button>
                      <span className="text-[10px] text-stone-500">Max 5MB</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-stone-400 mb-1">
                    Badge (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    placeholder="e.g. Best Value, Verified"
                    className="w-full px-4 py-2.5 rounded-2xl bg-white/5 border border-stone-700 text-stone-100 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-stone-400 mb-1">
                    Battery Health
                  </label>
                  <input
                    type="text"
                    value={formData.batteryHealth}
                    onChange={(e) => setFormData({ ...formData, batteryHealth: e.target.value })}
                    placeholder="e.g. 5Hr + or 95%"
                    className="w-full px-4 py-2.5 rounded-2xl bg-white/5 border border-stone-700 text-stone-100 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-stone-400 mb-1">
                    Heart Note / Grade
                  </label>
                  <input
                    type="text"
                    value={formData.heartNote}
                    onChange={(e) => setFormData({ ...formData, heartNote: e.target.value })}
                    placeholder="e.g. 88-100% or Grade A+"
                    className="w-full px-4 py-2.5 rounded-2xl bg-white/5 border border-stone-700 text-stone-100 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-stone-400 mb-1">
                  Description / Specs Note
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  placeholder="Detailed specs, RAM, SSD upgrades, battery backup..."
                  className="w-full px-4 py-2.5 rounded-2xl bg-white/5 border border-stone-700 text-stone-100 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-stone-300 text-xs font-medium transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25 transition cursor-pointer"
                >
                  {editingProduct ? 'Save Changes' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl w-full max-w-md p-6 space-y-6 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h3 className="font-serif text-lg font-medium text-white">Delete Product #{deletingId}?</h3>
              <p className="text-xs text-stone-400 font-light">
                This action is permanent and will immediately remove the product from the live price list website.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeletingId(null)}
                className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-stone-300 text-xs font-medium transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteProduct(deletingId)}
                className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-600/25 transition cursor-pointer"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
