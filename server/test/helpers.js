// Utilidades de test: base de datos temporal (nunca toca data/db.json) y "hoy" fijo.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { setToday } from '../src/utils/fechas.js';
import { escribirDb } from '../src/repositories/db.js';
import { generarDatos } from '../src/seed/seed.js';

export const HOY = '2026-06-15';

const carpeta = fs.mkdtempSync(path.join(os.tmpdir(), 'driveon-test-'));
process.env.DB_FILE = path.join(carpeta, 'db.json');

/** Deja la base temporal con los datos semilla de HOY y fija el reloj. */
export function reiniciarDb() {
  setToday(HOY);
  escribirDb(generarDatos(HOY));
}

/** Borra la carpeta temporal y libera el reloj. */
export function limpiar() {
  setToday(null);
  fs.rmSync(carpeta, { recursive: true, force: true });
}

/** Comprueba que `fn` lance un HttpError con ese status. */
export function esperarError(assert, fn, status, textoMensaje) {
  assert.throws(fn, (err) => {
    assert.equal(err.status, status, `se esperaba status ${status}, llegó ${err.status}: ${err.message}`);
    if (textoMensaje) assert.match(err.message, textoMensaje);
    return true;
  });
}
