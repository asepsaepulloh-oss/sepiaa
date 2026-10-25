'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BearHead, BearPaw } from '@/components/BearIcon';
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  Copy,
  Check,
  ShieldCheck,
  Zap,
  Clock,
  ShoppingBag,
  LogOut,
  ExternalLink,
  RefreshCw,
  Layers,
} from 'lucide-react';

interface UserData {
  id: string;
  name: string;
  whatsapp: string;
  email: string | null;
  createdAt: number;
}

interface OrderItem {
  id: string;
  orderId: string;
  productName: string;
  variantName: string;
  amount: number;
  totalPayment: number;
  status: string;
  accountDelivered: string | null;
  durationDays: number;
  createdAt: number;
  completedAt: number | null;
}

export default function UserDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'accounts' | 'orders'>('accounts');
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);

  const fetchDashboard = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/user/dashboard');
      if (res.status === 401) {
        router.push('/login');
        return;
      }
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        setOrders(data.orders || []);
      } else {
        setError(data.error || 'Gagal memuat dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Koneksi ke server gagal');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleLogout = async () => {
    await fetch('/api/user/logout', { method: 'POST' });
    router.push('/');
    router.refresh();
  };

  const handleCopyAccount = (text: string, orderId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedOrderId(orderId);
    setTimeout(() => setCopiedOrderId(null), 2000);
  };

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(num);
  };

  // Hitung sisa hari garansi/masa aktif
  const calculateDaysLeft = (completedAt: number | null, durationDays: number) => {
    if (!completedAt) return 0;
    const expiry = completedAt + durationDays * 24 * 60 * 60 * 1000;
    const diff = expiry - Date.now();
    return Math.max(0, Math.ceil(diff / (24 * 60 * 60 * 1000)));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#19120c] flex flex-col items-center justify-center p-4 text-[#baa496] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#e89a42]" />
        <p className="text-sm font-medium">Memuat Dashboard Member...</p>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-[#19120c] flex flex-col items-center justify-center p-4 text-center space-y-4">
        <div className="p-4 rounded-full bg-[#321715] border border-[#5c2825] text-rose-400">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-bold text-white">Sesi Login Tidak Ditemukan</h1>
        <p className="text-xs text-[#baa496] max-w-sm">
          {error || 'Silakan masuk terlebih dahulu untuk mengakses akun Anda.'}
        </p>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#c4622d] text-white hover:bg-[#b05220] transition-colors"
        >
          Masuk ke Akun
        </Link>
      </div>
    );
  }

  const completedOrders = orders.filter((o) => o.status === 'completed' && o.accountDelivered);

  return (
    <div className="min-h-screen bg-[#19120c] text-[#faf4ee] flex flex-col">
      {/* Top Header */}
      <header className="border-b border-[#3d291b] bg-[#19120c] sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-xs font-bold text-[#baa496] hover:text-white flex items-center gap-1.5">
              <ArrowLeft className="w-4 h-4" />
              <span>Belanja Lagi</span>
            </Link>
            <span className="text-[#3d291b]">|</span>
            <div className="flex items-center gap-2">
              <BearHead className="w-5 h-5 text-[#e89a42]" />
              <span className="font-extrabold text-sm text-white">DASHBOARD MEMBER</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchDashboard}
              className="p-2 rounded-xl bg-[#231810] hover:bg-[#2d2017] text-[#faf4ee] border border-[#3d291b] transition-colors cursor-pointer"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4 text-[#e89a42]" />
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-[#321715] hover:bg-[#441f1c] text-rose-300 border border-[#5c2825] transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Dashboard Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* User Greeting & Metrics */}
        <section className="rounded-2xl bg-[#231810] border border-[#3d291b] p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#312015]">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-[#c4622d] border border-[#e89a42]/40 flex items-center justify-center text-[#faf4ee]">
                <BearHead className="w-7 h-7 text-[#faf4ee]" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Halo, {user.name}</h1>
                <p className="text-xs text-[#baa496]">
                  WhatsApp: <span className="font-mono text-[#e89a42] font-semibold">{user.whatsapp}</span>
                  {user.email ? ` • ${user.email}` : ''}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-lg text-xs font-bold bg-[#1d3324] text-emerald-400 border border-emerald-500/40 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Garansi Beruang Aktif</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-[#2a1d14] border border-[#3d291b] space-y-1">
              <span className="text-xs text-[#baa496] flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-[#e89a42]" />
                <span>Akun Premium Aktif</span>
              </span>
              <p className="text-2xl font-black text-white">{completedOrders.length}</p>
            </div>

            <div className="p-4 rounded-xl bg-[#2a1d14] border border-[#3d291b] space-y-1">
              <span className="text-xs text-[#baa496] flex items-center gap-1.5">
                <ShoppingBag className="w-4 h-4 text-[#c4622d]" />
                <span>Total Transaksi</span>
              </span>
              <p className="text-2xl font-black text-white">{orders.length}</p>
            </div>

            <div className="p-4 rounded-xl bg-[#2a1d14] border border-[#3d291b] space-y-1 col-span-2 sm:col-span-1">
              <span className="text-xs text-[#baa496] flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span>Member Sejak</span>
              </span>
              <p className="text-sm font-bold text-white mt-1">
                {new Date(user.createdAt).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}
              </p>
            </div>
          </div>
        </section>

        {/* Tab Selector */}
        <div className="flex border-b border-[#3d291b] gap-6">
          <button
            onClick={() => setActiveTab('accounts')}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'accounts'
                ? 'border-[#c4622d] text-[#e89a42]'
                : 'border-transparent text-[#baa496] hover:text-white'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Akun Saya ({completedOrders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'orders'
                ? 'border-[#c4622d] text-[#e89a42]'
                : 'border-transparent text-[#baa496] hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Semua Riwayat Pesanan ({orders.length})</span>
          </button>
        </div>

        {/* TAB 1: AKUN SAYA (DELIVERED SUBSCRIPTIONS) */}
        {activeTab === 'accounts' && (
          <div className="space-y-4">
            {completedOrders.length === 0 ? (
              <div className="py-16 text-center rounded-2xl bg-[#231810] border border-[#3d291b] p-8 space-y-3">
                <BearPaw className="w-10 h-10 text-[#8a7263] mx-auto" />
                <h3 className="text-base font-bold text-white">Belum Ada Akun Premium</h3>
                <p className="text-xs text-[#baa496] max-w-sm mx-auto">
                  Anda belum memiliki akun aktif yang lunas. Silakan jelajahi katalog aplikasi premium kami.
                </p>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#c4622d] text-white hover:bg-[#b05220] transition-colors"
                >
                  Beli Akun Sekarang
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {completedOrders.map((ord) => {
                  const daysLeft = calculateDaysLeft(ord.completedAt, ord.durationDays);

                  return (
                    <div
                      key={ord.id}
                      className="rounded-2xl bg-[#231810] border border-[#3d291b] p-5 space-y-4 flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <span className="text-[10px] font-mono text-[#e89a42] font-bold block">
                              {ord.orderId}
                            </span>
                            <h3 className="text-base font-bold text-white mt-0.5">{ord.productName}</h3>
                            <p className="text-xs text-[#baa496]">{ord.variantName}</p>
                          </div>
                          <span
                            className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                              daysLeft > 0
                                ? 'bg-[#1d3324] text-emerald-400 border border-emerald-500/40'
                                : 'bg-[#321715] text-rose-300 border border-[#5c2825]'
                            }`}
                          >
                            {daysLeft > 0 ? `Aktif: ${daysLeft} Hari Lagi` : 'Kedaluwarsa'}
                          </span>
                        </div>

                        {/* Monospace Credentials Box */}
                        <div className="p-3.5 rounded-xl bg-[#2a1d14] border border-[#442e1f] font-mono text-xs text-[#faf4ee] select-all whitespace-pre-wrap break-all leading-relaxed">
                          {ord.accountDelivered}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="pt-2 flex items-center gap-2">
                        <button
                          onClick={() => handleCopyAccount(ord.accountDelivered!, ord.orderId)}
                          className="flex-1 py-2.5 px-3 rounded-xl font-bold text-xs bg-[#c4622d] hover:bg-[#b05220] text-white transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          {copiedOrderId === ord.orderId ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Tersalin!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Salin Akun</span>
                            </>
                          )}
                        </button>

                        <a
                          href={`https://wa.me/6281234567890?text=Halo%20Admin%20Sepia%20Bear,%20saya%20butuh%20bantuan%20garansi%20untuk%20pesanan%20${ord.orderId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2.5 rounded-xl bg-[#2a1d14] hover:bg-[#35251a] text-[#baa496] hover:text-white border border-[#3d291b] transition-colors"
                          title="Bantuan Garansi"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SEMUA RIWAYAT PESANAN */}
        {activeTab === 'orders' && (
          <div className="rounded-2xl bg-[#231810] border border-[#3d291b] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#dcd0c7]">
                <thead className="bg-[#2a1d14] text-[#baa496] font-semibold uppercase tracking-wider text-[11px] border-b border-[#3d291b]">
                  <tr>
                    <th className="px-4 py-3">Order ID</th>
                    <th className="px-4 py-3">Aplikasi &amp; Varian</th>
                    <th className="px-4 py-3">Total Bayar</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Waktu Order</th>
                    <th className="px-4 py-3">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2d1e15]">
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-[#705c4f]">
                        Belum ada riwayat pesanan.
                      </td>
                    </tr>
                  ) : (
                    orders.map((o) => (
                      <tr key={o.id} className="hover:bg-[#2a1d14] transition-colors">
                        <td className="px-4 py-3 font-mono font-bold text-[#e89a42]">
                          {o.orderId}
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-semibold text-white">{o.productName}</p>
                          <p className="text-[11px] text-[#8a7263]">{o.variantName}</p>
                        </td>
                        <td className="px-4 py-3 font-semibold text-white">
                          {formatRupiah(o.totalPayment)}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              o.status === 'completed'
                                ? 'bg-[#1d3324] text-emerald-400 border border-emerald-500/40'
                                : o.status === 'pending'
                                ? 'bg-[#382316] text-[#e89a42] border border-[#5c3a24]'
                                : 'bg-[#321715] text-rose-400 border border-[#5c2825]'
                            }`}
                          >
                            {o.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[#705c4f] text-[11px] whitespace-nowrap">
                          {new Date(o.createdAt).toLocaleString('id-ID')}
                        </td>
                        <td className="px-4 py-3">
                          <Link
                            href={`/order/${o.orderId}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#2a1d14] hover:bg-[#35251a] text-[#e89a42] border border-[#3d291b] transition-colors"
                          >
                            <span>Lihat Tagihan</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
