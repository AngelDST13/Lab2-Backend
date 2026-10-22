import { AppError } from '../utils/AppError.js';

const REQUEST_PARTS = ['params', 'query', 'body'];

/**
 * Valida params, query y body con esquemas zod antes de llegar al controller.
 * Los datos ya validados y transformados quedan en req.validated.
 *
 * @param {{ params?: import('zod').ZodTypeAny, query?: import('zod').ZodTypeAny, body?: import('zod').ZodTypeAny }} schemas
 */
export const validate = (schemas) => (req, _res, next) => {
  req.validated = {};

  for (const part of REQUEST_PARTS) {
    const schema = schemas[part];
    if (!schema) continue;

    const result = schema.safeParse(req[part] ?? {});
    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        field: [part, ...issue.path].join('.'),
        message: issue.message,
      }));
      throw AppError.badRequest('Datos de entrada inválidos', details);
    }
    req.validated[part] = result.data;
  }

  next();
};
