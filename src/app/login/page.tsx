'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BearHead, BearPaw } from '@/components/BearIcon';
import { ArrowLeft, Loader2, AlertCircle, Lock, Phone } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        const targetUrl = data.redirectUrl || (data.role === 'admin' ? '/admin' : '/dashboard');
        router.push(targetUrl);
        router.refresh();
      } else {
        setErrorMessage(data.error || 'Login gagal. Periksa data login Anda.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Koneksi ke server gagal');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#19120c] text-[#faf4ee] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-[#231810] border border-[#3d291b] rounded-2xl p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-[#c4622d] border border-[#e89a42]/40 flex items-center justify-center mx-auto text-[#faf4ee]">
            <BearHead className="w-8 h-8 text-[#faf4ee]" />
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">Masuk ke Sepia Bear</h1>
          <p className="text-xs text-[#baa496]">
            Akses seluruh data akun premium dan riwayat pesanan Anda
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#cfbeb5] mb-1.5">
              WhatsApp / Email / Username
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-[#8a7263] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="08123456789, email, atau username admin"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                className="w-full bg-[#2a1d14] border border-[#3d291b] focus:border-[#c4622d] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#faf4ee] placeholder-[#8a7263] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#cfbeb5] mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#8a7263] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-[#2a1d14] border border-[#3d291b] focus:border-[#c4622d] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#faf4ee] placeholder-[#8a7263] focus:outline-none"
              />
            </div>
          </div>

          {errorMessage && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-[#321715] border border-[#5c2825] text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl font-bold text-xs bg-[#c4622d] hover:bg-[#b05220] text-white transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <BearPaw className="w-4 h-4" />}
            <span>Masuk Sekarang</span>
          </button>
        </form>

        {/* Footer links */}
        <div className="pt-2 border-t border-[#312015] text-center space-y-2 text-xs">
          <p className="text-[#baa496]">
            Belum punya akun?{' '}
            <Link href="/register" className="font-bold text-[#e89a42] hover:underline">
              Daftar Gratis
            </Link>
          </p>
          <div>
            <Link href="/" className="text-[11px] text-[#8a7263] hover:text-[#baa496] inline-flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali ke Beranda Toko</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
