import { sendSuccess } from '../utils/response.js';
import * as agentService from '../services/agent.service.js';

export async function chat(req, res) {
  sendSuccess(res, await agentService.chat(req.validated.body, req.user));
}
