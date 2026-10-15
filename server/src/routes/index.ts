import { Router } from 'express';
import { checkDbConnection } from '../db/index.js';
import usersRoutes from '../modules/users/users.routes.js';

const router = Router();

router.get('/health', async (_req, res) => {
  const database = await checkDbConnection().then(() => 'connected', () => 'disconnected');
  res.json({ status: 'ok', database, uptime: process.uptime() });
});

router.use('/users', usersRoutes);

export default router;
