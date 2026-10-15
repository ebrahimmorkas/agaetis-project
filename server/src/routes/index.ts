import { Router } from 'express';
import { checkDbConnection } from '../db/index.js';
import { authenticate } from '../middlewares/auth.js';
import authRoutes from '../modules/auth/auth.routes.js';
import profileRoutes from '../modules/profile/profile.routes.js';
import usersRoutes from '../modules/users/users.routes.js';

const router = Router();

router.get('/health', async (_req, res) => {
  const database = await checkDbConnection().then(() => 'connected', () => 'disconnected');
  res.json({ status: 'ok', database, uptime: process.uptime() });
});

router.use('/auth', authRoutes);
router.use('/profile', authenticate, profileRoutes);
router.use('/users', authenticate, usersRoutes);

export default router;
