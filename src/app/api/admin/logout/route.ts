import { NextRequest, NextResponse } from 'next/server';
import { client } from '@/lib/turso';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('sepia_admin_token')?.value;
    if (token) {
      await client.execute({
        sql: 'DELETE FROM admin_sessions WHERE token = ?',
        args: [token],
      });
    }

    const res = NextResponse.json({ success: true });
    res.cookies.delete('sepia_admin_token');
    return res;
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
