import { AppError } from '../utils/AppError.js';
import { sendError } from '../utils/response.js';

// Errores de restricciones de schema.sql traducidos a un mensaje claro.
// Son la red de seguridad: normalmente el service valida antes de llegar aquí.
// SQLite incluye en el mensaje el nombre del CHECK/trigger o las columnas del UNIQUE.
const CONSTRAINT_MESSAGES = [
  { match: 'products.sku', message: 'Ya existe un producto con ese SKU' },
  { match: 'customers.email', message: 'Ya existe una cuenta con ese email' },
  { match: 'users.email', message: 'Ya existe una cuenta con ese email' },
  { match: 'orders.customer_id, orders.coupon_id', message: 'Ya usaste este cupón en una orden activa' },
  { match: 'chk_products_stock', message: 'Stock insuficiente' },
  { match: 'FOREIGN KEY', message: 'El registro está relacionado con otros datos y no se puede modificar así' },
  { match: 'INVALID_STATUS_TRANSITION', message: 'Ese cambio de estado no está permitido' },
  { match: 'ORDER_AMOUNTS_IMMUTABLE', message: 'Los montos de una orden no se pueden modificar' },
];

export function errorHandler(err, _req, res, _next) {
  if (err instanceof AppError) {
    return sendError(res, err.status, err.message, err.details);
  }

  if (err.type === 'entity.parse.failed') {
    return sendError(res, 400, 'El cuerpo de la petición no es JSON válido');
  }

  if (err.type === 'entity.too.large') {
    return sendError(res, 413, 'El cuerpo de la petición es demasiado grande');
  }

  // SQLITE_CONSTRAINT_CHECK, _UNIQUE, _FOREIGNKEY, _TRIGGER, _DATATYPE...
  if (typeof err.code === 'string' && err.code.startsWith('SQLITE_CONSTRAINT')) {
    const known = CONSTRAINT_MESSAGES.find(({ match }) => err.message.includes(match));
    return sendError(res, 409, known?.message ?? 'La operación viola una restricción de la base de datos');
  }

  if (err.code === 'SQLITE_BUSY') {
    return sendError(res, 503, 'La base de datos está ocupada, intenta de nuevo');
  }

  console.error(err);
  return sendError(res, 500, 'Error interno del servidor');
}
