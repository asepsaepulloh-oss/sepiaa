import { NextRequest, NextResponse } from 'next/server';
import { client, ensureDbReady } from '@/lib/turso';

export async function POST(req: NextRequest) {
  try {
    await ensureDbReady();
    const body = await req.json();
    const { username, password } = body;

    const envUser = process.env.ADMIN_USERNAME || 'admin';
    const envPass = process.env.ADMIN_PASSWORD || 'adminsepia123';

    if (username !== envUser || password !== envPass) {
      return NextResponse.json({ error: 'Username atau password admin salah' }, { status: 401 });
    }

    const token = `sepia_${Math.random().toString(36).substring(2)}${Date.now().toString(36)}`;
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 hari

    await client.execute({
      sql: 'INSERT INTO admin_sessions (token, username, expires_at) VALUES (?, ?, ?)',
      args: [token, username, expiresAt],
    });

    const res = NextResponse.json({ success: true });
    res.cookies.set('sepia_admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return res;
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
