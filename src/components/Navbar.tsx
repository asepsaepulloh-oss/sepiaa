'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, ShieldCheck, ShoppingBag, Clock, KeyRound, Menu, X } from 'lucide-react';

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenTrack: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  searchQuery,
  onSearchChange,
  onOpenTrack,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#09090b]/90 backdrop-blur-md border-b border-[#23232e]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
            <ShoppingBag className="w-5 h-5 text-zinc-950 font-bold" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-tight text-white group-hover:text-amber-400 transition-colors">
                SEPIA<span className="text-amber-500">STORE</span>
              </span>
              <span className="text-[10px] bg-amber-500/15 text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded font-semibold tracking-wider">
                PREMIUM
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-none">Akun Resmi & Bergaransi</p>
          </div>
        </Link>

        {/* Search Bar Desktop */}
        <div className="hidden md:flex flex-1 max-w-md relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Cari akun Netflix, Spotify, Canva, ChatGPT..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-[#14141b] border border-[#272733] focus:border-amber-500/60 rounded-xl pl-10 pr-4 py-2 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none transition-colors"
          />
        </div>

        {/* Action Buttons */}
        <div className="hidden sm:flex items-center gap-3">
          <button
            onClick={onOpenTrack}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#171720] hover:bg-[#20202c] text-zinc-300 hover:text-white border border-[#272733] transition-colors cursor-pointer"
          >
            <Clock className="w-4 h-4 text-amber-500" />
            <span>Lacak Pesanan</span>
          </button>

          <Link
            href="/admin"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-[#14141b] transition-colors"
            title="Masuk ke Admin Dashboard"
          >
            <KeyRound className="w-4 h-4" />
            <span className="hidden lg:inline">Admin</span>
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="sm:hidden p-2 text-zinc-400 hover:text-white rounded-lg focus:outline-none"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-[#23232e] bg-[#0d0d12] px-4 py-3 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari akun..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-[#14141b] border border-[#272733] rounded-xl pl-10 pr-4 py-2 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none"
            />
          </div>
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenTrack();
              }}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold bg-[#171720] text-zinc-200 border border-[#272733]"
            >
              <Clock className="w-4 h-4 text-amber-500" />
              Lacak Pesanan
            </button>
            <Link
              href="/admin"
              className="flex items-center justify-center px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#171720] text-zinc-300 border border-[#272733]"
            >
              Admin
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
