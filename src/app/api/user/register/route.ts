import { NextRequest, NextResponse } from 'next/server';
import { client, ensureDbReady } from '@/lib/turso';
import { hashPassword } from '@/lib/auth-user';

export async function POST(req: NextRequest) {
  try {
    await ensureDbReady();
    const body = await req.json();
    const { name, whatsapp, email, password } = body;

    if (!name?.trim() || !whatsapp?.trim() || !password?.trim()) {
      return NextResponse.json(
        { error: 'Nama, nomor WhatsApp, dan password wajib diisi' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password minimal terdiri dari 6 karakter' },
        { status: 400 }
      );
    }

    // Normalisasi WhatsApp (hanya angka)
    const cleanWa = whatsapp.trim().replace(/[^0-9]/g, '');
    if (cleanWa.length < 9) {
      return NextResponse.json(
        { error: 'Nomor WhatsApp tidak valid' },
        { status: 400 }
      );
    }

    // Cek apakah WhatsApp sudah terdaftar
    const existing = await client.execute({
      sql: 'SELECT id FROM users WHERE whatsapp = ? LIMIT 1',
      args: [cleanWa],
    });

    if (existing.rows.length > 0) {
      return NextResponse.json(
        { error: 'Nomor WhatsApp ini sudah terdaftar. Silakan login.' },
        { status: 400 }
      );
    }

    const userId = `usr_${Math.random().toString(36).substring(2, 9)}`;
    const passwordHash = hashPassword(password);
    const now = Date.now();

    // 1. Simpan user
    await client.execute({
      sql: 'INSERT INTO users (id, name, whatsapp, email, password, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      args: [userId, name.trim(), cleanWa, email?.trim() || null, passwordHash, now],
    });

    // 2. Hubungkan pesanan lama dengan nomor WhatsApp ini
    try {
      await client.execute({
        sql: 'UPDATE orders SET user_id = ? WHERE customer_whatsapp = ? OR customer_whatsapp = ?',
        args: [userId, cleanWa, `0${cleanWa.replace(/^62/, '')}`],
      });
    } catch {
      // Abaikan jika tidak ada pesanan lama
    }

    // 3. Buat sesi login
    const token = `usr_tok_${Math.random().toString(36).substring(2)}${Date.now().toString(36)}`;
    const expiresAt = now + 30 * 24 * 60 * 60 * 1000; // 30 hari

    await client.execute({
      sql: 'INSERT INTO user_sessions (token, user_id, expires_at) VALUES (?, ?, ?)',
      args: [token, userId, expiresAt],
    });

    const res = NextResponse.json({
      success: true,
      message: 'Pendaftaran berhasil!',
      user: {
        id: userId,
        name: name.trim(),
        whatsapp: cleanWa,
        email: email?.trim() || null,
      },
    });

    res.cookies.set('sepia_user_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60,
    });

    return res;
  } catch (err: any) {
    console.error('Register error:', err.message);
    return NextResponse.json({ error: err.message || 'Pendaftaran gagal' }, { status: 500 });
  }
}
