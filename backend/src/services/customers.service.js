import { withTransaction } from '../db.js';
import * as customersRepository from '../repositories/customers.repository.js';
import * as ordersRepository from '../repositories/orders.repository.js';
import { AppError } from '../utils/AppError.js';

export function list() {
  return customersRepository.findAll();
}

export function getById(id) {
  const customer = customersRepository.findById(id);
  if (!customer) {
    throw AppError.notFound(`El cliente ${id} no existe`);
  }
  return customer;
}

// Email duplicado → la BD lanza SQLITE_CONSTRAINT_UNIQUE y el errorHandler responde 409.
export function create(data) {
  return customersRepository.create(data);
}

// Cliente y su cuenta de acceso cambian juntos: o los dos, o ninguno.
export function update(id, fields) {
  return withTransaction(() => {
    const customer = customersRepository.update(id, fields);
    if (!customer) {
      throw AppError.notFound(`El cliente ${id} no existe`);
    }
    customersRepository.syncUserAccount(id, fields);
    return customer;
  });
}

// Un cliente con órdenes no se borra: las órdenes son historial contable.
export function remove(id) {
  return withTransaction(() => {
    const customer = getById(id);
    if (customersRepository.hasOrders(id)) {
      throw AppError.conflict(`${customer.fullName} tiene órdenes registradas y no se puede eliminar`);
    }
    customersRepository.remove(id);
    return { id, deleted: true };
  });
}

// Endpoint relacional: GET /api/customers/:id/orders
export function listOrders(id, filters) {
  getById(id);
  return ordersRepository.findAll({ ...filters, customerId: id });
}
