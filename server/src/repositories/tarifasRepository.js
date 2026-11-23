import { leerDb, modificarDb, buscarPorId, siguienteId } from './db.js';

export const listarTarifas = () => leerDb().tarifas;
export const buscarTarifa = (id) => buscarPorId(leerDb().tarifas, id);

/** Historial de auditoría, más reciente primero (por fecha y luego por orden de alta). */
export function listarHistorial() {
  return [...leerDb().historialTarifas].sort((a, b) => b.fecha.localeCompare(a.fecha) || b.id - a.id);
}

/** Agrega una versión a la tarifa y sus entradas de historial en una sola escritura. */
export function agregarVersion(tarifaId, version, entradasHistorial) {
  return modificarDb((db) => {
    const tarifa = buscarPorId(db.tarifas, tarifaId);
    tarifa.versiones.push(version);
    let id = siguienteId(db.historialTarifas);
    for (const entrada of entradasHistorial) {
      db.historialTarifas.push({ id: id++, ...entrada });
    }
    return tarifa;
  });
}
