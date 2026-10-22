import { sendSuccess } from '../utils/response.js';
import * as couponsService from '../services/coupons.service.js';

export function validate(req, res) {
  const { code } = req.validated.params;
  sendSuccess(res, couponsService.validate(code, req.validated.query, req.user));
}
