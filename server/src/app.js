import express from 'express';
import routes from './routes/index.js';
import { rutaNoEncontrada, manejarErrores } from './middleware/errores.js';

const ORIGEN_CLIENTE = 'http://localhost:5173';

export function crearApp() {
  const app = express();
  app.use(express.json());

  // CORS mínimo (opcional: el cliente usa el proxy de Vite) 
  // solo para el cliente en desarrollo
  app.use('/api', (req, res, next) => {
    if (req.headers.origin === ORIGEN_CLIENTE) {
      res.set({
        'Access-Control-Allow-Origin': ORIGEN_CLIENTE,
        'Access-Control-Allow-Methods': 'GET,POST,PUT,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      });
    }
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    next();
  });

  app.use('/api', routes);
  app.use('/api', rutaNoEncontrada);
  app.use(manejarErrores);
  return app;
}

export default app;
//Configurar Express: leo el jso, rutas y manejo de errores 

