'use client';

import React, { useState } from 'react';
import { X, ArrowRight, AlertCircle, Clock } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2d1c13]/60 animate-in fade-in">
      <div
        className="w-full max-w-md bg-[#fcfaf7] border border-[#ebdccb] rounded-3xl p-6 sm:p-8 shadow-2xl relative text-[#3b281a]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#f5efe6] hover:bg-[#ebdccb] flex items-center justify-center text-[#543827] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2.5 mb-2">
          <BearHead className="w-6 h-6 text-[#7e5434]" />
          <h2 className="text-lg font-bold text-[#543827]">Lacak &amp; Ambil Akun Anda</h2>
        </div>
        <p className="text-xs text-[#7e5434] mb-5 leading-relaxed">
          Masukkan nomor invoice (contoh: <code className="text-[#543827] bg-[#ebdccb] px-1 py-0.5 rounded font-mono font-bold">SEP...</code>) untuk melihat QRIS atau mengambil data akun yang sudah dibayar.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="Nomor Order (SEP...)"
              value={orderId}
              onChange={(e) => {
                setOrderId(e.target.value);
                setError(null);
              }}
              className="w-full bg-[#f5efe6] border border-[#ebdccb] focus:border-[#543827] rounded-xl px-4 py-3 text-sm text-[#543827] placeholder-[#9e6d42] focus:outline-none uppercase font-mono font-semibold"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl font-bold text-xs sm:text-sm bg-[#543827] hover:bg-[#67442d] text-[#fcfaf7] transition-colors shadow-md cursor-pointer"
          >
            <span>Buka Halaman Pesanan</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
