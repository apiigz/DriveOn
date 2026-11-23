import { leerDb, buscarPorId } from './db.js';

export const listarSucursales = () => leerDb().sucursales;
export const buscarSucursal = (id) => buscarPorId(leerDb().sucursales, id);

export const listarConductores = () => leerDb().conductores;
export const buscarConductor = (id) => buscarPorId(leerDb().conductores, id);

export const listarAlertasOperativas = () => leerDb().alertasOperativas;

//funciones