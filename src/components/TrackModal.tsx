'use client';

import React, { useState } from 'react';
import { X, Search, Clock, ArrowRight, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div
        className="w-full max-w-md bg-[#111117] border border-[#272738] rounded-2xl p-6 shadow-2xl relative text-zinc-100"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-[#1c1c28] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-2">
          <Clock className="w-5 h-5 text-amber-500" />
          <h2 className="text-base font-bold text-white">Lacak & Ambil Akun Anda</h2>
        </div>
        <p className="text-xs text-zinc-400 mb-5">
          Masukkan nomor invoice (contoh: <code className="text-amber-400 font-mono">SEP-20261025-XXXX</code>) untuk melihat QRIS atau mengambil data akun yang sudah dibayar.
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
              className="w-full bg-[#161622] border border-[#2b2b3d] focus:border-amber-500 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none uppercase font-mono"
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
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm bg-amber-500 hover:bg-amber-600 text-zinc-950 transition-colors cursor-pointer"
          >
            <span>Buka Halaman Pesanan</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
