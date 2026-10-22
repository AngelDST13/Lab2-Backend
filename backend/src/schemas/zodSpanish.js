import { z } from 'zod';

// Mensajes de validación en español para toda la API.
// Se registra una sola vez (en app.js) antes de definir cualquier esquema.
const TYPE_NAMES = { string: 'texto', number: 'número', boolean: 'verdadero/falso', array: 'lista', object: 'objeto', nan: 'un valor no numérico' };

z.setErrorMap((issue, ctx) => {
  switch (issue.code) {
    case z.ZodIssueCode.invalid_type:
      if (issue.received === 'undefined') return { message: 'Campo obligatorio' };
      return { message: `Se esperaba ${TYPE_NAMES[issue.expected] ?? issue.expected}` };
    case z.ZodIssueCode.too_small:
      if (issue.type === 'string') return { message: `Mínimo ${issue.minimum} caracteres` };
      if (issue.type === 'array') return { message: `Mínimo ${issue.minimum} elementos` };
      return { message: `Debe ser ${issue.inclusive ? 'mayor o igual a' : 'mayor que'} ${issue.minimum}` };
    case z.ZodIssueCode.too_big:
      if (issue.type === 'string') return { message: `Máximo ${issue.maximum} caracteres` };
      if (issue.type === 'array') return { message: `Máximo ${issue.maximum} elementos` };
      return { message: `Debe ser ${issue.inclusive ? 'menor o igual a' : 'menor que'} ${issue.maximum}` };
    case z.ZodIssueCode.invalid_enum_value:
      return { message: `Valor no permitido. Opciones: ${issue.options.join(', ')}` };
    case z.ZodIssueCode.unrecognized_keys:
      return { message: `Campos no permitidos: ${issue.keys.join(', ')}` };
    case z.ZodIssueCode.invalid_string:
      return { message: issue.validation === 'email' ? 'Email inválido' : 'Formato inválido' };
    case z.ZodIssueCode.not_multiple_of:
      return { message: 'Máximo 2 decimales' };
    default:
      return { message: ctx.defaultError };
  }
});
