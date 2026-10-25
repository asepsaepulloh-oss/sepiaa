'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import QRCode from 'qrcode';
import { BearHead, BearPaw } from '@/components/BearIcon';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Copy,
  Check,
  RefreshCw,
  ArrowLeft,
  Download,
  ShieldCheck,
  Zap,
  Loader2,
  ExternalLink,
} from 'lucide-react';

interface OrderData {
  orderId: string;
  productName: string;
  variantName: string;
  amount: number;
  fee: number;
  totalPayment: number;
  customerName: string;
  customerWhatsapp: string;
  customerEmail: string | null;
  paymentMethod: string;
  qrString: string | null;
  status: 'pending' | 'completed' | 'expired' | 'canceled';
  accountDelivered: string | null;
  expiredAt: number | null;
  createdAt: number;
  completedAt: number | null;
}

export default function OrderPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = use(params);

  const [order, setOrder] = useState<OrderData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>('--:--');

  const fetchOrder = async (showSpinner = false) => {
    if (showSpinner) setIsRefreshing(true);
    try {
      const res = await fetch(`/api/order/${orderId}`);
      const data = await res.json();
      if (data.success && data.order) {
        setOrder(data.order);
        setError(null);

        if (data.order.qrString && !qrDataUrl) {
          QRCode.toDataURL(data.order.qrString, {
            width: 320,
            margin: 2,
            color: {
              dark: '#000000',
              light: '#ffffff',
            },
          }).then((url) => setQrDataUrl(url));
        }
      } else {
        setError(data.error || 'Pesanan tidak ditemukan');
      }
    } catch (err: any) {
      setError(err.message || 'Gagal memuat status pesanan');
    } finally {
      setIsLoading(false);
      if (showSpinner) setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  useEffect(() => {
    if (!order || order.status !== 'pending') return;

    const interval = setInterval(() => {
      fetchOrder(false);
    }, 3000);

    return () => clearInterval(interval);
  }, [order?.status]);

  useEffect(() => {
    if (!order?.expiredAt || order.status !== 'pending') return;

    const timer = setInterval(() => {
      const diff = order.expiredAt! - Date.now();
      if (diff <= 0) {
        setTimeLeft('00:00');
        clearInterval(timer);
      } else {
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        setTimeLeft(
          `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        );
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [order?.expiredAt, order?.status]);

  const handleCopyAccount = () => {
    if (!order?.accountDelivered) return;
    navigator.clipboard.writeText(order.accountDelivered);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSimulatePayment = async () => {
    setIsSimulating(true);
    try {
      const res = await fetch('/api/order/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchOrder(false);
      } else {
        alert(data.error || 'Gagal melakukan simulasi');
      }
    } catch (err: any) {
      alert('Error simulasi: ' + err.message);
    } finally {
      setIsSimulating(false);
    }
  };

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(num);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#19120c] flex flex-col items-center justify-center p-4 text-[#baa496] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#e89a42]" />
        <p className="text-sm font-medium">Memuat detail tagihan Sepia Bear...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-[#19120c] flex flex-col items-center justify-center p-4 text-center space-y-4">
        <div className="p-4 rounded-full bg-[#321715] border border-[#5c2825] text-rose-400">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-bold text-[#faf4ee]">Pesanan Tidak Ditemukan</h1>
        <p className="text-xs text-[#baa496] max-w-sm">
          {error || 'Pastikan nomor invoice yang Anda buka sudah benar.'}
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#c4622d] text-white hover:bg-[#b05220] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Toko</span>
        </Link>
      </div>
    );
  }

  const isCompleted = order.status === 'completed';
  const isExpired = order.status === 'expired' || order.status === 'canceled';

  return (
    <div className="min-h-screen bg-[#19120c] text-[#faf4ee] flex flex-col">
      {/* Top Header */}
      <header className="border-b border-[#3d291b] bg-[#19120c] sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-[#baa496] hover:text-white transition-colors text-xs font-semibold">
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Toko</span>
          </Link>
          <div className="flex items-center gap-2">
            <BearHead className="w-4 h-4 text-[#e89a42]" />
            <span className="font-mono text-xs text-[#faf4ee] font-bold">{order.orderId}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Status Alert Banner */}
        {isCompleted ? (
          <div className="p-5 rounded-2xl bg-[#1a2d20] border border-[#2c4e36] flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#24422e] flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-7 h-7 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-white">Pembayaran Sukses &amp; Akun Diserahkan</h1>
              <p className="text-xs text-emerald-300 mt-0.5">
                Kredensial akun premium Anda siap dipakai di bawah ini. Simpan atau screenshot data ini.
              </p>
            </div>
          </div>
        ) : isExpired ? (
          <div className="p-5 rounded-2xl bg-[#321715] border border-[#5c2825] flex items-center gap-4">
            <AlertTriangle className="w-7 h-7 text-rose-400 shrink-0" />
            <div>
              <h1 className="text-base font-bold text-white">Tagihan Kedaluwarsa</h1>
              <p className="text-xs text-rose-300 mt-0.5">
                Waktu pembayaran telah habis. Silakan lakukan checkout ulang di beranda toko.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-4 sm:p-5 rounded-2xl bg-[#231810] border border-[#3d291b] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#2e1f15] border border-[#4d3423] flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-[#e89a42]" />
              </div>
              <div>
                <h1 className="text-sm sm:text-base font-bold text-[#faf4ee]">Menunggu Pembayaran QRIS</h1>
                <p className="text-xs text-[#baa496]">
                  Sistem mengecek status otomatis. Akun langsung tampil setelah Anda membayar.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-auto">
              <div className="text-right">
                <span className="text-[10px] text-[#8a7263] block">Sisa Waktu</span>
                <span className="font-mono text-base font-extrabold text-[#e89a42]">{timeLeft}</span>
              </div>
              <button
                onClick={() => fetchOrder(true)}
                disabled={isRefreshing}
                className="p-2.5 rounded-xl bg-[#2a1d14] hover:bg-[#35251a] text-[#faf4ee] border border-[#442e1f] transition-colors cursor-pointer"
                title="Cek Status Sekarang"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#e89a42]' : ''}`} />
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Column: Account Credentials / QRIS Payment */}
          <div className="md:col-span-7 space-y-6">
            {isCompleted ? (
              /* SUCCESS: Account Delivery Box */
              <div className="rounded-2xl bg-[#231810] border border-[#3d291b] p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BearHead className="w-5 h-5 text-[#e89a42]" />
                    <h2 className="text-sm sm:text-base font-bold text-white">Data Akun Langganan Anda</h2>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#1d3324] text-emerald-400 border border-emerald-500/40">
                    AKTIF &amp; BERGARANSI
                  </span>
                </div>

                {/* Monospace Credentials Box */}
                <div className="relative p-4 rounded-xl bg-[#2a1d14] border border-[#442e1f] font-mono text-xs sm:text-sm text-[#faf4ee] select-all whitespace-pre-wrap break-all leading-relaxed">
                  {order.accountDelivered}
                </div>

                {/* Copy Button */}
                <button
                  onClick={handleCopyAccount}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm bg-[#c4622d] hover:bg-[#b05220] text-white transition-colors cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Data Akun Berhasil Disalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Salin Semua Data Akun</span>
                    </>
                  )}
                </button>

                {/* Guarantee Rules */}
                <div className="p-3.5 rounded-xl bg-[#2a1d14] border border-[#3d291b] space-y-1.5 text-xs text-[#baa496]">
                  <p className="font-semibold text-[#faf4ee] flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Ketentuan Garansi Sepia Bear:</span>
                  </p>
                  <ul className="list-disc list-inside space-y-1 pl-1 text-[11px] text-[#baa496]">
                    <li>Dilarang mengubah email, password, atau profil paket akun sharing.</li>
                    <li>Gunakan profil sesuai nomor/PIN yang ditentukan.</li>
                    <li>Garansi penggantian akun baru jika terkendala selama masa aktif.</li>
                  </ul>
                </div>
              </div>
            ) : !isExpired ? (
              /* PENDING: QRIS Box */
              <div className="rounded-2xl bg-[#231810] border border-[#3d291b] p-5 sm:p-6 text-center space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#312015]">
                  <div className="text-left">
                    <p className="text-xs text-[#baa496]">Metode Pembayaran</p>
                    <p className="text-sm font-bold text-white">QRIS Nasional (Pakasir)</p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#382316] text-[#e89a42] border border-[#5c3a24]">
                    SCAN BEBAS BIAYA
                  </span>
                </div>

                {/* QR Code Canvas */}
                <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl max-w-xs mx-auto border-2 border-[#442e1f]">
                  {qrDataUrl ? (
                    <img src={qrDataUrl} alt="QRIS Pakasir" className="w-56 h-56 object-contain" />
                  ) : (
                    <div className="w-56 h-56 flex items-center justify-center text-zinc-600">
                      <Loader2 className="w-8 h-8 animate-spin text-[#c4622d]" />
                    </div>
                  )}
                  <p className="text-[11px] font-extrabold text-[#231810] mt-2 tracking-wider">
                    SEPIA BEAR &bull; QRIS
                  </p>
                </div>

                {qrDataUrl && (
                  <a
                    href={qrDataUrl}
                    download={`QRIS-${order.orderId}.png`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#2a1d14] hover:bg-[#35251a] text-[#faf4ee] border border-[#3d291b] transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Gambar QR</span>
                  </a>
                )}

                {/* Cara Bayar */}
                <div className="text-left p-3.5 rounded-xl bg-[#2a1d14] border border-[#3d291b] space-y-2 text-xs text-[#baa496]">
                  <p className="font-semibold text-[#faf4ee]">Cara Pembayaran:</p>
                  <ol className="list-decimal list-inside space-y-1 text-[11px]">
                    <li>Buka aplikasi m-Banking (BCA, BRI, Mandiri, BNI) atau E-Wallet (Dana, GoPay, OVO, ShopeePay).</li>
                    <li>Pilih menu <strong>Scan QRIS</strong> dan arahkan kamera ke barcode di atas.</li>
                    <li>Periksa nominal tagihan ({formatRupiah(order.totalPayment)}) lalu konfirmasi.</li>
                    <li>Halaman ini akan otomatis diperbarui begitu pembayaran selesai.</li>
                  </ol>
                </div>

                {/* Sandbox Simulation Button */}
                <div className="pt-2 border-t border-[#312015]">
                  <button
                    onClick={handleSimulatePayment}
                    disabled={isSimulating}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold bg-[#1d3324] hover:bg-[#25422f] text-emerald-400 border border-emerald-500/40 transition-colors cursor-pointer"
                  >
                    {isSimulating ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Zap className="w-3.5 h-3.5" />
                    )}
                    <span>Simulasi Bayar Sekarang (Sandbox Mode)</span>
                  </button>
                  <p className="text-[10px] text-[#8a7263] mt-1">
                    Tombol pengujian: langsung menyelesaikan pembayaran &amp; mengirim akun tanpa scan.
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl bg-[#231810] border border-[#3d291b] p-6 text-center space-y-3">
                <p className="text-xs text-[#baa496]">Silakan buat pesanan baru untuk mendapatkan QRIS yang masih aktif.</p>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#c4622d] text-white hover:bg-[#b05220] transition-colors"
                >
                  Pesan Ulang di Beranda
                </Link>
              </div>
            )}
          </div>

          {/* Right Column: Order Summary */}
          <div className="md:col-span-5 space-y-5">
            <div className="rounded-2xl bg-[#231810] border border-[#3d291b] p-5 space-y-4">
              <h3 className="text-xs font-bold text-[#baa496] uppercase tracking-wider">
                Ringkasan Tagihan
              </h3>

              <div className="space-y-3 pb-4 border-b border-[#312015] text-xs">
                <div>
                  <span className="text-[#8a7263] text-[11px] block">Aplikasi:</span>
                  <span className="font-bold text-white text-sm">{order.productName}</span>
                </div>
                <div>
                  <span className="text-[#8a7263] text-[11px] block">Varian Paket:</span>
                  <span className="font-semibold text-[#e89a42]">{order.variantName}</span>
                </div>
                <div>
                  <span className="text-[#8a7263] text-[11px] block">Penerima WhatsApp:</span>
                  <span className="font-mono text-[#faf4ee]">{order.customerWhatsapp}</span>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-[#baa496]">
                  <span>Harga Paket</span>
                  <span>{formatRupiah(order.amount)}</span>
                </div>
                <div className="flex justify-between text-[#baa496]">
                  <span>Biaya Layanan QRIS</span>
                  <span>{formatRupiah(order.fee)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-[#312015]">
                  <span>Total Tagihan</span>
                  <span className="text-[#e89a42] text-base">{formatRupiah(order.totalPayment)}</span>
                </div>
              </div>

              <div className="pt-2">
                <a
                  href={`https://wa.me/6281234567890?text=Halo%20Admin%20Sepia%20Bear,%20konfirmasi%20pesanan%20dengan%20ID%20${order.orderId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold bg-[#2a1d14] hover:bg-[#35251a] text-[#faf4ee] border border-[#3d291b] transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Bantuan CS WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
