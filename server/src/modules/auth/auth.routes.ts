import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { authenticate } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';
import * as controller from './auth.controller.js';
import { loginSchema } from './auth.validation.js';

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts. Please try again in a few minutes.' },
});

router.post('/login', loginLimiter, validate({ body: loginSchema }), controller.login);
router.post('/logout', controller.logout);
router.get('/me', authenticate, controller.me);

export default router;
