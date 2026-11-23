import { today } from '../utils/fechas.js';
import * as vehiculosRepo from '../repositories/vehiculosRepository.js';
import * as catalogosRepo from '../repositories/catalogosRepository.js';
import { calcularCobranzas } from './cobranzasService.js';

const pesos = (n) => `$${n.toLocaleString('es-AR')}`;
const porcentaje = (parte, total) => (total === 0 ? 0 : Math.round((parte / total) * 100));

/** Alertas del seed que siguen siendo verdad: una alerta "disponible" se oculta si el auto ya no lo está. */
function alertasOperativasVigentes(vehiculos) {
  const patentesLibres = new Set(vehiculos.filter((v) => v.estado === 'Disponible').map((v) => v.patente));
  return catalogosRepo
    .listarAlertasOperativas()
    .filter((a) => a.tipo !== 'disponible' || patentesLibres.has(a.codigo));
}

export function obtenerDashboard(hoy = today()) {
  const vehiculos = vehiculosRepo.listarVehiculos();
  const cobranzas = calcularCobranzas(hoy);

  const flotaTotal = vehiculos.length;
  const alquilados = vehiculos.filter((v) => v.estado === 'Alquilado').length;
  const disponibles = vehiculos.filter((v) => v.estado === 'Disponible').length;
  const enMora = cobranzas.filter((c) => c.cuenta.estado === 'En mora');

  const alertasMora = enMora.map(({ contrato, conductor, cuenta }) => ({
    id: `mora-${contrato.id}`,
    tipo: 'mora',
    titulo: 'Contrato',
    codigo: contrato.numero,
    subtitulo: conductor.nombre,
    descripcion: `Vencimiento de canon pendiente hace ${cuenta.diasAtraso} ${cuenta.diasAtraso === 1 ? 'día' : 'días'} sin comprobante. Saldo adeudado: ${pesos(cuenta.saldo)}.`,
    etiqueta: 'Mora',
    accion: 'Gestionar',
    ruta: '/cobranzas',
  }));

  const alertasRenovacion = cobranzas
    .filter((c) => c.estadoContrato === 'Por vencer')
    .map(({ contrato, conductor }) => ({
      id: `renovacion-${contrato.id}`,
      tipo: 'renovacion',
      titulo: 'Contrato',
      codigo: contrato.numero,
      subtitulo: conductor.nombre,
      descripcion: 'Renovación contractual: el contrato finaliza en los próximos 7 días.',
      etiqueta: 'Renovación',
      accion: 'Confirmar',
      ruta: '/contratos',
    }));

  return {
    kpis: {
      flotaTotal,
      alquilados,
      pctAlquilados: porcentaje(alquilados, flotaTotal),
      disponibles,
      pctDisponibles: porcentaje(disponibles, flotaTotal),
      // Contratos con saldo pendiente (Pendiente o En mora)
      pagosPendientes: cobranzas.filter((c) => c.cuenta.estado !== 'Al día').length,
      contratosEnMora: enMora.length,
    },
    alertas: [...alertasMora, ...alertasRenovacion, ...alertasOperativasVigentes(vehiculos)],
  };
}

//calcula los KPIs y alertas