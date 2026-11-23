// Genera data/db.json con los datos semilla.

// Uso: npm run reset
import { pathToFileURL } from 'node:url';
import { today, addDays } from '../utils/fechas.js';
import { escribirDb, rutaDb } from '../repositories/db.js';
import { generarCuotas } from '../services/reglasCobranza.js';
import { versionVigente } from '../services/reglasTarifa.js';

const SUCURSALES = [
  { id: 'centro', nombre: 'Centro', direccion: 'Av. Corrientes 1420' },
  { id: 'norte', nombre: 'Norte', direccion: 'Av. Cabildo 2850' },
  { id: 'sur', nombre: 'Sur', direccion: 'Av. Mitre 640' },
];

const CONDUCTORES = [
  ['Darío Gomez', '34.890.122'],
  ['Facundo Rossi', '38.220.914'],
  ['Marcos Ruiz', '31.004.812'],
  ['Laura Benítez', '36.711.542'],
  ['Esteban Paz', '32.441.900'],
  ['Carlos Varela', '39.810.223'],
  ['Ignacio Soto', '35.198.441'],
  ['Sofía Medina', '40.112.358'],
  ['Martín Acosta', '37.554.091'],
];

// Vehículos: [patente, modeloCompleto, tarifaId, sucursalId, estado, km, notaTaller?]
const VEHICULOS = [
  ['AE 104 BC', 'Toyota Etios 1.5 X', 'etios', 'centro', 'Disponible', 42150],
  ['AD 920 KL', 'Fiat Cronos 1.3 Drive', 'cronos', 'norte', 'Alquilado', 68400],
  ['AF 432 MN', 'Chevrolet Joy Plus 1.4', 'joy', 'sur', 'Alquilado', 29800],
  ['AB 771 TR', 'Renault Logan 1.6', 'logan', 'centro', 'En taller', 85200, 'Frenos / Tren delantero'],
  ['AC 338 QW', 'Fiat Cronos 1.3 Drive', 'cronos', 'sur', 'Disponible', 51300],
  ['AE 819 ZP', 'Nissan Versa 1.6 Sense', 'versa', 'norte', 'Alquilado', 33100],
  ['AF 501 RT', 'Renault Logan 1.6', 'logan', 'sur', 'Disponible', 19500],
  ['AA 421 CD', 'Toyota Etios 1.5 X', 'etios', 'centro', 'Alquilado', 24700],
  ['AF 892 PL', 'Chevrolet Joy Plus 1.4', 'joy', 'centro', 'Disponible', 38900],
  ['AB 312 FG', 'Toyota Etios 1.5 X', 'etios', 'sur', 'Alquilado', 57300],
  ['AC 645 HJ', 'Renault Logan 1.6', 'logan', 'norte', 'Alquilado', 44600],
  ['AD 118 LP', 'Fiat Cronos 1.3 Drive', 'cronos', 'centro', 'Alquilado', 61200],
];

// Contratos: [numero, conductor, patente, sucursalId, semanas, díasAtrás, estadoBase, cuotasPagadas ('todas' | n)]
const CONTRATOS = [
  ['CT-2041', 'Darío Gomez', 'AD 920 KL', 'norte', 4, 14, 'Activo', 'todas'],
  ['CT-2055', 'Facundo Rossi', 'AF 432 MN', 'sur', 8, 52, 'Activo', 'todas'],
  ['CT-2108', 'Laura Benítez', 'AA 421 CD', 'centro', 2, 3, 'Pendiente entrega', 0],
  ['CT-1980', 'Esteban Paz', 'AE 819 ZP', 'norte', 12, 30, 'Activo', 'todas'],
  ['CT-2019', 'Marcos Ruiz', 'AB 312 FG', 'sur', 8, 32, 'Activo', 3],
  ['CT-2082', 'Carlos Varela', 'AC 645 HJ', 'norte', 4, 10, 'Activo', 1],
  ['CT-2070', 'Ignacio Soto', 'AD 118 LP', 'centro', 8, 21, 'Activo', 'todas'],
];

function generarTarifas(hoy) {
  const v = (categoria, tarifaSemanal, deposito, kmSemanal, kmExcedente, vigenteDesde) => ({
    categoria,
    tarifaSemanal,
    deposito,
    kmSemanal,
    kmExcedente,
    vigenteDesde,
  });
  const base = addDays(hoy, -180); // vigencia inicial anterior a cualquier contrato semilla
  return [
    {
      id: 'etios', modelo: 'Toyota Etios 1.5 X', version: 'X', tipo: 'Hatch', descripcionMotor: 'Motor 1.5 16v • Manual 6v',
      // Antes del ajuste de franquicia (hoy-39) el depósito era 110000
      versiones: [v('Económico', 75000, 110000, 1500, 120, base), v('Económico', 75000, 120000, 1500, 120, addDays(hoy, -39))],
    },
    {
      id: 'cronos', modelo: 'Fiat Cronos 1.3', version: 'Drive', tipo: 'Sedán', descripcionMotor: 'Motor GSE 1.3 8v • Manual 5v',
      versiones: [v('Sedán Compacto', 76000, 130000, 1500, 135, base), v('Sedán Compacto', 82000, 130000, 1500, 135, addDays(hoy, -26))],
    },
    {
      id: 'joy', modelo: 'Chevrolet Joy Plus', version: '1.4', tipo: 'Sedán', descripcionMotor: 'Motor SPE/4 1.4 • Manual 5v',
      versiones: [v('Sedán Estándar', 78000, 120000, 1800, 125, base)],
    },
    {
      id: 'logan', modelo: 'Renault Logan 1.6', version: '1.6', tipo: 'Sedán', descripcionMotor: 'Motor HR16 1.6 16v • Baúl 510L',
      versiones: [v('Sedán Amplio', 80000, 125000, 1500, 130, base)],
    },
    {
      id: 'versa', modelo: 'Nissan Versa 1.6', version: 'Sense', tipo: 'Confort', descripcionMotor: 'Motor HR16DE • Transmisión CVT',
      // Antes de la homologación (hoy-55) el km semanal era 1800
      versiones: [v('Plus', 90000, 150000, 1800, 150, base), v('Plus', 90000, 150000, 2000, 150, addDays(hoy, -55))],
    },
  ];
}

