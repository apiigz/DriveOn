# CLAUDE.md — Guía general de desarrollo

Este documento establece las reglas generales para trabajar en este proyecto.

Su objetivo es mantener un código limpio, organizado, seguro, mantenible y coherente con los requisitos del proyecto.

**IMPORTANTE:** Estas instrucciones son una guía general. La arquitectura, las tecnologías y las convenciones concretas deben adaptarse a cada proyecto. No se debe imponer un stack o una estructura sin analizar primero el contexto.

---

# 1. Contexto del proyecto

Antes de comenzar a trabajar, identificar:

- Nombre y objetivo del proyecto.
- Problema que busca resolver.
- Usuarios y roles involucrados.
- Funcionalidades principales.
- Tecnologías utilizadas.
- Arquitectura existente.
- Estado actual del desarrollo.

No asumir funcionalidades, requisitos ni decisiones técnicas que no hayan sido especificadas.

Si existe documentación, consultar primero README.md, documentación técnica, diagramas y archivos de configuración.

# 2. Stack tecnológico

El stack depende de cada proyecto.

Algunos ejemplos de tecnologías que pueden utilizarse:

| Capa | Tecnologías posibles |
|---|---|
| Frontend | React, Vue, Angular, HTML, CSS, JavaScript |
| Backend | Node.js, Express, Python, FastAPI, .NET |
| Base de datos | PostgreSQL, MySQL, SQL Server, MongoDB |
| Autenticación | JWT, sesiones, OAuth |
| Estilos | CSS, Tailwind, Bootstrap |
| Testing | Vitest, Jest, Pytest, Playwright |
| Control de versiones | Git y GitHub |
| Gestión de paquetes | pnpm, npm, yarn, pip |

Reglas:

- Respetar las tecnologías existentes.
- No introducir nuevas dependencias sin justificación.
- No cambiar el framework o la arquitectura sin autorización.
- Utilizar las herramientas y versiones compatibles con el proyecto.
- No instalar librerías innecesarias.

# 3. Arquitectura y estructura

Antes de modificar o crear archivos:

1. Inspeccionar la estructura completa del proyecto.
2. Identificar las responsabilidades de cada carpeta y archivo.
3. Reconocer los patrones arquitectónicos existentes.
4. Revisar cómo se implementaron funcionalidades similares.
5. Identificar dependencias entre módulos.

La estructura debe organizarse según las responsabilidades del sistema.

Se pueden utilizar patrones como:

- MVC.
- Arquitectura por capas.
- Arquitectura modular.
- Clean Architecture.
- Arquitectura basada en componentes.
- Separación entre frontend y backend.

No imponer patrones complejos cuando una solución más sencilla sea suficiente.

## Organización general de referencia

```text
proyecto/
├── CLAUDE.md
├── README.md
├── package.json / configuración equivalente
├── .env
├── .env.example
├── .gitignore
├── docs/
├── database/
├── src/
│   ├── config/
│   ├── modules/
│   ├── services/
│   ├── utils/
│   └── ...
├── tests/
└── public/ o frontend/
```

Esta estructura es orientativa. No es obligatorio utilizar todas las carpetas ni adoptar esta organización si el proyecto ya tiene otra arquitectura válida.

# 4. Organización y responsabilidades

Mantener una separación clara entre responsabilidades.

Según la arquitectura elegida, identificar y separar cuando corresponda:

- Presentación: interfaces y componentes visuales.
- Rutas: definición de endpoints y navegación.
- Controladores: coordinación de solicitudes y respuestas.
- Servicios: lógica de negocio.
- Modelos o repositorios: acceso y persistencia de datos.
- Configuración: variables de entorno y conexiones.
- Middlewares: autenticación, autorización y procesamiento de solicitudes.
- Utilidades: funciones reutilizables.
- Tests: pruebas automatizadas.

Reglas:

- Evitar mezclar lógica de negocio con presentación.
- Evitar consultas a la base de datos desde componentes visuales.
- Evitar duplicación de código.
- Reutilizar componentes, servicios y funciones cuando tenga sentido.
- No crear abstracciones innecesarias.

# 5. Base de datos y persistencia

La base de datos debe mantenerse sincronizada con la aplicación.

Buenas prácticas:

- Definir correctamente las relaciones y restricciones.
- Utilizar claves primarias y foráneas cuando corresponda.
- Validar los datos antes de persistirlos.
- Utilizar consultas parametrizadas.
- Evitar SQL injection.
- Manejar correctamente transacciones cuando sean necesarias.
- Evitar duplicar información sin justificación.
- Mantener consistencia e integridad de los datos.

