/**
 * Library Integrasi Payment Gateway Pakasir API v2
 * Dokumentasi Resmi:
 * - Membuat Transaksi: https://pakasir.com/p/create-transaction
 * - Status Transaksi: https://pakasir.com/p/transaction-status
 * - Webhook: https://pakasir.com/p/webhook
 * - Simulasi Pembayaran: https://pakasir.com/p/payment-simulation
 */

const BASE_URL = (process.env.PAKASIR_BASE_URL || 'https://app.pakasir.com').trim().replace(/\/+$/, '');
const PROJECT = (process.env.PAKASIR_PROJECT || '').trim().replace(/^\/+|\/+$/g, '');
const API_KEY = (process.env.PAKASIR_API_KEY || '').trim();

export interface PakasirPaymentResult {
  txn_id?: string;
  project?: string;
  order_id: string;
  amount: number;
  fee: number;
  total_payment: number;
  payment_method: string;
  payment_number?: string;
  qr_string?: string;
  va_number?: string;
  expired_at?: string;
  is_sandbox?: boolean;
}

export interface PakasirDetailResult {
  txn_id?: string;
  order_id: string;
  amount: number;
  is_sandbox?: boolean;
  status: 'pending' | 'completed' | 'canceled' | 'expired';
  completed_at?: string;
}

/**
 * Buat transaksi pembayaran baru di Pakasir API v2
 * POST /api/v2/create-transaction/{slug}/{order_id}
 */
export async function createPakasirTransaction(params: {
  method: string;
  orderId: string;
  amount: number;
}): Promise<PakasirPaymentResult> {
  const { method, orderId, amount } = params;

  // Jika API Key belum diisi atau masih placeholder dummy di lokal,
  // buat fallback simulasi QRIS yang valid agar developer/user tetap bisa mencoba checkout langsung
  if (!PROJECT || !API_KEY || API_KEY.includes('dummy') || API_KEY.includes('rahasia')) {
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    return {
      txn_id: `txn_demo_${Date.now()}`,
      order_id: orderId,
      amount,
      fee: 750,
      total_payment: amount + 750,
      payment_method: method,
      payment_number: '082323240186',
      qr_string: `00020101021226670014ID.LINKAJA.WWW01189360091430000000000215${orderId}52045812530336054${amount}5802ID5911SEPIA BEAR6007JAKARTA62070703A016304`,
      expired_at: expiresAt,
      is_sandbox: true,
    };
  }

  // Pakasir v2 Endpoint
  const url = `${BASE_URL}/api/v2/create-transaction/${encodeURIComponent(PROJECT)}/${encodeURIComponent(orderId)}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Api-Key': API_KEY,
    },
    body: JSON.stringify({
      method: method || 'qris',
      amount: Math.round(amount),
    }),
  });

  const text = await res.text();
  let json: any;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`Respons tidak valid dari Pakasir v2 (${res.status}): ${text}`);
  }

  if (!res.ok) {
    const msg = json?.message || json?.error || `HTTP ${res.status}`;
    throw new Error(`Pakasir API v2 Error: ${msg}`);
  }

  // Response v2 mengembalikan data transaksi langsung
  return {
    txn_id: json.txn_id,
    project: json.project || PROJECT,
    order_id: json.order_id || orderId,
    amount: Number(json.amount || amount),
    fee: Number(json.fee || 0),
    total_payment: Number(json.total_payment || (amount + (json.fee || 0))),
    payment_method: json.payment_method || method,
    qr_string: json.qr_string,
    va_number: json.va_number,
    payment_number: json.va_number || json.payment_number,
    expired_at: json.expired_at,
    is_sandbox: json.is_sandbox,
  };
}

/**
 * Cek status transaksi langsung ke Pakasir API v2
 * GET /api/v2/transaction-status/{slug}/{txn_id}
 */
export async function getPakasirTransactionDetail(params: {
  txnId?: string | null;
  orderId: string;
}): Promise<PakasirDetailResult | null> {
  const { txnId, orderId } = params;

  if (!PROJECT || !API_KEY || API_KEY.includes('dummy') || API_KEY.includes('rahasia')) {
    return null; // Gunakan status lokal jika mode offline
  }

  // Di v2 status diakses melalui txn_id
  const targetId = txnId || orderId;
  if (!targetId) return null;

  try {
    const url = `${BASE_URL}/api/v2/transaction-status/${encodeURIComponent(PROJECT)}/${encodeURIComponent(targetId)}`;

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'X-Api-Key': API_KEY,
      },
    });

    if (!res.ok) {
      return null;
    }

    const json = await res.json();
    return {
      txn_id: json.txn_id,
      order_id: json.order_id || orderId,
      amount: Number(json.amount),
      is_sandbox: Boolean(json.is_sandbox),
      status: json.status,
      completed_at: json.completed_at,
    };
  } catch {
    return null;
  }
}

/**
 * Simulasi pembayaran berhasil (Sandbox mode) Pakasir API v2
 * POST /api/v2/payment-simulation/{slug}/{txn_id}
 */
export async function simulatePakasirPayment(params: {
  txnId?: string | null;
  orderId: string;
}): Promise<boolean> {
  const { txnId, orderId } = params;

  if (!PROJECT || !API_KEY || API_KEY.includes('dummy') || API_KEY.includes('rahasia')) {
    // Mode demo offline lokal
    return true;
  }

  const targetId = txnId || orderId;
  if (!targetId) return false;

  try {
    const url = `${BASE_URL}/api/v2/payment-simulation/${encodeURIComponent(PROJECT)}/${encodeURIComponent(targetId)}`;

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'X-Api-Key': API_KEY,
      },
    });

    return res.ok;
  } catch {
    return false;
  }
}
