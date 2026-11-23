// Acceso de bajo nivel al archivo JSON. Es lo único que sabe que la "base de datos" es un archivo.
// En producción esta capa (repositories/) se reemplaza por consultas a PostgreSQL.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RUTA_POR_DEFECTO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../data/db.json');

/** La ruta se lee en cada uso para que los tests puedan apuntar a un archivo temporal con DB_FILE. */
export const rutaDb = () => process.env.DB_FILE || RUTA_POR_DEFECTO;

export const existeDb = () => fs.existsSync(rutaDb());

export function leerDb() {
  return JSON.parse(fs.readFileSync(rutaDb(), 'utf8'));
}

/** Escritura atómica: archivo temporal + rename, así nunca queda un JSON a medias. */
export function escribirDb(db) {
  const destino = rutaDb();
  fs.mkdirSync(path.dirname(destino), { recursive: true });
  const temporal = `${destino}.tmp`;
  fs.writeFileSync(temporal, JSON.stringify(db, null, 2), 'utf8');
  fs.renameSync(temporal, destino);
}

/** Lee, aplica los cambios de `fn(db)` y guarda en una sola escritura (equivale a una transacción). */
export function modificarDb(fn) {
  const db = leerDb();
  const resultado = fn(db);
  escribirDb(db);
  return resultado;
}

const mismoId = (a, b) => String(a) === String(b);

/** Busca por id tolerando número/texto 
 * (los ids llegan como texto desde la URL). */
export const buscarPorId = (lista, id) => lista.find((x) => mismoId(x.id, id));

export const siguienteId = (lista) => lista.reduce((max, x) => Math.max(max, Number(x.id) || 0), 0) + 1;
