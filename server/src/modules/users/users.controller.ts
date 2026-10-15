import type { Request, Response } from 'express';
import { sendCreated, sendSuccess } from '../../utils/response.js';
import * as usersService from './users.service.js';
import type { ListUsersQuery } from './users.validation.js';

// these routes are always behind authenticate, and params/query are already parsed
const actor = (req: Request) => req.user!;
const getId = (req: Request) => Number(req.params.id);

export async function list(req: Request, res: Response) {
  const result = await usersService.listUsers(actor(req), req.query as unknown as ListUsersQuery);
  sendSuccess(res, result);
}

export async function managers(req: Request, res: Response) {
  sendSuccess(res, await usersService.listManagerOptions(actor(req)));
}

export async function getOne(req: Request, res: Response) {
  sendSuccess(res, await usersService.getUser(actor(req), getId(req)));
}

export async function create(req: Request, res: Response) {
  const user = await usersService.createUser(actor(req), req.body);
  sendCreated(res, user, 'User created');
}

export async function update(req: Request, res: Response) {
  const user = await usersService.updateUser(actor(req), getId(req), req.body);
  sendSuccess(res, user, 'User updated');
}

export async function updateStatus(req: Request, res: Response) {
  const user = await usersService.setUserStatus(actor(req), getId(req), req.body.status);
  sendSuccess(res, user, user.status === 'active' ? 'User activated' : 'User deactivated');
}

export async function resetPassword(req: Request, res: Response) {
  await usersService.resetPassword(actor(req), getId(req), req.body.password);
  sendSuccess(res, null, 'Password updated');
}
