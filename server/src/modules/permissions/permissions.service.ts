import { eq } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { adminPermissions, MANAGED_ROLES, type ManagedRole } from '../../db/schema/index.js';

export type RolePermission = {
  view: boolean;
  add: boolean;
  edit: boolean;
  delete: boolean;
};

export type PermissionMap = Record<ManagedRole, RolePermission>;

export const PERMISSION_ACTIONS = ['view', 'add', 'edit', 'delete'] as const;
export type PermissionAction = (typeof PERMISSION_ACTIONS)[number];

const noAccess = (): RolePermission => ({ view: false, add: false, edit: false, delete: false });

export function emptyPermissions(): PermissionMap {
  return { manager: noAccess(), employee: noAccess() };
}

// edit and delete only make sense if the admin can see those users
function normalize(permission: RolePermission): RolePermission {
  return { ...permission, view: permission.view || permission.edit || permission.delete };
}

export async function getAdminPermissions(adminId: number): Promise<PermissionMap> {
  const rows = await db.select().from(adminPermissions).where(eq(adminPermissions.adminId, adminId));
  const map = emptyPermissions();

  for (const row of rows) {
    map[row.targetRole] = {
      view: row.canView,
      add: row.canAdd,
      edit: row.canEdit,
      delete: row.canDelete,
    };
  }
  return map;
}

export async function saveAdminPermissions(adminId: number, permissions: PermissionMap) {
  await db.transaction(async (tx) => {
    await tx.delete(adminPermissions).where(eq(adminPermissions.adminId, adminId));
    await tx.insert(adminPermissions).values(
      MANAGED_ROLES.map((role) => {
        const p = normalize(permissions[role]);
        return {
          adminId,
          targetRole: role,
          canView: p.view,
          canAdd: p.add,
          canEdit: p.edit,
          canDelete: p.delete,
        };
      }),
    );
  });
}
