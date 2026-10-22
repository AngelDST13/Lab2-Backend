import { apiRequest } from '../../../services/apiClient.js';

export const quoteOrder = (orderInput, signal) =>
  apiRequest('/api/orders/quote', { method: 'POST', body: orderInput, signal });

export const createOrder = (orderInput) => apiRequest('/api/orders', { method: 'POST', body: orderInput });
