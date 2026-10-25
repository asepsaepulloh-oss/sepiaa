'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Clock, KeyRound, Menu, X } from 'lucide-react';
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
    <header className="sticky top-0 z-40 w-full bg-[#19120c] border-b border-[#3d291b]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo - Solid Warm Caramel Bear */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-[#c4622d] border border-[#e89a42]/40 flex items-center justify-center text-[#faf4ee]">
            <BearHead className="w-6 h-6 text-[#faf4ee]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-lg tracking-tight text-[#faf4ee] group-hover:text-[#e89a42] transition-colors">
                SEPIA<span className="text-[#e89a42]">BEAR</span>
              </span>
              <span className="text-[10px] bg-[#2b1d14] text-[#e89a42] border border-[#523724] px-1.5 py-0.5 rounded font-bold tracking-wider flex items-center gap-1">
                <BearPaw className="w-2.5 h-2.5 text-[#e89a42]" />
                <span>STORE</span>
              </span>
            </div>
            <p className="text-[11px] text-[#baa496] leading-none">Akun Beruang Legal &amp; Bergaransi</p>
          </div>
        </Link>

        {/* Search Bar Desktop */}
        <div className="hidden md:flex flex-1 max-w-md relative">
          <Search className="w-4 h-4 text-[#8a7263] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Cari akun Netflix, Spotify, Canva, ChatGPT..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-[#231810] border border-[#3d291b] focus:border-[#c4622d] rounded-xl pl-10 pr-4 py-2 text-sm text-[#faf4ee] placeholder-[#8a7263] focus:outline-none transition-colors"
          />
        </div>

        {/* Action Buttons */}
        <div className="hidden sm:flex items-center gap-3">
          <button
            onClick={onOpenTrack}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#261a12] hover:bg-[#302117] text-[#faf4ee] border border-[#442e1f] transition-colors cursor-pointer"
          >
            <Clock className="w-4 h-4 text-[#e89a42]" />
            <span>Lacak Pesanan</span>
          </button>

          {/* Tombol Panel Admin: HANYA tampil jika admin sudah login */}
          {isAdminLoggedIn && (
            <Link
              href="/admin"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-[#382316] hover:bg-[#482c1b] text-[#e89a42] border border-[#6b4226] transition-colors"
              title="Panel Admin Aktif"
            >
              <KeyRound className="w-3.5 h-3.5 text-[#e89a42]" />
              <span>Dashboard Admin</span>
            </Link>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="sm:hidden p-2 text-[#baa496] hover:text-white rounded-lg focus:outline-none"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-[#3d291b] bg-[#19120c] px-4 py-3 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-[#8a7263] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari akun..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-[#231810] border border-[#3d291b] rounded-xl pl-10 pr-4 py-2 text-sm text-[#faf4ee] placeholder-[#8a7263] focus:outline-none"
            />
          </div>
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenTrack();
              }}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold bg-[#261a12] text-[#faf4ee] border border-[#442e1f]"
            >
              <Clock className="w-4 h-4 text-[#e89a42]" />
              <span>Lacak Pesanan</span>
            </button>

            {isAdminLoggedIn && (
              <Link
                href="/admin"
                className="flex items-center justify-center px-4 py-2.5 rounded-xl text-xs font-bold bg-[#382316] text-[#e89a42] border border-[#6b4226]"
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
