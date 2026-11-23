// Reglas puras de versionado de tarifas (sin acceso a datos): reciben la fecha como parámetro.

export const CAMPOS_NUMERICOS = ['tarifaSemanal', 'deposito', 'kmSemanal', 'kmExcedente'];
export const CAMPOS_TARIFA = ['categoria', ...CAMPOS_NUMERICOS];

/** Versión vigente en `fecha`: la de mayor vigenteDesde <= fecha (si empatan, la última cargada). */
export function versionVigente(tarifa, fecha) {
  return tarifa.versiones
    .filter((v) => v.vigenteDesde <= fecha)
    .reduce((mejor, v) => (!mejor || v.vigenteDesde >= mejor.vigenteDesde ? v : mejor), null);
}

/** Próxima versión programada a futuro (la más cercana), o null. */
export function versionProxima(tarifa, hoy) {
  return (
    tarifa.versiones
      .filter((v) => v.vigenteDesde > hoy)
      .reduce((mejor, v) => (!mejor || v.vigenteDesde <= mejor.vigenteDesde ? v : mejor), null) ?? null
  );
}

//reglas de tarifas y vigencias de estas