import { z } from 'zod';

const emailSchema = z.string().trim().toLowerCase().email('Email inválido').max(160);

export const loginSchema = z
  .object({
    email: emailSchema,
    // Sin reglas de formato en el login: solo se compara con el hash guardado
    password: z.string().min(1, 'Escribe tu contraseña').max(200),
  })
  .strict();

export const registerSchema = z
  .object({
    fullName: z.string().trim().min(1).max(120),
    email: emailSchema,
    password: z
      .string()
      .min(8, 'Usa al menos 8 caracteres')
      .max(200)
      .refine((value) => /[A-Za-z]/.test(value) && /\d/.test(value), 'Combina letras y números'),
  })
  .strict();
