// Reglas puras de cuotas, saldo y estado de cobranza. No acceden a datos ni al reloj:
// reciben `hoy` como parámetro, así se pueden probar con cualquier fecha.
import { addDays, diffDays } from '../utils/fechas.js';

export const DIAS_POR_CUOTA = 7;
export const DIAS_AVISO_VENCIMIENTO = 7;

/**
 * Cuotas semanales de un contrato. La cuota k (0..duracion-1) se emite el día inicio + 7k
 * y vence el día inicio + 7k + 7.
 */
export function generarCuotas(contrato) {
  return Array.from({ length: contrato.duracionSemanas }, (_, k) => ({
    numero: k + 1,
    emision: addDays(contrato.fechaInicio, DIAS_POR_CUOTA * k),
    vencimiento: addDays(contrato.fechaInicio, DIAS_POR_CUOTA * k + DIAS_POR_CUOTA),
    monto: contrato.tarifaSemanal,
  }));
}

/**
 * Cuenta de un contrato a la fecha `hoy`.
 * - saldo = cuotas emitidas - pagos
 * - los pagos se imputan FIFO (a la cuota más antigua primero)
 * - estado: saldo <= 0 "Al día"; si la cuota impaga más antigua ya venció "En mora"; si no "Pendiente"
 */
export function calcularCuenta(contrato, pagos, hoy) {
  const cuotas = generarCuotas(contrato);
  const emitidas = cuotas.filter((c) => c.emision <= hoy);
  const totalPagado = pagos.reduce((suma, p) => suma + p.monto, 0);
  const totalEmitido = emitidas.reduce((suma, c) => suma + c.monto, 0);
  const saldo = Math.max(0, totalEmitido - totalPagado);

  // Imputación FIFO
  let restante = totalPagado;
  const detalle = emitidas.map((cuota) => {
    const aplicado = Math.min(restante, cuota.monto);
    restante -= aplicado;
    return { ...cuota, pagado: aplicado, impaga: aplicado < cuota.monto };
  });
  const cuotaImpaga = detalle.find((c) => c.impaga);

  let estado = 'Al día';
  let diasAtraso = 0;
  let vencimiento;

  if (saldo > 0 && cuotaImpaga) {
    vencimiento = cuotaImpaga.vencimiento;
    if (cuotaImpaga.vencimiento < hoy) {
      estado = 'En mora';
      diasAtraso = diffDays(hoy, cuotaImpaga.vencimiento);
    } else {
      estado = 'Pendiente';
    }
  } else {
    // Sin saldo: se muestra el vencimiento de la próxima cuota (o el de la última si no quedan).
    const proxima = cuotas[emitidas.length] ?? cuotas[cuotas.length - 1];
    vencimiento = proxima.vencimiento;
  }

  return {
    saldo,
    estado,
    diasAtraso,
    vencimiento,
    cuotasAdeudadas: saldo > 0 ? Math.ceil(saldo / contrato.tarifaSemanal) : 0,
    totalPagado,
    cuotas: detalle,
  };
}

/** Estado de contrato mostrado: Pendiente entrega / Por vencer (faltan <= 7 días) / Activo. */
export function estadoContrato(contrato, hoy) {
  if (contrato.estadoBase === 'Pendiente entrega') return 'Pendiente entrega';
  const fin = addDays(contrato.fechaInicio, DIAS_POR_CUOTA * contrato.duracionSemanas);
  return diffDays(fin, hoy) <= DIAS_AVISO_VENCIMIENTO ? 'Por vencer' : 'Activo';
}

//reglas de coutas semanales, saldo y estado