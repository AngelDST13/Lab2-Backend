import { apiRequest } from '../../../services/apiClient.js';

export const getSummary = (days, signal) => apiRequest(`/api/resumen?dias=${days}`, { signal });
