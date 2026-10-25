'use client';

import React from 'react';
import { X, Star, Check, ShoppingBag, ArrowRight } from 'lucide-react';

interface Variant {
  id: string;
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

interface ProductDetailModalProps {
  product: any;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (prod: any, variant?: any) => void;
  onBuyNow: (prod: any, variant?: any) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isOpen,
  onClose,
  onAddToCart,
  onBuyNow,
}) => {
  if (!isOpen || !product) return null;

  const defaultVariant = product.variants[0] || {
    id: 'default',
    name: '1 Bulan',
    durationDays: 30,
    price: 0,
    originalPrice: 0,
    description: null,
    stockCount: 0,
  };

  const [selectedVariant, setSelectedVariant] = React.useState<Variant>(defaultVariant);

  React.useEffect(() => {
    if (product.variants.length > 0) {
      setSelectedVariant(product.variants[0]);
    }
  }, [product]);

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(num);
  };

  const platforms = ['Windows', 'Mac', 'Android', 'iOS', 'Web / TV'];

  return (
    <div className="fixed inset-0 z-50 bg-[#2d1c13]/60 flex items-center justify-center p-4 animate-in fade-in">
      <div
        className="bg-[#fcfaf7] w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#ebdccb] relative text-[#3b281a]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#f5efe6] hover:bg-[#ebdccb] flex items-center justify-center text-[#543827] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Category & Rating */}
        <div className="flex items-center gap-2 mb-2">
          {product.badge && (
            <span className="text-[10px] font-bold uppercase tracking-wider bg-[#dec4a6] text-[#543827] px-2.5 py-1 rounded-full">
              {product.badge}
            </span>
          )}
          <div className="flex items-center gap-1 text-xs text-amber-700 font-semibold bg-[#f5efe6] px-2.5 py-1 rounded-full border border-[#ebdccb]">
            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span>4.9</span>
            <span className="text-[#9e6d42]">(380+ ulasan)</span>
          </div>
        </div>

        {/* Title & Description */}
        <h3 className="text-2xl font-extrabold text-[#543827] mb-2">{product.name}</h3>
        <p className="text-xs sm:text-sm text-[#7e5434] mb-5 leading-relaxed">{product.description}</p>

        {/* Variants Selector */}
        <div className="mb-5 space-y-2">
          <span className="block text-xs font-bold text-[#543827]">Pilihan Paket &amp; Durasi:</span>
          <div className="grid grid-cols-1 gap-2">
            {product.variants.map((v: any) => {
              const isSelected = v.id === selectedVariant?.id;
              return (
                <div
                  key={v.id}
                  onClick={() => setSelectedVariant(v)}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                    isSelected
                      ? 'border-[#543827] bg-[#f5efe6] text-[#543827]'
                      : 'border-[#ebdccb] bg-white hover:border-[#dec4a6] text-[#7e5434]'
                  }`}
                >
                  <div>
                    <span className="text-xs font-bold block">{v.name}</span>
                    {v.description && <span className="text-[11px] text-[#9e6d42]">{v.description}</span>}
                  </div>
                  <span className="text-xs font-extrabold text-[#543827]">{formatRupiah(v.price)}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Device compatibility */}
        <div className="mb-6">
          <span className="block text-xs font-bold text-[#543827] mb-2">Kompatibilitas Perangkat:</span>
          <div className="flex flex-wrap gap-1.5">
            {platforms.map((p) => (
              <span
                key={p}
                className="bg-[#f5efe6] border border-[#ebdccb] text-[#7e5434] text-[11px] px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1"
              >
                <Check className="w-3 h-3 text-[#b88654]" />
                <span>{p}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-[#ebdccb] gap-3">
          <div>
            <span className="text-[10px] text-[#9e6d42] uppercase block">Harga Paket</span>
            <span className="text-xl sm:text-2xl font-extrabold text-[#543827]">
              {formatRupiah(selectedVariant.price)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onAddToCart(product, selectedVariant);
                onClose();
              }}
              className="bg-[#ebdccb] hover:bg-[#dec4a6] text-[#543827] font-bold p-3 rounded-2xl text-xs transition-colors cursor-pointer"
              title="Tambah ke Keranjang"
            >
              <ShoppingBag className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                onBuyNow(product, selectedVariant);
                onClose();
              }}
              className="bg-[#543827] hover:bg-[#67442d] text-[#fcfaf7] font-bold px-5 py-3 rounded-2xl text-xs transition-colors shadow-md flex items-center gap-2 cursor-pointer"
            >
              <span>Beli Sekarang</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
