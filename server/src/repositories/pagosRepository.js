import { leerDb, modificarDb, siguienteId } from './db.js';

export const listarPagos = () => leerDb().pagos;
export const listarPagosDeContrato = (contratoId) => leerDb().pagos.filter((p) => String(p.contratoId) === String(contratoId));

export function insertarPago(datos) {
  return modificarDb((db) => {
    const pago = { id: siguienteId(db.pagos), ...datos };
    db.pagos.push(pago);
    return pago;
  });
}
