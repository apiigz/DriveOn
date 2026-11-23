import { leerDb, modificarDb, buscarPorId, siguienteId } from './db.js';

export const listarContratos = () => leerDb().contratos;
export const buscarContrato = (id) => buscarPorId(leerDb().contratos, id);

/**
 * Crea el contrato y marca el vehículo como Alquilado en una sola escritura,
 * para que nunca quede uno sin el otro. El número correlativo se calcula acá adentro.
 */
export function emitirContrato(datos) {
  return modificarDb((db) => {
    const ultimoNumero = db.contratos.reduce((max, c) => Math.max(max, Number(c.numero.replace('CT-', '')) || 0), 0);
    const contrato = { id: siguienteId(db.contratos), numero: `CT-${ultimoNumero + 1}`, ...datos };
    db.contratos.push(contrato);
    buscarPorId(db.vehiculos, datos.vehiculoId).estado = 'Alquilado';
    return contrato;
  });
}
