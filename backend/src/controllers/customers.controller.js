import * as customersService from '../services/customers.service.js';
import { sendSuccess } from '../utils/response.js';

export function list(_req, res) {
  sendSuccess(res, customersService.list());
}

export function getById(req, res) {
  sendSuccess(res, customersService.getById(req.validated.params.id));
}

export function create(req, res) {
  sendSuccess(res, customersService.create(req.validated.body), 201);
}

export function update(req, res) {
  sendSuccess(res, customersService.update(req.validated.params.id, req.validated.body));
}

export function remove(req, res) {
  sendSuccess(res, customersService.remove(req.validated.params.id));
}

export function listOrders(req, res) {
  sendSuccess(res, customersService.listOrders(req.validated.params.id, req.validated.query));
}
