// Debe coincidir con las reglas del backend (orders.service.js).

export const STATUS_LABELS = {
  PENDING: 'Pendiente',
  PAID: 'Pagada',
  SHIPPED: 'Enviada',
  DELIVERED: 'Entregada',
  CANCELLED: 'Cancelada',
};

export const NEXT_STATUS = { PENDING: 'PAID', PAID: 'SHIPPED', SHIPPED: 'DELIVERED' };

export const NEXT_STATUS_ACTION = {
  PAID: 'Registrar pago',
  SHIPPED: 'Marcar como enviada',
  DELIVERED: 'Confirmar entrega',
};

export const isCancellable = (status) => status === 'PENDING' || status === 'PAID';

export const formatOrderNumber = (id) => `N.º ${String(id).padStart(4, '0')}`;
