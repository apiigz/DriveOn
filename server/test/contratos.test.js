import { test, describe, beforeEach, after } from 'node:test';
import assert from 'node:assert/strict';
import { HOY, reiniciarDb, limpiar, esperarError } from './helpers.js';
import { emitirContrato, listarContratos, cotizar } from '../src/services/contratosService.js';
import { editarTarifa } from '../src/services/tarifasService.js';
import { listarDisponibles } from '../src/services/vehiculosService.js';
import { buscarVehiculo } from '../src/repositories/vehiculosRepository.js';
import { buscarContrato } from '../src/repositories/contratosRepository.js';

// Ids del seed: vehículo 1 = AE 104 BC (Etios, centro, Disponible); vehículo 2 = AD 920 KL (Alquilado)
// vehículo 5 = AC 338 QW (Cronos, sur, Disponible); conductores 8 y 9 no tienen contrato.
const pedido = { conductorId: 8, sucursalId: 'centro', vehiculoId: 1, duracionSemanas: 4 };

describe('emisión de contrato', () => {
  beforeEach(reiniciarDb);
  after(limpiar);

  test('vehículo no disponible -> 409', () => {
    esperarError(assert, () => emitirContrato({ ...pedido, vehiculoId: 2, sucursalId: 'norte' }), 409, /no está disponible/);
  });

  test('la sucursal no coincide con la del vehículo -> 400', () => {
    esperarError(assert, () => emitirContrato({ ...pedido, sucursalId: 'sur' }), 400, /no pertenece a la sucursal/);
  });

  test('datos inválidos -> 400 / 404', () => {
    esperarError(assert, () => emitirContrato({ ...pedido, duracionSemanas: 3 }), 400);
    esperarError(assert, () => emitirContrato({ ...pedido, conductorId: undefined }), 400);
    esperarError(assert, () => emitirContrato({ ...pedido, conductorId: 999 }), 404);
    esperarError(assert, () => emitirContrato({ ...pedido, vehiculoId: 999 }), 404);
    esperarError(assert, () => emitirContrato({ ...pedido, sucursalId: 'oeste' }), 404);
  });

  test('un pedido inválido no modifica el vehículo', () => {
    esperarError(assert, () => emitirContrato({ ...pedido, sucursalId: 'sur' }), 400);
    assert.equal(buscarVehiculo(1).estado, 'Disponible');
  });

  test('emisión válida: número correlativo, Pendiente entrega y vehículo Alquilado', () => {
    const c1 = emitirContrato(pedido);
    assert.equal(c1.numero, 'CT-2109'); // el mayor del seed es CT-2108
    assert.equal(c1.estado, 'Pendiente entrega');
    assert.equal(c1.fechaInicio, HOY);
    assert.equal(c1.patente, 'AE 104 BC');
    assert.equal(c1.sucursal, 'Centro');
    assert.equal(buscarVehiculo(1).estado, 'Alquilado');
    assert.equal(listarDisponibles({ sucursal: 'centro' }).some((v) => v.id === 1), false);

    const c2 = emitirContrato({ conductorId: 9, sucursalId: 'sur', vehiculoId: 5, duracionSemanas: 8 });
    assert.equal(c2.numero, 'CT-2110');

    // el segundo intento sobre el mismo vehículo ahora es un conflicto
    esperarError(assert, () => emitirContrato(pedido), 409);
  });

  test('el nuevo contrato aparece primero en el listado', () => {
    emitirContrato(pedido);
    const { items, total } = listarContratos({});
    assert.equal(total, 8);
    assert.equal(items[0].numero, 'CT-2109');
    assert.equal(items.length, 4); // pageSize por defecto
  });

  test('la tarifa queda congelada: editar la tarifa después no cambia el contrato (RN-05)', () => {
    const creado = emitirContrato(pedido); // Etios: 75000 / 120000
    assert.equal(creado.tarifaSemanal, 75000);

    editarTarifa(
      'etios',
      { categoria: 'Económico', tarifaSemanal: 99000, deposito: 150000, kmSemanal: 1500, kmExcedente: 120, vigenteDesde: HOY, motivo: 'Ajuste de prueba' },
      HOY,
    );

    const guardado = buscarContrato(creado.id);
    assert.equal(guardado.tarifaSemanal, 75000);
    assert.equal(guardado.deposito, 120000);
    assert.equal(listarContratos({}).items.find((c) => c.id === creado.id).tarifaSemanal, 75000);

    // los contratos nuevos sí toman la tarifa nueva
    assert.equal(cotizar({ vehiculoId: 1, duracionSemanas: 2 }).tarifaSemanal, 99000);
  });
});

describe('cotización', () => {
  beforeEach(reiniciarDb);
  after(limpiar);

  test('calcula el total = tarifa x semanas con los valores vigentes', () => {
    assert.deepEqual(cotizar({ vehiculoId: 5, duracionSemanas: 4 }), {
      tarifaSemanal: 82000,
      deposito: 130000,
      kmSemanal: 1500,
      kmExcedente: 135,
      totalContrato: 328000,
    });
  });

  test('valida duración y vehículo', () => {
    esperarError(assert, () => cotizar({ vehiculoId: 5, duracionSemanas: 5 }), 400);
    esperarError(assert, () => cotizar({ duracionSemanas: 4 }), 400);
    esperarError(assert, () => cotizar({ vehiculoId: 999, duracionSemanas: 4 }), 404);
  });
});
