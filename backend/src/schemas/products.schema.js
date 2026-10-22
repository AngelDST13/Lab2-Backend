import { z } from 'zod';
import { moneySchema } from './common.schema.js';

const skuSchema = z
  .string()
  .trim()
  .min(1)
  .max(30)
  .transform((sku) => sku.toUpperCase());

const weightKgSchema = z.number().min(0.001, 'Mínimo 1 gramo').max(999.999);

export const listProductsQuerySchema = z.object({
  // "?search=" vacío equivale a no filtrar
  search: z.preprocess(
    (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
    z.string().trim().max(100).optional(),
  ),
  active: z
    .enum(['true', 'false'])
    .transform((value) => value === 'true')
    .optional(),
});

export const createProductSchema = z
  .object({
    sku: skuSchema,
    name: z.string().trim().min(1).max(120),
    price: moneySchema,
    stock: z.number().int().nonnegative().max(100_000),
    weightKg: weightKgSchema,
  })
  .strict();

// El stock NO se edita aquí: solo cambia con ventas, cancelaciones o reposiciones,
// para que cada cambio quede registrado en stock_movements.
export const updateProductSchema = z
  .object({
    sku: skuSchema,
    name: z.string().trim().min(1).max(120),
    price: moneySchema,
    weightKg: weightKgSchema,
    isActive: z.boolean(),
  })
  .partial()
  .strict()
  .refine((fields) => Object.keys(fields).length > 0, 'Debe enviar al menos un campo');

export const restockSchema = z
  .object({
    quantity: z.number().int().positive().max(100_000),
  })
  .strict();
