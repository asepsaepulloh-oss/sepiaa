import { client, ensureDbReady } from './turso';

export interface StoreSettingsData {
  store_name: string;
  admin_whatsapp: string;
  qris_gateway_url: string;
  qris_api_key: string;
  qris_webhook_secret: string;
  fee_mode: 'customer' | 'merchant'; // 'customer' = fee QRIS dibebankan ke pembeli
  announcement_text?: string;
}

/**
 * Hitung perkiraan biaya QRIS standar (0.7%):
 * Jika fee dibebankan ke pembeli, dihitung sebagai fee tambahan transparan.
 */
export function calculateQrisFee(amount: number): number {
  return Math.round(amount * 0.007);
}

export const calculatePakasirFee = calculateQrisFee;

/**
 * Ambil semua pengaturan toko (mengutamakan database, fallback ke .env)
 */
export async function getStoreSettings(): Promise<StoreSettingsData> {
  await ensureDbReady();

  try {
    const res = await client.execute('SELECT key, value FROM store_settings');
    const dbMap = new Map<string, string>();
    for (const r of res.rows) {
      dbMap.set(String(r.key), String(r.value));
    }

    const store_name = dbMap.get('store_name') || 'Sepia Store';
    const admin_whatsapp = dbMap.get('admin_whatsapp') || '6282323240186';
    const qris_gateway_url =
      dbMap.get('qris_gateway_url') ||
      process.env.QRIS_GATEWAY_URL ||
      'https://gomerch-beta.vercel.app';
    const qris_api_key = dbMap.get('qris_api_key') || process.env.QRIS_API_KEY || '';
    const qris_webhook_secret =
      dbMap.get('qris_webhook_secret') || process.env.QRIS_WEBHOOK_SECRET || '';
    const fee_mode = (dbMap.get('fee_mode') as 'customer' | 'merchant') || 'customer';
    const announcement_text = dbMap.get('announcement_text') || '';

    return {
      store_name,
      admin_whatsapp,
      qris_gateway_url,
      qris_api_key,
      qris_webhook_secret,
      fee_mode,
      announcement_text,
    };
  } catch (err) {
    console.error('Error fetching store settings:', err);
    return {
      store_name: 'Sepia Store',
      admin_whatsapp: '6282323240186',
      qris_gateway_url: process.env.QRIS_GATEWAY_URL || 'https://gomerch-beta.vercel.app',
      qris_api_key: process.env.QRIS_API_KEY || '',
      qris_webhook_secret: process.env.QRIS_WEBHOOK_SECRET || '',
      fee_mode: 'customer',
      announcement_text: '',
    };
  }
}

/**
 * Simpan pengaturan toko ke database
 */
export async function saveStoreSettings(settings: Partial<StoreSettingsData>): Promise<void> {
  await ensureDbReady();
  const now = Date.now();

  for (const [key, val] of Object.entries(settings)) {
    if (val === undefined) continue;
    const strVal = typeof val === 'boolean' ? (val ? 'true' : 'false') : String(val);

    await client.execute({
      sql: `INSERT INTO store_settings (key, value, updated_at) 
            VALUES (?, ?, ?) 
            ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
      args: [key, strVal, now],
    });
  }
}