Los cambios en el esquema deben reflejarse en el mecanismo de versionado de base de datos que utilice el proyecto, ya sean migraciones, scripts SQL u otra herramienta.

Nunca ejecutar migraciones destructivas ni eliminar información sin autorización.

# 6. Seguridad y autenticación

Aplicar las medidas de seguridad correspondientes al tipo de aplicación.

Reglas generales:

- Nunca almacenar contraseñas en texto plano.
- Utilizar algoritmos seguros de hash de contraseñas.
- Validar y sanitizar las entradas del usuario.
- Proteger las rutas y operaciones privadas.
- Verificar permisos y roles en el backend.
- No confiar únicamente en las restricciones del frontend.
- Proteger los datos sensibles.
- Utilizar HTTPS en entornos productivos.
- Configurar CORS según los orígenes autorizados.
- Evitar exponer información interna en mensajes de error.

Los mecanismos de autenticación y autorización deben elegirse según los requisitos del proyecto.

# 7. Gestión de errores y validaciones

Toda operación importante debe contemplar:

- Datos obligatorios.
- Formatos inválidos.
- Registros inexistentes.
- Operaciones no autorizadas.
- Errores de conexión.
- Conflictos de información.
- Errores inesperados.

Utilizar respuestas y mensajes coherentes.

Cuando se trabaje con APIs, respetar los códigos HTTP correspondientes.

No ocultar errores ni utilizar soluciones temporales para evitar que aparezcan.

# 8. Frontend y experiencia de usuario

Las interfaces deben ser profesionales, intuitivas y coherentes.

Prioridades:

- Jerarquía visual clara.
- Diseño responsive.
- Accesibilidad.
- Navegación intuitiva.
- Componentes reutilizables.
- Consistencia entre pantallas.
- Formularios claros y fáciles de utilizar.
- Mensajes de error y confirmación comprensibles.
- Estados de carga y estados vacíos.

Evitar:

- Diseños genéricos generados por IA.
- Elementos decorativos innecesarios.
- Exceso de texto.
- Botones sin propósito claro.
- Colores y tipografías inconsistentes.
- Componentes duplicados.
- Dependencias visuales innecesarias.

## Trabajo con Figma

Cuando exista un diseño de referencia:

1. Consultar Figma mediante la integración disponible.
2. Inspeccionar las páginas y Frames relevantes.
3. Identificar componentes, tipografías, colores, dimensiones y assets.
4. Reconocer las relaciones entre pantallas.
5. Respetar el diseño original.
6. Identificar qué componentes pueden reutilizarse.
7. Implementar el comportamiento responsive sin alterar innecesariamente la identidad visual.

No reemplazar un diseño existente por una interpretación genérica.

Si faltan especificaciones, consultar antes de inventar comportamientos.

# 9. Convenciones de código

- Utilizar nombres descriptivos.
- Mantener un estilo de escritura consistente.
- Respetar las convenciones del lenguaje y framework.
- Evitar funciones demasiado extensas.
- Evitar duplicaciones.
- Separar responsabilidades.
- Documentar únicamente lo necesario.
- Eliminar código obsoleto solamente después de comprobar que no se utiliza.

No crear soluciones paralelas o parches innecesarios.

Si una implementación existente está mal, corregir el origen del problema en lugar de acumular soluciones temporales.

# 10. Testing y calidad

Probar las funcionalidades relevantes después de cada implementación.

Según el proyecto, utilizar:

- Tests unitarios.
- Tests de integración.
- Tests funcionales.
- Tests de APIs.
- Tests de interfaz.
- Pruebas de regresión.

Comprobar:

- Funcionamiento esperado.
- Casos límite.
- Validaciones.
- Manejo de errores.
- Permisos.
- Integridad de los datos.
- Compatibilidad entre componentes.

Nunca afirmar que una funcionalidad funciona sin haberla verificado.

Informar qué pruebas se ejecutaron y cuáles quedaron pendientes.

# 11. Seguridad de archivos y variables de entorno

- No modificar archivos .env sin autorización.
- No exponer credenciales ni tokens.
- Mantener .env fuera de Git.
- Utilizar .env.example para documentar variables necesarias sin incluir valores reales.
- No sobrescribir archivos sin revisar su contenido.
- No eliminar archivos o información sin autorización.
- No modificar configuraciones sensibles sin explicar el impacto.

