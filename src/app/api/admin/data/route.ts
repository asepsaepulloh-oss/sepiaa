import { NextRequest, NextResponse } from 'next/server';
import { client, ensureDbReady } from '@/lib/turso';

export async function GET(req: NextRequest) {
  try {
    await ensureDbReady();

    // Validasi sesi admin
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

    const adminUsername = String(sessionRes.rows[0].username);

    // 1. Metrics
    const totalOrdersRes = await client.execute('SELECT COUNT(*) as count FROM orders');
    const totalOrders = Number(totalOrdersRes.rows[0]?.count || 0);

    const paidOrdersRes = await client.execute(
      "SELECT COUNT(*) as count, SUM(total_payment) as revenue FROM orders WHERE status = 'completed'"
    );
    const paidOrders = Number(paidOrdersRes.rows[0]?.count || 0);
    const totalRevenue = Number(paidOrdersRes.rows[0]?.revenue || 0);

    const stockCountRes = await client.execute(
      'SELECT COUNT(*) as count FROM product_stocks WHERE is_sold = 0'
    );
    const activeStockCount = Number(stockCountRes.rows[0]?.count || 0);

    const totalCustomersRes = await client.execute('SELECT COUNT(*) as count FROM users');
    const totalCustomers = Number(totalCustomersRes.rows[0]?.count || 0);

    // 2. Kategori
    const catRes = await client.execute('SELECT * FROM categories ORDER BY sort_order ASC');
    const categories = catRes.rows.map((r: any) => ({
      id: String(r.id),
      name: String(r.name),
      slug: String(r.slug),
      icon: String(r.icon),
    }));

    // 3. Recent Orders (50 teratas)
    const ordersRes = await client.execute(
      'SELECT * FROM orders ORDER BY created_at DESC LIMIT 50'
    );

    const orders = ordersRes.rows.map((r: any) => ({
      id: String(r.id),
      orderId: String(r.order_id),
      productName: String(r.product_name),
      variantName: String(r.variant_name),
      amount: Number(r.amount),
      totalPayment: Number(r.total_payment),
      customerName: String(r.customer_name),
      customerWhatsapp: String(r.customer_whatsapp),
      customerEmail: r.customer_email ? String(r.customer_email) : null,
      status: String(r.status),
      accountDelivered: r.account_delivered ? String(r.account_delivered) : null,
      createdAt: Number(r.created_at),
      completedAt: r.completed_at ? Number(r.completed_at) : null,
    }));

    // 4. Products & Variants with individual stock count
    const variantsRes = await client.execute(`
      SELECT v.*, p.name as product_name,
        (SELECT COUNT(*) FROM product_stocks s WHERE s.variant_id = v.id AND s.is_sold = 0) as stock_count
      FROM product_variants v
      JOIN products p ON v.product_id = p.id
      ORDER BY p.name ASC, v.price ASC
    `);

    const variants = variantsRes.rows.map((r: any) => ({
      id: String(r.id),
      productId: String(r.product_id),
      productName: String(r.product_name),
      name: String(r.name),
      price: Number(r.price),
      originalPrice: Number(r.original_price),
      stockCount: Number(r.stock_count || 0),
    }));

    // 5. Raw Products list with variants grouped
    const prodRes = await client.execute(
      'SELECT * FROM products ORDER BY created_at DESC'
    );
    const products = prodRes.rows.map((r: any) => {
      const pId = String(r.id);
      const prodVars = variants.filter((v) => v.productId === pId);
      const totalStock = prodVars.reduce((sum, v) => sum + v.stockCount, 0);
      const prices = prodVars.map((v) => v.price);
      const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
      const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

      return {
        id: pId,
        name: String(r.name),
        categoryId: String(r.category_id),
        imageUrl: String(r.image_url),
        badge: r.badge ? String(r.badge) : null,
        description: String(r.description),
        isActive: Number(r.is_active),
        variants: prodVars,
        totalStock,
        minPrice,
        maxPrice,
      };
    });

    // 6. Registered Customers list
    const usersRes = await client.execute(
      'SELECT id, name, whatsapp, email, created_at FROM users ORDER BY created_at DESC LIMIT 50'
    );
    const customers = usersRes.rows.map((r: any) => ({
      id: String(r.id),
      name: String(r.name),
      whatsapp: String(r.whatsapp),
      email: r.email ? String(r.email) : null,
      createdAt: Number(r.created_at),
    }));

    return NextResponse.json({
      success: true,
      adminUsername,
      metrics: {
        totalRevenue,
        totalOrders,
        paidOrders,
        activeStockCount,
        totalCustomers,
      },
      categories,
      orders,
      variants,
      products,
      customers,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
