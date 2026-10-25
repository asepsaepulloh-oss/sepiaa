/**
 * Library Integrasi Payment Gateway Pakasir
 * Dokumentasi: https://pakasir.com/p/docs
 */

const BASE_URL = process.env.PAKASIR_BASE_URL || 'https://app.pakasir.com';
const PROJECT = process.env.PAKASIR_PROJECT || '';
const API_KEY = process.env.PAKASIR_API_KEY || '';
const IS_SANDBOX = process.env.PAKASIR_SANDBOX === 'true';

export interface PakasirPaymentResult {
  order_id: string;
  amount: number;
  fee: number;
  total_payment: number;
  payment_method: string;
  payment_number?: string;
  qr_string?: string;
  qr_image_url?: string;
  expired_at?: string;
}

export interface PakasirDetailResult {
  order_id: string;
  amount: number;
  status: 'pending' | 'completed' | 'canceled' | 'expired';
  payment_method?: string;
  completed_at?: string;
}

/**
 * Buat transaksi pembayaran baru di Pakasir
 */
export async function createPakasirTransaction(params: {
  method: string;
  orderId: string;
  amount: number;
  redirectUrl?: string;
}): Promise<PakasirPaymentResult> {
  const { method, orderId, amount, redirectUrl } = params;

  // Jika API Key belum diisi atau masih placeholder dummy di lokal,
  // buat fallback simulasi QRIS yang valid agar user tetap bisa mencoba checkout langsung
  if (!PROJECT || !API_KEY || API_KEY.includes('dummy') || API_KEY.includes('rahasia')) {
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    return {
      order_id: orderId,
      amount,
      fee: 750,
      total_payment: amount + 750,
      payment_method: method,
      payment_number: '081234567890',
      qr_string: `00020101021226670014ID.LINKAJA.WWW01189360091430000000000215${orderId}52045812530336054${amount}5802ID5911SEPIA STORE6007JAKARTA62070703A016304`,
      expired_at: expiresAt,
    };
  }

  const url = `${BASE_URL}/api/transactioncreate/${method}`;
  const body: Record<string, any> = {
    project: PROJECT,
    order_id: orderId,
    amount,
    api_key: API_KEY,
  };

  if (redirectUrl) {
    body.redirect_url = redirectUrl;
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  let json: any;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`Respons tidak valid dari Pakasir (${res.status}): ${text}`);
  }

  if (!res.ok) {
    const msg = json?.message || json?.error || `HTTP ${res.status}`;
    throw new Error(`Pakasir API Error: ${msg}`);
  }

  return json.payment;
}

/**
 * Cek status transaksi langsung ke server Pakasir (Truth Verification)
 */
export async function getPakasirTransactionDetail(params: {
  orderId: string;
  amount: number;
}): Promise<PakasirDetailResult | null> {
  const { orderId, amount } = params;

  if (!PROJECT || !API_KEY || API_KEY.includes('dummy') || API_KEY.includes('rahasia')) {
    return null; // Gunakan status lokal jika mode offline/dummy
  }

  const query = new URLSearchParams({
    project: PROJECT,
    amount: String(amount),
    order_id: orderId,
    api_key: API_KEY,
  });

  const res = await fetch(`${BASE_URL}/api/transactiondetail?${query.toString()}`);
  if (!res.ok) {
    return null;
  }

  try {
    const json = await res.json();
    return json.transaction || null;
  } catch {
    return null;
  }
}

/**
 * Simulasi pembayaran berhasil (Sandbox mode)
 */
export async function simulatePakasirPayment(params: {
  orderId: string;
  amount: number;
}): Promise<boolean> {
  const { orderId, amount } = params;

  if (!PROJECT || !API_KEY || API_KEY.includes('dummy') || API_KEY.includes('rahasia')) {
    // Simulasi langsung di lokal
    return true;
  }

  const url = `${BASE_URL}/api/paymentsimulation`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      project: PROJECT,
      order_id: orderId,
      amount,
      api_key: API_KEY,
    }),
  });

  return res.ok;
}
