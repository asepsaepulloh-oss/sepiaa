'use client';

import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, ShieldCheck, AlertCircle, Loader2, QrCode } from 'lucide-react';
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
  isOpen: boolean;
  onClose: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  product,
  isOpen,
  onClose,
}) => {
  const router = useRouter();
  const [selectedVariantId, setSelectedVariantId] = useState<string>('');
  const [customerName, setCustomerName] = useState('');
  const [customerWhatsapp, setCustomerWhatsapp] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (product && product.variants.length > 0) {
      setSelectedVariantId(product.variants[0].id);
      setErrorMessage(null);
    }
  }, [product]);

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

  const selectedVariant = product.variants.find((v) => v.id === selectedVariantId) || product.variants[0];

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto bg-[#17100b] border border-[#3b2a1e] rounded-2xl shadow-2xl text-[#fbf6f0] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 border-b border-[#312217] bg-[#17100b]/95 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <BearHead className="w-5 h-5 text-[#e59a44]" />
            <h2 className="text-base font-bold text-white">Checkout Sepia Bear</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#a89588] hover:text-white rounded-lg hover:bg-[#271a12] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Product Banner Info */}
          <div className="flex gap-4 p-3.5 rounded-xl bg-[#20150e] border border-[#382619]">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-16 h-16 rounded-xl object-cover border border-[#442f20] shrink-0"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base text-white truncate">{product.name}</h3>
                {product.badge && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#c86d34]/25 text-[#f0b27a] border border-[#c86d34]/40">
                    {product.badge}
                  </span>
                )}
              </div>
              <p className="text-xs text-[#bcaaa0] line-clamp-2 mt-1">{product.description}</p>
            </div>
          </div>

          {/* Variant Selector */}
          <div>
            <label className="block text-xs font-semibold text-[#cfbeb5] uppercase tracking-wider mb-2">
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
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'border-[#c86d34] bg-[#c86d34]/15 text-white shadow-sm'
                        : 'border-[#332317] bg-[#1d140e] hover:border-[#4d3626] text-[#dcd0c7]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                          isSelected ? 'border-[#c86d34] bg-[#c86d34]' : 'border-[#614736]'
                        }`}
                      >
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-[#120d0a]" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">{v.name}</span>
                          {discount > 0 && (
                            <span className="text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.2 rounded">
                              Hemat {discount}%
                            </span>
                          )}
                        </div>
                        {v.description && (
                          <p className="text-xs text-[#a69286] mt-0.5">{v.description}</p>
                        )}
                        <div className="text-[11px] text-[#8a7266] mt-0.5">
                          {v.stockCount > 0 ? (
                            <span className="text-emerald-400 font-medium">
                              Tersedia: {v.stockCount} akun siap kirim
                            </span>
                          ) : (
                            <span className="text-[#e59a44] font-medium">
                              Antrian Instan (Restock otomatis)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-sm font-bold text-[#e59a44]">{formatRupiah(v.price)}</div>
                      {v.originalPrice > v.price && (
                        <div className="text-xs text-[#735e53] line-through">
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
            <label className="block text-xs font-semibold text-[#cfbeb5] uppercase tracking-wider">
              2. Data Penerima Akun
            </label>

            <div>
              <input
                type="text"
                placeholder="Nama Lengkap Anda"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
                className="w-full bg-[#1f1610] border border-[#3b2a1e] focus:border-[#c86d34] rounded-xl px-3.5 py-2.5 text-sm text-[#fbf6f0] placeholder-[#7d675b] focus:outline-none transition-colors"
              />
            </div>

            <div>
              <input
                type="tel"
                placeholder="Nomor WhatsApp (Contoh: 08123456789)"
                value={customerWhatsapp}
                onChange={(e) => setCustomerWhatsapp(e.target.value)}
                required
                className="w-full bg-[#1f1610] border border-[#3b2a1e] focus:border-[#c86d34] rounded-xl px-3.5 py-2.5 text-sm text-[#fbf6f0] placeholder-[#7d675b] focus:outline-none transition-colors"
              />
              <p className="text-[11px] text-[#8a7266] mt-1">
                Kredensial akun dan tanda terima akan dikirimkan juga ke nomor ini.
              </p>
            </div>

            <div>
              <input
                type="email"
                placeholder="Email Penerima (Opsional)"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full bg-[#1f1610] border border-[#3b2a1e] focus:border-[#c86d34] rounded-xl px-3.5 py-2.5 text-sm text-[#fbf6f0] placeholder-[#7d675b] focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Payment Method Info */}
          <div className="p-3.5 rounded-xl bg-[#20150e] border border-[#382619] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#c86d34]/15 border border-[#c86d34]/30 flex items-center justify-center shrink-0">
                <QrCode className="w-5 h-5 text-[#e59a44]" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">QRIS Instan (Pakasir)</p>
                <p className="text-[11px] text-[#a69286]">
                  BCA, BRI, Mandiri, BNI, Dana, GoPay, OVO, ShopeePay
                </p>
              </div>
            </div>
            <span className="text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded">
              VERIFIKASI OTOMATIS
            </span>
          </div>

          {/* Error message */}
          {errorMessage && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Submit Action */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-[#c86d34] via-[#b85c27] to-[#96471c] hover:from-[#d97736] hover:to-[#a75020] text-white shadow-lg shadow-amber-950/40 disabled:opacity-50 transition-all cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Membuat Tagihan QRIS...</span>
                </>
              ) : (
                <>
                  <BearPaw className="w-4 h-4 text-[#f0b27a]" />
                  <span>Lanjut Pembayaran ({formatRupiah(selectedVariant?.price || 0)})</span>
                </>
              )}
            </button>
            <p className="text-center text-[11px] text-[#8a7266] mt-2 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Garansi Beruang: 100% Penggantian Akun Jika Terkendala</span>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
