import { NextRequest, NextResponse } from 'next/server';
import { client, ensureDbReady } from '@/lib/turso';
import { verifyPassword } from '@/lib/auth-user';

export async function POST(req: NextRequest) {
  try {
    await ensureDbReady();
    const body = await req.json();
    const { identifier, password } = body;

    if (!identifier?.trim() || !password?.trim()) {
      return NextResponse.json(
        { error: 'Username / Nomor WhatsApp / Email dan password wajib diisi' },
        { status: 400 }
      );
    }

    const cleanInput = identifier.trim();
    const adminUser = process.env.ADMIN_USERNAME || 'admin';
    const adminPass = process.env.ADMIN_PASSWORD || 'adminsepia123';

    // 1. Cek apakah ini kredensial Admin Toko
    if (cleanInput === adminUser && password === adminPass) {
      const adminToken = `sepia_${Math.random().toString(36).substring(2)}${Date.now().toString(36)}`;
      const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;

      await client.execute({
        sql: 'INSERT INTO admin_sessions (token, username, expires_at) VALUES (?, ?, ?)',
        args: [adminToken, adminUser, expiresAt],
      });

      const res = NextResponse.json({
        success: true,
        role: 'admin',
        redirectUrl: '/admin',
        message: 'Login Admin Berhasil!',
        user: {
          id: 'admin',
          name: 'Administrator',
          role: 'admin',
        },
      });

      res.cookies.set('sepia_admin_token', adminToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60,
      });

      return res;
    }

    // 2. Jika bukan admin, cari di tabel users (Customer / Member)
    const cleanDigits = cleanInput.replace(/[^0-9]/g, '');

    const userRes = await client.execute({
      sql: `SELECT * FROM users 
            WHERE whatsapp = ? OR whatsapp = ? OR email = ? 
            LIMIT 1`,
      args: [cleanInput, cleanDigits, cleanInput.toLowerCase()],
    });

    if (userRes.rows.length === 0) {
      return NextResponse.json(
        { error: 'Akun tidak ditemukan. Periksa kembali nomor WhatsApp/email atau username Anda.' },
        { status: 401 }
      );
    }

    const user = userRes.rows[0];
    const isPasswordValid = verifyPassword(password, String(user.password));

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Password yang Anda masukkan salah.' },
        { status: 401 }
      );
    }

    const userId = String(user.id);
    const token = `usr_tok_${Math.random().toString(36).substring(2)}${Date.now().toString(36)}`;
    const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000;

    await client.execute({
      sql: 'INSERT INTO user_sessions (token, user_id, expires_at) VALUES (?, ?, ?)',
      args: [token, userId, expiresAt],
    });

    const res = NextResponse.json({
      success: true,
      role: 'user',
      redirectUrl: '/dashboard',
      message: 'Login berhasil!',
      user: {
        id: userId,
        name: String(user.name),
        whatsapp: String(user.whatsapp),
        email: user.email ? String(user.email) : null,
        role: 'user',
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
    console.error('Login error:', err.message);
    return NextResponse.json({ error: err.message || 'Login gagal' }, { status: 500 });
  }
}
