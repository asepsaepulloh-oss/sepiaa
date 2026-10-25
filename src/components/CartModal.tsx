'use client';

import React from 'react';
import { X, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';

export interface CartItem {
  variantId: string;
  productName: string;
  variantName: string;
  price: number;
  qty: number;
  imageUrl?: string;
}

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onRemoveItem: (variantId: string) => void;
  onUpdateQty: (variantId: string, delta: number) => void;
  onCheckout: (item: CartItem) => void;
}

export const CartModal: React.FC<CartModalProps> = ({
  isOpen,
  onClose,
  items,
  onRemoveItem,
  onUpdateQty,
  onCheckout,
}) => {
  if (!isOpen) return null;

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(num);
  };

  const totalPrice = items.reduce((acc, curr) => acc + curr.price * curr.qty, 0);

  return (
    <div className="fixed inset-0 z-50 bg-[#2d1c13]/60 flex justify-end animate-in fade-in">
      <div
        className="bg-[#fcfaf7] w-full max-w-md h-full shadow-2xl flex flex-col border-l border-[#ebdccb] animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-[#ebdccb] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#543827]" />
            <h3 className="font-bold text-[#543827] text-base">Keranjang Belanja</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#f5efe6] hover:bg-[#ebdccb] flex items-center justify-center text-[#543827] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {items.length === 0 ? (
            <div className="py-16 text-center text-[#9e6d42] space-y-2">
              <ShoppingBag className="w-10 h-10 mx-auto opacity-40 text-[#7e5434]" />
              <p className="text-xs font-semibold">Keranjang belanja Anda masih kosong.</p>
              <p className="text-[11px] text-[#9e6d42]">Pilih aplikasi premium dari katalog untuk dimasukkan ke keranjang.</p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.variantId}
                className="bg-white border border-[#ebdccb] p-4 rounded-2xl flex items-center justify-between gap-3 shadow-sm"
              >
                <div className="min-w-0">
                  <h4 className="font-bold text-xs text-[#543827] truncate">{item.productName}</h4>
                  <p className="text-[11px] text-[#7e5434]">{item.variantName}</p>
                  <span className="text-xs font-extrabold text-[#543827] mt-1 block">
                    {formatRupiah(item.price)}
                  </span>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={() => onCheckout(item)}
                    className="px-3 py-1.5 rounded-xl bg-[#543827] hover:bg-[#67442d] text-white text-[11px] font-bold transition-colors cursor-pointer"
                  >
                    Beli Ini
                  </button>
                  <button
                    onClick={() => onRemoveItem(item.variantId)}
                    className="text-rose-600 hover:text-rose-800 p-1.5 transition-colors cursor-pointer"
                    title="Hapus dari keranjang"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-6 border-t border-[#ebdccb] bg-[#f5efe6] space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#7e5434] font-medium">Total Nilai Keranjang:</span>
              <span className="text-xl font-extrabold text-[#543827]">{formatRupiah(totalPrice)}</span>
            </div>
            <button
              onClick={() => onCheckout(items[0])}
              className="w-full bg-[#543827] hover:bg-[#67442d] text-[#fcfaf7] font-bold py-3.5 rounded-2xl text-xs transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Proses Pembayaran Item ({formatRupiah(items[0].price)})</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
