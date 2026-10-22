import { apiRequest, buildQuery } from '../../../services/apiClient.js';

export const getOrders = ({ status, customerId } = {}, signal) =>
  apiRequest(`/api/orders${buildQuery({ status, customerId })}`, { signal });

export const getOrder = (id, signal) => apiRequest(`/api/orders/${id}`, { signal });

export const updateOrderStatus = (id, status) =>
  apiRequest(`/api/orders/${id}/status`, { method: 'PATCH', body: { status } });

export const cancelOrder = (id, reason) =>
  apiRequest(`/api/orders/${id}/cancel`, { method: 'POST', body: { reason } });
