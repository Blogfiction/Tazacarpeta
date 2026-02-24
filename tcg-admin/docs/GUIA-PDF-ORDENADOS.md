# Guía: Cómo dejar los PDF más ordenados

Esta guía indica **qué parte del código modificar** para mejorar el orden, márgenes y legibilidad de los reportes PDF.

---

## 1. Archivo principal: `src/services/reports.ts`

Aquí se generan los PDF de: Actividades, Tiendas, Juegos, Dashboard, Historial, Búsquedas y Usuarios.

### 1.1 Márgenes y cabecera (líneas ~151–176)

**Qué pasa:** Las posiciones están fijas (14, 20), (14, 30). No hay constantes de margen ni zona de contenido.

**Qué modificar:**

- Definir constantes al inicio de la clase `ReportService` (después de las propiedades privadas, ~línea 76):

```ts
// Añadir después de FAKE_STORE_INVENTORY
private readonly MARGIN = 20;
private readonly PAGE_WIDTH = 210; // A4
private readonly PAGE_HEIGHT = 297;
private readonly HEADER_START_Y = 45; // Donde empieza el contenido (debajo de título y fecha)
```

- En `generateReport`, usar esas constantes para título y fecha, por ejemplo:

  - Título: `doc.text(title, this.MARGIN, 22);`
  - Fecha: `doc.text(..., this.MARGIN, 32);`
  - Reservar `HEADER_START_Y` (p. ej. 45) para que todo el contenido empiece ahí.

Así tendrás un margen uniforme y la cabecera siempre en el mismo sitio.

### 1.2 Actividades – `addActivitiesContent` (líneas 502–566)

**Qué mejorar:**

- Usar `startY` coherente con la cabecera, por ejemplo `startY: this.HEADER_START_Y + 25` (resumen arriba, tabla debajo).
- En `autoTable` añadir márgenes y evitar que la tabla se pegue a los bordes:

```ts
(doc as any).autoTable({
  // ... head, body ...
  margin: { left: this.MARGIN, right: this.MARGIN },
  startY: 70,
  didDrawPage: (data) => {
    // Opcional: añadir número de página en cada hoja que dibuje la tabla
  },
  // Mantener theme: 'grid', headStyles, alternateRowStyles
});
```

- Ajustar `columnStyles` si alguna columna (Nombre, Ubicación) se ve cortada o desordenada; por ejemplo dar más ancho a “Nombre” y “Ubicación” y menos a los IDs.

Con esto el reporte de actividades queda más ordenado y alineado.

### 1.3 Tiendas – `addStoresContent` (líneas 570–645)

**Qué mejorar:**

- Corregir el comentario de `columnStyles`: dice "Ciudad" y "Plan" pero las columnas son Nombre, Dirección, Teléfono, Email. Ajustar anchos según eso (p. ej. más ancho a Dirección, menos a Teléfono/Email).
- Añadir `margin: { left: this.MARGIN, right: this.MARGIN }` en `autoTable`.
- Calcular `startY` de la tabla de forma que no se solape con el bloque “Tiendas por región” (el `y` que usas ya va bien; solo asegurar que sea mayor que `HEADER_START_Y` y que haya unos 10–15 pt de separación).

Así las tiendas se ven alineadas y con columnas coherentes.

### 1.4 Juegos – `addGamesContent` (líneas 647–718)

**Qué mejorar:**

- Igual que en Actividades y Tiendas: `margin: { left, right }` en `autoTable` y un `startY` que respete `HEADER_START_Y`.
- La columna “Descripción” (corte a 80 caracteres) ya evita textos largos; si quieres más orden, puedes subir un poco `cellPadding` (p. ej. 4) en `styles`.

### 1.5 Dashboard – `addDashboardContent` (líneas 722–891)

**Qué mejorar:**

- Sustituir los “magic numbers” (40, 50, 55, 110, 120, 200, 240, 250) por constantes derivadas de `MARGIN` y `HEADER_START_Y`, por ejemplo:
  - Título “Resumen Ejecutivo”: `this.HEADER_START_Y`
  - Métricas: `this.HEADER_START_Y + 15`
  - Tabla de métricas: `startY: this.HEADER_START_Y + 25`
- Para el gráfico de barras y el de torta, definir variables como `chartStartY` y `chartHeight` y usarlas en todos los cálculos, para que al cambiar una sola variable se mantenga el orden en la página.
- La condición `if (y > 200)` antes de “Distribución de Tiendas por Plan” está bien; puedes hacerla dependiente de `PAGE_HEIGHT` (p. ej. `if (y > this.PAGE_HEIGHT - 100)`) para que en otros tamaños de página siga habiendo espacio.

