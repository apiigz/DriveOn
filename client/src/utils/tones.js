// Mapeo estado de negocio -> tono visual del Badge.
const VEHICULO = { Disponible: 'available', Alquilado: 'info', 'En taller': 'danger', Baja: 'neutral' };
const COBRANZA = { 'Al día': 'ok', Pendiente: 'info', 'En mora': 'danger' };
const CONTRATO = { Activo: 'active', 'Por vencer': 'danger', 'Pendiente entrega': 'info' };

export const toneForVehiculo = (estado) => VEHICULO[estado] ?? 'neutral';
export const toneForCobranza = (estado) => COBRANZA[estado] ?? 'neutral';
export const toneForContrato = (estado) => CONTRATO[estado] ?? 'neutral';
