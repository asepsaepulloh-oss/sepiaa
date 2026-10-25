import { NextRequest, NextResponse } from 'next/server';
import { client, ensureDbReady } from '@/lib/turso';

export async function GET(req: NextRequest) {
  try {
    await ensureDbReady();
    const token = req.cookies.get('sepia_admin_token')?.value;

    if (!token) {
      return NextResponse.json({ authenticated: false });
    }

    const sessionRes = await client.execute({
      sql: 'SELECT * FROM admin_sessions WHERE token = ? AND expires_at > ? LIMIT 1',
      args: [token, Date.now()],
    });

    if (sessionRes.rows.length === 0) {
      return NextResponse.json({ authenticated: false });
    }

    return NextResponse.json({
      authenticated: true,
      username: String(sessionRes.rows[0].username),
    });
  } catch {
    return NextResponse.json({ authenticated: false });
  }
}