Con esto el dashboard queda más predecible y ordenado al pasar de una sección a otra.

### 1.6 Historial, Búsquedas y Usuarios – `addHistoryContent`, `addSearchesContent`, `addUsersContent` (líneas 1054–1163)

**Qué mejorar:**

- Unificar estilo con el resto: mismo `margin: { left, right }`, mismo `headStyles` (p. ej. `fillColor: [80, 80, 80]`, `textColor: [255,255,255]`) y `theme: 'grid'` para que todas las tablas se vean igual.
- En **Usuarios** hay muchas columnas (9) y `fontSize: 7`; para que no se vea apretado:
  - Aumentar un poco `cellPadding` (4 o 5).
  - Dar `columnStyles` con anchos proporcionales (más a Email/Nombre, menos a # y Fecha).
- Usar un `startY` común, por ejemplo `this.HEADER_START_Y + 15`, para título y `startY` de la tabla un poco más abajo.

Así estos tres reportes quedan alineados con Actividades/Tiendas/Juegos y más legibles.

### 1.7 Pie de página (líneas 177–184)

**Qué mejorar:**

- Usar una constante para la posición vertical, por ejemplo:

```ts
private readonly FOOTER_Y = this.PAGE_HEIGHT - 12;
```

y en el bucle `doc.text(..., 14, this.FOOTER_Y)`. Si más adelante usas `margin` en las tablas, puedes definir también `marginBottom` en `autoTable` para que ninguna tabla invada la zona del pie (por ejemplo que el contenido no baje de `PAGE_HEIGHT - 25`).

---

## 2. Reportes mensuales: `src/services/monthlyReports.ts`

Aquí el orden ya es mejor (portada, resumen, tablas, gráficos, tendencias, pie). Para afinarlo:

### 2.1 Constantes de layout (al inicio de la clase)

- Definir `MARGIN = 20`, `PAGE_WIDTH`, `PAGE_HEIGHT` y usarlas en:
  - `addCoverPage`: posiciones 20, 30, 105 (centrado), 120, 130.
  - `addExecutiveSummary`: 20, 30 y en las llamadas a `autoTable(doc, { margin: { left: 20, right: 20 }, ... })`.
  - `addDetailedTables`, `addChartsSection`, `addTrendsAnalysis`: mismo margen horizontal y, si quieres, una variable `contentStartY` (p. ej. 25 o 30) para cada nueva página.

### 2.2 Tablas en `addExecutiveSummary` y `addDetailedTables`

- En cada `autoTable` añadir `margin: { left: 20, right: 20 }` (o la constante que definas) para que las tablas no toquen los bordes y el documento se vea más ordenado.

### 2.3 Gráficos y texto en `addStoresChartPage`, `addGamesChartPage`, `addCategoriesChartPage`

- Las posiciones 20, 25, 35, 45, 190, etc. se pueden sustituir por `MARGIN`, `MARGIN + 5`, etc., para que si cambias el margen una sola vez, todo el reporte mensual se mantenga alineado.

---

## 3. Resumen de cambios recomendados

| Archivo | Sección | Cambio principal |
|--------|---------|-------------------|
| `reports.ts` | Inicio de clase | Añadir constantes `MARGIN`, `PAGE_WIDTH`, `PAGE_HEIGHT`, `HEADER_START_Y`, `FOOTER_Y`. |
| `reports.ts` | `generateReport` | Usar constantes para título, fecha y (opcional) pie. |
| `reports.ts` | `addActivitiesContent` | `margin` en autoTable, `startY` según `HEADER_START_Y`. |
| `reports.ts` | `addStoresContent` | Corregir `columnStyles` a Nombre/Dirección/Teléfono/Email; `margin` en autoTable. |
| `reports.ts` | `addGamesContent` | `margin` en autoTable; opcionalmente más `cellPadding`. |
| `reports.ts` | `addDashboardContent` | Reemplazar números por constantes; ordenar secciones con variables (chartStartY, etc.). |
| `reports.ts` | `addHistoryContent`, `addSearchesContent`, `addUsersContent` | Mismo margen y tema de tabla; en Usuarios, `columnStyles` y algo más de padding. |
| `reports.ts` | Pie de página | Usar `FOOTER_Y`. |
| `monthlyReports.ts` | Varios | Introducir `MARGIN`/`PAGE_*` y usarlos en portada, tablas y gráficos. |

Con estos cambios, los PDF quedarán más ordenados, con márgenes uniformes, tablas alineadas y secciones bien separadas. Si quieres, el siguiente paso puede ser aplicar solo las constantes y márgenes en `reports.ts` y luego pasar a tablas y dashboard.
