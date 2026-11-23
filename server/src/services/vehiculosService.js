import { normalizar, paginar } from '../utils/formato.js';
import * as vehiculosRepo from '../repositories/vehiculosRepository.js';
import * as contratosRepo from '../repositories/contratosRepository.js';
import * as catalogosRepo from '../repositories/catalogosRepository.js';

function armarAsignacion(vehiculo, contratos, conductores) {
  if (vehiculo.estado === 'Alquilado') {
    // El contrato vigente del vehículo es el más reciente
    const contrato = contratos.filter((c) => c.vehiculoId === vehiculo.id).sort((a, b) => b.id - a.id)[0];
    const conductor = contrato && conductores.find((c) => c.id === contrato.conductorId);
    return { tipo: 'contrato', conductor: conductor?.nombre, contrato: contrato?.numero };
  }
  if (vehiculo.estado === 'En taller') return { tipo: 'taller', nota: vehiculo.notaTaller };
  return { tipo: 'disponible' };
}

export function listarVehiculos(query) {
  const todos = vehiculosRepo.listarVehiculos();
  const sucursales = catalogosRepo.listarSucursales();
  const conductores = catalogosRepo.listarConductores();
  const contratos = contratosRepo.listarContratos();

  const texto = normalizar(query.search);
  const filtrados = todos.filter(
    (v) =>
      (!texto || normalizar(`${v.patente}${v.modeloCompleto}`).includes(texto)) &&
      (!query.sucursal || v.sucursalId === query.sucursal) &&
      (!query.estado || v.estado === query.estado),
  );

  const pagina = paginar(filtrados, query, 7);
  return {
    ...pagina,
    items: pagina.items.map((v) => ({
      id: v.id,
      patente: v.patente,
      modelo: v.modeloCompleto,
      sucursal: sucursales.find((s) => s.id === v.sucursalId).nombre,
      estado: v.estado,
      kilometraje: v.kilometraje,
      asignacion: armarAsignacion(v, contratos, conductores),
    })),
    // Resumen de toda la flota (no depende de los filtros)
    resumen: {
      disponibles: todos.filter((v) => v.estado === 'Disponible').length,
      alquilados: todos.filter((v) => v.estado === 'Alquilado').length,
      enTaller: todos.filter((v) => v.estado === 'En taller').length,
    },
  };
}

export function listarDisponibles(query) {
  return vehiculosRepo
    .listarVehiculos()
    .filter((v) => v.estado === 'Disponible' && (!query.sucursal || v.sucursalId === query.sucursal))
    .map((v) => ({ id: v.id, patente: v.patente, modelo: v.modeloCompleto }));
}

//lista de la flota con sus filtros y conductores 