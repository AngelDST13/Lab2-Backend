import { z } from 'zod';

export const summaryQuerySchema = z.object({
  // Ventana del gráfico de ventas diarias
  dias: z.coerce.number().int().min(1).max(365).default(14),
}).transform(({ dias }) => ({ days: dias }));
