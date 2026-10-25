'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BearHead, BearPaw } from '@/components/BearIcon';
import { ArrowLeft, Loader2, AlertCircle, Lock, Phone, User, Mail } from 'lucide-react';

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
    <div className="min-h-screen bg-[#f7f3ed] text-[#3b281a] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-[#fcfaf7] border border-[#ebdccb] rounded-3xl p-6 sm:p-8 space-y-6 card-shadow">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-[#543827] flex items-center justify-center mx-auto text-[#fcfaf7] shadow-md">
            <BearHead className="w-8 h-8 text-[#f5efe6]" />
          </div>
          <h1 className="text-2xl font-extrabold text-[#543827] tracking-tight">Daftar Akun Member</h1>
          <p className="text-xs text-[#7e5434]">
            Simpan data akun langganan dan pantau masa garansi dengan mudah
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#543827] mb-1.5">
              Nama Lengkap
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#9e6d42] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Nama Anda"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-[#f5efe6] border border-[#ebdccb] focus:border-[#543827] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#543827] placeholder-[#9e6d42] focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#543827] mb-1.5">
              Nomor WhatsApp Aktif
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-[#9e6d42] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="tel"
                placeholder="082323240186"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                required
                className="w-full bg-[#f5efe6] border border-[#ebdccb] focus:border-[#543827] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#543827] placeholder-[#9e6d42] focus:outline-none transition-colors"
              />
            </div>
            <p className="text-[10px] text-[#9e6d42] mt-1">
              Gunakan nomor yang sama saat checkout agar pesanan lama langsung terhubung.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#543827] mb-1.5">
              Email (Opsional)
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#9e6d42] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                placeholder="email@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#f5efe6] border border-[#ebdccb] focus:border-[#543827] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#543827] placeholder-[#9e6d42] focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#543827] mb-1.5">
              Password (Minimal 6 karakter)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#9e6d42] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
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
            <span>Daftar Akun Sekarang</span>
          </button>
        </form>

        {/* Footer links */}
        <div className="pt-2 border-t border-[#ebdccb] text-center space-y-2 text-xs">
          <p className="text-[#7e5434]">
            Sudah punya akun?{' '}
            <Link href="/login" className="font-bold text-[#543827] hover:underline">
              Masuk di sini
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
