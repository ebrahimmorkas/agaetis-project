import { Router } from 'express';
import { authorize } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';
import { idParam } from '../../utils/params.js';
import * as controller from './users.controller.js';
import {
  createUserSchema,
  listUsersQuery,
  resetPasswordSchema,
  updateStatusSchema,
  updateUserSchema,
} from './users.validation.js';

const router = Router();

router.use(authorize('super_admin', 'admin', 'manager'));

router.get('/', validate({ query: listUsersQuery }), controller.list);
router.get('/managers', authorize('super_admin', 'admin'), controller.managers);
router.post('/', authorize('super_admin', 'admin'), validate({ body: createUserSchema }), controller.create);

router.get('/:id', validate({ params: idParam }), controller.getOne);
router.patch('/:id', validate({ params: idParam, body: updateUserSchema }), controller.update);
router.patch(
  '/:id/status',
  authorize('super_admin', 'admin'),
  validate({ params: idParam, body: updateStatusSchema }),
  controller.updateStatus,
);
router.patch(
  '/:id/password',
  authorize('super_admin'),
  validate({ params: idParam, body: resetPasswordSchema }),
  controller.resetPassword,
);

export default router;
