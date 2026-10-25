import { NextRequest, NextResponse } from 'next/server';
import { client } from '@/lib/turso';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('sepia_user_token')?.value;
    if (token) {
      await client.execute({
        sql: 'DELETE FROM user_sessions WHERE token = ?',
        args: [token],
      });
    }

    const res = NextResponse.json({ success: true, message: 'Berhasil keluar' });
    res.cookies.delete('sepia_user_token');
    return res;
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
