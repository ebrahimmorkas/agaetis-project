import { int, mysqlEnum, mysqlTable, timestamp, varchar, type AnyMySqlColumn } from 'drizzle-orm/mysql-core';

export const USER_ROLES = ['super_admin', 'admin', 'manager', 'employee'] as const;
export const USER_STATUSES = ['active', 'inactive'] as const;

export const users = mysqlTable('users', {
  id: int('id').autoincrement().primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  role: mysqlEnum('role', USER_ROLES).notNull().default('employee'),
  status: mysqlEnum('status', USER_STATUSES).notNull().default('active'),
  managerId: int('manager_id').references((): AnyMySqlColumn => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type UserRole = (typeof USER_ROLES)[number];
export type UserStatus = (typeof USER_STATUSES)[number];
export type PublicUser = Omit<User, 'password'>;
