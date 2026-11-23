import { test, describe, beforeEach, after } from 'node:test';
import assert from 'node:assert/strict';
import { HOY, reiniciarDb, limpiar, esperarError } from './helpers.js';
import { addDays } from '../src/utils/fechas.js';
import { listarCobranzas, registrarPago, cuentaCorriente } from '../src/services/cobranzasService.js';
import { obtenerDashboard } from '../src/services/dashboardService.js';

// Ids del seed por orden: 1 CT-2041, 2 CT-2055, 3 CT-2108, 4 CT-1980, 5 CT-2019, 6 CT-2082, 7 CT-2070
const fila = (numero) => listarCobranzas({ pageSize: '50' }).items.find((f) => f.numero === numero);
const pagoValido = { monto: 75000, medio: 'Transferencia Bancaria', referencia: 'TRF-000001', fecha: HOY };

describe('cobranzas con datos semilla', () => {
  beforeEach(reiniciarDb);
  after(limpiar);

  test('estados del seed: mora, pendiente y al día', () => {
    const mora = fila('CT-2019'); // Etios 75000, 5 cuotas emitidas, 3 pagas
    assert.equal(mora.estado, 'En mora');
    assert.equal(mora.diasAtraso, 4);
    assert.equal(mora.saldo, 150000);
    assert.equal(mora.cuotasAdeudadas, 2);
    assert.equal(mora.vencimiento, addDays(HOY, -4));
    assert.equal(mora.conductor.iniciales, 'MR');

    assert.equal(fila('CT-2082').estado, 'Pendiente');
    assert.equal(fila('CT-2108').estado, 'Pendiente');
    assert.equal(fila('CT-2108').diasAtraso, 0);
    assert.equal(fila('CT-2041').estado, 'Al día');
    assert.equal(fila('CT-2041').saldo, 0);
  });

  test('listado: filtros, paginación y resumen de mora', () => {
    const res = listarCobranzas({});
    assert.equal(res.total, 7);
    assert.equal(res.items.length, 7);
    assert.equal(res.items[0].numero, 'CT-2019'); // En mora primero
    assert.deepEqual(res.mora, { monto: 150000, casos: 1 });

    assert.equal(listarCobranzas({ estado: 'En mora' }).total, 1);
    assert.equal(listarCobranzas({ search: 'dario' }).items[0].numero, 'CT-2041'); // sin tildes
    assert.equal(listarCobranzas({ search: '31004812' }).items[0].numero, 'CT-2019'); // por DNI sin puntos
    assert.equal(listarCobranzas({ pageSize: '3', page: '3' }).items.length, 1);
    esperarError(assert, () => listarCobranzas({ page: '0' }), 400);
  });

  test('registrar cobro: actualiza saldo y estado (FIFO)', () => {
    const r1 = registrarPago(5, pagoValido, HOY);
    assert.equal(r1.pago.registradoPor, 'Juan Lopez');
    assert.equal(r1.cobranza.saldo, 75000);
    // se cubrió la cuota 4 (la más antigua): la que queda emitió hace 4 días y vence en 3
    assert.equal(r1.cobranza.estado, 'Pendiente');
    assert.equal(r1.cobranza.cuotasAdeudadas, 1);
    assert.equal(fila('CT-2019').saldo, 75000);

    const r2 = registrarPago(5, pagoValido, HOY);
    assert.equal(r2.cobranza.saldo, 0);
    assert.equal(r2.cobranza.estado, 'Al día');
  });

  test('pago parcial: sigue En mora si la cuota más antigua queda impaga', () => {
    const r = registrarPago(5, { ...pagoValido, monto: 30000 }, HOY);
    assert.equal(r.cobranza.saldo, 120000);
    assert.equal(r.cobranza.estado, 'En mora');
    assert.equal(r.cobranza.diasAtraso, 4);
  });

  test('monto mayor al saldo -> 400', () => {
    esperarError(assert, () => registrarPago(5, { ...pagoValido, monto: 150001 }, HOY), 400, /saldo/);
  });

  test('contrato sin saldo -> 400', () => {
    esperarError(assert, () => registrarPago(1, pagoValido, HOY), 400, /no tiene saldo pendiente/);
  });

  test('otras validaciones del cobro', () => {
    esperarError(assert, () => registrarPago(5, { ...pagoValido, monto: 0 }, HOY), 400);
    esperarError(assert, () => registrarPago(5, { ...pagoValido, monto: 100.5 }, HOY), 400);
    esperarError(assert, () => registrarPago(5, { ...pagoValido, medio: '' }, HOY), 400);
    esperarError(assert, () => registrarPago(5, { ...pagoValido, fecha: addDays(HOY, 1) }, HOY), 400);
    esperarError(assert, () => registrarPago(5, { ...pagoValido, fecha: 'ayer' }, HOY), 400);
    esperarError(assert, () => registrarPago(999, pagoValido, HOY), 404);
  });

  test('un cobro rechazado no modifica el saldo', () => {
    esperarError(assert, () => registrarPago(5, { ...pagoValido, monto: 999999 }, HOY), 400);
    assert.equal(fila('CT-2019').saldo, 150000);
  });

  test('cuenta corriente: cargos y pagos, más reciente primero, con resumen', () => {
    const cc = cuentaCorriente(5, HOY);
    assert.equal(cc.numero, 'CT-2019');
    assert.equal(cc.conductor, 'Marcos Ruiz');
    assert.equal(cc.estado, 'En mora');
    assert.equal(cc.movimientos.length, 8); // 5 cargos + 3 pagos
    assert.equal(cc.movimientos.filter((m) => m.tipo === 'cargo').length, 5);
    assert.equal(cc.movimientos[0].concepto, 'Canon Liquidado S-5');
    assert.equal(cc.movimientos[0].detalle, 'Devengamiento');
    const fechas = cc.movimientos.map((m) => m.fecha);
    assert.deepEqual(fechas, [...fechas].sort().reverse());
    assert.deepEqual(cc.resumen, { garantia: 120000, infracciones: 0, saldo: 150000 });
    const pago = cc.movimientos.find((m) => m.tipo === 'pago');
    assert.equal(pago.concepto, 'Cobro Canon Semanal');
    esperarError(assert, () => cuentaCorriente(999, HOY), 404);
  });

  test('dashboard: KPIs y alertas calculadas desde los datos', () => {
    const d = obtenerDashboard(HOY);
    assert.deepEqual(d.kpis, {
      flotaTotal: 12,
      alquilados: 7,
      pctAlquilados: 58,
      disponibles: 4,
      pctDisponibles: 33,
      pagosPendientes: 3, // CT-2019, CT-2082, CT-2108
      contratosEnMora: 1,
    });
    const tipos = d.alertas.map((a) => a.tipo);
    assert.ok(tipos.includes('mora') && tipos.includes('renovacion') && tipos.includes('kilometraje') && tipos.includes('disponible'));
    const mora = d.alertas.find((a) => a.tipo === 'mora');
    assert.equal(mora.codigo, 'CT-2019');
    assert.equal(mora.ruta, '/cobranzas');
  });
});
