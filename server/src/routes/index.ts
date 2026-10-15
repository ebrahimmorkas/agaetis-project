import { Router } from 'express';
import { checkDbConnection } from '../db/index.js';

const router = Router();

router.get('/health', async (_req, res) => {
  const database = await checkDbConnection().then(() => 'connected', () => 'disconnected');
  res.json({ status: 'ok', database, uptime: process.uptime() });
});

export default router;
