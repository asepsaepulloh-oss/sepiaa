'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Clock, KeyRound, Menu, X, User, ShoppingBag, LogOut } from 'lucide-react';
import { BearHead, BearPaw } from './BearIcon';

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenTrack: () => void;
  cartCount: number;
  onOpenCart: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  searchQuery,
  onSearchChange,
  onOpenTrack,
  cartCount,
  onOpenCart,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [userProfile, setUserProfile] = useState<{ name: string } | null>(null);

  useEffect(() => {
    async function checkAdminAuth() {
      try {
        const res = await fetch('/api/admin/check');
        const data = await res.json();
        if (data.authenticated) {
          setIsAdminLoggedIn(true);
        } else {
          setIsAdminLoggedIn(false);
        }
      } catch {
        setIsAdminLoggedIn(false);
      }
    }

    async function checkUserAuth() {
      try {
        const res = await fetch('/api/user/check');
        const data = await res.json();
        if (data.authenticated && data.user) {
          setUserProfile(data.user);
        } else {
          setUserProfile(null);
        }
      } catch {
        setUserProfile(null);
      }
    }

    checkAdminAuth();
    checkUserAuth();
  }, []);

  const handleAdminLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      setIsAdminLoggedIn(false);
      window.location.reload();
    } catch {}
  };

  const handleUserLogout = async () => {
    try {
      await fetch('/api/user/logout', { method: 'POST' });
      setUserProfile(null);
      window.location.reload();
    } catch {}
  };

  return (
    <header className="sticky top-0 z-40 bg-[#f7f3ed] border-b border-[#ebdccb]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 cursor-pointer group">
          <div className="w-10 h-10 rounded-xl bg-[#543827] flex items-center justify-center text-[#fcfaf7] shadow-md group-hover:scale-105 transition-transform">
            <BearHead className="w-6 h-6 text-[#f5efe6]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xl tracking-tight text-[#543827]">Sepia Store</span>
              <span className="text-[10px] bg-[#ebdccb] text-[#7e5434] px-1.5 py-0.5 rounded font-bold tracking-wider flex items-center gap-1">
                <BearPaw className="w-2.5 h-2.5" />
                <span>BEAR</span>
              </span>
            </div>
            <span className="block text-[10px] uppercase tracking-widest text-[#9e6d42] font-semibold">
              Digital Suite &amp; Apps
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 font-semibold text-xs lg:text-sm text-[#67442d]">
          <a href="#katalog" className="hover:text-[#9e6d42] transition-colors">Katalog</a>
          <a href="#tentang" className="hover:text-[#9e6d42] transition-colors">Tentang Kami</a>
          <button
            onClick={onOpenTrack}
            className="hover:text-[#9e6d42] transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Clock className="w-3.5 h-3.5 text-[#b88654]" />
            <span>Lacak Pesanan</span>
          </button>
        </nav>

        {/* Search & Actions */}
        <div className="flex items-center gap-3">
          <div className="relative hidden sm:block">
            <input
              type="text"
              placeholder="Cari aplikasi..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-44 lg:w-56 pl-9 pr-4 py-2 bg-[#f5efe6] border border-[#ebdccb] rounded-full text-xs text-[#543827] placeholder-[#9e6d42] focus:outline-none focus:ring-2 focus:ring-[#b88654]/40 transition-all"
            />
            <Search className="w-3.5 h-3.5 absolute left-3.5 top-2.5 text-[#9e6d42] pointer-events-none" />
          </div>

          {/* User / Admin Authentication State */}
          {isAdminLoggedIn ? (
            /* Admin Sedang Login: Tampilkan Tombol Panel Admin & Keluar, HAPUS tombol Masuk */
            <div className="hidden sm:flex items-center gap-1.5">
              <Link
                href="/admin"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold bg-[#dec4a6] hover:bg-[#cfa67c] text-[#543827] border border-[#b88654] transition-colors shadow-sm"
                title="Buka Dashboard Admin"
              >
                <KeyRound className="w-3.5 h-3.5 text-[#7e5434]" />
                <span>Panel Admin</span>
              </Link>
              <button
                onClick={handleAdminLogout}
                className="p-2 rounded-full bg-[#f5efe6] hover:bg-[#ebdccb] text-rose-700 transition-colors cursor-pointer"
                title="Keluar Admin"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : userProfile ? (
            /* Customer Sedang Login: Tampilkan Akun Saya & Keluar, HAPUS tombol Masuk */
            <div className="hidden sm:flex items-center gap-1.5">
              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold bg-[#f5efe6] hover:bg-[#ebdccb] text-[#543827] border border-[#dec4a6] transition-colors"
              >
                <User className="w-3.5 h-3.5 text-[#7e5434]" />
                <span>Akun Saya ({userProfile.name.split(' ')[0]})</span>
              </Link>
              <button
                onClick={handleUserLogout}
                className="p-2 rounded-full bg-[#f5efe6] hover:bg-[#ebdccb] text-rose-700 transition-colors cursor-pointer"
                title="Keluar Member"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            /* Belum Login Sama Sekali: Tampilkan tombol Masuk */
            <Link
              href="/login"
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold bg-[#f5efe6] hover:bg-[#ebdccb] text-[#67442d] border border-[#dec4a6] transition-colors"
            >
              <User className="w-3.5 h-3.5 text-[#7e5434]" />
              <span>Masuk</span>
            </Link>
          )}

          {/* Cart Button */}
          <button
            onClick={onOpenCart}
            className="relative flex items-center gap-2 bg-[#543827] hover:bg-[#67442d] text-[#fcfaf7] px-4 py-2 rounded-full text-xs font-semibold transition-all shadow-md cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Keranjang</span>
            <span className="bg-[#b88654] text-white w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold">
              {cartCount}
            </span>
          </button>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-[#543827] hover:text-[#7e5434] rounded-lg focus:outline-none"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#ebdccb] bg-[#f7f3ed] px-4 py-4 space-y-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Cari aplikasi..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-[#f5efe6] border border-[#ebdccb] rounded-full text-xs text-[#543827] placeholder-[#9e6d42] focus:outline-none"
            />
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-[#9e6d42] pointer-events-none" />
          </div>

          <div className="flex flex-col gap-2 pt-1 font-semibold text-xs text-[#67442d]">
            <a
              href="#katalog"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded-lg hover:bg-[#ebdccb]"
            >
              Katalog Aplikasi
            </a>
            <a
              href="#tentang"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded-lg hover:bg-[#ebdccb]"
            >
              Tentang Kami
            </a>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenTrack();
              }}
              className="py-2 px-3 rounded-lg hover:bg-[#ebdccb] text-left flex items-center gap-2 cursor-pointer"
            >
              <Clock className="w-4 h-4 text-[#b88654]" />
              <span>Lacak Pesanan</span>
            </button>
          </div>

          <div className="pt-2 border-t border-[#ebdccb]">
            {isAdminLoggedIn ? (
              <div className="flex gap-2">
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2.5 rounded-full text-xs font-bold bg-[#dec4a6] text-[#543827] border border-[#b88654]"
                >
                  Panel Admin
                </Link>
                <button
                  onClick={handleAdminLogout}
                  className="px-4 py-2.5 rounded-full text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200"
                >
                  Keluar
                </button>
              </div>
            ) : userProfile ? (
              <div className="flex gap-2">
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2.5 rounded-full text-xs font-bold bg-[#543827] text-white"
                >
                  Akun Saya ({userProfile.name.split(' ')[0]})
                </Link>
                <button
                  onClick={handleUserLogout}
                  className="px-4 py-2.5 rounded-full text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200"
                >
                  Keluar
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center py-2.5 rounded-full text-xs font-semibold bg-[#f5efe6] text-[#543827] border border-[#dec4a6]"
              >
                Masuk / Daftar
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
