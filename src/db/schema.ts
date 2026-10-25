import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const categories = sqliteTable('categories', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  icon: text('icon').notNull(),
  sortOrder: integer('sort_order').default(0),
});

export const products = sqliteTable('products', {
  id: text('id').primaryKey(),
  categoryId: text('category_id').notNull(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description').notNull(),
  imageUrl: text('image_url').notNull(),
  badge: text('badge'),
  isActive: integer('is_active').notNull().default(1),
  createdAt: integer('created_at').notNull(),
});

export const productVariants = sqliteTable('product_variants', {
  id: text('id').primaryKey(),
  productId: text('product_id').notNull(),
  name: text('name').notNull(),
  durationDays: integer('duration_days').notNull().default(30),
  price: integer('price').notNull(),
  originalPrice: integer('original_price').notNull(),
  description: text('description'),
});

export const productStocks = sqliteTable('product_stocks', {
  id: text('id').primaryKey(),
  variantId: text('variant_id').notNull(),
  accountData: text('account_data').notNull(), // format email:password | profile/PIN | note
  isSold: integer('is_sold').notNull().default(0),
  orderId: text('order_id'),
  soldAt: integer('sold_at'),
  createdAt: integer('created_at').notNull(),
});

export const orders = sqliteTable('orders', {
  id: text('id').primaryKey(),
  orderId: text('order_id').notNull().unique(),
  productId: text('product_id').notNull(),
  variantId: text('variant_id').notNull(),
  productName: text('product_name').notNull(),
  variantName: text('variant_name').notNull(),
  amount: integer('amount').notNull(),
  fee: integer('fee').notNull().default(0),
  totalPayment: integer('total_payment').notNull(),
  customerName: text('customer_name').notNull(),
  customerWhatsapp: text('customer_whatsapp').notNull(),
  customerEmail: text('customer_email'),
  paymentMethod: text('payment_method').notNull().default('qris'),
  paymentNumber: text('payment_number'),
  qrString: text('qr_string'),
  status: text('status').notNull().default('pending'), // 'pending' | 'completed' | 'expired' | 'canceled'
  accountDelivered: text('account_delivered'),
  expiredAt: integer('expired_at'),
  createdAt: integer('created_at').notNull(),
  completedAt: integer('completed_at'),
});

export const adminSessions = sqliteTable('admin_sessions', {
  token: text('token').primaryKey(),
  username: text('username').notNull(),
  expiresAt: integer('expires_at').notNull(),
});
