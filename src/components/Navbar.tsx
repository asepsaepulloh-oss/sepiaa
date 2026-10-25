'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Clock, KeyRound, Menu, X, ShieldAlert } from 'lucide-react';
import { BearHead, BearPaw } from './BearIcon';

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
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  // Periksa apakah admin sedang login di session browser ini
  useEffect(() => {
    async function checkAdminAuth() {
      try {
        const res = await fetch('/api/admin/check');
        const data = await res.json();
        if (data.authenticated) {
          setIsAdminLoggedIn(true);
        }
      } catch {
        setIsAdminLoggedIn(false);
      }
    }
    checkAdminAuth();
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#120d0a]/92 backdrop-blur-md border-b border-[#31241b]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo - Sepia Bear */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#c86d34] via-[#9e4c1e] to-[#612c10] flex items-center justify-center shadow-lg shadow-amber-950/40 text-[#fbf6f0] group-hover:scale-105 transition-transform border border-[#dca368]/30">
            <BearHead className="w-7 h-7 text-[#faefe3]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-lg tracking-tight text-white group-hover:text-[#e59a44] transition-colors">
                SEPIA<span className="text-[#e59a44]">BEAR</span>
              </span>
              <span className="text-[10px] bg-[#3a281c] text-[#e59a44] border border-[#6b472e] px-1.5 py-0.5 rounded-md font-bold tracking-wider flex items-center gap-1">
                <BearPaw className="w-2.5 h-2.5 text-[#e59a44]" />
                <span>STORE</span>
              </span>
            </div>
            <p className="text-[11px] text-[#bcaaa0] leading-none">Akun Beruang Legal &amp; Bergaransi</p>
          </div>
        </Link>

        {/* Search Bar Desktop */}
        <div className="hidden md:flex flex-1 max-w-md relative">
          <Search className="w-4 h-4 text-[#8a7266] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Cari akun Netflix, Spotify, Canva, ChatGPT..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-[#1c140e] border border-[#3b2c22] focus:border-[#c86d34] rounded-xl pl-10 pr-4 py-2 text-sm text-[#fbf6f0] placeholder-[#8a7266] focus:outline-none transition-colors"
          />
        </div>

        {/* Action Buttons */}
        <div className="hidden sm:flex items-center gap-3">
          <button
            onClick={onOpenTrack}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#221812] hover:bg-[#2d2018] text-[#e8dbce] hover:text-white border border-[#3d2e23] transition-colors cursor-pointer"
          >
            <Clock className="w-4 h-4 text-[#e59a44]" />
            <span>Lacak Pesanan</span>
          </button>

          {/* Tombol Panel Admin: HANYA tampil jika admin sudah login */}
          {isAdminLoggedIn && (
            <Link
              href="/admin"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-[#c86d34]/20 hover:bg-[#c86d34]/30 text-[#e59a44] border border-[#c86d34]/40 transition-colors animate-in fade-in"
              title="Panel Admin Aktif"
            >
              <KeyRound className="w-3.5 h-3.5 text-[#e59a44]" />
              <span>Dashboard Admin</span>
            </Link>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="sm:hidden p-2 text-[#bcaaa0] hover:text-white rounded-lg focus:outline-none"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-[#31241b] bg-[#160f0b] px-4 py-3 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-[#8a7266] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari akun..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-[#1c140e] border border-[#3b2c22] rounded-xl pl-10 pr-4 py-2 text-sm text-[#fbf6f0] placeholder-[#8a7266] focus:outline-none"
            />
          </div>
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenTrack();
              }}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold bg-[#221812] text-[#fbf6f0] border border-[#3d2e23]"
            >
              <Clock className="w-4 h-4 text-[#e59a44]" />
              Lacak Pesanan
            </button>

            {/* Tombol Admin di Mobile: HANYA muncul jika sudah login */}
            {isAdminLoggedIn && (
              <Link
                href="/admin"
                className="flex items-center justify-center px-4 py-2.5 rounded-xl text-xs font-bold bg-[#c86d34]/20 text-[#e59a44] border border-[#c86d34]/40"
              >
                Admin
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
