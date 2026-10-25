import { client } from './turso';

/**
 * Otomatis mengambil 1 stok akun aktif untuk order yang sudah dibayar
 * dan menandai status order menjadi 'completed'.
 */
export async function assignStockToOrder(orderId: string): Promise<{
  success: boolean;
  accountData?: string;
  error?: string;
}> {
  try {
    // 1. Ambil detail order
    const orderRes = await client.execute({
      sql: 'SELECT * FROM orders WHERE order_id = ? LIMIT 1',
      args: [orderId],
    });

    if (orderRes.rows.length === 0) {
      return { success: false, error: 'Order tidak ditemukan' };
    }

    const order = orderRes.rows[0];

    // Jika akun sudah pernah dikirimkan sebelumnya, return akun yang sudah ada
    if (order.account_delivered) {
      return {
        success: true,
        accountData: String(order.account_delivered),
      };
    }

    const variantId = String(order.variant_id);

    // 2. Cari 1 stok yang belum terjual
    const stockRes = await client.execute({
      sql: 'SELECT * FROM product_stocks WHERE variant_id = ? AND is_sold = 0 LIMIT 1',
      args: [variantId],
    });

    const now = Date.now();

    if (stockRes.rows.length > 0) {
      const stock = stockRes.rows[0];
      const stockId = String(stock.id);
      const accountData = String(stock.account_data);

      // Tandai stok terjual
      await client.execute({
        sql: 'UPDATE product_stocks SET is_sold = 1, order_id = ?, sold_at = ? WHERE id = ?',
        args: [orderId, now, stockId],
      });

      // Update status order
      await client.execute({
        sql: `UPDATE orders 
              SET status = 'completed', 
                  completed_at = ?, 
                  account_delivered = ? 
              WHERE order_id = ?`,
        args: [now, accountData, orderId],
      });

      return { success: true, accountData };
    } else {
      // Jika stok habis saat order dibayar, update status order dan beri pesan antrian admin
      const waitMessage = 'Stok instan saat ini sedang di-restock otomatis. Hubungi WhatsApp Admin untuk penyerahan akun prioritas.';
      await client.execute({
        sql: `UPDATE orders 
              SET status = 'completed', 
                  completed_at = ?, 
                  account_delivered = ? 
              WHERE order_id = ?`,
        args: [now, waitMessage, orderId],
      });

      return { success: true, accountData: waitMessage };
    }
  } catch (err: any) {
    console.error('Error in assignStockToOrder:', err.message);
    return { success: false, error: err.message };
  }
}
