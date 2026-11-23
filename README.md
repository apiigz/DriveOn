# DriveOn S.A — Demo del MVP

Prototipo funcional del sistema de gestión de flota, contratos y cobranzas de DriveOn (caso C). Se usa para la defensa oral: muestra los flujos centrales del MVP con datos de ejemplo.

- **Frontend:** React + Vite + React Router (`client/`)
- **Backend:** Node.js + Express, API REST (`server/`)
- **Datos:** archivo JSON (`server/data/db.json`) detrás de una capa `repositories/`. En producción se reemplaza por PostgreSQL, como propone el documento (A.4), cambiando solo esa capa.

## Requisitos

- Node.js 20 o superior (probado con Node 24)

## Cómo levantarlo

Todos los comandos se ejecutan en la terminal del proyecto (PowerShell, CMD o Git Bash), desde la carpeta `demo/`.

```bash
npm run install:all   # solo la primera vez: instala raíz, server y client
npm run dev           # levanta backend (puerto 3001) y frontend (puerto 5173)
```

Abrir http://localhost:5173

| Comando | Qué hace |
|---|---|
| `npm run reset` | Restaura los datos de ejemplo. **Correrlo antes del oral.** Las fechas se generan relativas al día de hoy, así la mora siempre se ve igual. |
| `npm test` | Corre los tests del backend (reglas de cuotas, mora, contratos, tarifas y cobros). |

## Qué se puede hacer en la demo

| Funcionalidad | Dónde | Requerimientos |
|---|---|---|
| Ver el tablero con KPIs y alertas calculados desde los datos | Inicio | RF-16, RF-13 |
| Filtrar la flota por patente/modelo, sucursal y estado | Flota | RF-01, RF-03 |
| Editar una tarifa con fecha de vigencia y motivo; queda en el historial de auditoría | Tarifas | RF-04, RF-05, RNF-08 |
| Cotizar y emitir un contrato: el sistema calcula tarifa, depósito y total, y el auto pasa a Alquilado | Cotizaciones y Contratos | RF-07, RF-09, RN-02, RN-03, RNF-01 |
| Filtrar contratos por estado | Cotizaciones y Contratos | — |
| Registrar un cobro y ver cómo cambia el saldo y el estado | Cobranzas | RF-12, RF-13 |
| Ver la cuenta corriente del conductor | Cobranzas → "Ver c/c" | RF-12 |

Los botones de funciones fuera de esta demo muestran el aviso "Próximamente".

### Guion sugerido para el oral

1. **Inicio:** 1 contrato en mora (CT-2019, Marcos Ruiz) y las alertas operativas.
2. **Tarifas:** editar el Fiat Cronos 1.3 (por ejemplo, $ 82.000 → $ 85.000) con un motivo; aparece en el historial con usuario y fecha.
3. **Contratos:** emitir uno con un Fiat Cronos de la sucursal Sur. La cotización ya usa $ 85.000, mientras que el CT-2041 (firmado antes) sigue en $ 82.000: la tarifa queda congelada (RN-05).
4. **Flota:** ese auto ya figura como Alquilado y no se puede volver a contratar (RNF-01).
5. **Cobranzas:** registrar un cobro a Marcos Ruiz: deja de estar en mora, baja la cartera en mora y su alerta desaparece de Inicio.

## Reglas de negocio implementadas

- **Cuota semanal:** se emite cada 7 días desde el inicio del contrato y vence 7 días después.
- **Saldo y estado:** el saldo es cuotas emitidas − pagos (los pagos se imputan a la cuota más antigua). El estado es "Al día" sin saldo, "Pendiente" si debe pero no venció, y "En mora" desde el día siguiente al vencimiento (RN-08).
- **Tarifa congelada:** cada contrato copia la tarifa y el depósito vigentes al emitirse; editar una tarifa no modifica contratos firmados (RN-05).
- **Disponibilidad:** solo se contratan vehículos disponibles de la sucursal elegida, y un vehículo no puede estar en dos contratos (RN-02, RN-03).
- **Auditoría:** cada cambio de tarifa registra campo, valor anterior y nuevo, responsable, motivo y vigencia (RF-05).

El detalle de la API y del modelo de datos está en [docs/plan-implementacion.md](docs/plan-implementacion.md).

## Estructura

```
demo/
├── client/              React (páginas, componentes reutilizables, servicios de API)
├── server/
│   ├── src/routes       endpoints REST
│   ├── src/controllers  reciben la request y devuelven la respuesta
│   ├── src/services     reglas de negocio
│   ├── src/repositories único acceso a los datos (JSON → PostgreSQL en producción)
│   ├── src/seed         datos de ejemplo
│   └── test/            tests con node:test
└── docs/                plan, alcance de la demo y capturas de Figma
```

## Limitaciones conocidas

- **Contratos vencidos:** no se cierran solos y quedan como "Por vencer". El cierre de contrato y la liquidación del depósito son RF-18 (sprints 4–5).
- **Fuentes:** Inter y Exo 2 se cargan desde Google Fonts. Sin internet se ve la fuente del sistema; la demo funciona igual.
- **Datos:** la persistencia es un archivo JSON con un único proceso. No está pensada para usuarios concurrentes; en producción eso lo resuelve PostgreSQL con transacciones (RNF-01).

## Datos de ejemplo

12 vehículos de 5 modelos, 3 sucursales (Centro, Norte, Sur), 9 conductores y 7 contratos. El caso real tiene 320 vehículos: la muestra alcanza para demostrar los flujos, y el resto se carga en la migración de datos (sprint 7).
