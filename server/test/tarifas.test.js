import { test, describe, beforeEach, after } from 'node:test';
import assert from 'node:assert/strict';
import { HOY, reiniciarDb, limpiar, esperarError } from './helpers.js';
import { addDays } from '../src/utils/fechas.js';
import { listarTarifas, editarTarifa, listarHistorial } from '../src/services/tarifasService.js';

const valido = {
  categoria: 'Sedán Compacto',
  tarifaSemanal: 85000,
  deposito: 130000,
  kmSemanal: 1500,
  kmExcedente: 135,
  vigenteDesde: HOY,
  motivo: 'Actualización de costos',
};
const cronos = () => listarTarifas().find((t) => t.id === 'cronos');

describe('edición de tarifa', () => {
  beforeEach(reiniciarDb);
  after(limpiar);

  test('el seed deja los valores vigentes del documento', () => {
    const t = cronos();
    assert.equal(t.tarifaSemanal, 82000);
    assert.equal(t.proximoCambio, null);
    assert.equal(listarTarifas().length, 5);
  });

  test('validaciones -> 400', () => {
    const casos = [
      { categoria: '  ' },
      { tarifaSemanal: 0 },
      { tarifaSemanal: -5 },
      { deposito: 1000.5 },
      { kmSemanal: 'abc' },
      { kmExcedente: undefined },
      { vigenteDesde: addDays(HOY, -1) },
      { vigenteDesde: '2026-02-30' },
      { vigenteDesde: undefined },
      { motivo: 'ajus' },
      { motivo: undefined },
    ];
    for (const caso of casos) {
      esperarError(assert, () => editarTarifa('cronos', { ...valido, ...caso }, HOY), 400, undefined);
    }
  });

  test('sin cambios -> 400; tarifa inexistente -> 404', () => {
    esperarError(assert, () => editarTarifa('cronos', { ...valido, tarifaSemanal: 82000 }, HOY), 400, /No hay cambios/);
    esperarError(assert, () => editarTarifa('xyz', valido, HOY), 404);
  });

  test('un cambio con vigencia hoy actualiza la tarifa vigente', () => {
    const t = editarTarifa('cronos', valido, HOY);
    assert.equal(t.tarifaSemanal, 85000);
    assert.equal(t.proximoCambio, null);
    assert.equal(cronos().tarifaSemanal, 85000);
  });

  test('genera una entrada de historial por cada campo cambiado', () => {
    editarTarifa('cronos', { ...valido, deposito: 140000 }, HOY); // cambian tarifaSemanal y deposito
    const nuevas = listarHistorial({}).filter((h) => h.fecha === HOY);
    assert.equal(nuevas.length, 2);
    assert.deepEqual(nuevas.map((h) => h.campo).sort(), ['deposito', 'tarifaSemanal']);
    const semanal = nuevas.find((h) => h.campo === 'tarifaSemanal');
    assert.equal(semanal.anterior, 82000);
    assert.equal(semanal.nuevo, 85000);
    assert.equal(semanal.responsable, 'Juan Lopez');
    assert.equal(semanal.motivo, 'Actualización de costos');
    assert.equal(semanal.vehiculo, 'Fiat Cronos 1.3');
  });

  test('el historial viene ordenado (más reciente primero) y respeta limit', () => {
    editarTarifa('cronos', valido, HOY);
    const todo = listarHistorial({});
    assert.equal(todo.length, 4); // 3 del seed + 1 nuevo
    assert.equal(todo[0].fecha, HOY);
    assert.equal(listarHistorial({ limit: '3' }).length, 3);
    esperarError(assert, () => listarHistorial({ limit: '0' }), 400);
  });

  test('vigencia futura: la tarifa actual no cambia y se informa proximoCambio', () => {
    const futura = addDays(HOY, 10);
    const t = editarTarifa('cronos', { ...valido, vigenteDesde: futura }, HOY);
    assert.equal(t.tarifaSemanal, 82000);
    assert.deepEqual(t.proximoCambio, {
      categoria: 'Sedán Compacto',
      tarifaSemanal: 85000,
      deposito: 130000,
      kmSemanal: 1500,
      kmExcedente: 135,
      vigenteDesde: futura,
    });
    assert.equal(cronos().tarifaSemanal, 82000);
    assert.equal(listarHistorial({}).filter((h) => h.vigenteDesde === undefined).length, 4); // el historial no expone vigenteDesde
  });
});
