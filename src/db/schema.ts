import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const santri = sqliteTable('santri', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tenantId: text('tenant_id').notNull(),
  nis: text('nis').notNull(), // Remove unique globally, should be unique per tenant (handled via code/composite index)
  nama: text('nama').notNull(),
  kelas: text('kelas'),
  nama_wali: text('nama_wali'),
  no_wa: text('no_wa'),
  saldo: integer('saldo').default(0),
  nominal_spp: integer('nominal_spp').default(0),
  status_bulan_ini: text('status_bulan_ini').default('BELUM_BAYAR'),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
  updatedAt: text('updated_at').default('CURRENT_TIMESTAMP'),
});

export const transaksi = sqliteTable('transaksi', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tenantId: text('tenant_id').notNull(),
  santriId: integer('santri_id').references(() => santri.id),
  tipe: text('tipe').notNull(), // 'SPP', 'UANG_SAKU', dll
  jumlah: integer('jumlah').notNull(),
  status: text('status').default('PENDING'), // 'PENDING', 'LUNAS'
  metode: text('metode'), // 'TUNAI', 'IPAYMU', 'IPAYMU_INSTAN', 'IPAYMU_PRIBADI'
  biayaAdmin: integer('biaya_admin').default(0), // Biaya admin gateway
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
});

export const pengaturan = sqliteTable('pengaturan', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tenantId: text('tenant_id').notNull(),
  kunci: text('kunci').notNull(), // 'DEEPSEEK_API', 'IPAYMU_API'
  nilai: text('nilai').notNull(),
  updatedAt: text('updated_at').default('CURRENT_TIMESTAMP'),
});

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  tenantId: text("tenant_id").notNull(), // Menyimpan "tenant-1" dll
  email: text("email").notNull().unique(), // Digunakan untuk login Google
  firebaseUid: text("firebase_uid").unique(), // Firebase UID
  namaSekolah: text("nama_sekolah"), // Bisa diisi nama owner/lembaga
  role: text("role").notNull().default("ADMIN"), // "SUPER_ADMIN" atau "ADMIN"
  createdAt: text("created_at").default("CURRENT_TIMESTAMP")
});

export const media_ai = sqliteTable('media_ai', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tenantId: text('tenant_id').notNull(),
  namaFile: text('nama_file').notNull(),
  urlFile: text('url_file').notNull(),
  deskripsi: text('deskripsi').notNull(),
  ukuranFile: integer('ukuran_file'),
  tipeMedia: text('tipe_media').default('image'),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
});

export const pencairan = sqliteTable('pencairan', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tenantId: text('tenant_id').notNull(),
  bank: text('bank').notNull(),
  noRekening: text('no_rekening').notNull(),
  atasNama: text('atas_nama').notNull(),
  jumlah: integer('jumlah').notNull(),
  status: text('status').default('PENDING'), // PENDING, PROCESSED, REJECTED
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
  updatedAt: text('updated_at').default('CURRENT_TIMESTAMP'),
});

export const social_connections = sqliteTable('social_connections', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tenantId: text('tenant_id').notNull(),
  platform: text('platform').notNull(), // 'facebook', 'instagram'
  pageId: text('page_id').notNull().unique(), // ID Unik dari Meta untuk pencocokan Webhook
  accessToken: text('access_token').notNull(), // Wajib dienkripsi AES-256
  status: text('status').default('active'), // 'active', 'disconnected'
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
  updatedAt: text('updated_at').default('CURRENT_TIMESTAMP'),
});

export const meta_customers = sqliteTable('meta_customers', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tenantId: text('tenant_id').notNull(),
  platform: text('platform').notNull(),
  psid: text('psid').notNull(), // Page-Scoped ID (Sender ID)
  lastReplyAt: text('last_reply_at').default('CURRENT_TIMESTAMP'), // Untuk aturan 24 jam Meta
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
  updatedAt: text('updated_at').default('CURRENT_TIMESTAMP'),
});

export const meta_messages = sqliteTable('meta_messages', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  messageId: text('message_id').notNull().unique(), // ID Pesan dari Meta (Idempotency)
  tenantId: text('tenant_id').notNull(),
  platform: text('platform').notNull(),
  senderId: text('sender_id').notNull(), // PSID
  text: text('text'),
  isEcho: integer('is_echo').default(0), // 1 if this message was sent by the page
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
});
