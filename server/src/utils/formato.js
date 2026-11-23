import { badRequest } from './errores.js';

/** Minúsculas, sin tildes, espacios ni puntos: para búsquedas tolerantes. */
export function normalizar(texto) {
  return String(texto ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[\s.]/g, '');
}

/** "Darío Gomez" -> "DG" */
export function iniciales(nombre) {
  return nombre
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((palabra) => palabra[0].toUpperCase())
    .join('');
}

function enteroPositivo(valor, nombre, porDefecto) {
  if (valor === undefined || valor === '') return porDefecto;
  const n = Number(valor);
  if (!Number.isInteger(n) || n < 1) throw badRequest(`El parámetro "${nombre}" debe ser un entero positivo`);
  return n;
}

/** Pagina un arreglo y arma la respuesta { items, total, page, pageSize, totalPages }. */
export function paginar(lista, query, pageSizePorDefecto) {
  const pageSize = Math.min(enteroPositivo(query.pageSize, 'pageSize', pageSizePorDefecto), 100);
  const total = lista.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  // Si la página pedida ya no existe (p. ej. tras filtrar), se devuelve la última
  const page = Math.min(enteroPositivo(query.page, 'page', 1), totalPages);
  const desde = (page - 1) * pageSize;
  return { items: lista.slice(desde, desde + pageSize), total, page, pageSize, totalPages };
}

//funciones auxiliares