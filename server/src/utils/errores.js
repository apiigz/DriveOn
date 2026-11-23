// Error HTTP con código de estado. Los services lo lanzan y el middleware lo traduce a { error }.
export class HttpError extends Error {
  constructor(status, mensaje) {
    super(mensaje);
    this.name = 'HttpError';
    this.status = status;
  }
}

export const badRequest = (mensaje) => new HttpError(400, mensaje);
export const notFound = (mensaje) => new HttpError(404, mensaje);
export const conflict = (mensaje) => new HttpError(409, mensaje);
