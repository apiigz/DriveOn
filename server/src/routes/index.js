// Definición de rutas de la API (prefijo /api). Cada ruta apunta a un controlador.
import { Router } from 'express';
import * as c from '../controllers/controllers.js';

const router = Router();

router.get('/dashboard', c.obtenerDashboard);
router.get('/catalogos', c.obtenerCatalogos);

router.get('/vehiculos', c.listarVehiculos);
router.get('/vehiculos/disponibles', c.listarVehiculosDisponibles);

router.get('/tarifas', c.listarTarifas);
router.get('/tarifas/historial', c.listarHistorialTarifas);
router.put('/tarifas/:id', c.editarTarifa);

router.get('/cotizacion', c.cotizar);

router.get('/contratos', c.listarContratos);
router.post('/contratos', c.emitirContrato);

router.get('/cobranzas', c.listarCobranzas);
router.post('/cobranzas/:contratoId/pagos', c.registrarPago);
router.get('/cobranzas/:contratoId/cuenta-corriente', c.obtenerCuentaCorriente);

export default router;

//Aca tengo la lista de endpoints, donde cada uno apunta a un controlador