import { HttpError, notFound } from '../utils/errores.js';

/** 404 para cualquier ruta /api que no exista. */
export function rutaNoEncontrada(req, res, next) {
  next(notFound(`La ruta ${req.method} ${req.originalUrl} no existe`));
}

/** Middleware central de errores: siempre responde { error }. */
// eslint-disable-next-line no-unused-vars
export function manejarErrores(err, req, res, next) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message });
  }
  // JSON mal formado en el body
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'El cuerpo de la solicitud no es un JSON válido' });
  }
  // Otros errores de cliente detectados por Express (body demasiado grande, charset inválido…)
  if (err.status >= 400 && err.status < 500) {
    return res.status(err.status).json({ error: 'La solicitud no es válida' });
  }
  // Error inesperado: se registra en el servidor pero no se filtran detalles al cliente
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
}

//manejo de errores