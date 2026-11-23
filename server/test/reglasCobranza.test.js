// Reglas puras de cuotas, saldo, estado y FIFO. Reciben `hoy` por parámetro: no usan el reloj ni archivos.
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { generarCuotas, calcularCuenta, estadoContrato } from '../src/services/reglasCobranza.js';
import { addDays, diffDays, esFechaValida } from '../src/utils/fechas.js';

const INICIO = '2026-06-01';
const contrato = { fechaInicio: INICIO, duracionSemanas: 4, tarifaSemanal: 1000, estadoBase: 'Activo' };
const pago = (monto) => ({ monto });

describe('fechas', () => {
  test('addDays / diffDays / esFechaValida', () => {
    assert.equal(addDays('2026-02-27', 3), '2026-03-02');
    assert.equal(diffDays('2026-06-15', '2026-06-01'), 14);
    assert.equal(esFechaValida('2026-02-30'), false);
    assert.equal(esFechaValida('2026-06-15'), true);
  });
});

describe('cuotas', () => {
  test('la cuota k se emite en inicio+7k y vence en inicio+7k+7', () => {
    const cuotas = generarCuotas(contrato);
    assert.equal(cuotas.length, 4);
    assert.deepEqual([cuotas[0].emision, cuotas[0].vencimiento], ['2026-06-01', '2026-06-08']);
    assert.deepEqual([cuotas[2].emision, cuotas[2].vencimiento], ['2026-06-15', '2026-06-22']);
  });
});

describe('estado de cobranza y saldo', () => {
  test('el día de inicio hay una cuota emitida: Pendiente, vence en 7 días', () => {
    const c = calcularCuenta(contrato, [], INICIO);
    assert.equal(c.saldo, 1000);
    assert.equal(c.estado, 'Pendiente');
    assert.equal(c.vencimiento, '2026-06-08');
    assert.equal(c.diasAtraso, 0);
    assert.equal(c.cuotasAdeudadas, 1);
  });

  test('el mismo día del vencimiento todavía es Pendiente (no vencida antes de hoy)', () => {
    assert.equal(calcularCuenta(contrato, [], '2026-06-08').estado, 'Pendiente');
  });

  test('sin pagos y pasado el vencimiento: En mora con días de atraso', () => {
    const c = calcularCuenta(contrato, [], '2026-06-11'); // cuota 1 venció el 06-08
    assert.equal(c.estado, 'En mora');
    assert.equal(c.diasAtraso, 3);
    assert.equal(c.vencimiento, '2026-06-08');
    assert.equal(c.saldo, 2000); // cuotas 1 y 2 (emitida el 06-08)
    assert.equal(c.cuotasAdeudadas, 2);
  });

  test('con todo lo emitido pagado: Al día, saldo 0 y muestra el vencimiento de la próxima cuota', () => {
    const c = calcularCuenta(contrato, [pago(2000)], '2026-06-11');
    assert.equal(c.saldo, 0);
    assert.equal(c.estado, 'Al día');
    assert.equal(c.diasAtraso, 0);
    assert.equal(c.vencimiento, '2026-06-22'); // cuota 3 (emitida el 06-15)
  });

  test('sin cuotas por emitir y todo pagado: muestra el vencimiento de la última cuota', () => {
    const c = calcularCuenta(contrato, [pago(4000)], '2026-07-20');
    assert.equal(c.estado, 'Al día');
    assert.equal(c.vencimiento, '2026-06-29');
  });

  test('imputación FIFO: el pago cubre primero la cuota más antigua', () => {
    // hoy = 06-16: 3 cuotas emitidas (3000). Pago de 1500: cuota 1 completa, cuota 2 parcial.
    const c = calcularCuenta(contrato, [pago(1500)], '2026-06-16');
    assert.equal(c.saldo, 1500);
    assert.deepEqual(c.cuotas.map((q) => q.pagado), [1000, 500, 0]);
    // la más antigua impaga es la 2 (vence 06-15) -> 1 día de atraso
    assert.equal(c.estado, 'En mora');
    assert.equal(c.vencimiento, '2026-06-15');
    assert.equal(c.diasAtraso, 1);
    assert.equal(c.cuotasAdeudadas, 2); // ceil(1500/1000)
  });

  test('si la cuota impaga más antigua todavía no venció: Pendiente', () => {
    // hoy = 06-10: cuotas 1 y 2 emitidas; se pagó la 1; la 2 vence el 06-15
    const c = calcularCuenta(contrato, [pago(1000)], '2026-06-10');
    assert.equal(c.estado, 'Pendiente');
    assert.equal(c.vencimiento, '2026-06-15');
    assert.equal(c.saldo, 1000);
  });
});

describe('estado de contrato', () => {
  test('Pendiente entrega se respeta', () => {
    assert.equal(estadoContrato({ ...contrato, estadoBase: 'Pendiente entrega' }, INICIO), 'Pendiente entrega');
  });
  test('Por vencer cuando faltan 7 días o menos para el fin (inicio + 7 * semanas)', () => {
    // fin = 2026-06-29
    assert.equal(estadoContrato(contrato, '2026-06-22'), 'Por vencer');
    assert.equal(estadoContrato(contrato, '2026-06-21'), 'Activo');
    assert.equal(estadoContrato(contrato, '2026-06-10'), 'Activo');
  });
});
