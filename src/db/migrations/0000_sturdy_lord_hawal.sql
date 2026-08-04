CREATE TABLE `pengaturan` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`kunci` text NOT NULL,
	`nilai` text NOT NULL,
	`updated_at` text DEFAULT 'CURRENT_TIMESTAMP'
);
--> statement-breakpoint
CREATE UNIQUE INDEX `pengaturan_kunci_unique` ON `pengaturan` (`kunci`);--> statement-breakpoint
CREATE TABLE `santri` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nis` text NOT NULL,
	`nama` text NOT NULL,
	`kelas` text,
	`no_wa` text,
	`saldo` integer DEFAULT 0,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP',
	`updated_at` text DEFAULT 'CURRENT_TIMESTAMP'
);
--> statement-breakpoint
CREATE UNIQUE INDEX `santri_nis_unique` ON `santri` (`nis`);--> statement-breakpoint
CREATE TABLE `transaksi` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`santri_id` integer,
	`tipe` text NOT NULL,
	`jumlah` integer NOT NULL,
	`status` text DEFAULT 'PENDING',
	`metode` text,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP',
	FOREIGN KEY (`santri_id`) REFERENCES `santri`(`id`) ON UPDATE no action ON DELETE no action
);
