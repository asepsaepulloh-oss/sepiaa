'use client';

import React, { useState } from 'react';
import { X, ArrowRight, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { BearHead } from './BearIcon';

interface TrackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TrackModal: React.FC<TrackModalProps> = ({ isOpen, onClose }) => {
  const [orderId, setOrderId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = orderId.trim();
    if (!clean) {
      setError('Masukkan Invoice / Order ID Anda.');
      return;
    }
    onClose();
    router.push(`/order/${clean}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0e0a07]/90 animate-in fade-in">
      <div
        className="w-full max-w-md bg-[#231810] border border-[#3d291b] rounded-2xl p-6 relative text-[#faf4ee]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-[#baa496] hover:text-white rounded-lg hover:bg-[#2e1f15] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-2">
          <BearHead className="w-5 h-5 text-[#e89a42]" />
          <h2 className="text-base font-bold text-[#faf4ee]">Lacak &amp; Ambil Akun Anda</h2>
        </div>
        <p className="text-xs text-[#baa496] mb-5">
          Masukkan nomor invoice (contoh: <code className="text-[#e89a42] font-mono">SEP-20261025-XXXX</code>) untuk melihat QRIS atau mengambil data akun yang sudah dibayar.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="Nomor Order (SEP-XXXXXXXX-XXXX)"
              value={orderId}
              onChange={(e) => {
                setOrderId(e.target.value);
                setError(null);
              }}
              className="w-full bg-[#2a1d14] border border-[#3d291b] focus:border-[#c4622d] rounded-xl px-4 py-3 text-sm text-[#faf4ee] placeholder-[#8a7263] focus:outline-none uppercase font-mono"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-rose-400 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm bg-[#c4622d] hover:bg-[#b05220] text-white transition-colors cursor-pointer"
          >
            <span>Buka Halaman Pesanan</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
