import { z } from 'zod';

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const moneySchema = z
  .number()
  .nonnegative()
  .max(99_999_999.99)
  .multipleOf(0.01, 'Máximo 2 decimales');
