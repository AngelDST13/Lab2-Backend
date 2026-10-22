import { z } from 'zod';

export const chatSchema = z
  .object({
    message: z.string().trim().min(1).max(2000),
    sessionId: z
      .string()
      .trim()
      .regex(/^[\w-]{8,64}$/, 'sessionId inválido'),
  })
  .strict();
