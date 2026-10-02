# Job Tracker · Frontend

Interfaz en React para llevar el seguimiento de candidaturas de empleo: un tablero Kanban con los estados de cada proceso y una pantalla de estadísticas.

Hecha con **React 19 + TypeScript + Vite**, sin librerías de UI, de estado ni de drag & drop: componentes funcionales, hooks y CSS plano.

## Requisitos

- Node.js 20.19+ o 22.12+ (requisito de Vite 8)
- El backend de Spring Boot arrancado en **http://localhost:8081**. En desarrollo, Vite redirige las peticiones a `/api` a ese puerto (ver `vite.config.ts`), así que no hace falta configurar CORS.

Si el backend no está arrancado, la app lo indica con el mensaje «No se puede conectar con la API».

## Puesta en marcha

```bash
npm install
npm run dev
```

La app queda en http://localhost:5173.

## Scripts

| Comando              | Qué hace                                          |
| -------------------- | ------------------------------------------------- |
| `npm run dev`        | Servidor de desarrollo con recarga en caliente    |
| `npm run build`      | Comprobación de tipos (`tsc -b`) y build en `dist/` |
| `npm run preview`    | Sirve el build de producción en local             |
| `npm run lint`       | Linter (Oxlint, el que trae la plantilla de Vite) |
| `npm test`           | Tests con Vitest y Testing Library                |
| `npm run test:watch` | Tests en modo watch                               |

## Funcionalidades

- **Tablero**: cinco columnas (Por aplicar, Aplicado, Entrevista, Oferta, Descartado). Las tarjetas se mueven arrastrándolas (drag & drop nativo de HTML5) o, sin ratón, con el menú «Mover a…» de cada tarjeta. Solo se permiten los cambios de estado que acepta el backend; mientras arrastras se resaltan las columnas válidas. El movimiento es optimista: si la API lo rechaza, la tarjeta vuelve a su sitio y se muestra el motivo.
- **Búsqueda** con debounce, que filtra en el servidor (`?q=`).
- **Detalle** en un panel lateral con el historial de estados, y acciones para editar y eliminar.
- **Formulario** de alta y edición con validación en cliente (la misma que el backend) y errores del servidor junto a cada campo.
- **Estadísticas**: indicadores, gráfico de barras semanal dibujado con SVG y reparto por estado.
- Accesibilidad: etiquetas en todos los campos, foco visible, diálogos nativos (`<dialog>`) que se cierran con Escape y avisos en una región `aria-live`.

## Estructura

```
src/
├── api/            # Cliente HTTP (fetch) y errores ProblemDetail
├── components/     # Componentes, cada uno con su hoja de estilos
│   ├── ApplicationDrawer/
│   ├── ApplicationForm/
│   ├── Board/
│   ├── Modal/
│   ├── Stats/
│   ├── Toast/
│   └── common/
├── hooks/          # useApplications, useStats, useDebouncedValue…
├── utils/          # Transiciones de estado, formato y validación del formulario
├── test/           # Configuración y utilidades de los tests
├── constants.ts    # Estados, modalidades y sus textos
└── types.ts        # Tipos del contrato de la API
```
