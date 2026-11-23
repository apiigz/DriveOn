import { badRequest, notFound } from '../utils/errores.js';
import { today, esFechaValida } from '../utils/fechas.js';
import { iniciales, normalizar, paginar } from '../utils/formato.js';
import * as contratosRepo from '../repositories/contratosRepository.js';
import * as pagosRepo from '../repositories/pagosRepository.js';
import * as catalogosRepo from '../repositories/catalogosRepository.js';
import { calcularCuenta, estadoContrato } from './reglasCobranza.js';
import { RESPONSABLE } from './tarifasService.js';

const PRIORIDAD_ESTADO = { 'En mora': 0, Pendiente: 1, 'Al día': 2 };

/** Fila de cobranza de un contrato (la forma que consume la tabla de Cobranzas). */
function armarFila(contrato, conductor, cuenta) {
  return {
    contratoId: contrato.id,
    numero: contrato.numero,
    conductor: { nombre: conductor.nombre, dni: conductor.dni, iniciales: iniciales(conductor.nombre) },
    importeSemanal: contrato.tarifaSemanal,
    vencimiento: cuenta.vencimiento,
    diasAtraso: cuenta.diasAtraso,
    saldo: cuenta.saldo,
    cuotasAdeudadas: cuenta.cuotasAdeudadas,
    estado: cuenta.estado,
  };
}

/** Todas las cobranzas con su cuenta calculada. También las usa el dashboard. */
export function calcularCobranzas(hoy = today()) {
  const pagos = pagosRepo.listarPagos();
  const conductores = catalogosRepo.listarConductores();
  return contratosRepo.listarContratos().map((contrato) => {
    const pagosDelContrato = pagos.filter((p) => p.contratoId === contrato.id);
    const cuenta = calcularCuenta(contrato, pagosDelContrato, hoy);
    const conductor = conductores.find((c) => c.id === contrato.conductorId);
    return { contrato, conductor, cuenta, fila: armarFila(contrato, conductor, cuenta), estadoContrato: estadoContrato(contrato, hoy) };
  });
}

export function listarCobranzas(query) {
  const hoy = today();
  const todas = calcularCobranzas(hoy).map((c) => c.fila);

  const texto = normalizar(query.search);
  let filas = todas.filter((f) => !texto || normalizar(`${f.conductor.nombre}${f.conductor.dni}${f.numero}`).includes(texto));
  if (query.estado) filas = filas.filter((f) => f.estado === query.estado);

  // En mora primero (más atraso arriba), luego Pendiente y Al día
  filas.sort(
    (a, b) =>
      PRIORIDAD_ESTADO[a.estado] - PRIORIDAD_ESTADO[b.estado] || b.diasAtraso - a.diasAtraso || a.numero.localeCompare(b.numero),
  );

  const enMora = todas.filter((f) => f.estado === 'En mora');
  return {
    ...paginar(filas, query, 7),
    mora: { monto: enMora.reduce((suma, f) => suma + f.saldo, 0), casos: enMora.length },
  };
}

function obtenerContrato(contratoId) {
  const contrato = contratosRepo.buscarContrato(contratoId);
  if (!contrato) throw notFound('El contrato no existe');
  return contrato;
}

function filaDeContrato(contrato, hoy) {
  const conductor = catalogosRepo.buscarConductor(contrato.conductorId);
  const cuenta = calcularCuenta(contrato, pagosRepo.listarPagosDeContrato(contrato.id), hoy);
  return armarFila(contrato, conductor, cuenta);
}

export function registrarPago(contratoId, body, hoy = today()) {
  const contrato = obtenerContrato(contratoId);
  const cuenta = calcularCuenta(contrato, pagosRepo.listarPagosDeContrato(contrato.id), hoy);
  if (cuenta.saldo === 0) throw badRequest('El contrato no tiene saldo pendiente');

  const datos = body ?? {};
  const monto = typeof datos.monto === 'string' && /^\d+$/.test(datos.monto.trim()) ? Number(datos.monto) : datos.monto;
  if (!Number.isInteger(monto) || monto <= 0) throw badRequest('El monto debe ser un número entero mayor a 0');
  if (monto > cuenta.saldo) throw badRequest(`El monto no puede superar el saldo pendiente ($${cuenta.saldo})`);

  if (typeof datos.medio !== 'string' || datos.medio.trim() === '') throw badRequest('El medio de pago es obligatorio');

  const fecha = datos.fecha === undefined || datos.fecha === '' ? hoy : datos.fecha;
  if (!esFechaValida(fecha)) throw badRequest('La fecha no es válida (formato AAAA-MM-DD)');
  if (fecha > hoy) throw badRequest('La fecha del cobro no puede ser futura');
  if (fecha < contrato.fechaInicio) throw badRequest('La fecha del cobro no puede ser anterior al inicio del contrato');

  const referencia = typeof datos.referencia === 'string' && datos.referencia.trim() !== '' ? datos.referencia.trim() : null;

  const pago = pagosRepo.insertarPago({
    contratoId: contrato.id,
    monto,
    medio: datos.medio.trim(),
    referencia,
    fecha,
    registradoPor: RESPONSABLE,
  });
  return { pago, cobranza: filaDeContrato(contrato, hoy) };
}

export function cuentaCorriente(contratoId, hoy = today()) {
  const contrato = obtenerContrato(contratoId);
  const conductor = catalogosRepo.buscarConductor(contrato.conductorId);
  const pagos = pagosRepo.listarPagosDeContrato(contrato.id);
  const cuenta = calcularCuenta(contrato, pagos, hoy);

  const cargos = cuenta.cuotas.map((c) => ({
    id: `cargo-${contrato.id}-${c.numero}`,
    tipo: 'cargo',
    concepto: `Canon Liquidado S-${c.numero}`,
    detalle: 'Devengamiento',
    fecha: c.emision,
    monto: c.monto,
  }));
  const cobros = pagos.map((p) => ({
    id: `pago-${p.id}`,
    tipo: 'pago',
    concepto: 'Cobro Canon Semanal',
    detalle: p.medio,
    fecha: p.fecha,
    monto: p.monto,
  }));

  // Orden cronológico (en un mismo día el cargo va antes que el cobro) y luego se invierte: más reciente primero.
  const cronologico = [...cargos, ...cobros].sort((a, b) => a.fecha.localeCompare(b.fecha) || (a.tipo === b.tipo ? 0 : a.tipo === 'cargo' ? -1 : 1));

  return {
    numero: contrato.numero,
    importeSemanal: contrato.tarifaSemanal,
    conductor: conductor.nombre,
    estado: cuenta.estado,
    movimientos: cronologico.reverse(),
    resumen: { garantia: contrato.deposito, infracciones: 0, saldo: cuenta.saldo },
  };
}

//registra pagos, calcula salgo y arma la cuenta corriente
