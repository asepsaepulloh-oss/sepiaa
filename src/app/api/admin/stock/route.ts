import { NextRequest, NextResponse } from 'next/server';
import { client, ensureDbReady } from '@/lib/turso';

export async function POST(req: NextRequest) {
  try {
    await ensureDbReady();

    const token = req.cookies.get('sepia_admin_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sessionRes = await client.execute({
      sql: 'SELECT * FROM admin_sessions WHERE token = ? AND expires_at > ? LIMIT 1',
      args: [token, Date.now()],
    });

    if (sessionRes.rows.length === 0) {
      return NextResponse.json({ error: 'Sesi telah kedaluwarsa' }, { status: 401 });
    }

    const body = await req.json();
    const { variantId, rawAccounts } = body;

    if (!variantId || !rawAccounts) {
      return NextResponse.json({ error: 'Varian dan data akun wajib diisi' }, { status: 400 });
    }

    // Pisahkan baris akun
    const lines = String(rawAccounts)
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length === 0) {
      return NextResponse.json({ error: 'Tidak ada baris akun yang valid' }, { status: 400 });
    }

    const now = Date.now();
    let insertedCount = 0;

    for (const line of lines) {
      const stockId = `stk-${Math.random().toString(36).substring(2, 9)}`;
      await client.execute({
        sql: 'INSERT INTO product_stocks (id, variant_id, account_data, is_sold, created_at) VALUES (?, ?, ?, 0, ?)',
        args: [stockId, variantId, line, now],
      });
      insertedCount++;
    }

    return NextResponse.json({
      success: true,
      message: `Berhasil menambahkan ${insertedCount} akun ke dalam stok.`,
      count: insertedCount,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
