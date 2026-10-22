import { sendSuccess } from '../utils/response.js';
import * as shippingService from '../services/shipping.service.js';

export function listZones(_req, res) {
  sendSuccess(res, shippingService.listZones());
}
