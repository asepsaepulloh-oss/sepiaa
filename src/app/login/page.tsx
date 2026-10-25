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
    <div className="min-h-screen bg-[#f7f3ed] text-[#3b281a] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-[#fcfaf7] border border-[#ebdccb] rounded-3xl p-6 sm:p-8 space-y-6 card-shadow">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-[#543827] flex items-center justify-center mx-auto text-[#fcfaf7] shadow-md">
            <BearHead className="w-8 h-8 text-[#f5efe6]" />
          </div>
          <h1 className="text-2xl font-extrabold text-[#543827] tracking-tight">Masuk ke Sepia Store</h1>
          <p className="text-xs text-[#7e5434]">
            Akses akun langganan premium, riwayat pesanan, atau panel admin
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#543827] mb-1.5">
              WhatsApp / Email / Username
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-[#9e6d42] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="08123456789, email, atau username admin"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                className="w-full bg-[#f5efe6] border border-[#ebdccb] focus:border-[#543827] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#543827] placeholder-[#9e6d42] focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#543827] mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#9e6d42] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-[#f5efe6] border border-[#ebdccb] focus:border-[#543827] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#543827] placeholder-[#9e6d42] focus:outline-none transition-colors"
              />
            </div>
          </div>

          {errorMessage && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-2xl font-bold text-xs bg-[#543827] hover:bg-[#67442d] text-[#fcfaf7] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <BearPaw className="w-4 h-4" />}
            <span>Masuk Sekarang</span>
          </button>
        </form>

        {/* Footer links */}
        <div className="pt-2 border-t border-[#ebdccb] text-center space-y-2 text-xs">
          <p className="text-[#7e5434]">
            Belum punya akun?{' '}
            <Link href="/register" className="font-bold text-[#543827] hover:underline">
              Daftar Gratis
            </Link>
          </p>
          <div>
            <Link href="/" className="text-[11px] text-[#9e6d42] hover:text-[#543827] inline-flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali ke Beranda Toko</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
