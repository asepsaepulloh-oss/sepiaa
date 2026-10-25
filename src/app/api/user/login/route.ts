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
        { error: 'Nomor WhatsApp / Email dan password wajib diisi' },
        { status: 400 }
      );
    }

    const cleanInput = identifier.trim();
    const cleanDigits = cleanInput.replace(/[^0-9]/g, '');

    // Cari user berdasarkan WhatsApp atau Email
    const userRes = await client.execute({
      sql: `SELECT * FROM users 
            WHERE whatsapp = ? OR whatsapp = ? OR email = ? 
            LIMIT 1`,
      args: [cleanInput, cleanDigits, cleanInput.toLowerCase()],
    });

    if (userRes.rows.length === 0) {
      return NextResponse.json(
        { error: 'Akun tidak ditemukan. Silakan periksa kembali data Anda.' },
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
    const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 hari

    await client.execute({
      sql: 'INSERT INTO user_sessions (token, user_id, expires_at) VALUES (?, ?, ?)',
      args: [token, userId, expiresAt],
    });

    const res = NextResponse.json({
      success: true,
      message: 'Login berhasil!',
      user: {
        id: userId,
        name: String(user.name),
        whatsapp: String(user.whatsapp),
        email: user.email ? String(user.email) : null,
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
