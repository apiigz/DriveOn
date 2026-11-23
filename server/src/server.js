import { crearApp } from './app.js';
import { existeDb, rutaDb } from './repositories/db.js';
import { ejecutarSeed } from './seed/seed.js';

const PORT = Number(process.env.PORT) || 3001;

// Si todavía no hay base de datos, se genera con los datos semilla
if (!existeDb()) {
  ejecutarSeed();
  console.log(`Base de datos creada con datos semilla: ${rutaDb()}`);
}

crearApp().listen(PORT, () => {
  console.log(`API DriveOn escuchando en http://localhost:${PORT}/api`);
});

//Levanto el servidor y ejecuta la semilla (json)