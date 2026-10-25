import { client, ensureDbReady } from './turso';

export interface StoreSettingsData {
  store_name: string;
  admin_whatsapp: string;
  pakasir_project: string;
  pakasir_api_key: string;
  pakasir_sandbox: boolean;
  fee_mode: 'customer' | 'merchant'; // 'customer' = fee dibebankan ke pembeli
  announcement_text?: string;
}

/**
 * Hitung biaya Pakasir QRIS resmi:
 * - Nominal <= Rp 105.000: 0.7% + Rp 310
 * - Nominal > Rp 105.000: 1%
 * Referensi: https://pakasir.com/p/pricing
 */
export function calculatePakasirFee(amount: number): number {
  if (amount <= 105000) {
    return Math.round(amount * 0.007 + 310);
  } else {
    return Math.round(amount * 0.01);
  }
}

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
    const pakasir_project = dbMap.get('pakasir_project') || process.env.PAKASIR_PROJECT || '';
    const pakasir_api_key = dbMap.get('pakasir_api_key') || process.env.PAKASIR_API_KEY || '';
    const rawSandbox = dbMap.get('pakasir_sandbox');
    const pakasir_sandbox = rawSandbox !== undefined ? rawSandbox === 'true' : process.env.PAKASIR_SANDBOX === 'true';
    const fee_mode = (dbMap.get('fee_mode') as 'customer' | 'merchant') || 'customer';
    const announcement_text = dbMap.get('announcement_text') || '';

    return {
      store_name,
      admin_whatsapp,
      pakasir_project,
      pakasir_api_key,
      pakasir_sandbox,
      fee_mode,
      announcement_text,
    };
  } catch (err) {
    console.error('Error fetching store settings:', err);
    return {
      store_name: 'Sepia Store',
      admin_whatsapp: '6282323240186',
      pakasir_project: process.env.PAKASIR_PROJECT || '',
      pakasir_api_key: process.env.PAKASIR_API_KEY || '',
      pakasir_sandbox: process.env.PAKASIR_SANDBOX === 'true',
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
