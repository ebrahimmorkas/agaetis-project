CREATE TABLE `admin_permissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`admin_id` int NOT NULL,
	`target_role` enum('manager','employee') NOT NULL,
	`can_view` boolean NOT NULL DEFAULT false,
	`can_add` boolean NOT NULL DEFAULT false,
	`can_edit` boolean NOT NULL DEFAULT false,
	`can_delete` boolean NOT NULL DEFAULT false,
	CONSTRAINT `admin_permissions_id` PRIMARY KEY(`id`),
	CONSTRAINT `admin_role_unique` UNIQUE(`admin_id`,`target_role`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('super_admin','admin','manager','employee') NOT NULL DEFAULT 'employee';--> statement-breakpoint
ALTER TABLE `users` ADD `password` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `status` enum('active','inactive') DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `manager_id` int;--> statement-breakpoint
ALTER TABLE `admin_permissions` ADD CONSTRAINT `admin_permissions_admin_id_users_id_fk` FOREIGN KEY (`admin_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_manager_id_users_id_fk` FOREIGN KEY (`manager_id`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;