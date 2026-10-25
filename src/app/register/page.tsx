'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BearHead, BearPaw } from '@/components/BearIcon';
import { ArrowLeft, Loader2, AlertCircle, Lock, Phone, User, Mail, ShieldCheck } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (password.length < 6) {
      setErrorMessage('Password minimal 6 karakter.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/user/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, whatsapp, email, password }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        router.push('/dashboard');
        router.refresh();
      } else {
        setErrorMessage(data.error || 'Pendaftaran gagal');
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
          <h1 className="text-xl font-bold text-white tracking-tight">Daftar Akun Member</h1>
          <p className="text-xs text-[#baa496]">
            Simpan data langganan dan pantau masa garansi akun Anda dengan mudah
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#cfbeb5] mb-1.5">
              Nama Lengkap
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#8a7263] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Nama Anda"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-[#2a1d14] border border-[#3d291b] focus:border-[#c4622d] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#faf4ee] placeholder-[#8a7263] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#cfbeb5] mb-1.5">
              Nomor WhatsApp Aktif
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-[#8a7263] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="tel"
                placeholder="08123456789"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                required
                className="w-full bg-[#2a1d14] border border-[#3d291b] focus:border-[#c4622d] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#faf4ee] placeholder-[#8a7263] focus:outline-none"
              />
            </div>
            <p className="text-[10px] text-[#8a7263] mt-1">
              Gunakan nomor yang sama saat checkout agar pesanan lama langsung terhubung.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#cfbeb5] mb-1.5">
              Email (Opsional)
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#8a7263] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                placeholder="email@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#2a1d14] border border-[#3d291b] focus:border-[#c4622d] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#faf4ee] placeholder-[#8a7263] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#cfbeb5] mb-1.5">
              Password (Minimal 6 karakter)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#8a7263] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
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
            <span>Daftar Akun Sekarang</span>
          </button>
        </form>

        {/* Footer links */}
        <div className="pt-2 border-t border-[#312015] text-center space-y-2 text-xs">
          <p className="text-[#baa496]">
            Sudah punya akun?{' '}
            <Link href="/login" className="font-bold text-[#e89a42] hover:underline">
              Masuk di sini
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
