"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/me')
      .then(res => {
        if (res.ok) router.replace('/admin');
      })
      .catch(() => {});
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to login');
      }

      router.push('/admin');
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError('Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden font-sans">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/10 border border-white/10 text-white font-serif text-2xl shadow-xl">
            A
          </div>
          <h1 className="text-2xl font-serif font-medium tracking-tight text-white">
            Apple Studio <span className="italic text-indigo-400">BD</span>
          </h1>
          <p className="text-xs text-stone-400 font-light tracking-wide uppercase">
            Admin & Moderator Portal
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="flex items-center gap-2 pb-2 border-b border-white/10 text-xs font-semibold text-stone-300">
            <Lock className="w-4 h-4 text-indigo-400" />
            <span>Secure Sign In</span>
          </div>

          {error && (
            <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] uppercase tracking-wider font-semibold text-stone-400 mb-1.5">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin or moderator username"
                required
                className="w-full px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-stone-100 placeholder:text-stone-500 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400 transition"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider font-semibold text-stone-400 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                  className="w-full pl-4 pr-11 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-stone-100 placeholder:text-stone-500 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold tracking-wide transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>{loading ? 'Signing in...' : 'Sign In to Portal'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </form>

          <div className="pt-2 text-center border-t border-white/5 text-[11px] text-stone-400">
            <p>Master Admin: <span className="font-mono text-stone-300">admin</span> / <span className="font-mono text-stone-300">applestudio2026!</span></p>
          </div>
        </div>

        <div className="text-center">
          <a
            href="/"
            className="text-xs text-stone-400 hover:text-stone-200 transition underline underline-offset-4"
          >
            ← Return to public website
          </a>
        </div>
      </div>
    </div>
  );
}
