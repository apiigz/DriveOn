// Utilidades de fechas. Todas las fechas viajan como texto ISO "YYYY-MM-DD".
// Las comparaciones de texto ISO equivalen a comparar fechas.

let hoyForzado = null;

const pad = (n) => String(n).padStart(2, '0');

/** Devuelve "hoy" (fecha local) en ISO. Único punto de acceso al reloj. */
export function today() {
  if (hoyForzado) return hoyForzado;
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Solo para tests: fija el "hoy" (o lo libera con null). */
export function setToday(iso) {
  hoyForzado = iso;
}

function aUTC(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
}

/** Suma (o resta) días a una fecha ISO. */
export function addDays(iso, dias) {
  const d = new Date(aUTC(iso) + dias * 86400000);
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

/** Diferencia en días: a - b. */
export function diffDays(a, b) {
  return Math.round((aUTC(a) - aUTC(b)) / 86400000);
}

/** true si es un texto "YYYY-MM-DD" que representa una fecha real. */
export function esFechaValida(valor) {
  if (typeof valor !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) return false;
  return addDays(valor, 0) === valor;
}
