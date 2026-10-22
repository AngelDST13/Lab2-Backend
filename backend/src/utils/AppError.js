/**
 * Error de negocio con código HTTP. El errorHandler lo convierte en
 * { "error": "mensaje" } (y "details" cuando hay información por campo o por producto).
 */
export class AppError extends Error {
  constructor(status, message, details = undefined) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.details = details;
  }

  static badRequest(message, details) {
    return new AppError(400, message, details);
  }

  static notFound(message, details) {
    return new AppError(404, message, details);
  }

  static conflict(message, details) {
    return new AppError(409, message, details);
  }
}
