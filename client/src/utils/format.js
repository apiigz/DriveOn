const LOCALE = 'es-AR';
const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

const numberFormat = new Intl.NumberFormat(LOCALE, { useGrouping: 'always', maximumFractionDigits: 0 });

export const formatNumber = (n) => numberFormat.format(Number(n) || 0);

/** 82000 -> "$ 82.000" */
export const formatMoney = (n) => `$ ${formatNumber(n)}`;

/** 42150 -> "42.150 km" */
export const formatKm = (n) => `${formatNumber(n)} km`;

function parseParts(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value ?? ''));
  if (!match) return null;
  return { year: match[1], month: Number(match[2]), day: match[3] };
}

/** "2024-10-21" -> "21 Oct 2024" */
export function formatDateLong(value) {
  const p = parseParts(value);
  return p ? `${p.day} ${MESES[p.month - 1]} ${p.year}` : '—';
}

/** "2024-10-14" -> "14/10/2024" */
export function formatDateShort(value) {
  const p = parseParts(value);
  return p ? `${p.day}/${String(p.month).padStart(2, '0')}/${p.year}` : '—';
}

/** Fecha local de hoy en formato YYYY-MM-DD (para inputs date). */
export function todayISO() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

export const pluralize = (n, singular, plural) => (n === 1 ? singular : plural);
