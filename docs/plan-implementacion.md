# DriveOn — Plan de implementación de la demo

Prototipo del MVP: frontend React + backend Node/Express con persistencia en un archivo JSON.

Prototipo navegable que permite consultar la flota con filtros, editar tarifas con historial de auditoría, cotizar y registrar contratos con la tarifa vigente congelada, registrar cobros y consultar la cuenta corriente del conductor con detección automática de mora. El prototipo usa datos de ejemplo y no incluye autenticación, generación de PDF ni integración con el ERP, que se entregan según la cadencia de sprints acordada. Su objetivo es validar con el cliente los flujos y las reglas de negocio antes de construir el MVP.


## Estructura

```
demo/
├── package.json          scripts raíz: install:all, dev, reset, test
├── README.md
├── docs/                 este plan + capturas de Figma (docs/figma/*.png)
├── server/               Node.js + Express (ES modules), puerto 3001
│   ├── package.json
│   ├── data/db.json      datos (generado por el seed; ignorado al resetear)
│   ├── src/
│   │   ├── app.js / server.js
│   │   ├── routes/       un archivo por dominio
│   │   ├── controllers/
│   │   ├── services/     reglas de negocio (tarifas, contratos, cobranzas, dashboard)
│   │   ├── repositories/ única capa que toca el JSON (reemplazable por PostgreSQL)
│   │   ├── utils/        fechas, errores HTTP, formato
│   │   └── seed/         seed.js genera db.json con fechas relativas a HOY
│   └── test/             node:test (sin dependencias extra)
└── client/               React + Vite + React Router, puerto 5173, proxy /api → 3001
```

## Modelo de datos (db.json)

- `sucursales`: `{ id, nombre, direccion }` — exactamente 3: `centro` (Centro, Av. Corrientes 1420), `norte` (Norte, Av. Cabildo 2850), `sur` (Sur, Av. Mitre 640).
- `tarifas`: `{ id, modelo, version, tipo, descripcionMotor, versiones: [{ categoria, tarifaSemanal, deposito, kmSemanal, kmExcedente, vigenteDesde }] }`. La versión vigente es la última con `vigenteDesde <= hoy`.
- `vehiculos`: `{ id, patente, tarifaId, modeloCompleto, sucursalId, estado, kilometraje, notaTaller? }`. `estado` ∈ `Disponible | Alquilado | En taller | Baja` (RN-01).
- `conductores`: `{ id, nombre, dni }`.
- `contratos`: `{ id, numero, conductorId, vehiculoId, sucursalId, tarifaId, duracionSemanas, tarifaSemanal, deposito, kmSemanal, kmExcedente, fechaInicio, estadoBase }`. Tarifa y depósito **congelados** al emitir (RN-05). `estadoBase` ∈ `Activo | Pendiente entrega`.
- `pagos`: `{ id, contratoId, monto, medio, referencia, fecha, registradoPor }`.
- `historialTarifas`: `{ id, fecha, tarifaId, vehiculo, campo, anterior, nuevo, responsable, motivo, vigenteDesde }`.
- `alertasOperativas` (estáticas del seed): exceso de kilometraje y vehículo devuelto.



### Datos semilla

Tarifas (5 modelos):

| id | Modelo / tipo | Motor | Categoría | Semanal | Depósito | Km/sem | Km exc. |
|---|---|---|---|---|---|---|---|
| etios | Toyota Etios 1.5 X / Hatch | Motor 1.5 16v • Manual 6v | Económico | 75000 | 120000 | 1500 | 120 |
| cronos | Fiat Cronos 1.3 / Sedán | Motor GSE 1.3 8v • Manual 5v | Sedán Compacto | 82000 | 130000 | 1500 | 135 |
| joy | Chevrolet Joy Plus / Sedán | Motor SPE/4 1.4 • Manual 5v | Sedán Estándar | 78000 | 120000 | 1800 | 125 |
| logan | Renault Logan 1.6 / Sedán | Motor HR16 1.6 16v • Baúl 510L | Sedán Amplio | 80000 | 125000 | 1500 | 130 |
| versa | Nissan Versa 1.6 / Confort | Motor HR16DE • Transmisión CVT | Plus | 90000 | 150000 | 2000 | 150 |

