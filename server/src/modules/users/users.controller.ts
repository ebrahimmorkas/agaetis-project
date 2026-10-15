import type { Request, Response } from 'express';
import { sendCreated, sendSuccess } from '../../utils/response.js';
import * as usersService from './users.service.js';
import type { ListUsersQuery } from './users.validation.js';

// params/query are already parsed by the validate middleware at this point
const getId = (req: Request) => Number(req.params.id);

export async function list(req: Request, res: Response) {
  const result = await usersService.listUsers(req.query as unknown as ListUsersQuery);
  sendSuccess(res, result);
}

export async function getOne(req: Request, res: Response) {
  const user = await usersService.getUserById(getId(req));
  sendSuccess(res, user);
}

export async function create(req: Request, res: Response) {
  const user = await usersService.createUser(req.body);
  sendCreated(res, user, 'Employee added');
}

export async function update(req: Request, res: Response) {
  const user = await usersService.updateUser(getId(req), req.body);
  sendSuccess(res, user, 'Employee updated');
}

export async function remove(req: Request, res: Response) {
  await usersService.deleteUser(getId(req));
  sendSuccess(res, null, 'Employee deleted');
}
