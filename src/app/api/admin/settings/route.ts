import { NextRequest, NextResponse } from 'next/server';
import { client, ensureDbReady } from '@/lib/turso';
import { getStoreSettings, saveStoreSettings } from '@/lib/settings';

export async function GET(req: NextRequest) {
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

    const settings = await getStoreSettings();
    return NextResponse.json({ success: true, settings });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

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
    const {
      store_name,
      admin_whatsapp,
      pakasir_project,
      pakasir_api_key,
      pakasir_sandbox,
      fee_mode,
      announcement_text,
    } = body;

    await saveStoreSettings({
      store_name: store_name?.trim() || 'Sepia Store',
      admin_whatsapp: admin_whatsapp?.trim().replace(/[^0-9]/g, '') || '6282323240186',
      pakasir_project: pakasir_project?.trim() || '',
      pakasir_api_key: pakasir_api_key?.trim() || '',
      pakasir_sandbox: Boolean(pakasir_sandbox),
      fee_mode: fee_mode === 'merchant' ? 'merchant' : 'customer',
      announcement_text: announcement_text?.trim() || '',
    });

    return NextResponse.json({
      success: true,
      message: 'Pengaturan toko & gateway pembayaran berhasil disimpan!',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