# 12. Git y control de versiones

Utilizar Git para mantener un historial ordenado.

Buenas prácticas:

- Mantener la rama principal estable.
- Crear ramas para funcionalidades y correcciones.
- Utilizar commits claros y descriptivos.
- Revisar los cambios antes de integrarlos.
- Utilizar Pull Requests cuando el flujo del proyecto lo requiera.

Reglas de seguridad:

- Revisar git status antes de realizar cambios importantes.
- No ejecutar git reset, git push, git commit, git merge o comandos destructivos sin autorización.
- No modificar el historial de Git sin permiso.
- No sobrescribir trabajo de otros colaboradores.

# 13. Documentación

Mantener la documentación sincronizada con el código.

Según el proyecto, documentar:

- Objetivo y alcance.
- Instalación y configuración.
- Tecnologías utilizadas.
- Estructura del proyecto.
- Arquitectura.
- Funcionalidades.
- Base de datos.
- Endpoints y contratos de API.
- Instrucciones de ejecución.
- Pruebas.
- Decisiones técnicas importantes.

Actualizar el README cuando cambien los procedimientos de instalación o ejecución.

Evitar documentación redundante o desactualizada.

# 14. Flujo de trabajo con Claude Code

Seguir este proceso:

## Antes de programar

1. Comprender el pedido.
2. Revisar la estructura y los archivos relacionados.
3. Analizar la implementación existente.
4. Identificar dependencias y posibles impactos.
5. Presentar un plan cuando el cambio sea significativo.
6. Esperar aprobación para decisiones importantes.

## Durante la implementación

1. Realizar cambios pequeños y ordenados.
2. Respetar la arquitectura existente.
3. Evitar modificar archivos ajenos a la tarea.
4. Explicar las decisiones técnicas relevantes.
5. Ejecutar verificaciones a medida que se avanza.

## Después de implementar

1. Revisar los archivos modificados.
2. Ejecutar las pruebas pertinentes.
3. Corregir los errores encontrados.
4. Verificar que no se hayan introducido regresiones.
5. Actualizar la documentación necesaria.

# 15. Uso de agentes especializados

Cuando estén disponibles, utilizar los siguientes agentes según la naturaleza de la tarea:

### backend-engineer

Para:
- Desarrollo backend.
- APIs.
- Bases de datos.
- Arquitectura.
- Lógica de negocio.
- Seguridad del servidor.

### frontend-engineer

Para:
- Interfaces.
- Componentes.
- Responsive.
- UX/UI.
- Integración con APIs.
- Consistencia visual.

### qa-engineer

Para:
- Testing.
- Debugging.
- Revisión de código.
- Detección de errores.
- Validación de funcionalidades.
- Prevención de regresiones.

El agente QA debe actuar como revisor independiente y no modificar archivos.

Se pueden combinar agentes cuando una funcionalidad involucre distintas áreas.

No delegar tareas innecesariamente: utilizar el agente adecuado según el problema.

# 16. Reglas generales de comportamiento

Claude debe:

- Comunicarse en español, salvo que se solicite otro idioma.
- Explicar los conceptos técnicos de forma clara y didáctica.
- Adaptarse al nivel de complejidad del proyecto.
- Priorizar soluciones simples y mantenibles.
- Inspeccionar antes de modificar.
- Preguntar cuando falte información importante.
- No inventar APIs, métodos ni funcionalidades.
- No instalar dependencias sin justificación.
- No realizar cambios destructivos sin autorización.
- No modificar la arquitectura por preferencias personales.
- Trabajar de manera incremental.
- Respetar las decisiones previamente aprobadas.

# 17. Resumen final de cada tarea

Al finalizar una tarea, informar:

1. **Qué se hizo:** resumen de la implementación.
2. **Archivos modificados:** rutas y finalidad de los cambios.
3. **Decisiones técnicas:** explicación de las decisiones importantes.
4. **Pruebas:** qué se ejecutó y cuáles fueron los resultados.
5. **Pendientes:** problemas detectados o tareas que todavía faltan.

No declarar una tarea terminada si existen errores conocidos que impidan su funcionamiento.

---

# Principio fundamental

**Primero comprender el proyecto, después planificar y finalmente implementar.**

La prioridad es construir soluciones que funcionen, sean fáciles de mantener, respeten los requisitos y puedan evolucionar sin generar complejidad innecesaria.