/** Función pura: arma toda la base de datos a partir de la fecha `hoy`. */
export function generarDatos(hoy = today()) {
  const tarifas = generarTarifas(hoy);
  const conductores = CONDUCTORES.map(([nombre, dni], i) => ({ id: i + 1, nombre, dni }));
  const vehiculos = VEHICULOS.map(([patente, modeloCompleto, tarifaId, sucursalId, estado, kilometraje, notaTaller], i) => ({
    id: i + 1,
    patente,
    tarifaId,
    modeloCompleto,
    sucursalId,
    estado,
    kilometraje,
    ...(notaTaller ? { notaTaller } : {}),
  }));

  const contratos = [];
  const pagos = [];
  let nroPago = 0;

  CONTRATOS.forEach(([numero, nombre, patente, sucursalId, semanas, diasAtras, estadoBase, cuotasPagadas], i) => {
    const vehiculo = vehiculos.find((x) => x.patente === patente);
    const tarifa = tarifas.find((t) => t.id === vehiculo.tarifaId);
    const fechaInicio = addDays(hoy, -diasAtras);
    const vigente = versionVigente(tarifa, fechaInicio); // tarifa congelada al emitir
    const contrato = {
      id: i + 1,
      numero,
      conductorId: conductores.find((c) => c.nombre === nombre).id,
      vehiculoId: vehiculo.id,
      sucursalId,
      tarifaId: tarifa.id,
      duracionSemanas: semanas,
      tarifaSemanal: vigente.tarifaSemanal,
      deposito: vigente.deposito,
      kmSemanal: vigente.kmSemanal,
      kmExcedente: vigente.kmExcedente,
      fechaInicio,
      estadoBase,
    };
    contratos.push(contrato);

    // Un pago por cada cuota emitida (o solo las primeras N), fechado el día de emisión
    const emitidas = generarCuotas(contrato).filter((c) => c.emision <= hoy);
    const cantidad = cuotasPagadas === 'todas' ? emitidas.length : cuotasPagadas;
    emitidas.slice(0, cantidad).forEach((cuota) => {
      nroPago += 1;
      const transferencia = nroPago % 2 === 1;
      pagos.push({
        id: nroPago,
        contratoId: contrato.id,
        monto: cuota.monto,
        medio: transferencia ? 'Transferencia Bancaria' : 'Efectivo Caja',
        referencia: transferencia ? `TRF-${String(480000 + nroPago * 137).padStart(6, '0')}` : null,
        fecha: cuota.emision,
        registradoPor: 'Juan Lopez',
      });
    });
  });

  const historial = [
    [26, 'cronos', 'tarifaSemanal', 76000, 82000, 'Carlos Méndez', 'Actualización de costos de seguro'],
    [39, 'etios', 'deposito', 110000, 120000, 'Carlos Méndez', 'Ajuste de franquicia'],
    [55, 'versa', 'kmSemanal', 1800, 2000, 'Dirección Operativa', 'Homologación para trayectos interurbanos'],
  ].map(([dias, tarifaId, campo, anterior, nuevo, responsable, motivo], i) => ({
    id: i + 1,
    fecha: addDays(hoy, -dias),
    tarifaId,
    vehiculo: tarifas.find((t) => t.id === tarifaId).modelo,
    campo,
    anterior,
    nuevo,
    responsable,
    motivo,
    vigenteDesde: addDays(hoy, -dias),
  }));

  // Alertas operativas estáticas (las de mora y renovación se calculan en el dashboard)
  const alertasOperativas = [
    {
      id: 'km-1',
      tipo: 'kilometraje',
      titulo: 'Fiat Cronos 1.3 Drive',
      codigo: 'AD 920 KL',
      subtitulo: null,
      descripcion: 'Superó el kilometraje semanal pactado (+340 km s/ telemetría).',
      etiqueta: 'Revisión',
      accion: 'Ajustar',
      ruta: '/tarifas',
    },
    {
      id: 'disp-1',
      tipo: 'disponible',
      titulo: 'Chevrolet Joy Plus 1.4',
      codigo: 'AF 892 PL',
      subtitulo: null,
      descripcion: 'Devuelto en sucursal Centro, listo para check-in e inspección.',
      etiqueta: 'Disponible',
      accion: 'Inspeccionar',
      ruta: '/flota',
    },
  ];

  return { sucursales: SUCURSALES, tarifas, vehiculos, conductores, contratos, pagos, historialTarifas: historial, alertasOperativas };
}

/** Escribe db.json (sobrescribe el existente: así funciona `npm run reset`). */
export function ejecutarSeed(hoy = today()) {
  escribirDb(generarDatos(hoy));
}

// Si se ejecuta directamente (npm run reset), genera la base
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  ejecutarSeed();
  console.log(`Datos semilla generados en ${rutaDb()} (hoy = ${today()})`);
}
