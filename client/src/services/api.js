const BASE = '/api';

function buildQuery(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') query.set(key, value);
  });
  const text = query.toString();
  return text ? `?${text}` : '';
}

async function request(path, { method = 'GET', params, body } = {}) {
  let response;
  try {
    response = await fetch(`${BASE}${path}${buildQuery(params)}`, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error('No se pudo conectar con el servidor. Intentá nuevamente.');
  }

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(data?.error || `Error inesperado (${response.status})`);
  }
  return data;
}

export const api = {
  getDashboard: () => request('/dashboard'),
  getCatalogos: () => request('/catalogos'),
  getVehiculos: (params) => request('/vehiculos', { params }),
  getVehiculosDisponibles: (sucursal) => request('/vehiculos/disponibles', { params: { sucursal } }),
  getTarifas: () => request('/tarifas'),
  updateTarifa: (id, body) => request(`/tarifas/${id}`, { method: 'PUT', body }),
  getHistorialTarifas: (limit) => request('/tarifas/historial', { params: { limit } }),
  getCotizacion: (params) => request('/cotizacion', { params }),
  getContratos: (params) => request('/contratos', { params }),
  createContrato: (body) => request('/contratos', { method: 'POST', body }),
  getCobranzas: (params) => request('/cobranzas', { params }),
  registrarPago: (contratoId, body) =>
    request(`/cobranzas/${contratoId}/pagos`, { method: 'POST', body }),
  getCuentaCorriente: (contratoId) => request(`/cobranzas/${contratoId}/cuenta-corriente`),
};

//unico punto de contacto con el backend 