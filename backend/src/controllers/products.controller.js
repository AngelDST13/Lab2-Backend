import { sendSuccess } from '../utils/response.js';
import * as productsService from '../services/products.service.js';

// El controller solo traduce HTTP ↔ service. Sin reglas de negocio aquí.

export function list(req, res) {
  sendSuccess(res, productsService.list(req.validated.query));
}

export function getById(req, res) {
  sendSuccess(res, productsService.getById(req.validated.params.id));
}

export function create(req, res) {
  sendSuccess(res, productsService.create(req.validated.body), 201);
}

export function update(req, res) {
  sendSuccess(res, productsService.update(req.validated.params.id, req.validated.body));
}

export function remove(req, res) {
  sendSuccess(res, productsService.remove(req.validated.params.id));
}

export function restock(req, res) {
  sendSuccess(res, productsService.restock(req.validated.params.id, req.validated.body.quantity));
}

export function listMovements(req, res) {
  sendSuccess(res, productsService.listMovements(req.validated.params.id));
}
