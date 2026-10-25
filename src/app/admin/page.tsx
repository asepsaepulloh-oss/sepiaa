'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { BearHead, BearPaw } from '@/components/BearIcon';
import {
  KeyRound,
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

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Dashboard Data
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [variants, setVariants] = useState<VariantItem[]>([]);
  const [activeTab, setActiveTab] = useState<'orders' | 'stock' | 'variants'>('orders');
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Stock Form
  const [selectedVariantId, setSelectedVariantId] = useState('');
  const [rawAccounts, setRawAccounts] = useState('');
  const [stockMessage, setStockMessage] = useState<string | null>(null);
  const [isSubmittingStock, setIsSubmittingStock] = useState(false);

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
        setOrders(data.orders || []);
        setVariants(data.variants || []);
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
      <div className="min-h-screen bg-[#120d0a] flex items-center justify-center text-[#bcaaa0]">
        <Loader2 className="w-8 h-8 animate-spin text-[#e59a44]" />
      </div>
    );
  }

  // Not Authenticated -> Show Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#120d0a] flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm bg-[#1a120c] border border-[#3b2a1e] rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-[#c86d34]/20 border border-[#c86d34]/40 flex items-center justify-center mx-auto text-[#e59a44]">
              <BearHead className="w-8 h-8 text-[#e59a44]" />
            </div>
            <h1 className="text-lg font-bold text-white tracking-tight">Admin Sepia Bear</h1>
            <p className="text-xs text-[#bcaaa0]">Masuk untuk mengelola produk, pesanan, dan stok</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#cfbeb5] mb-1.5">Username</label>
              <input
                type="text"
                placeholder="admin"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                required
                className="w-full bg-[#221711] border border-[#3b2a1e] focus:border-[#c86d34] rounded-xl px-3.5 py-2.5 text-sm text-[#fbf6f0] placeholder-[#7d675b] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#cfbeb5] mb-1.5">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                required
                className="w-full bg-[#221711] border border-[#3b2a1e] focus:border-[#c86d34] rounded-xl px-3.5 py-2.5 text-sm text-[#fbf6f0] placeholder-[#7d675b] focus:outline-none"
              />
            </div>

            {loginError && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3 rounded-xl font-bold text-xs bg-gradient-to-r from-[#c86d34] to-[#a35222] hover:from-[#d97736] hover:to-[#b45d29] text-white transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-amber-950/40"
            >
              {isLoggingIn ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              <span>Masuk ke Dashboard</span>
            </button>
          </form>

          <div className="text-center">
            <Link href="/" className="text-xs text-[#8a7266] hover:text-[#bcaaa0] transition-colors">
              &larr; Kembali ke Toko
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Logged-in Dashboard
  return (
    <div className="min-h-screen bg-[#120d0a] text-[#fbf6f0] flex flex-col">
      {/* Top Navigation */}
      <header className="border-b border-[#31241b] bg-[#17100b]/92 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-xs font-bold text-[#bcaaa0] hover:text-white flex items-center gap-1.5">
              <ArrowLeft className="w-4 h-4" />
              <span>Lihat Toko</span>
            </Link>
            <span className="text-[#3b2a1e]">|</span>
            <div className="flex items-center gap-2">
              <BearHead className="w-5 h-5 text-[#e59a44]" />
              <span className="font-extrabold text-sm text-white">SEPIA BEAR ADMIN</span>
              <span className="text-[10px] bg-[#3a281c] text-[#e59a44] border border-[#6b472e] px-1.5 py-0.5 rounded font-mono">
                TURSO LIVE
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchDashboardData}
              disabled={isLoadingData}
              className="p-2 rounded-xl bg-[#221812] hover:bg-[#2d2017] text-[#e8dbce] border border-[#3d2e23] transition-colors cursor-pointer"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingData ? 'animate-spin text-[#e59a44]' : ''}`} />
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Dashboard */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Metric Cards */}
        {metrics && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-[#1a120c] border border-[#35251a] space-y-1 shadow-lg">
              <span className="text-xs font-medium text-[#bcaaa0] flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-[#e59a44]" />
                <span>Total Omset Lunas</span>
              </span>
              <p className="text-lg sm:text-2xl font-black text-[#e59a44]">
                {formatRupiah(metrics.totalRevenue)}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#1a120c] border border-[#35251a] space-y-1 shadow-lg">
              <span className="text-xs font-medium text-[#bcaaa0] flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>Pesanan Selesai</span>
              </span>
              <p className="text-lg sm:text-2xl font-black text-white">
                {metrics.paidOrders} <span className="text-xs font-normal text-[#8a7266]">transaksi</span>
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#1a120c] border border-[#35251a] space-y-1 shadow-lg">
              <span className="text-xs font-medium text-[#bcaaa0] flex items-center gap-1.5">
                <ShoppingBag className="w-4 h-4 text-[#d97736]" />
                <span>Total Pesanan Masuk</span>
              </span>
              <p className="text-lg sm:text-2xl font-black text-white">
                {metrics.totalOrders}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#1a120c] border border-[#35251a] space-y-1 shadow-lg">
              <span className="text-xs font-medium text-[#bcaaa0] flex items-center gap-1.5">
                <PackagePlus className="w-4 h-4 text-purple-400" />
                <span>Sisa Stok Akun Aktif</span>
              </span>
              <p className="text-lg sm:text-2xl font-black text-emerald-400">
                {metrics.activeStockCount} <span className="text-xs font-normal text-[#8a7266]">akun</span>
              </p>
            </div>
          </div>
        )}

        {/* Tab Selector */}
        <div className="flex border-b border-[#31241b] gap-4">
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'orders'
                ? 'border-[#c86d34] text-[#e59a44]'
                : 'border-transparent text-[#a69286] hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Riwayat Transaksi ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('stock')}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'stock'
                ? 'border-[#c86d34] text-[#e59a44]'
                : 'border-transparent text-[#a69286] hover:text-white'
            }`}
          >
            <PackagePlus className="w-4 h-4" />
            <span>Input Stok Akun (Bulk)</span>
          </button>

          <button
            onClick={() => setActiveTab('variants')}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'variants'
                ? 'border-[#c86d34] text-[#e59a44]'
                : 'border-transparent text-[#a69286] hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Katalog &amp; Sisa Stok</span>
          </button>
        </div>

        {/* TAB 1: ORDERS TABLE */}
        {activeTab === 'orders' && (
          <div className="rounded-2xl bg-[#1a120c] border border-[#35251a] overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#dcd0c7]">
                <thead className="bg-[#241810] text-[#a69286] font-semibold uppercase tracking-wider text-[11px] border-b border-[#35251a]">
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
                <tbody className="divide-y divide-[#281b12]">
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-[#7d675b]">
                        Belum ada riwayat pesanan.
                      </td>
                    </tr>
                  ) : (
                    orders.map((o) => (
                      <tr key={o.id} className="hover:bg-[#20150e] transition-colors">
                        <td className="px-4 py-3 font-mono font-bold text-[#e59a44]">
                          <Link href={`/order/${o.orderId}`} target="_blank" className="hover:underline">
                            {o.orderId}
                          </Link>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-semibold text-white">{o.productName}</p>
                          <p className="text-[11px] text-[#8a7266]">{o.variantName}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-white">{o.customerName}</p>
                          <a
                            href={`https://wa.me/${o.customerWhatsapp.replace(/^0/, '62')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] text-emerald-400 hover:underline"
                          >
                            {o.customerWhatsapp}
                          </a>
                        </td>
                        <td className="px-4 py-3 font-semibold text-white">
                          {formatRupiah(o.totalPayment)}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              o.status === 'completed'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : o.status === 'pending'
                                ? 'bg-[#c86d34]/20 text-[#f0b27a] border border-[#c86d34]/30'
                                : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            }`}
                          >
                            {o.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 max-w-xs">
                          {o.accountDelivered ? (
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[11px] truncate text-[#dcd0c7]">
                                {o.accountDelivered}
                              </span>
                              <button
                                onClick={() => handleCopyText(o.accountDelivered!, o.orderId)}
                                className="p-1 text-[#8a7266] hover:text-white"
                                title="Salin Akun"
                              >
                                {copiedOrderId === o.orderId ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          ) : (
                            <span className="text-[#5c4639]">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-[#7d675b] text-[11px] whitespace-nowrap">
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

        {/* TAB 2: BULK STOCK INJECTION */}
        {activeTab === 'stock' && (
          <div className="max-w-2xl bg-[#1a120c] border border-[#35251a] rounded-2xl p-6 space-y-6 shadow-lg">
            <div className="flex items-center gap-2">
              <BearPaw className="w-5 h-5 text-[#e59a44]" />
              <div>
                <h2 className="text-base font-bold text-white">Input Massal (Bulk) Stok Akun</h2>
                <p className="text-xs text-[#bcaaa0] mt-0.5">
                  Pilih varian paket, lalu paste kredensial akun di textarea (1 baris per akun).
                </p>
              </div>
            </div>

            <form onSubmit={handleAddStock} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#cfbeb5] mb-1.5">
                  Pilih Produk &amp; Varian
                </label>
                <select
                  value={selectedVariantId}
                  onChange={(e) => setSelectedVariantId(e.target.value)}
                  className="w-full bg-[#241810] border border-[#3d2b1f] focus:border-[#c86d34] rounded-xl px-3.5 py-2.5 text-sm text-[#fbf6f0] focus:outline-none"
                >
                  {variants.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.productName} &mdash; {v.name} (Sisa Stok: {v.stockCount})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#cfbeb5] mb-1.5">
                  Daftar Akun (1 Akun Per Baris)
                </label>
                <textarea
                  rows={8}
                  placeholder={`Email: user1@gmail.com | Pass: Sepia#123 | Profil: 2 (PIN: 1122)\nEmail: user2@gmail.com | Pass: Sepia#123 | Profil: 3 (PIN: 3344)\nhttps://spotify.com/family/join/sepia-token-example`}
                  value={rawAccounts}
                  onChange={(e) => setRawAccounts(e.target.value)}
                  required
                  className="w-full bg-[#241810] border border-[#3d2b1f] focus:border-[#c86d34] rounded-xl p-3.5 text-xs font-mono text-[#fbf6f0] placeholder-[#7d675b] focus:outline-none leading-relaxed"
                />
              </div>

              {stockMessage && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>{stockMessage}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmittingStock}
                className="w-full py-3 rounded-xl font-bold text-xs bg-gradient-to-r from-[#c86d34] to-[#a35222] hover:from-[#d97736] hover:to-[#b45d29] text-white transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-amber-950/40"
              >
                {isSubmittingStock ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                <span>Simpan Stok Akun Sekarang</span>
              </button>
            </form>
          </div>
        )}

        {/* TAB 3: VARIANTS & STOCKS OVERVIEW */}
        {activeTab === 'variants' && (
          <div className="rounded-2xl bg-[#1a120c] border border-[#35251a] overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#dcd0c7]">
                <thead className="bg-[#241810] text-[#a69286] font-semibold uppercase tracking-wider text-[11px] border-b border-[#35251a]">
                  <tr>
                    <th className="px-4 py-3">Produk</th>
                    <th className="px-4 py-3">Varian Paket</th>
                    <th className="px-4 py-3">Harga Jual</th>
                    <th className="px-4 py-3">Harga Asli</th>
                    <th className="px-4 py-3">Stok Belum Terjual</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#281b12]">
                  {variants.map((v) => (
                    <tr key={v.id} className="hover:bg-[#20150e] transition-colors">
                      <td className="px-4 py-3 font-bold text-white">{v.productName}</td>
                      <td className="px-4 py-3 text-[#dcd0c7]">{v.name}</td>
                      <td className="px-4 py-3 font-semibold text-[#e59a44]">
                        {formatRupiah(v.price)}
                      </td>
                      <td className="px-4 py-3 text-[#735e53] line-through">
                        {formatRupiah(v.originalPrice)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            v.stockCount > 0
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
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
        )}
      </main>
    </div>
  );
}
