import { Router } from 'express';
import { validate } from '../../middlewares/validate.js';
import { idParam } from '../../utils/params.js';
import * as controller from './users.controller.js';
import { createUserSchema, listUsersQuery, updateUserSchema } from './users.validation.js';

const router = Router();

router.get('/', validate({ query: listUsersQuery }), controller.list);
router.post('/', validate({ body: createUserSchema }), controller.create);
router.get('/:id', validate({ params: idParam }), controller.getOne);
router.patch('/:id', validate({ params: idParam, body: updateUserSchema }), controller.update);
router.delete('/:id', validate({ params: idParam }), controller.remove);

export default router;
