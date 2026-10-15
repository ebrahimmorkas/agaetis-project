import { Router } from 'express';
import { checkDbConnection } from '../db/index.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import authRoutes from '../modules/auth/auth.routes.js';
import usersRoutes from '../modules/users/users.routes.js';

const router = Router();

router.get('/health', async (_req, res) => {
  const database = await checkDbConnection().then(() => 'connected', () => 'disconnected');
  res.json({ status: 'ok', database, uptime: process.uptime() });
});

router.use('/auth', authRoutes);
router.use('/users', authenticate, authorize('super_admin'), usersRoutes);

export default router;
