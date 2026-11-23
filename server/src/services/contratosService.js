import { badRequest, notFound, conflict } from '../utils/errores.js';
import { today } from '../utils/fechas.js';
import { paginar } from '../utils/formato.js';
import * as contratosRepo from '../repositories/contratosRepository.js';
import * as vehiculosRepo from '../repositories/vehiculosRepository.js';
import * as tarifasRepo from '../repositories/tarifasRepository.js';
import * as catalogosRepo from '../repositories/catalogosRepository.js';
import { versionVigente } from './reglasTarifa.js';
import { estadoContrato } from './reglasCobranza.js';

export const DURACIONES = [1, 2, 4, 8, 12];

function validarDuracion(valor) {
  // Solo números o strings numéricos (Number(true) o Number([4]) no deben colarse)
  const esNumerico = typeof valor === 'number' || (typeof valor === 'string' && /^\d+$/.test(valor.trim()));
  const duracion = Number(valor);
  if (!esNumerico || !DURACIONES.includes(duracion)) {
    throw badRequest(`La duración debe ser una de: ${DURACIONES.join(', ')} semanas`);
  }
  return duracion;
}

const vacio = (v) => v === undefined || v === null || v === '';

function vistaContrato(contrato, hoy) {
  const conductor = catalogosRepo.buscarConductor(contrato.conductorId);
  const vehiculo = vehiculosRepo.buscarVehiculo(contrato.vehiculoId);
  const sucursal = catalogosRepo.buscarSucursal(contrato.sucursalId);
  return {
    id: contrato.id,
    numero: contrato.numero,
    conductor: conductor.nombre,
    patente: vehiculo.patente,
    sucursal: sucursal.nombre,
    duracionSemanas: contrato.duracionSemanas,
    tarifaSemanal: contrato.tarifaSemanal,
    estado: estadoContrato(contrato, hoy),
  };
}

export function listarContratos(query) {
  const hoy = today();
  let items = [...contratosRepo.listarContratos()]
    // Más reciente primero
    .sort((a, b) => b.fechaInicio.localeCompare(a.fechaInicio) || b.id - a.id)
    .map((c) => vistaContrato(c, hoy));
  if (query.estado) items = items.filter((c) => c.estado === query.estado);
  return paginar(items, query, 4);
}

/** Cotización calculada por el servidor con la tarifa vigente del vehículo. */
export function cotizar(query, hoy = today()) {
  if (vacio(query.vehiculoId)) throw badRequest('El vehículo es obligatorio');
  const duracion = validarDuracion(query.duracionSemanas);
  const vehiculo = vehiculosRepo.buscarVehiculo(query.vehiculoId);
  if (!vehiculo) throw notFound('El vehículo no existe');
  const tarifa = versionVigente(tarifasRepo.buscarTarifa(vehiculo.tarifaId), hoy);
  return {
    tarifaSemanal: tarifa.tarifaSemanal,
    deposito: tarifa.deposito,
    kmSemanal: tarifa.kmSemanal,
    kmExcedente: tarifa.kmExcedente,
    totalContrato: tarifa.tarifaSemanal * duracion,
  };
}

/** Emite un contrato congelando la tarifa vigente (RN-05) y deja el vehículo como Alquilado. */
export function emitirContrato(body, hoy = today()) {
  const { conductorId, sucursalId, vehiculoId, duracionSemanas } = body ?? {};
  if (vacio(conductorId)) throw badRequest('El conductor es obligatorio');
  if (vacio(sucursalId)) throw badRequest('La sucursal es obligatoria');
  if (vacio(vehiculoId)) throw badRequest('El vehículo es obligatorio');
  const duracion = validarDuracion(duracionSemanas);

  const conductor = catalogosRepo.buscarConductor(conductorId);
  if (!conductor) throw notFound('El conductor no existe');
  const sucursal = catalogosRepo.buscarSucursal(sucursalId);
  if (!sucursal) throw notFound('La sucursal no existe');
  const vehiculo = vehiculosRepo.buscarVehiculo(vehiculoId);
  if (!vehiculo) throw notFound('El vehículo no existe');

  if (vehiculo.estado !== 'Disponible') {
    throw conflict(`El vehículo ${vehiculo.patente} no está disponible (estado: ${vehiculo.estado})`);
  }
  if (vehiculo.sucursalId !== sucursal.id) {
    throw badRequest(`El vehículo ${vehiculo.patente} no pertenece a la sucursal ${sucursal.nombre}`);
  }

  const tarifa = versionVigente(tarifasRepo.buscarTarifa(vehiculo.tarifaId), hoy);
  const contrato = contratosRepo.emitirContrato({
    conductorId: conductor.id,
    vehiculoId: vehiculo.id,
    sucursalId: sucursal.id,
    tarifaId: vehiculo.tarifaId,
    duracionSemanas: duracion,
    // Valores congelados: editar la tarifa después no los modifica
    tarifaSemanal: tarifa.tarifaSemanal,
    deposito: tarifa.deposito,
    kmSemanal: tarifa.kmSemanal,
    kmExcedente: tarifa.kmExcedente,
    fechaInicio: hoy,
    estadoBase: 'Pendiente entrega',
  });

  return {
    ...vistaContrato(contrato, hoy),
    conductorId: contrato.conductorId,
    vehiculoId: contrato.vehiculoId,
    sucursalId: contrato.sucursalId,
    deposito: contrato.deposito,
    kmSemanal: contrato.kmSemanal,
    kmExcedente: contrato.kmExcedente,
    fechaInicio: contrato.fechaInicio,
  };
}

//cotiza y emite contratos, verifica autos disponibles y congela la tarifa y pasa el auto a alquilado
