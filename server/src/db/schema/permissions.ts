import { boolean, int, mysqlEnum, mysqlTable, unique } from 'drizzle-orm/mysql-core';
import { users } from './users.js';

// Roles an admin can be given access to manage
export const MANAGED_ROLES = ['manager', 'employee'] as const;

export const adminPermissions = mysqlTable(
  'admin_permissions',
  {
    id: int('id').autoincrement().primaryKey(),
    adminId: int('admin_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    targetRole: mysqlEnum('target_role', MANAGED_ROLES).notNull(),
    canView: boolean('can_view').notNull().default(false),
    canAdd: boolean('can_add').notNull().default(false),
    canEdit: boolean('can_edit').notNull().default(false),
    canDelete: boolean('can_delete').notNull().default(false),
  },
  (table) => [unique('admin_role_unique').on(table.adminId, table.targetRole)],
);

export type ManagedRole = (typeof MANAGED_ROLES)[number];
export type AdminPermission = typeof adminPermissions.$inferSelect;
