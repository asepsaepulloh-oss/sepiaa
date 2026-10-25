'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { CheckoutModal } from '@/components/CheckoutModal';
import { ProductDetailModal } from '@/components/ProductDetailModal';
import { CartModal, CartItem } from '@/components/CartModal';
import { TrackModal } from '@/components/TrackModal';
import { BearHead, BearPaw } from '@/components/BearIcon';
import {
  Sparkles,
  ArrowRight,
  Star,
  Check,
  ShoppingBag,
  ChevronRight,
  Loader2,
  AlertTriangle,
  Clock,
  Layers,
  CheckCircle2,
  HeartHandshake,
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

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [sortBy, setSortBy] = useState<'popular' | 'lowest' | 'highest'>('popular');

  // Modals & Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [checkoutProduct, setCheckoutProduct] = useState<Product | null>(null);
  const [checkoutVariantId, setCheckoutVariantId] = useState<string | undefined>(undefined);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isTrackOpen, setIsTrackOpen] = useState(false);

  // Toast State
  const [toastMessage, setToastMessage] = useState<{ title: string; desc: string } | null>(null);

  const showToast = (title: string, desc: string) => {
    setToastMessage({ title, desc });
    setTimeout(() => setToastMessage(null), 3000);
  };

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

  // Filter & Sort
  const filteredProducts = products
    .filter((p) => {
      const matchCat =
        selectedCategory === 'Semua' ||
        p.categoryId.toLowerCase().includes(selectedCategory.toLowerCase()) ||
        (categories.find((c) => c.id === p.categoryId)?.name.toLowerCase() === selectedCategory.toLowerCase());

      const matchSearch =
        !searchQuery ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase());

      return matchCat && matchSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'lowest') return a.minPrice - b.minPrice;
      if (sortBy === 'highest') return b.minPrice - a.minPrice;
      return b.totalStock - a.totalStock;
    });

  const handleOpenDetail = (prod: Product) => {
    setDetailProduct(prod);
    setIsDetailOpen(true);
  };

  const handleBuyNow = (prod: Product, variant?: Variant) => {
    setCheckoutProduct(prod);
    setCheckoutVariantId(variant?.id || (prod.variants[0]?.id));
    setIsCheckoutOpen(true);
  };

  const handleAddToCart = (prod: Product, variant?: Variant) => {
    const chosenVariant = variant || prod.variants[0];
    if (!chosenVariant) return;

    setCart((prev) => {
      const existing = prev.find((item) => item.variantId === chosenVariant.id);
      if (existing) {
        return prev.map((item) =>
          item.variantId === chosenVariant.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [
        ...prev,
        {
          variantId: chosenVariant.id,
          productName: prod.name,
          variantName: chosenVariant.name,
          price: chosenVariant.price,
          qty: 1,
          imageUrl: prod.imageUrl,
        },
      ];
    });

    showToast('Ditambahkan ke Keranjang', `${prod.name} (${chosenVariant.name}) berhasil dimasukkan.`);
  };

  const handleRemoveFromCart = (variantId: string) => {
    setCart((prev) => prev.filter((i) => i.variantId !== variantId));
  };

  const handleUpdateCartQty = (variantId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.variantId === variantId) {
            const newQty = item.qty + delta;
            return newQty > 0 ? { ...item, qty: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleCheckoutCartItem = (cartItem: CartItem) => {
    const prod = products.find((p) => p.variants.some((v) => v.id === cartItem.variantId));
    if (prod) {
      setCheckoutProduct(prod);
      setCheckoutVariantId(cartItem.variantId);
      setIsCartOpen(false);
      setIsCheckoutOpen(true);
    }
  };

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(num);
  };

  // Featured Product for Hero Section
  const featuredProduct = products[0] || {
    id: 'featured',
    name: 'Netflix Premium 4K UHD',
    description: 'Nonton film & serial TV tanpa batas resolusi 4K Ultra HD. Akun legal, garansi full sesuai masa aktif.',
    minPrice: 28000,
    badge: 'PILIHAN PENDIRI',
    variants: [
      { id: 'v1', name: '1 Bulan Private', price: 135000, originalPrice: 186000, durationDays: 30, description: '5 Profil milik sendiri', stockCount: 5 },
    ],
  };

  return (
    <div className="flex-1 flex flex-col bg-[#f7f3ed] text-[#3b281a] antialiased">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-[#543827] text-[#fcfaf7] px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-[#7e5434] animate-in slide-in-from-top duration-300">
          <CheckCircle2 className="w-5 h-5 text-[#cfa67c] shrink-0" />
          <div>
            <h4 className="font-bold text-xs">{toastMessage.title}</h4>
            <p className="text-[11px] text-[#dec4a6]">{toastMessage.desc}</p>
          </div>
        </div>
      )}

      {/* Header / Navbar */}
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenTrack={() => setIsTrackOpen(true)}
        cartCount={cart.reduce((sum, item) => sum + item.qty, 0)}
        onOpenCart={() => setIsCartOpen(true)}
      />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="hero-gradient pt-10 pb-16 px-4 sm:px-6 lg:px-8 border-b border-[#ebdccb]">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 bg-[#ebdccb] border border-[#dec4a6] text-[#543827] px-3.5 py-1.5 rounded-full text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-[#9e6d42]" />
                <span>LISENSI RESMI &amp; PENGIRIMAN OTOMATIS</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#543827] tracking-tight leading-[1.1]">
                Aplikasi premium yang <span className="text-[#9e6d42]">hangat di tangan.</span>
              </h1>

              <p className="text-[#7e5434] text-sm sm:text-base max-w-xl font-normal leading-relaxed">
                Sepia Store mengoleksi produk digital kelas dunia, aplikasi hiburan, desain, dan kecerdasan buatan pilihan. Aktivasi instan via QRIS Pakasir, bergaransi penuh dan siap pakai.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <a
                  href="#katalog"
                  className="bg-[#543827] hover:bg-[#67442d] text-[#fcfaf7] font-semibold px-6 py-3.5 rounded-2xl text-xs sm:text-sm transition-all shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <span>Jelajahi katalog</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
                <a
                  href="#bundel"
                  className="bg-[#ebdccb] hover:bg-[#dec4a6] text-[#543827] font-semibold px-6 py-3.5 rounded-2xl text-xs sm:text-sm transition-all border border-[#dec4a6] flex items-center gap-2 cursor-pointer"
                >
                  <span>Lihat bundel berharga</span>
                </a>
              </div>

              {/* Stats Footer */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8 border-t border-[#ebdccb]">
                <div>
                  <h4 className="text-xl sm:text-2xl font-extrabold text-[#543827]">38+</h4>
                  <p className="text-xs text-[#9e6d42] mt-0.5">Aplikasi kurasi</p>
                </div>
                <div>
                  <h4 className="text-xl sm:text-2xl font-extrabold text-[#543827]">12.400+</h4>
                  <p className="text-xs text-[#9e6d42] mt-0.5">Pengguna aktif</p>
                </div>
                <div>
                  <h4 className="text-xl sm:text-2xl font-extrabold text-[#543827] flex items-center gap-1">
                    4.9 <span className="text-amber-700 text-sm">★</span>
                  </h4>
                  <p className="text-xs text-[#9e6d42] mt-0.5">Rating kepuasan</p>
                </div>
                <div>
                  <h4 className="text-xl sm:text-2xl font-extrabold text-[#543827]">100%</h4>
                  <p className="text-xs text-[#9e6d42] mt-0.5">Garansi penggantian</p>
                </div>
              </div>
            </div>

            {/* Right Hero Featured Card */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-md bg-[#543827] text-[#fcfaf7] p-6 sm:p-8 rounded-3xl shadow-xl relative border border-[#67442d]">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#67442d] rounded-2xl flex items-center justify-center text-[#dec4a6] text-xl font-bold border border-[#7e5434]">
                      <BearHead className="w-7 h-7 text-[#fcfaf7]" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[#cfa67c]">
                        PILIHAN PENDIRI
                      </span>
                      <h3 className="text-lg font-bold text-white">{featuredProduct.name}</h3>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs bg-[#67442d] px-2.5 py-1 rounded-full border border-[#7e5434] text-amber-300">
                    <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                    <span className="font-semibold text-white">4.9</span>
                    <span className="text-[#dec4a6] text-[10px]">(412)</span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-[#dec4a6] mb-6 leading-relaxed">
                  {featuredProduct.description}
                </p>

                <div className="space-y-2 mb-6 text-xs text-[#f5efe6] bg-[#2d1c13] p-4 rounded-2xl border border-[#67442d]">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#cfa67c] shrink-0" />
                    <span>Aktivasi otomatis &lt; 10 detik setelah scan QRIS</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#cfa67c] shrink-0" />
                    <span>Garansi penuh selama masa aktif berlangganan</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#cfa67c] shrink-0" />
                    <span>Kredensial tersimpan aman di Dashboard Member</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-[#67442d]">
                  <div>
                    <span className="block text-[10px] text-[#cfa67c] uppercase">Harga Mulai Dari</span>
                    <span className="text-xl sm:text-2xl font-extrabold text-white">
                      {formatRupiah(featuredProduct.minPrice)}
                    </span>
                  </div>
                  <button
                    onClick={() => handleBuyNow(featuredProduct)}
                    className="bg-[#fcfaf7] hover:bg-white text-[#543827] font-bold px-5 py-2.5 rounded-xl text-xs transition-colors shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Beli Sekarang</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* KATALOG APLIKASI SECTION */}
        <section id="katalog" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#543827] tracking-tight">Katalog aplikasi</h2>
              <p className="text-xs sm:text-sm text-[#7e5434] mt-1">
                Setiap aplikasi dipilih karena kenyamanan dan estetika antarmuka. Harga lisensi resmi &amp; pembaruan langsung.
              </p>
            </div>

            {/* Sorting */}
            <div className="flex items-center gap-2 self-start md:self-auto">
              <span className="text-xs text-[#7e5434] font-medium">Urutkan:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-[#f5efe6] border border-[#ebdccb] text-[#543827] text-xs rounded-xl px-3 py-2 font-semibold focus:outline-none cursor-pointer"
              >
                <option value="popular">Paling populer</option>
                <option value="lowest">Harga terendah</option>
                <option value="highest">Harga tertinggi</option>
              </select>
            </div>
          </div>

          {/* Category Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('Semua')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === 'Semua'
                  ? 'bg-[#543827] text-[#fcfaf7] shadow-sm'
                  : 'bg-[#ebdccb] text-[#543827] hover:bg-[#dec4a6]'
              }`}
            >
              Semua
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.name)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory.toLowerCase() === c.name.toLowerCase()
                    ? 'bg-[#543827] text-[#fcfaf7] shadow-sm'
                    : 'bg-[#ebdccb] text-[#543827] hover:bg-[#dec4a6]'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>

          {/* Product Grid */}
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3 text-[#9e6d42]">
              <Loader2 className="w-8 h-8 animate-spin text-[#7e5434]" />
              <p className="text-xs">Memuat katalog aplikasi...</p>
            </div>
          ) : error ? (
            <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-center space-y-2">
              <AlertTriangle className="w-6 h-6 mx-auto" />
              <p className="text-sm font-semibold">{error}</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-16 text-center text-[#9e6d42] space-y-2 bg-[#fcfaf7] rounded-3xl border border-[#ebdccb]">
              <ShoppingBag className="w-10 h-10 mx-auto opacity-40 text-[#7e5434]" />
              <p className="text-sm font-semibold text-[#543827]">Tidak ada produk ditemukan.</p>
              <p className="text-xs text-[#9e6d42]">Coba ganti kata kunci pencarian atau pilih kategori lain.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((prod) => (
                <div
                  key={prod.id}
                  className="bg-[#fcfaf7] border border-[#ebdccb] rounded-3xl p-6 card-shadow flex flex-col justify-between hover:border-[#cfa67c] transition-colors"
                >
                  <div>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#9e6d42]">
                          {categories.find((c) => c.id === prod.categoryId)?.name || 'Premium'}
                        </span>
                        <h3 className="font-extrabold text-base text-[#543827] mt-0.5">{prod.name}</h3>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-amber-800 font-semibold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                        <span>4.9</span>
                      </div>
                    </div>

                    <p className="text-xs text-[#7e5434] mb-4 line-clamp-2 leading-relaxed">
                      {prod.description}
                    </p>

                    {/* Varian Preview Chips */}
                    <div className="flex flex-wrap gap-1.5 mb-6">
                      {prod.variants.map((v) => (
                        <span
                          key={v.id}
                          className="bg-[#f5efe6] border border-[#ebdccb] text-[#7e5434] text-[10px] px-2.5 py-1 rounded-md font-semibold"
                        >
                          {v.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-[#ebdccb]">
                    <div>
                      <span className="text-xs font-extrabold text-[#543827]">
                        {formatRupiah(prod.minPrice)}
                      </span>
                      <span className="block text-[10px] text-[#9e6d42]">Garansi Resmi Full</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenDetail(prod)}
                        className="bg-[#f5efe6] hover:bg-[#ebdccb] text-[#543827] font-bold px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer"
                      >
                        Detail
                      </button>
                      <button
                        onClick={() => handleBuyNow(prod)}
                        className="bg-[#543827] hover:bg-[#67442d] text-[#fcfaf7] px-3.5 py-2 rounded-xl text-xs font-bold transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Beli</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* BUNDLE SECTION */}
        <section id="bundel" className="bg-[#ebdccb]/40 border-y border-[#ebdccb] py-16 px-4 sm:px-6 lg:px-8 my-10">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-10">
            <div className="space-y-4 max-w-xl">
              <span className="bg-[#dec4a6] text-[#543827] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Hemat hingga 65%
              </span>
              <h2 className="text-3xl font-extrabold text-[#543827]">Bundel Koleksi Kreator Sepia</h2>
              <p className="text-sm text-[#7e5434] leading-relaxed">
                Dapatkan aplikasi produktivitas, hiburan, dan desain pilihan kami dalam satu bundel eksklusif. Lisensi terjamin untuk seluruh perangkat Anda.
              </p>
              <div className="flex items-center gap-4 text-xs font-semibold text-[#67442d]">
                <span className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-[#9e6d42]" />
                  <span>Update &amp; Garansi Penuh</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-[#9e6d42]" />
                  <span>Semua Platform</span>
                </span>
              </div>
            </div>

            <div className="bg-[#543827] text-[#fcfaf7] p-8 rounded-3xl shadow-xl w-full max-w-sm border border-[#67442d] text-center space-y-6">
              <div>
                <span className="text-xs uppercase tracking-widest text-[#cfa67c]">Harga Bundel Spesial</span>
                <div className="flex items-center justify-center gap-3 mt-1">
                  <span className="text-3xl font-extrabold text-white">Rp899.000</span>
                  <span className="text-sm text-[#dec4a6] line-through">Rp2.450.000</span>
                </div>
              </div>
              <button
                onClick={() => {
                  if (products[0]) handleBuyNow(products[0]);
                }}
                className="w-full bg-[#fcfaf7] hover:bg-white text-[#543827] font-bold py-3.5 rounded-2xl text-xs transition-colors shadow-md cursor-pointer"
              >
                Beli Bundel Sekarang
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer id="tentang" className="bg-[#543827] text-[#dec4a6] pt-16 pb-12 px-4 sm:px-6 lg:px-8 mt-auto border-t border-[#67442d]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#67442d] flex items-center justify-center text-[#fcfaf7]">
                <BearHead className="w-5 h-5 text-[#fcfaf7]" />
              </div>
              <span className="font-extrabold text-lg text-[#fcfaf7]">Sepia Store</span>
            </div>
            <p className="text-xs text-[#cfa67c] leading-relaxed">
              Koleksi perangkat lunak dan aplikasi premium kelas dunia yang dirancang dengan kesederhanaan dan estetika hangat.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-sm text-[#fcfaf7] mb-4">Navigasi</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#katalog" className="hover:text-white transition-colors">Katalog Aplikasi</a></li>
              <li><a href="#bundel" className="hover:text-white transition-colors">Bundel Eksklusif</a></li>
              <li>
                <button onClick={() => setIsTrackOpen(true)} className="hover:text-white transition-colors text-left">
                  Lacak Pesanan
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-sm text-[#fcfaf7] mb-4">Dukungan</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="https://wa.me/6282323240186"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  WhatsApp CS Resmi (0823-2324-0186)
                </a>
              </li>
              <li><span className="text-[#cfa67c]">Garansi Penggantian Penuh</span></li>
              <li><span className="text-[#cfa67c]">Kebijakan Privasi Aman</span></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-sm text-[#fcfaf7] mb-4">Newsletter</h4>
            <p className="text-xs text-[#cfa67c] mb-3">Dapatkan info rilis aplikasi baru dan diskon mingguan.</p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                showToast('Berlangganan!', 'Terima kasih telah mendaftar newsletter Sepia Store.');
              }}
              className="flex gap-2"
            >
              <input
                type="email"
                placeholder="Email Anda..."
                required
                className="bg-[#67442d] border border-[#7e5434] px-3 py-2 rounded-xl text-xs text-white placeholder-[#dec4a6] focus:outline-none w-full"
              />
              <button
                type="submit"
                className="bg-[#7e5434] hover:bg-[#9e6d42] text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                OK
              </button>
            </form>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-8 border-t border-[#67442d] flex flex-col sm:flex-row items-center justify-between text-xs text-[#cfa67c]">
          <p>&copy; {new Date().getFullYear()} Sepia Store. Hak Cipta Dilindungi.</p>
          <p className="text-[11px] text-[#dec4a6] mt-2 sm:mt-0">
            Didukung oleh Pakasir QRIS Nasional &amp; Database Turso LibSQL.
          </p>
        </div>
      </footer>

      {/* Modals */}
      <ProductDetailModal
        product={detailProduct}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
      />

      <CheckoutModal
        product={checkoutProduct}
        initialVariantId={checkoutVariantId}
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
      />

      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onRemoveItem={handleRemoveFromCart}
        onUpdateQty={handleUpdateCartQty}
        onCheckout={handleCheckoutCartItem}
      />

      <TrackModal
        isOpen={isTrackOpen}
        onClose={() => setIsTrackOpen(false)}
      />
    </div>
  );
}
