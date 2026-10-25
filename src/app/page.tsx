'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { CheckoutModal } from '@/components/CheckoutModal';
import { TrackModal } from '@/components/TrackModal';
import {
  ShieldCheck,
  Zap,
  CheckCircle,
  Clock,
  Sparkles,
  Tv,
  Music,
  Palette,
  Shield,
  Loader2,
  AlertTriangle,
  ArrowRight,
  Headphones,
} from 'lucide-react';

interface Variant {
  id: string;
  productId: string;
  name: string;
  durationDays: number;
  price: number;
  originalPrice: number;
  description: string | null;
  stockCount: number;
}

interface Product {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  badge: string | null;
  minPrice: number;
  totalStock: number;
  variants: Variant[];
}

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
}

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Modal State
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isTrackOpen, setIsTrackOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const res = await fetch('/api/products');
        const data = await res.json();
        if (data.success) {
          setCategories(data.categories || []);
          setProducts(data.products || []);
        } else {
          setError(data.error || 'Gagal memuat katalog produk');
        }
      } catch (err: any) {
        setError(err.message || 'Koneksi ke server gagal');
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // Filter products by category & search
  const filteredProducts = products.filter((p) => {
    const matchCategory = selectedCategory === 'all' || p.categoryId === selectedCategory;
    const matchSearch =
      !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const handleOpenCheckout = (prod: Product) => {
    setSelectedProduct(prod);
    setIsCheckoutOpen(true);
  };

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(num);
  };

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Tv':
        return <Tv className="w-4 h-4" />;
      case 'Music':
        return <Music className="w-4 h-4" />;
      case 'Palette':
        return <Palette className="w-4 h-4" />;
      case 'Sparkles':
        return <Sparkles className="w-4 h-4" />;
      case 'Shield':
        return <Shield className="w-4 h-4" />;
      default:
        return <Sparkles className="w-4 h-4" />;
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenTrack={() => setIsTrackOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-10">
        {/* Hero Banner */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#14141d] to-[#0c0c11] border border-[#232330] p-6 sm:p-10 lg:p-12">
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
              <Zap className="w-3.5 h-3.5" />
              <span>Sistem Pengiriman Otomatis 24 Jam</span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              Aplikasi Premium Resmi, Hemat Hingga <span className="text-amber-500">80%</span>
            </h1>

            <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
              Dapatkan akses Netflix, Spotify, Canva Pro, YouTube Premium, dan ChatGPT Plus legal bergaransi penuh. Pembayaran instan via QRIS Pakasir dan akun langsung diserahkan otomatis.
            </p>

            {/* 3 Pillars */}
            <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#181822]/70 border border-[#272735]">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-xs font-semibold text-zinc-200">Kirim Otomatis &lt; 10 Detik</span>
              </div>
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#181822]/70 border border-[#272735]">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-xs font-semibold text-zinc-200">Garansi Penuh Masa Aktif</span>
              </div>
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#181822]/70 border border-[#272735]">
                <CheckCircle className="w-4 h-4 text-blue-400 shrink-0" />
                <span className="text-xs font-semibold text-zinc-200">QRIS Seluruh Bank &amp; E-Wallet</span>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Bar */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white tracking-tight">Kategori Aplikasi</h2>
            <span className="text-xs text-zinc-500">{filteredProducts.length} Produk Tersedia</span>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20'
                  : 'bg-[#14141c] text-zinc-400 hover:text-white border border-[#23232f] hover:border-[#353549]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Semua Kategori</span>
            </button>

            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20'
                      : 'bg-[#14141c] text-zinc-400 hover:text-white border border-[#23232f] hover:border-[#353549]'
                  }`}
                >
                  {getCategoryIcon(cat.icon)}
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Product Grid */}
        <section className="space-y-4">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3 text-zinc-400">
              <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
              <p className="text-xs">Memuat katalog aplikasi premium...</p>
            </div>
          ) : error ? (
            <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-center space-y-2">
              <AlertTriangle className="w-6 h-6 mx-auto" />
              <p className="text-sm font-semibold">{error}</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-16 text-center rounded-2xl bg-[#121218] border border-[#232330] p-8 space-y-2">
              <p className="text-sm font-semibold text-zinc-300">Tidak ada produk yang cocok dengan pencarian.</p>
              <p className="text-xs text-zinc-500">Coba ganti kata kunci atau pilih kategori lain.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredProducts.map((prod) => (
                <div
                  key={prod.id}
                  className="group rounded-2xl bg-[#111117] border border-[#23232f] hover:border-amber-500/50 p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/5"
                >
                  <div className="space-y-4">
                    {/* Thumbnail & Badge */}
                    <div className="relative aspect-video rounded-xl overflow-hidden bg-[#181822] border border-[#262635]">
                      <img
                        src={prod.imageUrl}
                        alt={prod.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      {prod.badge && (
                        <span className="absolute top-3 left-3 text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500 text-zinc-950 uppercase tracking-wider shadow">
                          {prod.badge}
                        </span>
                      )}
                      <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-[10px] font-medium text-emerald-400 border border-emerald-500/30">
                        {prod.totalStock > 0 ? `Stok: ${prod.totalStock} Akun` : 'Ready Order'}
                      </div>
                    </div>

                    {/* Info */}
                    <div>
                      <h3 className="font-bold text-base text-white group-hover:text-amber-400 transition-colors">
                        {prod.name}
                      </h3>
                      <p className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                        {prod.description}
                      </p>
                    </div>

                    {/* Varian Preview Chips */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {prod.variants.map((v) => (
                        <span
                          key={v.id}
                          className="text-[11px] px-2 py-0.5 rounded bg-[#181822] border border-[#262635] text-zinc-300"
                        >
                          {v.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Pricing & Action */}
                  <div className="pt-5 mt-4 border-t border-[#1e1e28] flex items-center justify-between gap-3">
                    <div>
                      <span className="text-[11px] text-zinc-500 block">Mulai dari</span>
                      <span className="text-base font-extrabold text-amber-400">
                        {formatRupiah(prod.minPrice)}
                      </span>
                    </div>

                    <button
                      onClick={() => handleOpenCheckout(prod)}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-600 text-zinc-950 transition-colors cursor-pointer shadow-md shadow-amber-500/10"
                    >
                      <span>Beli Sekarang</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* FAQ & Support Banner */}
        <section className="rounded-2xl bg-[#111117] border border-[#23232f] p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-base sm:text-lg font-bold text-white">Butuh Bantuan atau Mau Tanya-Tanya?</h3>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-xl">
              Customer support kami aktif melayani panduan login, klaim garansi, dan pesanan khusus melalui WhatsApp resmi.
            </p>
          </div>

          <a
            href="https://wa.me/6281234567890?text=Halo%20Admin%20Sepia%20Store,%20saya%20ingin%20bertanya%20tentang%20aplikasi%20premium"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-xs bg-[#1f202b] hover:bg-[#282a39] text-white border border-[#303346] transition-colors shrink-0"
          >
            <Headphones className="w-4 h-4 text-emerald-400" />
            <span>Hubungi WhatsApp Admin</span>
          </a>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#20202b] bg-[#09090c] py-8 text-center text-xs text-zinc-500 space-y-2">
        <p className="font-semibold text-zinc-400">
          SEPIA STORE &copy; {new Date().getFullYear()} - Pusat Akun Aplikasi Premium Legal &amp; Bergaransi.
        </p>
        <p className="text-[11px] text-zinc-600">
          Didukung oleh Payment Gateway Pakasir QRIS Nasional &amp; Database Turso LibSQL.
        </p>
      </footer>

      {/* Modals */}
      <CheckoutModal
        product={selectedProduct}
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
      />

      <TrackModal
        isOpen={isTrackOpen}
        onClose={() => setIsTrackOpen(false)}
      />
    </div>
  );
}
