'use client';

import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, AlertCircle, Loader2, QrCode, Check, UserCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { BearHead, BearPaw } from './BearIcon';

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
  name: string;
  description: string;
  imageUrl: string;
  badge: string | null;
  variants: Variant[];
}

interface CheckoutModalProps {
  product: Product | null;
  initialVariantId?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  product,
  initialVariantId,
  isOpen,
  onClose,
}) => {
  const router = useRouter();
  const [selectedVariantId, setSelectedVariantId] = useState<string>('');
  const [customerName, setCustomerName] = useState('');
  const [customerWhatsapp, setCustomerWhatsapp] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [currentUser, setCurrentUser] = useState<{ name: string; whatsapp: string; email: string | null } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Ambil data user yang sedang login untuk auto-fill formulir checkout
  useEffect(() => {
    async function loadLoggedUser() {
      try {
        const res = await fetch('/api/user/check');
        const data = await res.json();
        if (data.authenticated && data.user) {
          setCurrentUser(data.user);
          setCustomerName(data.user.name || '');
          setCustomerWhatsapp(data.user.whatsapp || '');
          setCustomerEmail(data.user.email || '');
        }
      } catch {}
    }
    loadLoggedUser();
  }, []);

  // Update varian dan pastikan form terisi otomatis jika modal dibuka
  useEffect(() => {
    if (product && product.variants.length > 0) {
      setSelectedVariantId(initialVariantId || product.variants[0].id);
      setErrorMessage(null);
    }
    if (currentUser) {
      if (!customerName) setCustomerName(currentUser.name || '');
      if (!customerWhatsapp) setCustomerWhatsapp(currentUser.whatsapp || '');
      if (!customerEmail) setCustomerEmail(currentUser.email || '');
    }
  }, [product, initialVariantId, isOpen, currentUser]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !product) return null;

  const selectedVariant =
    product.variants.find((v) => v.id === selectedVariantId) || product.variants[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!selectedVariantId) {
      setErrorMessage('Silakan pilih salah satu varian paket langganan.');
      return;
    }

    if (!customerName.trim()) {
      setErrorMessage('Nama lengkap pembeli wajib diisi.');
      return;
    }

    if (!customerWhatsapp.trim() || customerWhatsapp.trim().length < 8) {
      setErrorMessage('Nomor WhatsApp aktif wajib diisi dengan benar.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          variantId: selectedVariantId,
          customerName: customerName.trim(),
          customerWhatsapp: customerWhatsapp.trim(),
          customerEmail: customerEmail.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal membuat tagihan pembayaran.');
      }

      router.push(data.redirectUrl);
    } catch (err: any) {
      setErrorMessage(err.message || 'Terjadi kesalahan sistem, silakan coba sesaat lagi.');
      setIsSubmitting(false);
    }
  };

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(num);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#2d1c13]/60 animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto bg-[#fcfaf7] border border-[#ebdccb] rounded-3xl shadow-2xl text-[#3b281a] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-[#ebdccb] bg-[#fcfaf7]">
          <div className="flex items-center gap-2">
            <BearHead className="w-5 h-5 text-[#7e5434]" />
            <h2 className="text-base font-bold text-[#543827]">Checkout Sepia Store</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#7e5434] hover:text-[#543827] rounded-full hover:bg-[#f5efe6] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Product Banner Info */}
          <div className="flex gap-4 p-3.5 rounded-2xl bg-[#f5efe6] border border-[#ebdccb]">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-16 h-16 rounded-xl object-cover border border-[#dec4a6] shrink-0"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base text-[#543827] truncate">{product.name}</h3>
                {product.badge && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#dec4a6] text-[#543827] border border-[#cfa67c]">
                    {product.badge}
                  </span>
                )}
              </div>
              <p className="text-xs text-[#7e5434] line-clamp-2 mt-1">{product.description}</p>
            </div>
          </div>

          {/* Variant Selector */}
          <div>
            <label className="block text-xs font-semibold text-[#543827] uppercase tracking-wider mb-2">
              1. Pilih Durasi &amp; Paket
            </label>
            <div className="grid grid-cols-1 gap-2.5">
              {product.variants.map((v) => {
                const isSelected = v.id === selectedVariantId;
                const discount = Math.round(((v.originalPrice - v.price) / v.originalPrice) * 100);

                return (
                  <div
                    key={v.id}
                    onClick={() => setSelectedVariantId(v.id)}
                    className={`p-3.5 rounded-2xl border transition-colors cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'border-[#543827] bg-[#f5efe6] text-[#543827] shadow-sm'
                        : 'border-[#ebdccb] bg-white hover:border-[#dec4a6] text-[#7e5434]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                          isSelected ? 'border-[#543827] bg-[#543827]' : 'border-[#dec4a6]'
                        }`}
                      >
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs sm:text-sm">{v.name}</span>
                          {discount > 0 && (
                            <span className="text-[10px] font-bold bg-[#dec4a6] text-[#543827] px-1.5 py-0.2 rounded">
                              Hemat {discount}%
                            </span>
                          )}
                        </div>
                        {v.description && (
                          <p className="text-xs text-[#9e6d42] mt-0.5">{v.description}</p>
                        )}
                        <div className="text-[11px] text-[#7e5434] mt-0.5">
                          {v.stockCount > 0 ? (
                            <span className="text-emerald-700 font-semibold">
                              Tersedia: {v.stockCount} akun siap kirim
                            </span>
                          ) : (
                            <span className="text-amber-800 font-semibold">
                              Antrian Instan (Restock otomatis)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-sm font-extrabold text-[#543827]">{formatRupiah(v.price)}</div>
                      {v.originalPrice > v.price && (
                        <div className="text-xs text-[#9e6d42] line-through">
                          {formatRupiah(v.originalPrice)}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Customer Details Form */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-[#543827] uppercase tracking-wider">
                2. Data Penerima Akun
              </label>

              {/* Status Badge jika Form Terisi Otomatis dari Akun Login */}
              {currentUser && (
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <UserCheck className="w-3 h-3 text-emerald-700" />
                  <span>Otomatis terisi dari akun ({currentUser.name})</span>
                </span>
              )}
            </div>

            <div>
              <input
                type="text"
                placeholder="Nama Lengkap Anda"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
                className="w-full bg-[#f5efe6] border border-[#ebdccb] focus:border-[#543827] rounded-xl px-3.5 py-2.5 text-sm text-[#543827] placeholder-[#9e6d42] focus:outline-none transition-colors"
              />
            </div>

            <div>
              <input
                type="tel"
                placeholder="Nomor WhatsApp (Contoh: 082323240186)"
                value={customerWhatsapp}
                onChange={(e) => setCustomerWhatsapp(e.target.value)}
                required
                className="w-full bg-[#f5efe6] border border-[#ebdccb] focus:border-[#543827] rounded-xl px-3.5 py-2.5 text-sm text-[#543827] placeholder-[#9e6d42] focus:outline-none transition-colors"
              />
              <p className="text-[11px] text-[#9e6d42] mt-1">
                Kredensial akun dan tanda terima akan dikirimkan juga ke nomor ini.
              </p>
            </div>

            <div>
              <input
                type="email"
                placeholder="Email Penerima (Opsional)"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full bg-[#f5efe6] border border-[#ebdccb] focus:border-[#543827] rounded-xl px-3.5 py-2.5 text-sm text-[#543827] placeholder-[#9e6d42] focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Payment Method Info */}
          <div className="p-3.5 rounded-2xl bg-[#f5efe6] border border-[#ebdccb] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#dec4a6] flex items-center justify-center shrink-0 text-[#543827]">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#543827]">QRIS Instan (Pakasir)</p>
                <p className="text-[11px] text-[#7e5434]">
                  BCA, BRI, Mandiri, BNI, Dana, GoPay, OVO, ShopeePay
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold bg-[#dec4a6] text-[#543827] px-2 py-0.5 rounded">
              VERIFIKASI OTOMATIS
            </span>
          </div>

          {/* Error message */}
          {errorMessage && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Submit Action */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl font-bold text-xs sm:text-sm bg-[#543827] hover:bg-[#67442d] text-[#fcfaf7] shadow-md transition-colors cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Membuat Tagihan QRIS...</span>
                </>
              ) : (
                <>
                  <BearPaw className="w-4 h-4" />
                  <span>Lanjut Pembayaran ({formatRupiah(selectedVariant?.price || 0)})</span>
                </>
              )}
            </button>
            <p className="text-center text-[11px] text-[#7e5434] mt-2 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span>Garansi 100% Penggantian Akun Jika Terkendala</span>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
