// Tests de regresión de los hallazgos de la revisión QA.
import { test, describe, beforeEach, after } from 'node:test';
import assert from 'node:assert/strict';
import { HOY, reiniciarDb, limpiar, esperarError } from './helpers.js';
import { emitirContrato, listarContratos } from '../src/services/contratosService.js';
import { editarTarifa } from '../src/services/tarifasService.js';
import { registrarPago } from '../src/services/cobranzasService.js';
import { obtenerDashboard } from '../src/services/dashboardService.js';

// Vehículo 9 = AF 892 PL (Disponible, Centro), protagonista de la alerta "disponible" del seed
const VEHICULO_ALERTA = 9;
// Contrato 6 = CT-2082 (Pendiente, inicio hoy-10)
const CONTRATO_PENDIENTE = 6;

describe('regresión QA', () => {
  beforeEach(reiniciarDb);
  after(limpiar);

  test('M1: la alerta "disponible" desaparece cuando el auto se alquila', () => {
    const tieneAlerta = () => obtenerDashboard().alertas.some((a) => a.tipo === 'disponible' && a.codigo === 'AF 892 PL');
    assert.equal(tieneAlerta(), true);
    emitirContrato({ conductorId: 8, sucursalId: 'centro', vehiculoId: VEHICULO_ALERTA, duracionSemanas: 4 });
    assert.equal(tieneAlerta(), false);
  });

  test('M3: un cobro no puede tener fecha anterior al inicio del contrato', () => {
    esperarError(
      assert,
      () => registrarPago(CONTRATO_PENDIENTE, { monto: 1000, medio: 'Efectivo Caja', fecha: '2000-01-01' }),
      400,
      /anterior al inicio/,
    );
  });

  test('M4: una tarifa con valor desmesurado se rechaza', () => {
    const base = { categoria: 'Sedán Compacto', tarifaSemanal: 82000, deposito: 130000, kmSemanal: 1500, kmExcedente: 135, vigenteDesde: HOY, motivo: 'Prueba de tope' };
    esperarError(assert, () => editarTarifa('cronos', { ...base, tarifaSemanal: 99999999999999999999 }), 400);
    esperarError(assert, () => editarTarifa('cronos', { ...base, tarifaSemanal: 10_000_001 }), 400);
  });

  test('B1: duracionSemanas no acepta booleanos ni arreglos', () => {
    const pedido = { conductorId: 8, sucursalId: 'centro', vehiculoId: 1 };
    esperarError(assert, () => emitirContrato({ ...pedido, duracionSemanas: true }), 400);
    esperarError(assert, () => emitirContrato({ ...pedido, duracionSemanas: [4] }), 400);
  });

  test('B4: una página fuera de rango devuelve la última página', () => {
    const res = listarContratos({ page: '999', pageSize: '4' });
    assert.equal(res.page, res.totalPages);
    assert.ok(res.items.length > 0);
  });
});
