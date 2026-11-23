// Controladores: traducen HTTP (req/res) a llamadas a los services. No contienen reglas de negocio.
import * as dashboard from '../services/dashboardService.js';
import * as catalogos from '../services/catalogosService.js';
import * as vehiculos from '../services/vehiculosService.js';
import * as tarifas from '../services/tarifasService.js';
import * as contratos from '../services/contratosService.js';
import * as cobranzas from '../services/cobranzasService.js';

export const obtenerDashboard = (req, res) => res.json(dashboard.obtenerDashboard());

export const obtenerCatalogos = (req, res) => res.json(catalogos.obtenerCatalogos());

export const listarVehiculos = (req, res) => res.json(vehiculos.listarVehiculos(req.query));
export const listarVehiculosDisponibles = (req, res) => res.json(vehiculos.listarDisponibles(req.query));

export const listarTarifas = (req, res) => res.json(tarifas.listarTarifas());
export const listarHistorialTarifas = (req, res) => res.json(tarifas.listarHistorial(req.query));
export const editarTarifa = (req, res) => res.json(tarifas.editarTarifa(req.params.id, req.body));

export const cotizar = (req, res) => res.json(contratos.cotizar(req.query));
export const listarContratos = (req, res) => res.json(contratos.listarContratos(req.query));
export const emitirContrato = (req, res) => res.status(201).json(contratos.emitirContrato(req.body));

export const listarCobranzas = (req, res) => res.json(cobranzas.listarCobranzas(req.query));
export const registrarPago = (req, res) => res.status(201).json(cobranzas.registrarPago(req.params.contratoId, req.body));
export const obtenerCuentaCorriente = (req, res) => res.json(cobranzas.cuentaCorriente(req.params.contratoId));

//querys 