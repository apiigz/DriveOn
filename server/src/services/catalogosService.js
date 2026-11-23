import * as catalogosRepo from '../repositories/catalogosRepository.js';
import { DURACIONES } from './contratosService.js';

export function obtenerCatalogos() {
  return {
    sucursales: catalogosRepo.listarSucursales(),
    conductores: catalogosRepo.listarConductores(),
    duraciones: DURACIONES,
    estadosVehiculo: ['Disponible', 'Alquilado', 'En taller', 'Baja'],
    estadosContrato: ['Activo', 'Pendiente entrega', 'Por vencer'],
    estadosCobranza: ['Al día', 'Pendiente', 'En mora'],
  };
}

//defino listas dijas para los selects, sucursales, estados, sucuersales
//duraciones