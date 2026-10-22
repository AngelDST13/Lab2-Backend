import { z } from 'zod';

export const couponCodeSchema = z
  .string()
  .trim()
  .min(1)
  .max(30)
  .transform((code) => code.toUpperCase());

export const couponParamsSchema = z.object({
  code: couponCodeSchema,
});

// El cliente se toma de la sesión, nunca de la URL.
export const validateCouponQuerySchema = z.object({
  subtotal: z.coerce.number().nonnegative().max(99_999_999.99),
});
