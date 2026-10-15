import { eq } from 'drizzle-orm';
import { hashPassword } from '../utils/password.js';
import { pool, db } from './index.js';
import { users } from './schema/index.js';

async function seedSuperAdmin() {
  const name = process.env.SUPER_ADMIN_NAME ?? 'Super Admin';
  const email = process.env.SUPER_ADMIN_EMAIL?.toLowerCase();
  const password = process.env.SUPER_ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error('Set SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD in .env before seeding');
  }

  const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.role, 'super_admin')).limit(1);
  if (existing) {
    console.log('Super admin already exists, skipping');
    return;
  }

  await db.insert(users).values({
    name,
    email,
    password: await hashPassword(password),
    role: 'super_admin',
  });
  console.log(`Super admin created: ${email}`);
}

seedSuperAdmin()
  .catch((err) => {
    console.error(err.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
