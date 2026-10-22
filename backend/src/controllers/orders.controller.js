import { sendSuccess } from '../utils/response.js';
import * as ordersService from '../services/orders.service.js';

// Cada operación recibe req.user: el service decide qué órdenes puede ver o tocar.

export function list(req, res) {
  sendSuccess(res, ordersService.list(req.validated.query, req.user));
}

export function getById(req, res) {
  sendSuccess(res, ordersService.getById(req.validated.params.id, req.user));
}

export function quote(req, res) {
  sendSuccess(res, ordersService.quote(req.validated.body, req.user));
}

export function create(req, res) {
  sendSuccess(res, ordersService.create(req.validated.body, req.user), 201);
}

export function cancel(req, res) {
  sendSuccess(res, ordersService.cancel(req.validated.params.id, req.validated.body.reason, req.user));
}

export function updateStatus(req, res) {
  sendSuccess(res, ordersService.updateStatus(req.validated.params.id, req.validated.body.status, req.user));
}
