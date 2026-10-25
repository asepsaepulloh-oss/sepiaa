'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { BearHead, BearPaw } from '@/components/BearIcon';
import {
  DollarSign,
  ShoppingBag,
  CheckCircle,
  PackagePlus,
  RefreshCw,
  LogOut,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Clock,
  Layers,
  Copy,
  Check,
  PlusCircle,
  Trash2,
} from 'lucide-react';

interface Metrics {
  totalRevenue: number;
  totalOrders: number;
  paidOrders: number;
  activeStockCount: number;
}

interface OrderItem {
  id: string;
  orderId: string;
  productName: string;
  variantName: string;
  amount: number;
  totalPayment: number;
  customerName: string;
  customerWhatsapp: string;
  status: string;
  accountDelivered: string | null;
  createdAt: number;
  completedAt: number | null;
}

interface VariantItem {
  id: string;
  productId: string;
  productName: string;
  name: string;
  price: number;
  originalPrice: number;
  stockCount: number;
}

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
}

interface ProductItem {
  id: string;
  name: string;
  categoryId: string;
  imageUrl: string;
  badge: string | null;
  description: string;
}

interface NewVariantForm {
  name: string;
  durationDays: number;
  price: number | '';
  originalPrice: number | '';
  description: string;
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Dashboard Data
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [variants, setVariants] = useState<VariantItem[]>([]);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [activeTab, setActiveTab] = useState<'orders' | 'add-product' | 'stock' | 'variants'>('orders');
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Stock Form
  const [selectedVariantId, setSelectedVariantId] = useState('');
  const [rawAccounts, setRawAccounts] = useState('');
  const [stockMessage, setStockMessage] = useState<string | null>(null);
  const [isSubmittingStock, setIsSubmittingStock] = useState(false);

