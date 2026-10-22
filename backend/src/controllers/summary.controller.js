import * as summaryService from '../services/summary.service.js';
import { sendSuccess } from '../utils/response.js';

export function getSummary(req, res) {
  sendSuccess(res, summaryService.getSummary(req.validated.query));
}
