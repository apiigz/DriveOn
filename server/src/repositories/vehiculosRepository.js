import { leerDb, buscarPorId } from './db.js';

export const listarVehiculos = () => leerDb().vehiculos;
export const buscarVehiculo = (id) => buscarPorId(leerDb().vehiculos, id);
