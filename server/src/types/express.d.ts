import type { PublicUser } from '../db/schema/index.js';
import type { PermissionMap } from '../modules/permissions/permissions.service.js';

export type AuthUser = PublicUser & {
  permissions: PermissionMap | null;
};

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}
