import { z } from 'zod';

const fullNameSchema = z.string().trim().min(1).max(120);
const emailSchema = z.string().trim().toLowerCase().email('Email inválido').max(160);

export const createCustomerSchema = z
  .object({
    fullName: fullNameSchema,
    email: emailSchema,
  })
  .strict();

export const updateCustomerSchema = z
  .object({
    fullName: fullNameSchema,
    email: emailSchema,
  })
  .partial()
  .strict()
  .refine((fields) => Object.keys(fields).length > 0, 'Debe enviar al menos un campo');
