# Guía: Cómo dejar los PDF más ordenados

Esta guía indica **qué parte del código modificar** para que los reportes PDF tengan mejor orden, márgenes uniformes, tablas que no se solapen y saltos de página correctos.

---

## 1. Archivos donde se genera el PDF

| Archivo | Uso |
|--------|-----|
| `src/services/reports.ts` | Reportes normales: Actividades, Tiendas, Juegos, Dashboard, Historial, Búsquedas, Usuarios |
| `src/services/monthlyReports.ts` | Reportes mensuales (portada, resumen ejecutivo, tablas, gráficos, tendencias) |

---

## 2. Cambios en `reports.ts`

### 2.1 Constantes de diseño (recomendado)

**Dónde:** Al inicio de la clase `ReportService` (después de la línea ~68, antes de `initializeFakeData`).

**Qué hacer:** Definir constantes para no usar números “mágicos” y unificar márgenes y espaciado.

```ts
// Añadir constantes (ejemplo)
private readonly PDF = {
  marginLeft: 20,
  marginRight: 20,
  marginTop: 20,
  headerHeight: 45,      // espacio reservado para título + fecha
  lineHeight: 6,
  tableStartY: 50,       // donde empieza el contenido bajo la cabecera
  footerY: 0,            // se calculará como pageHeight - 15
  fontSize: { title: 18, subtitle: 10, section: 12, body: 10, table: 8 }
} as const;
```

**Luego:** Sustituir en todo el archivo:
- `14` → `this.PDF.marginLeft` (o `PDF.marginLeft` si lo defines fuera de la clase)
- `20` (título) → posición calculada con `marginTop`
- `30` (fecha) → `marginTop + 10`
- `40`, `48`, `54`, `60`, `70` en resúmenes/tablas → usar `tableStartY`, `lineHeight` y el `finalY` que devuelve `autoTable` (ver abajo)

Así todos los reportes comparten el mismo criterio de márgenes y orden.

---

### 2.2 Cabecera del documento (título y fecha)

**Dónde:** Método `generateReport`, líneas ~166–173.

**Qué hacer:**
- Usar las constantes anteriores para posición del título y de la fecha.
- Dejar un “bloque” fijo de cabecera (por ejemplo hasta `headerHeight`) y que **todo el contenido** (resúmenes y tablas) empiece después de ese bloque, nunca antes de `tableStartY` (p. ej. 50).

Así la primera página queda siempre ordenada: título arriba, fecha, luego contenido.

---

### 2.3 Tablas con `autoTable`: márgenes, saltos de página y posición siguiente

**Dónde:** Todas las llamadas a `(doc as any).autoTable({ ... })` en:
- `addActivitiesContent` (aprox. 536–565)
- `addStoresContent` (aprox. 616–643)
- `addGamesContent` (aprox. 642–673)
- `addDashboardContent` (aprox. 741–749)
- `addHistoryContent` (aprox. 1075–1083)
- `addSearchesContent` (aprox. 1111–1119)
- `addUsersContent` (aprox. 1151–1159)

**Qué hacer en cada una:**

1. **Márgenes:** Añadir opción `margin: { left: 20, right: 20 }` (o usar tus constantes) para que la tabla no se pegue a los bordes.

2. **Saltos de página:** Añadir `pageBreak: 'auto'` para que tablas largas se partan en varias páginas en lugar de salirse.

3. **Usar `finalY`:**  
   `autoTable` devuelve un objeto con `finalY` (posición Y donde terminó la tabla). Guardarlo y usarlo para:
   - Escribir el siguiente bloque (por ejemplo “Tiendas por región” o la siguiente tabla) **debajo** de la tabla, no en un Y fijo que pueda solaparse.
   - Ejemplo después de la primera tabla:
     ```ts
     const result = (doc as any).autoTable({ ... });
     let currentY = result.finalY + 12; // 12px de separación
     // siguiente título o tabla con startY: currentY
     ```

4. **Opciones recomendadas por tabla (ejemplo):**
   ```ts
   (doc as any).autoTable({
     head: [tableColumn],
     body: tableRows,
     startY: 70,  // o currentY si ya tienes contenido arriba
     margin: { left: 20, right: 20 },
     pageBreak: 'auto',
     theme: 'grid',
     styles: {
       fontSize: 8,
       cellPadding: 4,
       valign: 'middle',
       overflow: 'linebreak',
       cellWidth: 'auto'
     },
     // ... columnStyles, headStyles, etc.
   });
   ```

Con esto las tablas quedan alineadas, con márgenes y sin solaparse entre sí ni con el pie.

---

### 2.4 Reporte de Tiendas: corrección de columnas

**Dónde:** `addStoresContent`, opción `columnStyles` (aprox. 622–627).

**Problema:** Las cabeceras de la tabla son `['Nombre', 'Dirección', 'Teléfono', 'Email']` pero en `columnStyles` se describen como “Ciudad” y “Plan”, lo que desordena los anchos.

**Qué hacer:** Ajustar los comentarios y, si quieres anchos concretos, que coincidan con el orden real:

- Columna 0: Nombre  
- Columna 1: Dirección  
- Columna 2: Teléfono  
- Columna 3: Email  

Por ejemplo:

