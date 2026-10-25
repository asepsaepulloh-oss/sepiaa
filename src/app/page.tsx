'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { CheckoutModal } from '@/components/CheckoutModal';
import { TrackModal } from '@/components/TrackModal';
import { BearHead, BearPaw } from '@/components/BearIcon';
import {
  ShieldCheck,
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
    <div className="flex-1 flex flex-col bg-[#19120c] text-[#faf4ee]">
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenTrack={() => setIsTrackOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-10">
        {/* Solid Hero Card with Bear Character */}
        <section className="rounded-2xl bg-[#231810] border border-[#3d291b] p-6 sm:p-10 lg:p-12">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#2e1f15] border border-[#4d3423] text-[#e89a42] text-xs font-bold">
              <BearHead className="w-4 h-4 text-[#e89a42]" />
              <span>Sepia Bear: Toko Aplikasi Premium Terpercaya</span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#faf4ee] tracking-tight leading-tight">
              Aplikasi Premium Resmi, Hemat Hingga <span className="text-[#e89a42]">80%</span>
            </h1>

            <p className="text-sm sm:text-base text-[#baa496] leading-relaxed">
              Langganan Netflix, Spotify, Canva Pro, YouTube Premium, dan ChatGPT Plus bergaransi penuh. Pembayaran instan via QRIS Pakasir dan data akun langsung diserahkan otomatis.
            </p>

            {/* 3 Solid Pillars */}
            <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#2a1d14] border border-[#3d291b]">
                <Clock className="w-4 h-4 text-[#e89a42] shrink-0" />
                <span className="text-xs font-semibold text-[#faf4ee]">Kirim Otomatis &lt; 10 Detik</span>
              </div>
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#2a1d14] border border-[#3d291b]">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-xs font-semibold text-[#faf4ee]">Garansi Beruang Full</span>
              </div>
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#2a1d14] border border-[#3d291b]">
                <CheckCircle className="w-4 h-4 text-[#c4622d] shrink-0" />
                <span className="text-xs font-semibold text-[#faf4ee]">QRIS Semua Bank &amp; E-Wallet</span>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Bar */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BearPaw className="w-4 h-4 text-[#e89a42]" />
              <h2 className="text-lg font-bold text-[#faf4ee] tracking-tight">Kategori Aplikasi</h2>
            </div>
            <span className="text-xs text-[#baa496]">{filteredProducts.length} Produk Tersedia</span>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-[#c4622d] text-white border border-[#e89a42]/40'
                  : 'bg-[#231810] text-[#baa496] hover:text-white border border-[#3d291b] hover:border-[#523724]'
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
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[#c4622d] text-white border border-[#e89a42]/40'
                      : 'bg-[#231810] text-[#baa496] hover:text-white border border-[#3d291b] hover:border-[#523724]'
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
            <div className="py-20 flex flex-col items-center justify-center gap-3 text-[#baa496]">
              <Loader2 className="w-8 h-8 animate-spin text-[#e89a42]" />
              <p className="text-xs">Memuat katalog aplikasi premium...</p>
            </div>
          ) : error ? (
            <div className="p-6 rounded-2xl bg-[#321715] border border-[#5c2825] text-rose-300 text-center space-y-2">
              <AlertTriangle className="w-6 h-6 mx-auto" />
              <p className="text-sm font-semibold">{error}</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-16 text-center rounded-2xl bg-[#231810] border border-[#3d291b] p-8 space-y-2">
              <p className="text-sm font-semibold text-[#faf4ee]">Tidak ada produk yang cocok dengan pencarian.</p>
              <p className="text-xs text-[#baa496]">Coba ganti kata kunci atau pilih kategori lain.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredProducts.map((prod) => (
                <div
                  key={prod.id}
                  className="rounded-2xl bg-[#231810] border border-[#3d291b] hover:border-[#c4622d] p-5 flex flex-col justify-between transition-colors"
                >
                  <div className="space-y-4">
                    {/* Thumbnail & Badge */}
                    <div className="relative aspect-video rounded-xl overflow-hidden bg-[#2a1d14] border border-[#3d291b]">
                      <img
                        src={prod.imageUrl}
                        alt={prod.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      {prod.badge && (
                        <span className="absolute top-3 left-3 text-[10px] font-black px-2 py-0.5 rounded bg-[#c4622d] text-white uppercase tracking-wider border border-[#e89a42]/30">
                          {prod.badge}
                        </span>
                      )}
                      <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-[#19120c] text-[10px] font-semibold text-emerald-400 border border-emerald-500/30">
                        {prod.totalStock > 0 ? `Stok: ${prod.totalStock} Akun` : 'Ready Order'}
                      </div>
                    </div>

                    {/* Info */}
                    <div>
                      <h3 className="font-bold text-base text-[#faf4ee] hover:text-[#e89a42] transition-colors">
                        {prod.name}
                      </h3>
                      <p className="text-xs text-[#baa496] mt-1 line-clamp-2 leading-relaxed">
                        {prod.description}
                      </p>
                    </div>

                    {/* Varian Preview Chips */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {prod.variants.map((v) => (
                        <span
                          key={v.id}
                          className="text-[11px] px-2 py-0.5 rounded bg-[#2a1d14] border border-[#3d291b] text-[#dcd0c7]"
                        >
                          {v.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Pricing & Action */}
                  <div className="pt-5 mt-4 border-t border-[#312015] flex items-center justify-between gap-3">
                    <div>
                      <span className="text-[11px] text-[#baa496] block">Mulai dari</span>
                      <span className="text-base font-extrabold text-[#e89a42]">
                        {formatRupiah(prod.minPrice)}
                      </span>
                    </div>

                    <button
                      onClick={() => handleOpenCheckout(prod)}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs bg-[#c4622d] hover:bg-[#b05220] text-white transition-colors cursor-pointer"
                    >
                      <BearPaw className="w-3.5 h-3.5" />
                      <span>Beli Sekarang</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Support Banner */}
        <section className="rounded-2xl bg-[#231810] border border-[#3d291b] p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <BearHead className="w-5 h-5 text-[#e89a42]" />
              <h3 className="text-base sm:text-lg font-bold text-[#faf4ee]">Butuh Bantuan Langganan?</h3>
            </div>
            <p className="text-xs sm:text-sm text-[#baa496] max-w-xl">
              Tim support Sepia Bear siap membantu proses aktivasi, perpanjangan, dan klaim garansi akun melalui WhatsApp resmi.
            </p>
          </div>

          <a
            href="https://wa.me/6281234567890?text=Halo%20Admin%20Sepia%20Bear,%20saya%20ingin%20bertanya%20tentang%20aplikasi%20premium"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-xs bg-[#2e1f15] hover:bg-[#3a281c] text-[#faf4ee] border border-[#4d3423] transition-colors shrink-0"
          >
            <Headphones className="w-4 h-4 text-emerald-400" />
            <span>Hubungi WhatsApp Sepia Bear</span>
          </a>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#3d291b] bg-[#140e09] py-8 text-center text-xs text-[#8a7263] space-y-2">
        <div className="flex items-center justify-center gap-1.5 text-[#baa496] font-semibold">
          <BearHead className="w-4 h-4 text-[#e89a42]" />
          <span>SEPIA BEAR STORE &copy; {new Date().getFullYear()}</span>
        </div>
        <p className="text-[11px] text-[#705c4f]">
          Platform Akun Aplikasi Premium Beruang. Didukung Payment Gateway Pakasir QRIS &amp; Turso LibSQL.
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
