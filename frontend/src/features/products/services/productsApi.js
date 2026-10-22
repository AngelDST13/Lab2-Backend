import { apiRequest, buildQuery } from '../../../services/apiClient.js';

export const getProducts = ({ search, active } = {}, signal) =>
  apiRequest(`/api/products${buildQuery({ search, active })}`, { signal });

export const createProduct = (product) => apiRequest('/api/products', { method: 'POST', body: product });

export const restockProduct = (id, quantity) =>
  apiRequest(`/api/products/${id}/restock`, { method: 'POST', body: { quantity } });
