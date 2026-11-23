import { badRequest, notFound } from '../utils/errores.js';
import { today, esFechaValida } from '../utils/fechas.js';
import * as tarifasRepo from '../repositories/tarifasRepository.js';
import { CAMPOS_TARIFA, CAMPOS_NUMERICOS, versionVigente, versionProxima } from './reglasTarifa.js';

export const RESPONSABLE = 'Juan Lopez';

const valoresDe = (version) => ({
  categoria: version.categoria,
  tarifaSemanal: version.tarifaSemanal,
  deposito: version.deposito,
  kmSemanal: version.kmSemanal,
  kmExcedente: version.kmExcedente,
});

/** Forma de respuesta de una tarifa: valores vigentes hoy + próximo cambio programado. */
export function vistaTarifa(tarifa, hoy) {
  const vigente = versionVigente(tarifa, hoy);
  const proxima = versionProxima(tarifa, hoy);
  return {
    id: tarifa.id,
    modelo: tarifa.modelo,
    tipo: tarifa.tipo,
    descripcionMotor: tarifa.descripcionMotor,
    ...valoresDe(vigente),
    vigenteDesde: vigente.vigenteDesde,
    proximoCambio: proxima ? { ...valoresDe(proxima), vigenteDesde: proxima.vigenteDesde } : null,
  };
}

export function listarTarifas() {
  const hoy = today();
  return tarifasRepo.listarTarifas().map((t) => vistaTarifa(t, hoy));
}

export function listarHistorial(query) {
  let limite;
  if (query.limit !== undefined && query.limit !== '') {
    limite = Number(query.limit);
    if (!Number.isInteger(limite) || limite < 1) throw badRequest('El parámetro "limit" debe ser un entero positivo');
  }
  const historial = tarifasRepo.listarHistorial().map(({ id, fecha, vehiculo, campo, anterior, nuevo, responsable, motivo }) => ({
    id,
    fecha,
    vehiculo,
    campo,
    anterior,
    nuevo,
    responsable,
    motivo,
  }));
  return limite ? historial.slice(0, limite) : historial;
}

const VALOR_MAXIMO = 10_000_000;

function enteroPositivo(valor) {
  const n = typeof valor === 'string' && /^\d+$/.test(valor.trim()) ? Number(valor) : valor;
  // Tope razonable para evitar valores absurdos (y pérdida de precisión)
  return Number.isSafeInteger(n) && n > 0 && n <= VALOR_MAXIMO ? n : null;
}

const ETIQUETAS = {
  tarifaSemanal: 'La tarifa semanal',
  deposito: 'El depósito',
  kmSemanal: 'El kilometraje semanal',
  kmExcedente: 'El costo por km excedente',
};

export function editarTarifa(id, body, hoy = today()) {
  const tarifa = tarifasRepo.buscarTarifa(id);
  if (!tarifa) throw notFound('La tarifa no existe');

  const datos = body ?? {};
  const nuevos = {};

  if (typeof datos.categoria !== 'string' || datos.categoria.trim() === '') throw badRequest('La categoría es obligatoria');
  nuevos.categoria = datos.categoria.trim();

  for (const campo of CAMPOS_NUMERICOS) {
    const valor = enteroPositivo(datos[campo]);
    if (valor === null) throw badRequest(`${ETIQUETAS[campo]} debe ser un número entero entre 1 y 10.000.000`);
    nuevos[campo] = valor;
  }

  if (!esFechaValida(datos.vigenteDesde)) throw badRequest('La fecha de vigencia no es válida (formato AAAA-MM-DD)');
  if (datos.vigenteDesde < hoy) throw badRequest('La fecha de vigencia no puede ser anterior a hoy');

  if (typeof datos.motivo !== 'string' || datos.motivo.trim().length < 5) {
    throw badRequest('El motivo es obligatorio (mínimo 5 caracteres)');
  }
  const motivo = datos.motivo.trim();

  // Se compara contra la versión vigente hoy
  const actual = valoresDe(versionVigente(tarifa, hoy));
  const cambios = CAMPOS_TARIFA.filter((campo) => actual[campo] !== nuevos[campo]);
  if (cambios.length === 0) throw badRequest('No hay cambios para guardar');

  // RN-05: solo se agrega una versión; los contratos ya emitidos guardan su propia copia congelada.
  const historial = cambios.map((campo) => ({
    fecha: hoy,
    tarifaId: tarifa.id,
    vehiculo: tarifa.modelo,
    campo,
    anterior: actual[campo],
    nuevo: nuevos[campo],
    responsable: RESPONSABLE,
    motivo,
    vigenteDesde: datos.vigenteDesde,
  }));

  const actualizada = tarifasRepo.agregarVersion(tarifa.id, { ...nuevos, vigenteDesde: datos.vigenteDesde }, historial);
  return vistaTarifa(actualizada, hoy);
}

//esita tarifas y deja un registro
