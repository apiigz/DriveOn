// Prueba de punta a punta de la capa HTTP (rutas, middleware de errores) sobre la base temporal.
import { test, describe, before, beforeEach, after } from 'node:test';
import assert from 'node:assert/strict';
import { reiniciarDb, limpiar } from './helpers.js';
import { crearApp } from '../src/app.js';

describe('API HTTP', () => {
  let servidor;
  let base;

  before(async () => {
    reiniciarDb();
    servidor = crearApp().listen(0);
    await new Promise((resolver) => servidor.once('listening', resolver));
    base = `http://127.0.0.1:${servidor.address().port}/api`;
  });
  beforeEach(reiniciarDb);
  after(() => {
    servidor.close();
    limpiar();
  });

  const pedir = async (ruta, opciones) => {
    const res = await fetch(base + ruta, opciones);
    return { status: res.status, body: await res.json() };
  };
  const json = (metodo, datos) => ({ method: metodo, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(datos) });

  test('ruta /api inexistente -> 404 con { error }', async () => {
    const r = await pedir('/no-existe');
    assert.equal(r.status, 404);
    assert.equal(typeof r.body.error, 'string');
  });

  test('POST /contratos con vehículo alquilado -> 409', async () => {
    const r = await pedir('/contratos', json('POST', { conductorId: 8, sucursalId: 'norte', vehiculoId: 2, duracionSemanas: 4 }));
    assert.equal(r.status, 409);
  });

  test('POST /contratos válido -> 201', async () => {
    const r = await pedir('/contratos', json('POST', { conductorId: 8, sucursalId: 'centro', vehiculoId: 1, duracionSemanas: 4 }));
    assert.equal(r.status, 201);
    assert.equal(r.body.numero, 'CT-2109');
  });

  test('JSON inválido -> 400', async () => {
    const res = await fetch(`${base}/contratos`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{malo' });
    assert.equal(res.status, 400);
    assert.equal(typeof (await res.json()).error, 'string');
  });

  test('GET /vehiculos filtra por estado y devuelve resumen', async () => {
    const r = await pedir('/vehiculos?estado=Disponible');
    assert.equal(r.status, 200);
    assert.equal(r.body.total, 4);
    assert.deepEqual(r.body.resumen, { disponibles: 4, alquilados: 7, enTaller: 1 });
  });

  test('POST /cobranzas/:id/pagos con monto excedido -> 400', async () => {
    const r = await pedir('/cobranzas/5/pagos', json('POST', { monto: 999999, medio: 'Efectivo Caja', fecha: '2026-06-15' }));
    assert.equal(r.status, 400);
  });
});