```ts
columnStyles: {
  0: { cellWidth: 40 },  // Nombre
  1: { cellWidth: 60 },  // Dirección
  2: { cellWidth: 25 },  // Teléfono
  3: { cellWidth: 45 }   // Email
}
```

Así el PDF de tiendas se ve ordenado y coherente.

---

### 2.5 Pie de página

**Dónde:** En `generateReport`, el bucle que escribe “Página X de Y” (aprox. 176–183).

**Qué hacer:**
- Usar la misma constante de margen (p. ej. `marginLeft`) para la posición X del texto.
- Usar una constante para la posición Y del pie, por ejemplo `pageHeight - 15`, para que no quede pegado al borde y sea igual en todos los reportes.

---

### 2.6 Dashboard: orden y posición dinámica

**Dónde:** `addDashboardContent` (aprox. 719–891).

**Qué hacer:**
- Sustituir los `14`, `40`, `50`, `55`, `110`, `120`, etc. por constantes (margen, `tableStartY`, `lineHeight`).
- Después de la tabla de métricas, usar el `finalY` de `autoTable` para colocar el título “Tendencia de Actividades por Mes” y el gráfico.
- Donde ya se comprueba `if (y > 200)` para añadir página (aprox. 818), mantener esa lógica pero usando un “límite de página” constante (p. ej. 250) para decidir cuándo hacer `doc.addPage()` y resetear `y` al margen superior.

Así el dashboard no amontona contenido y el orden visual es claro.

---

## 3. Cambios en `monthlyReports.ts`

### 3.1 Márgenes y posición de secciones

**Dónde:** Varios métodos usan `20` para márgenes y títulos; el pie usa `14`.

**Qué hacer:**
- Definir constantes al inicio de la clase (o del módulo), por ejemplo `MARGIN = 20`, `FOOTER_Y_OFFSET = 15`.
- En `addFooter` (aprox. 882–888), usar la misma constante de margen (20) y una posición Y calculada con `pageHeight - FOOTER_Y_OFFSET` para el texto del pie.

Así todo el reporte mensual tiene el mismo criterio de márgenes y el pie queda ordenado.

---

### 3.2 Tablas detalladas: usar `finalY` para no solapar

**Dónde:** `addDetailedTables` (aprox. 647–832).

**Problema:** La “Ranking de Juegos” empieza en `startY: 150` y la de “Actividades” en `startY: 50` en otra página. Si la tabla de tiendas crece, puede invadir la zona de la segunda tabla.

**Qué hacer:**
- Después de cada `autoTable`, leer el `finalY` que devuelve.
- Usar ese valor + un espacio (p. ej. 15) como `startY` de la siguiente tabla o del siguiente título en la **misma página**.
- Si `finalY + 15` supera un límite (p. ej. 260), hacer `doc.addPage()` y poner `startY` en el margen superior (p. ej. 30).

Ejemplo después de la primera tabla:

```ts
const table1Result = autoTable(doc, { ... startY: 70, ... });
let nextY = table1Result.finalY + 15;
if (nextY > 250) {
  doc.addPage();
  nextY = 30;
}
doc.text('RANKING DE JUEGOS...', 20, nextY);
nextY += 10;
autoTable(doc, { ... startY: nextY, ... });
```

Así las secciones quedan ordenadas y sin solapamientos.

---

### 3.3 Análisis de tendencias: evitar que se salga de página

**Dónde:** `addTrendsAnalysis` (aprox. 833–880).

**Problema:** Se hace `y += 40` después del título “RECOMENDACIONES” y luego se escriben líneas. Si hay muchas líneas antes, `y` puede pasar del final de la página.

**Qué hacer:**
- Antes de escribir cada bloque (tendencias y recomendaciones), comprobar si `y` supera un máximo (p. ej. 260).
- Si lo supera: `doc.addPage()`, `y = 30` (o tu margen superior), y seguir escribiendo.
- Opcional: después de cada `doc.text(...)` hacer `y += lineHeight` (p. ej. 10) y comprobar de nuevo antes del siguiente párrafo.

Con esto el análisis de tendencias queda ordenado y sin cortes raros.

---

## 4. Resumen rápido

| Objetivo | Archivo | Dónde / Qué |
|----------|---------|--------------|
| Márgenes y espaciado uniforme | `reports.ts` | Añadir constantes (margen, headerHeight, lineHeight, tableStartY) y usarlas en cabecera, contenido y pie. |
| Tablas que no se solapen | `reports.ts` | Usar `finalY` de cada `autoTable` para el `startY` del siguiente bloque; añadir `margin` y `pageBreak: 'auto'`. |
| Tabla de Tiendas correcta | `reports.ts` | `addStoresContent`: corregir `columnStyles` para Nombre/Dirección/Teléfono/Email. |
| Pie de página uniforme | `reports.ts` y `monthlyReports.ts` | Misma X (margen) y misma Y (pageHeight - 15). |
| Reporte mensual ordenado | `monthlyReports.ts` | Constantes de margen; en `addDetailedTables` usar `finalY` y saltos de página; en `addTrendsAnalysis` comprobar `y` y hacer `addPage()` si hace falta. |

Si quieres, en el siguiente paso puedo proponerte los parches concretos (diffs) en `reports.ts` y `monthlyReports.ts` para uno de los reportes (por ejemplo solo Actividades o solo reporte mensual) y luego los replicas al resto.