Historial semilla (fechas relativas): hoy-26 Fiat Cronos 1.3 tarifa semanal 76000→82000 (Carlos Méndez, "Actualización de costos de seguro"); hoy-39 Toyota Etios 1.5 depósito 110000→120000 (Carlos Méndez, "Ajuste de franquicia"); hoy-55 Nissan Versa 1.6 km semanal 1800→2000 (Dirección Operativa, "Homologación para trayectos interurbanos").

Conductores: Darío Gomez 34.890.122 · Facundo Rossi 38.220.914 · Marcos Ruiz 31.004.812 · Laura Benítez 36.711.542 · Esteban Paz 32.441.900 · Carlos Varela 39.810.223 · Ignacio Soto 35.198.441 · Sofía Medina 40.112.358 · Martín Acosta 37.554.091 (los dos últimos sin contrato, para la demo de alta).

Vehículos (12):

| Patente | Modelo | Tarifa | Sucursal | Estado | Km |
|---|---|---|---|---|---|
| AE 104 BC | Toyota Etios 1.5 X | etios | centro | Disponible | 42150 |
| AD 920 KL | Fiat Cronos 1.3 Drive | cronos | norte | Alquilado | 68400 |
| AF 432 MN | Chevrolet Joy Plus 1.4 | joy | sur | Alquilado | 29800 |
| AB 771 TR | Renault Logan 1.6 | logan | centro | En taller (Frenos / Tren delantero) | 85200 |
| AC 338 QW | Fiat Cronos 1.3 Drive | cronos | sur | Disponible | 51300 |
| AE 819 ZP | Nissan Versa 1.6 Sense | versa | norte | Alquilado | 33100 |
| AF 501 RT | Renault Logan 1.6 | logan | sur | Disponible | 19500 |
| AA 421 CD | Toyota Etios 1.5 X | etios | centro | Alquilado | 24700 |
| AF 892 PL | Chevrolet Joy Plus 1.4 | joy | centro | Disponible | 38900 |
| AB 312 FG | Toyota Etios 1.5 X | etios | sur | Alquilado | 57300 |
| AC 645 HJ | Renault Logan 1.6 | logan | norte | Alquilado | 44600 |
| AD 118 LP | Fiat Cronos 1.3 Drive | cronos | centro | Alquilado | 61200 |

Contratos (inicio relativo a hoy):

| N° | Conductor | Patente | Sucursal | Semanas | Inicio | estadoBase | Pagos semilla |
|---|---|---|---|---|---|---|---|
| CT-2041 | Darío Gomez | AD 920 KL | norte | 4 | hoy-14 | Activo | todas las cuotas emitidas |
| CT-2055 | Facundo Rossi | AF 432 MN | sur | 8 | hoy-52 | Activo | todas |
| CT-2108 | Laura Benítez | AA 421 CD | centro | 2 | hoy-3 | Pendiente entrega | ninguna |
| CT-1980 | Esteban Paz | AE 819 ZP | norte | 12 | hoy-30 | Activo | todas |
| CT-2019 | Marcos Ruiz | AB 312 FG | sur | 8 | hoy-32 | Activo | primeras 3 |
| CT-2082 | Carlos Varela | AC 645 HJ | norte | 4 | hoy-10 | Activo | primera |
| CT-2070 | Ignacio Soto | AD 118 LP | centro | 8 | hoy-21 | Activo | todas |

Medios de pago semilla alternados: "Transferencia Bancaria" (ref. TRF-xxxxxx) y "Efectivo Caja".



## API REST (prefijo `/api`)

Errores: `{ "error": "mensaje en español" }` con 400 (validación), 404 (no existe), 409 (conflicto), 500.

| Método y ruta | Respuesta |
|---|---|
| `GET /dashboard 
| `GET /catalogos
| `GET /vehiculos/disponibles
| `PUT /tarifas/:id
| `GET /tarifas/historial
| `GET /cotizacion?vehiculoId&duracionSemanas
| `GET /contratos
| `POST /contratos
| `POST /cobranzas/:contratoId/pagos