  // Add Product Form
  const [newProductName, setNewProductName] = useState('');
  const [newCategoryId, setNewCategoryId] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newBadge, setNewBadge] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newVariants, setNewVariants] = useState<NewVariantForm[]>([
    { name: '1 Bulan Sharing', durationDays: 30, price: 25000, originalPrice: 45000, description: '1 Profil khusus 1 user' },
  ]);
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);
  const [productSuccessMessage, setProductSuccessMessage] = useState<string | null>(null);
  const [productErrorMessage, setProductErrorMessage] = useState<string | null>(null);

  // Copy helper
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setIsLoadingData(true);
    try {
      const res = await fetch('/api/admin/data');
      if (res.status === 401) {
        setIsAuthenticated(false);
        setIsLoadingData(false);
        return;
      }

      const data = await res.json();
      if (data.success) {
        setIsAuthenticated(true);
        setMetrics(data.metrics);
        setCategories(data.categories || []);
        setOrders(data.orders || []);
        setVariants(data.variants || []);
        setProducts(data.products || []);

        if (data.categories && data.categories.length > 0 && !newCategoryId) {
          setNewCategoryId(data.categories[0].id);
        }
        if (data.variants && data.variants.length > 0 && !selectedVariantId) {
          setSelectedVariantId(data.variants[0].id);
        }
      } else {
        setIsAuthenticated(false);
      }
    } catch {
      setIsAuthenticated(false);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: usernameInput.trim(),
          password: passwordInput,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsAuthenticated(true);
        fetchDashboardData();
      } else {
        setLoginError(data.error || 'Login gagal');
      }
    } catch (err: any) {
      setLoginError(err.message || 'Koneksi gagal');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    setIsAuthenticated(false);
  };

  const handleAddStock = async (e: React.FormEvent) => {
    e.preventDefault();
    setStockMessage(null);
    if (!selectedVariantId || !rawAccounts.trim()) {
      alert('Pilih varian dan masukkan baris data akun.');
      return;
    }

    setIsSubmittingStock(true);
    try {
      const res = await fetch('/api/admin/stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          variantId: selectedVariantId,
          rawAccounts: rawAccounts.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setStockMessage(data.message);
        setRawAccounts('');
        fetchDashboardData();
      } else {
        alert(data.error || 'Gagal menambahkan stok');
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setIsSubmittingStock(false);
    }
  };

  const handleAddVariantRow = () => {
    setNewVariants((prev) => [
      ...prev,
      { name: '', durationDays: 30, price: '', originalPrice: '', description: '' },
    ]);
  };

  const handleRemoveVariantRow = (index: number) => {
    if (newVariants.length <= 1) return;
    setNewVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const handleVariantChange = (index: number, field: keyof NewVariantForm, value: any) => {
    setNewVariants((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setProductSuccessMessage(null);
    setProductErrorMessage(null);

    if (!newProductName.trim() || !newCategoryId || !newDescription.trim()) {
      setProductErrorMessage('Nama produk, kategori, dan deskripsi wajib diisi.');
      return;
    }

    for (let i = 0; i < newVariants.length; i++) {
      const v = newVariants[i];
      if (!v.name.trim() || !v.price) {
        setProductErrorMessage(`Varian #${i + 1} harus memiliki nama dan harga jual.`);
        return;
      }
    }

    setIsCreatingProduct(true);
    try {
      const res = await fetch('/api/admin/product/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newProductName.trim(),
          categoryId: newCategoryId,
          description: newDescription.trim(),
          imageUrl: newImageUrl.trim() || undefined,
          badge: newBadge.trim() || undefined,
          variants: newVariants.map((v) => ({
            name: v.name.trim(),
            durationDays: Number(v.durationDays) || 30,
            price: Number(v.price),
            originalPrice: Number(v.originalPrice) || Math.round(Number(v.price) * 1.4),
            description: v.description.trim() || undefined,
          })),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setProductSuccessMessage(data.message || 'Produk baru berhasil diterbitkan!');
        setNewProductName('');
        setNewDescription('');
        setNewImageUrl('');
        setNewBadge('');
        setNewVariants([
          { name: '1 Bulan Sharing', durationDays: 30, price: 25000, originalPrice: 45000, description: '1 Profil khusus 1 user' },
        ]);
        fetchDashboardData();
      } else {
        setProductErrorMessage(data.error || 'Gagal menambahkan produk');
      }
    } catch (err: any) {
      setProductErrorMessage(err.message || 'Koneksi gagal');
    } finally {
      setIsCreatingProduct(false);
    }
  };

  const handleDeleteProduct = async (productId: string, productName: string) => {
    if (!confirm(`Yakin ingin menghapus produk "${productName}" beserta seluruh varian dan stoknya?`)) {
      return;
    }

    try {
      const res = await fetch('/api/admin/product/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      });
      const data = await res.json();
      if (data.success) {
        fetchDashboardData();
      } else {
        alert(data.error || 'Gagal menghapus produk');
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(num);
  };

  const handleCopyText = (text: string, orderId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedOrderId(orderId);
    setTimeout(() => setCopiedOrderId(null), 2000);
  };

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-[#f7f3ed] flex items-center justify-center text-[#7e5434]">
        <Loader2 className="w-8 h-8 animate-spin text-[#543827]" />
      </div>
    );
  }

  // Login Screen if directly accessing /admin
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#f7f3ed] text-[#3b281a] flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm bg-[#fcfaf7] border border-[#ebdccb] rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 card-shadow">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-[#543827] flex items-center justify-center mx-auto text-[#fcfaf7] shadow-md">
              <BearHead className="w-8 h-8 text-[#f5efe6]" />
            </div>
            <h1 className="text-xl font-extrabold text-[#543827] tracking-tight">Admin Sepia Store</h1>
            <p className="text-xs text-[#7e5434]">Masuk untuk mengelola produk, pesanan, dan stok</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#543827] mb-1.5">Username</label>
              <input
                type="text"
                placeholder="admin"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                required
                className="w-full bg-[#f5efe6] border border-[#ebdccb] focus:border-[#543827] rounded-xl px-3.5 py-2.5 text-sm text-[#543827] placeholder-[#9e6d42] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#543827] mb-1.5">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                required
                className="w-full bg-[#f5efe6] border border-[#ebdccb] focus:border-[#543827] rounded-xl px-3.5 py-2.5 text-sm text-[#543827] placeholder-[#9e6d42] focus:outline-none"
              />
            </div>

            {loginError && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3.5 rounded-2xl font-bold text-xs bg-[#543827] hover:bg-[#67442d] text-[#fcfaf7] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              {isLoggingIn ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              <span>Masuk ke Dashboard</span>
            </button>
          </form>

          <div className="text-center">
            <Link href="/" className="text-xs text-[#9e6d42] hover:text-[#543827] transition-colors">
              &larr; Kembali ke Toko
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Logged-in Dashboard
  return (
    <div className="min-h-screen bg-[#f7f3ed] text-[#3b281a] flex flex-col">
      {/* Header */}
      <header className="border-b border-[#ebdccb] bg-[#f7f3ed] sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-xs font-bold text-[#7e5434] hover:text-[#543827] flex items-center gap-1.5">
              <ArrowLeft className="w-4 h-4" />
              <span>Lihat Toko</span>
            </Link>
            <span className="text-[#ebdccb]">|</span>
            <div className="flex items-center gap-2">
              <BearHead className="w-5 h-5 text-[#7e5434]" />
              <span className="font-extrabold text-sm text-[#543827]">SEPIA STORE ADMIN</span>
              <span className="text-[10px] bg-[#ebdccb] text-[#543827] border border-[#dec4a6] px-1.5 py-0.5 rounded font-mono font-bold">
                TURSO LIVE
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchDashboardData}
              disabled={isLoadingData}
              className="p-2 rounded-xl bg-[#f5efe6] hover:bg-[#ebdccb] text-[#543827] border border-[#dec4a6] transition-colors cursor-pointer"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingData ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Dashboard Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Metric Cards */}
        {metrics && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-[#fcfaf7] border border-[#ebdccb] space-y-1 card-shadow">
              <span className="text-xs font-semibold text-[#7e5434] flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-[#b88654]" />
                <span>Total Omset Lunas</span>
              </span>
              <p className="text-lg sm:text-2xl font-black text-[#543827]">
                {formatRupiah(metrics.totalRevenue)}
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-[#fcfaf7] border border-[#ebdccb] space-y-1 card-shadow">
              <span className="text-xs font-semibold text-[#7e5434] flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-700" />
                <span>Pesanan Selesai</span>
              </span>
              <p className="text-lg sm:text-2xl font-black text-[#543827]">
                {metrics.paidOrders} <span className="text-xs font-normal text-[#9e6d42]">transaksi</span>
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-[#fcfaf7] border border-[#ebdccb] space-y-1 card-shadow">
              <span className="text-xs font-semibold text-[#7e5434] flex items-center gap-1.5">
                <ShoppingBag className="w-4 h-4 text-[#7e5434]" />
                <span>Total Pesanan Masuk</span>
              </span>
              <p className="text-lg sm:text-2xl font-black text-[#543827]">
                {metrics.totalOrders}
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-[#fcfaf7] border border-[#ebdccb] space-y-1 card-shadow">
              <span className="text-xs font-semibold text-[#7e5434] flex items-center gap-1.5">
                <PackagePlus className="w-4 h-4 text-purple-700" />
                <span>Sisa Stok Akun Aktif</span>
              </span>
              <p className="text-lg sm:text-2xl font-black text-emerald-700">
                {metrics.activeStockCount} <span className="text-xs font-normal text-[#9e6d42]">akun</span>
              </p>
            </div>
          </div>
        )}

        {/* Tab Selector */}
        <div className="flex border-b border-[#ebdccb] gap-3 sm:gap-6 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'orders'
                ? 'border-[#543827] text-[#543827]'
                : 'border-transparent text-[#9e6d42] hover:text-[#543827]'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Riwayat Transaksi ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('add-product')}
            className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'add-product'
                ? 'border-[#543827] text-[#543827]'
                : 'border-transparent text-[#9e6d42] hover:text-[#543827]'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Tambah Produk Baru</span>
          </button>

          <button
            onClick={() => setActiveTab('stock')}
            className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'stock'
                ? 'border-[#543827] text-[#543827]'
                : 'border-transparent text-[#9e6d42] hover:text-[#543827]'
            }`}
          >
            <PackagePlus className="w-4 h-4" />
            <span>Input Stok Akun (Bulk)</span>
          </button>

          <button
            onClick={() => setActiveTab('variants')}
            className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'variants'
                ? 'border-[#543827] text-[#543827]'
                : 'border-transparent text-[#9e6d42] hover:text-[#543827]'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Katalog &amp; Sisa Stok</span>
          </button>
        </div>

        {/* TAB 1: ORDERS TABLE */}
        {activeTab === 'orders' && (
          <div className="rounded-3xl bg-[#fcfaf7] border border-[#ebdccb] overflow-hidden card-shadow">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#3b281a]">
                <thead className="bg-[#f5efe6] text-[#7e5434] font-semibold uppercase tracking-wider text-[11px] border-b border-[#ebdccb]">
                  <tr>
                    <th className="px-4 py-3">Order ID</th>
                    <th className="px-4 py-3">Aplikasi / Paket</th>
                    <th className="px-4 py-3">Pembeli</th>
                    <th className="px-4 py-3">Total Bayar</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Akun Diserahkan</th>
                    <th className="px-4 py-3">Waktu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#ebdccb]">
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-[#9e6d42]">
                        Belum ada riwayat pesanan.
                      </td>
                    </tr>
                  ) : (
                    orders.map((o) => (
                      <tr key={o.id} className="hover:bg-[#f5efe6] transition-colors">
                        <td className="px-4 py-3 font-mono font-bold text-[#543827]">
                          <Link href={`/order/${o.orderId}`} target="_blank" className="hover:underline">
                            {o.orderId}
                          </Link>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-bold text-[#543827]">{o.productName}</p>
                          <p className="text-[11px] text-[#7e5434]">{o.variantName}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-bold text-[#543827]">{o.customerName}</p>
                          <a
                            href={`https://wa.me/${o.customerWhatsapp.replace(/^0/, '62')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] text-emerald-700 hover:underline"
                          >
                            {o.customerWhatsapp}
                          </a>
                        </td>
                        <td className="px-4 py-3 font-extrabold text-[#543827]">
                          {formatRupiah(o.totalPayment)}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              o.status === 'completed'
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                                : o.status === 'pending'
                                ? 'bg-amber-50 text-amber-800 border border-amber-300'
                                : 'bg-rose-50 text-rose-800 border border-rose-200'
                            }`}
                          >
                            {o.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 max-w-xs">
                          {o.accountDelivered ? (
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[11px] truncate text-[#543827]">
                                {o.accountDelivered}
                              </span>
                              <button
                                onClick={() => handleCopyText(o.accountDelivered!, o.orderId)}
                                className="p-1 text-[#9e6d42] hover:text-[#543827]"
                                title="Salin Akun"
                              >
                                {copiedOrderId === o.orderId ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-700" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          ) : (
                            <span className="text-[#9e6d42]">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-[#9e6d42] text-[11px] whitespace-nowrap">
                          {new Date(o.createdAt).toLocaleString('id-ID')}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: INPUT PRODUK BARU */}
        {activeTab === 'add-product' && (
          <div className="max-w-3xl bg-[#fcfaf7] border border-[#ebdccb] rounded-3xl p-6 sm:p-8 space-y-6 card-shadow">
            <div className="flex items-center gap-2.5">
              <BearHead className="w-6 h-6 text-[#7e5434]" />
              <div>
                <h2 className="text-base font-bold text-[#543827]">Tambah Produk Aplikasi Baru</h2>
                <p className="text-xs text-[#7e5434] mt-0.5">
                  Publikasikan akun aplikasi baru ke katalog Sepia Store lengkap dengan varian paket dan harganya.
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-6">
              {/* Product Basic Info */}
              <div className="space-y-4 p-4 rounded-2xl bg-[#f5efe6] border border-[#ebdccb]">
                <h3 className="text-xs font-bold text-[#543827] uppercase tracking-wider">
                  1. Informasi Produk
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#543827] mb-1.5">
                      Nama Aplikasi / Produk *
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Disney+ Hotstar VIP"
                      value={newProductName}
                      onChange={(e) => setNewProductName(e.target.value)}
                      required
                      className="w-full bg-white border border-[#ebdccb] focus:border-[#543827] rounded-xl px-3.5 py-2.5 text-sm text-[#543827] placeholder-[#9e6d42] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#543827] mb-1.5">
                      Kategori *
                    </label>
                    <select
                      value={newCategoryId}
                      onChange={(e) => setNewCategoryId(e.target.value)}
                      className="w-full bg-white border border-[#ebdccb] focus:border-[#543827] rounded-xl px-3.5 py-2.5 text-sm text-[#543827] focus:outline-none cursor-pointer"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#543827] mb-1.5">
                      URL Gambar Sampul (Cover Image)
                    </label>
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/... (atau kosongkan)"
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      className="w-full bg-white border border-[#ebdccb] focus:border-[#543827] rounded-xl px-3.5 py-2.5 text-sm text-[#543827] placeholder-[#9e6d42] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#543827] mb-1.5">
                      Badge / Label Khusus (Opsional)
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: HOT, TERLARIS, HEMAT"
                      value={newBadge}
                      onChange={(e) => setNewBadge(e.target.value)}
                      className="w-full bg-white border border-[#ebdccb] focus:border-[#543827] rounded-xl px-3.5 py-2.5 text-sm text-[#543827] placeholder-[#9e6d42] focus:outline-none uppercase"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#543827] mb-1.5">
                    Deskripsi Singkat Aplikasi *
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Contoh: Nonton film Disney, Marvel, dan serial lokal tanpa iklan kualitas Full HD. Garansi full sesuai durasi."
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    required
                    className="w-full bg-white border border-[#ebdccb] focus:border-[#543827] rounded-xl p-3 text-xs text-[#543827] placeholder-[#9e6d42] focus:outline-none"
                  />
                </div>
              </div>

              {/* Variants Form */}
              <div className="space-y-4 p-4 rounded-2xl bg-[#f5efe6] border border-[#ebdccb]">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-[#543827] uppercase tracking-wider">
                    2. Pilihan Paket &amp; Harga Varian
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddVariantRow}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#ebdccb] hover:bg-[#dec4a6] text-[#543827] border border-[#dec4a6] transition-colors cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Tambah Varian Lain</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {newVariants.map((variant, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-white border border-[#ebdccb] space-y-3 relative shadow-sm"
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-[#ebdccb]">
                        <span className="text-xs font-bold text-[#543827]">
                          Varian #{idx + 1}
                        </span>
                        {newVariants.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveVariantRow(idx)}
                            className="text-rose-600 hover:text-rose-800 p-1 text-xs flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Hapus</span>
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] text-[#7e5434] mb-1 font-semibold">
                            Nama Paket Varian *
                          </label>
                          <input
                            type="text"
                            placeholder="Misal: 1 Bulan Private"
                            value={variant.name}
                            onChange={(e) => handleVariantChange(idx, 'name', e.target.value)}
                            required
                            className="w-full bg-[#f5efe6] border border-[#ebdccb] rounded-lg px-3 py-2 text-xs text-[#543827] focus:outline-none focus:border-[#543827]"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] text-[#7e5434] mb-1 font-semibold">
                            Durasi (Hari) *
                          </label>
                          <input
                            type="number"
                            placeholder="30"
                            value={variant.durationDays}
                            onChange={(e) => handleVariantChange(idx, 'durationDays', Number(e.target.value))}
                            required
                            className="w-full bg-[#f5efe6] border border-[#ebdccb] rounded-lg px-3 py-2 text-xs text-[#543827] focus:outline-none focus:border-[#543827]"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] text-[#7e5434] mb-1 font-semibold">
                            Harga Jual (Rp) *
                          </label>
                          <input
                            type="number"
                            placeholder="25000"
                            value={variant.price}
                            onChange={(e) => handleVariantChange(idx, 'price', e.target.value)}
                            required
                            className="w-full bg-[#f5efe6] border border-[#ebdccb] rounded-lg px-3 py-2 text-xs text-[#543827] focus:outline-none focus:border-[#543827]"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] text-[#7e5434] mb-1 font-semibold">
                            Harga Coret Normal (Rp)
                          </label>
                          <input
                            type="number"
                            placeholder="45000"
                            value={variant.originalPrice}
                            onChange={(e) => handleVariantChange(idx, 'originalPrice', e.target.value)}
                            className="w-full bg-[#f5efe6] border border-[#ebdccb] rounded-lg px-3 py-2 text-xs text-[#543827] focus:outline-none focus:border-[#543827]"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] text-[#7e5434] mb-1 font-semibold">
                            Catatan Paket
                          </label>
                          <input
                            type="text"
                            placeholder="Contoh: 1 Profil Sharing, Bebas Kunci PIN"
                            value={variant.description}
                            onChange={(e) => handleVariantChange(idx, 'description', e.target.value)}
                            className="w-full bg-[#f5efe6] border border-[#ebdccb] rounded-lg px-3 py-2 text-xs text-[#543827] focus:outline-none focus:border-[#543827]"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Feedback messages */}
              {productSuccessMessage && (
                <div className="flex items-center gap-2 p-3 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>{productSuccessMessage}</span>
                </div>
              )}

              {productErrorMessage && (
                <div className="flex items-center gap-2 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{productErrorMessage}</span>
                </div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={isCreatingProduct}
                className="w-full py-3.5 rounded-2xl font-bold text-xs bg-[#543827] hover:bg-[#67442d] text-white transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                {isCreatingProduct ? <Loader2 className="w-4 h-4 animate-spin" /> : <BearPaw className="w-4 h-4" />}
                <span>Simpan dan Terbitkan Produk Baru</span>
              </button>
            </form>
          </div>
        )}

        {/* TAB 3: BULK STOCK INJECTION */}
        {activeTab === 'stock' && (
          <div className="max-w-2xl bg-[#fcfaf7] border border-[#ebdccb] rounded-3xl p-6 sm:p-8 space-y-6 card-shadow">
            <div className="flex items-center gap-2">
              <BearPaw className="w-5 h-5 text-[#7e5434]" />
              <div>
                <h2 className="text-base font-bold text-[#543827]">Input Massal (Bulk) Stok Akun</h2>
                <p className="text-xs text-[#7e5434] mt-0.5">
                  Pilih varian paket, lalu paste kredensial akun di textarea (1 baris per akun).
                </p>
              </div>
            </div>

            <form onSubmit={handleAddStock} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#543827] mb-1.5">
                  Pilih Produk &amp; Varian
                </label>
                <select
                  value={selectedVariantId}
                  onChange={(e) => setSelectedVariantId(e.target.value)}
                  className="w-full bg-[#f5efe6] border border-[#ebdccb] focus:border-[#543827] rounded-xl px-3.5 py-2.5 text-sm text-[#543827] focus:outline-none"
                >
                  {variants.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.productName} : {v.name} (Sisa Stok: {v.stockCount})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#543827] mb-1.5">
                  Daftar Akun (1 Akun Per Baris)
                </label>
                <textarea
                  rows={8}
                  placeholder={`Email: user1@gmail.com | Pass: Sepia#123 | Profil: 2 (PIN: 1122)\nEmail: user2@gmail.com | Pass: Sepia#123 | Profil: 3 (PIN: 3344)\nhttps://spotify.com/family/join/sepia-token-example`}
                  value={rawAccounts}
                  onChange={(e) => setRawAccounts(e.target.value)}
                  required
                  className="w-full bg-[#f5efe6] border border-[#ebdccb] focus:border-[#543827] rounded-xl p-3.5 text-xs font-mono text-[#543827] placeholder-[#9e6d42] focus:outline-none leading-relaxed"
                />
              </div>

              {stockMessage && (
                <div className="flex items-center gap-2 p-3 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>{stockMessage}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmittingStock}
                className="w-full py-3.5 rounded-2xl font-bold text-xs bg-[#543827] hover:bg-[#67442d] text-white transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                {isSubmittingStock ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                <span>Simpan Stok Akun Sekarang</span>
              </button>
            </form>
          </div>
        )}

        {/* TAB 4: VARIANTS & STOCKS OVERVIEW */}
        {activeTab === 'variants' && (
          <div className="space-y-6">
            {/* Products List with Delete Option */}
            <div className="rounded-3xl bg-[#fcfaf7] border border-[#ebdccb] p-6 space-y-4 card-shadow">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#543827] flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#7e5434]" />
                  <span>Daftar Produk Aktif di Toko ({products.length})</span>
                </h3>
                <button
                  onClick={() => setActiveTab('add-product')}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#543827] text-white hover:bg-[#67442d] transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Tambah Produk</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((p) => (
                  <div
                    key={p.id}
                    className="p-4 rounded-2xl bg-[#f5efe6] border border-[#ebdccb] flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        className="w-12 h-12 rounded-xl object-cover border border-[#dec4a6] shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#543827] truncate">{p.name}</p>
                        <p className="text-[11px] text-[#7e5434] truncate">{p.description}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteProduct(p.id, p.name)}
                      className="p-2 text-[#9e6d42] hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors shrink-0"
                      title="Hapus Produk"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Individual Variants Stock Table */}
            <div className="rounded-3xl bg-[#fcfaf7] border border-[#ebdccb] overflow-hidden card-shadow">
              <div className="p-4 border-b border-[#ebdccb] bg-[#f5efe6]">
                <h3 className="text-xs font-bold text-[#543827] uppercase tracking-wider">
                  Rincian Stok Per Varian
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-[#3b281a]">
                  <thead className="bg-[#f5efe6] text-[#7e5434] font-semibold uppercase tracking-wider text-[11px] border-b border-[#ebdccb]">
                    <tr>
                      <th className="px-4 py-3">Produk</th>
                      <th className="px-4 py-3">Varian Paket</th>
                      <th className="px-4 py-3">Harga Jual</th>
                      <th className="px-4 py-3">Harga Asli</th>
                      <th className="px-4 py-3">Stok Belum Terjual</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#ebdccb]">
                    {variants.map((v) => (
                      <tr key={v.id} className="hover:bg-[#f5efe6] transition-colors">
                        <td className="px-4 py-3 font-bold text-[#543827]">{v.productName}</td>
                        <td className="px-4 py-3 text-[#7e5434]">{v.name}</td>
                        <td className="px-4 py-3 font-extrabold text-[#543827]">
                          {formatRupiah(v.price)}
                        </td>
                        <td className="px-4 py-3 text-[#9e6d42] line-through">
                          {formatRupiah(v.originalPrice)}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                              v.stockCount > 0
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                                : 'bg-rose-50 text-rose-800 border border-rose-200'
                            }`}
                          >
                            {v.stockCount} Akun
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
