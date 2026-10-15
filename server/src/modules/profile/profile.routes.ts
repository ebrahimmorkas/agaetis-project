import { Router, type Request, type Response } from 'express';
import { validate } from '../../middlewares/validate.js';
import { sendSuccess } from '../../utils/response.js';
import * as profileService from './profile.service.js';
import { changePasswordSchema, updateProfileSchema } from './profile.validation.js';

const router = Router();

router.patch('/', validate({ body: updateProfileSchema }), async (req: Request, res: Response) => {
  const user = await profileService.updateProfile(req.user!.id, req.body);
  sendSuccess(res, user, 'Profile updated');
});

router.patch('/password', validate({ body: changePasswordSchema }), async (req: Request, res: Response) => {
  await profileService.changePassword(req.user!.id, req.body);
  sendSuccess(res, null, 'Password changed');
});

export default router;
