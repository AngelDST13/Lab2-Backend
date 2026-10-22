import { apiRequest } from '../../services/apiClient.js';

// Datos de referencia que usan varias features (carrito, órdenes).

export const getCustomers = (signal) => apiRequest('/api/customers', { signal });

export const getShippingZones = (signal) => apiRequest('/api/shipping-zones', { signal });
