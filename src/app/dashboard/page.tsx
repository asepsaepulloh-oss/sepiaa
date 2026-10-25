'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BearHead, BearPaw } from '@/components/BearIcon';
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  AlertTriangle,
  Copy,
  Check,
  ShieldCheck,
  Zap,
  Clock,
  ShoppingBag,
  LogOut,
  ExternalLink,
  RefreshCw,
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

  const calculateDaysLeft = (completedAt: number | null, durationDays: number) => {
    if (!completedAt) return 0;
    const expiry = completedAt + durationDays * 24 * 60 * 60 * 1000;
    const diff = expiry - Date.now();
    return Math.max(0, Math.ceil(diff / (24 * 60 * 60 * 1000)));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f7f3ed] flex flex-col items-center justify-center p-4 text-[#7e5434] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#543827]" />
        <p className="text-sm font-semibold">Memuat Dashboard Member...</p>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-[#f7f3ed] flex flex-col items-center justify-center p-4 text-center space-y-4">
        <div className="p-4 rounded-full bg-rose-50 border border-rose-200 text-rose-700">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-bold text-[#543827]">Sesi Login Tidak Ditemukan</h1>
        <p className="text-xs text-[#7e5434] max-w-sm">
          {error || 'Silakan masuk terlebih dahulu untuk mengakses akun Anda.'}
        </p>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold bg-[#543827] text-white hover:bg-[#67442d] transition-colors"
        >
          Masuk ke Akun
        </Link>
      </div>
    );
  }

  const completedOrders = orders.filter((o) => o.status === 'completed' && o.accountDelivered);

  return (
    <div className="min-h-screen bg-[#f7f3ed] text-[#3b281a] flex flex-col">
      {/* Top Header */}
      <header className="border-b border-[#ebdccb] bg-[#f7f3ed] sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-xs font-bold text-[#7e5434] hover:text-[#543827] flex items-center gap-1.5">
              <ArrowLeft className="w-4 h-4" />
              <span>Belanja Lagi</span>
            </Link>
            <span className="text-[#ebdccb]">|</span>
            <div className="flex items-center gap-2">
              <BearHead className="w-5 h-5 text-[#7e5434]" />
              <span className="font-extrabold text-sm text-[#543827]">DASHBOARD MEMBER</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchDashboard}
              className="p-2 rounded-xl bg-[#f5efe6] hover:bg-[#ebdccb] text-[#543827] border border-[#dec4a6] transition-colors cursor-pointer"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4 text-[#7e5434]" />
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

      {/* Main Dashboard Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* User Greeting & Metrics */}
        <section className="rounded-3xl bg-[#fcfaf7] border border-[#ebdccb] p-6 space-y-6 card-shadow">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#ebdccb]">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#543827] flex items-center justify-center text-[#fcfaf7] shadow-md">
                <BearHead className="w-7 h-7 text-[#f5efe6]" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-[#543827]">Halo, {user.name}</h1>
                <p className="text-xs text-[#7e5434]">
                  WhatsApp: <span className="font-mono text-[#543827] font-bold">{user.whatsapp}</span>
                  {user.email ? ` • ${user.email}` : ''}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>Garansi Resmi Aktif</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-[#f5efe6] border border-[#ebdccb] space-y-1">
              <span className="text-xs text-[#7e5434] flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-[#b88654]" />
                <span>Akun Premium Aktif</span>
              </span>
              <p className="text-2xl font-black text-[#543827]">{completedOrders.length}</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#f5efe6] border border-[#ebdccb] space-y-1">
              <span className="text-xs text-[#7e5434] flex items-center gap-1.5">
                <ShoppingBag className="w-4 h-4 text-[#7e5434]" />
                <span>Total Transaksi</span>
              </span>
              <p className="text-2xl font-black text-[#543827]">{orders.length}</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#f5efe6] border border-[#ebdccb] space-y-1 col-span-2 sm:col-span-1">
              <span className="text-xs text-[#7e5434] flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emerald-700" />
                <span>Member Sejak</span>
              </span>
              <p className="text-sm font-bold text-[#543827] mt-1">
                {new Date(user.createdAt).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}
              </p>
            </div>
          </div>
        </section>

        {/* Tab Selector */}
        <div className="flex border-b border-[#ebdccb] gap-6">
          <button
            onClick={() => setActiveTab('accounts')}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'accounts'
                ? 'border-[#543827] text-[#543827]'
                : 'border-transparent text-[#9e6d42] hover:text-[#543827]'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Akun Saya ({completedOrders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'orders'
                ? 'border-[#543827] text-[#543827]'
                : 'border-transparent text-[#9e6d42] hover:text-[#543827]'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Semua Riwayat Pesanan ({orders.length})</span>
          </button>
        </div>

        {/* TAB 1: AKUN SAYA */}
        {activeTab === 'accounts' && (
          <div className="space-y-4">
            {completedOrders.length === 0 ? (
              <div className="py-16 text-center rounded-3xl bg-[#fcfaf7] border border-[#ebdccb] p-8 space-y-3 card-shadow">
                <BearPaw className="w-10 h-10 text-[#dec4a6] mx-auto" />
                <h3 className="text-base font-bold text-[#543827]">Belum Ada Akun Premium</h3>
                <p className="text-xs text-[#7e5434] max-w-sm mx-auto">
                  Anda belum memiliki akun aktif yang lunas. Silakan pilih aplikasi premium dari katalog kami.
                </p>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold bg-[#543827] text-white hover:bg-[#67442d] transition-colors"
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
                      className="rounded-3xl bg-[#fcfaf7] border border-[#ebdccb] p-6 space-y-4 flex flex-col justify-between card-shadow"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <span className="text-[10px] font-mono text-[#9e6d42] font-bold block">
                              {ord.orderId}
                            </span>
                            <h3 className="text-base font-bold text-[#543827] mt-0.5">{ord.productName}</h3>
                            <p className="text-xs text-[#7e5434]">{ord.variantName}</p>
                          </div>
                          <span
                            className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                              daysLeft > 0
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                                : 'bg-rose-50 text-rose-800 border border-rose-200'
                            }`}
                          >
                            {daysLeft > 0 ? `Aktif: ${daysLeft} Hari Lagi` : 'Kedaluwarsa'}
                          </span>
                        </div>

                        {/* Monospace Credentials Box */}
                        <div className="p-4 rounded-2xl bg-[#f5efe6] border border-[#dec4a6] font-mono text-xs text-[#543827] select-all whitespace-pre-wrap break-all leading-relaxed">
                          {ord.accountDelivered}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="pt-2 flex items-center gap-2">
                        <button
                          onClick={() => handleCopyAccount(ord.accountDelivered!, ord.orderId)}
                          className="flex-1 py-2.5 px-3 rounded-2xl font-bold text-xs bg-[#543827] hover:bg-[#67442d] text-white transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
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
                          href={`https://wa.me/6281234567890?text=Halo%20Admin%20Sepia%20Store,%20saya%20butuh%20bantuan%20garansi%20untuk%20pesanan%20${ord.orderId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2.5 rounded-2xl bg-[#f5efe6] hover:bg-[#ebdccb] text-[#543827] border border-[#dec4a6] transition-colors"
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
          <div className="rounded-3xl bg-[#fcfaf7] border border-[#ebdccb] overflow-hidden card-shadow">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#3b281a]">
                <thead className="bg-[#f5efe6] text-[#7e5434] font-semibold uppercase tracking-wider text-[11px] border-b border-[#ebdccb]">
                  <tr>
                    <th className="px-4 py-3">Order ID</th>
                    <th className="px-4 py-3">Aplikasi &amp; Varian</th>
                    <th className="px-4 py-3">Total Bayar</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Waktu Order</th>
                    <th className="px-4 py-3">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#ebdccb]">
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-[#9e6d42]">
                        Belum ada riwayat pesanan.
                      </td>
                    </tr>
                  ) : (
                    orders.map((o) => (
                      <tr key={o.id} className="hover:bg-[#f5efe6] transition-colors">
                        <td className="px-4 py-3 font-mono font-bold text-[#543827]">
                          {o.orderId}
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-bold text-[#543827]">{o.productName}</p>
                          <p className="text-[11px] text-[#7e5434]">{o.variantName}</p>
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
                        <td className="px-4 py-3 text-[#9e6d42] text-[11px] whitespace-nowrap">
                          {new Date(o.createdAt).toLocaleString('id-ID')}
                        </td>
                        <td className="px-4 py-3">
                          <Link
                            href={`/order/${o.orderId}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#f5efe6] hover:bg-[#ebdccb] text-[#543827] border border-[#dec4a6] transition-colors"
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
