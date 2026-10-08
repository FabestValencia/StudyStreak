# Plan de Implementación 001: Mapa de Calor de Actividad de Estudio (Heat Map)

> **Documento de Planificación Técnica Consolidado**  
> Basado en: [specs/001-heat-map/spec.md](file:///c:/Users/fabes/OneDrive/Documentos/StudyStreak/specs/001-heat-map/spec.md)  
> Conforme a: [docs/constitution.md](file:///c:/Users/fabes/OneDrive/Documentos/StudyStreak/docs/constitution.md) y [AGENTS.md](file:///c:/Users/fabes/OneDrive/Documentos/StudyStreak/AGENTS.md)

---

## 1. Alcance y objetivo

### 1.1 Lo que se va a implementar (:white_check_mark:)
* Integración del mapa de calor visual al pie de la tarjeta del historial de sesiones ([RF-1](file:///c:/Users/fabes/OneDrive/Documentos/StudyStreak/specs/001-heat-map/spec.md#L30-L35)).
* Matriz semanal de Lunes a Domingo con etiquetas para días de la semana y meses sobre las columnas ([RF-2](file:///c:/Users/fabes/OneDrive/Documentos/StudyStreak/specs/001-heat-map/spec.md#L36-L45)).
* Rango adaptativo que ajusta 12 semanas (escritorio/tableta) o 4 semanas (móvil estrecho) ante cambios de tamaño de pantalla sin recargar la página ([RF-3](file:///c:/Users/fabes/OneDrive/Documentos/StudyStreak/specs/001-heat-map/spec.md#L46-L53)).
* Escala fija de 5 niveles de color por minutos estudiados (0 min, 1–30 min, 31–60 min, 61–120 min, >120 min) ([RF-4](file:///c:/Users/fabes/OneDrive/Documentos/StudyStreak/specs/001-heat-map/spec.md#L54-L64)).
* Estado visual neutral/inactivo para los días futuros de la semana corriente, sin foco por teclado ni tooltip ([RF-5](file:///c:/Users/fabes/OneDrive/Documentos/StudyStreak/specs/001-heat-map/spec.md#L65-L71)).
* Leyenda de 5 muestras desde nivel 0 ("Menos") hasta nivel 4 ("Más") ([RF-6](file:///c:/Users/fabes/OneDrive/Documentos/StudyStreak/specs/001-heat-map/spec.md#L72-L77)).
* Tooltip accesible con fecha completa (incluyendo año) y minutos exactos, con contención en los límites del viewport y cierre automático en pantallas táctiles al tocar fuera o hacer scroll ([RF-7](file:///c:/Users/fabes/OneDrive/Documentos/StudyStreak/specs/001-heat-map/spec.md#L78-L86)).
* Sincronización instantánea ante altas, modificaciones o bajas de sesiones ([RF-8](file:///c:/Users/fabes/OneDrive/Documentos/StudyStreak/specs/001-heat-map/spec.md#L87-L93)).

### 1.2 Lo que queda explícitamente fuera de alcance (:no_entry_sign:)
* Filtrado o navegación del historial al hacer clic en celdas de la cuadrícula.
* Selección de rangos anuales personalizados o vistas mensuales independientes.
* Exportación de la cuadrícula a imágenes (PNG/SVG).
* Desglose detallado por asignaturas o temas dentro del tooltip.
* Paletas de colores configurables por el usuario.

---

## 2. Archivos involucrados y responsabilidades

| Archivo | Acción | Responsabilidad técnica y de dominio | RF cubiertos |
| :--- | :---: | :--- | :--- |
| `heatmap-logic.js` | **Crear** | **Lógica pura y dominio (sin DOM ni localStorage):** Módulo universal con funciones puras para agregación de minutos por fecha, normalización de datos corruptos, cálculo de calendario semanal de Lunes a Domingo y generación del ViewModel con metadatos de accesibilidad. Exportación dual UMD (`window.HeatMapLogic` en navegador y `module.exports` en Node.js). Cumple Principios 1, 3, 5 y 6. | RF-2, RF-3, RF-4, RF-5, RF-7, CL-1..6 |
| `test/heatmap.test.js` | **Crear** | **Suite de pruebas unitarias (`node --test`):** Batería determinista que valida agregación, normalización de fechas/minutos corruptos, cálculo de semanas, cruce de años, días futuros, formato de tooltip y test sintético de rendimiento (< 50 ms). Cumple Principio 4. | RF-2..5, RF-7, CL-1..6, RNF-2 |
| `index.html` | **Modificar** | **Estructura semántica:** Añade el contenedor `<section class="card heatmap-card" id="heatmap-section">` al pie del historial en `col-secondary`. Vincula `<script src="heatmap-logic.js"></script>` antes de `app.js`. Cumple Principio 1 y 2. | RF-1, RF-2, RF-6, RF-7 |
| `styles.css` | **Modificar** | **Diseño y estilos:** Cuadrícula con CSS Grid o Flexbox sincronizado, tokens de color para modo claro y oscuro, estado neutral de días futuros, diseño de la leyenda y tooltip flotante con prevención de desbordes. Cumple RNF-1. | RF-2, RF-4, RF-5, RF-6, RF-7 |
| `app.js` | **Modificar** | **Controlador de interfaz:** Invoca `HeatMapLogic.buildHeatMapViewModel(...)` en `render()`, detecta reactivamente el breakpoint (12 vs 4 semanas) con `window.matchMedia`, dibuja las celdas en el DOM y gestiona los eventos del tooltip (hover, focus, touch y cierre en scroll/tap-outside). | RF-1, RF-3, RF-5, RF-7, RF-8, RNF-3..4 |

---

## 3. Funciones puras de lógica (`heatmap-logic.js`)

Todas las funciones son deterministas, no tocan el DOM ni `localStorage`, respetan el **Principio 3** (reciben `today` explícitamente) y el **Principio 6** (nombres y código en inglés):

### 3.1 `getActivityLevel(minutes)`
* **Propósito:** Mapear los minutos acumulados de un día a uno de los 5 niveles cromáticos fijos.
* **Entrada:** `minutes` (número).
* **Salida:** Entero de `0` a `4`.
* **Reglas:**
  * Si `minutes <= 0` o no numérico $\rightarrow$ `0`
  * Si `1 <= minutes <= 30` $\rightarrow$ `1`
  * Si `31 <= minutes <= 60` $\rightarrow$ `2`
  * Si `61 <= minutes <= 120` $\rightarrow$ `3`
  * Si `minutes > 120` $\rightarrow$ `4`
* **RF:** RF-4, CL-3.

### 3.2 `aggregateMinutesByDate(sessions, todayStr)`
* **Propósito:** Agrupar y sumar los minutos válidos por fecha en un diccionario clave-valor `{ 'YYYY-MM-DD': minutosTotales }`.
* **Entradas:** `sessions` (array de objetos sesión), `todayStr` (cadena `'YYYY-MM-DD'`).
* **Salida:** Objeto clave-valor con totales por fecha.
* **Reglas:**
  * Si `session.date` no cumple el formato estricto `/^\d{4}-\d{2}-\d{2}$/`, la sesión se ignora de forma segura.
  * Si `session.date > todayStr`, la sesión se descarta (CL-2).
  * Si `session.minutes` es nulo, negativo o NaN, se normaliza a `0` (CL-3).
  * Múltiples sesiones en la misma fecha se suman aritméticamente (CL-4).
* **RF:** RF-4, CL-2, CL-3, CL-4.

### 3.3 `getMondayOfWeek(date)`
* **Propósito:** Obtener la fecha del lunes de la semana que contiene a `date` utilizando hora local.
* **Entrada:** `date` (objeto `Date`).
* **Salida:** Nuevo objeto `Date` correspondiente al lunes local a las 00:00:00.
* **Reglas:**
  * Se obtiene el día de la semana (`dayOfWeek = date.getDay()`). Si es domingo (`0`), el desfase es `-6`; si no, es `1 - dayOfWeek`.
  * Se aplica aritmética local `new Date(date.getFullYear(), date.getMonth(), date.getDate() + offset)` para evitar desajustes horarios (CL-6).
* **RF:** RF-2.

### 3.4 `formatDayTooltipText(dateStr, minutes, isFuture)`
* **Propósito:** Construir la cadena de texto en español accesible con día de la semana y año.
* **Entradas:** `dateStr` (`'YYYY-MM-DD'`), `minutes` (número), `isFuture` (booleano).
* **Salida:** Cadena de texto (ej. `"Lunes 7 de octubre de 2026: 45 min"` o `"Lunes 7 de octubre de 2026: 0 min"`). Si `isFuture` es verdadero, devuelve `""`.
* **RF:** RF-7, CL-5.

### 3.5 `buildHeatMapViewModel(sessions, today, weeksCount)`
* **Propósito:** Orquestar el cálculo puro y producir el ViewModel completo con datos de presentación y accesibilidad.
* **Entradas:**
  * `sessions` (array de sesiones).
  * `today` (objeto `Date`, por defecto `new Date()`).
  * `weeksCount` (número entero: 12 para escritorio, 4 para móvil).
* **Salida:**
  ```javascript
  {
    weeksCount: 12,
    weeks: [
      {
        weekIndex: 0,
        monthLabel: "Sep", // null si no marca inicio de mes
        days: [
          {
            dateStr: "2026-09-14",
            dayOfWeek: 0, // 0 = Lunes, 6 = Domingo
            minutes: 45,
            level: 2, // 0..4, o null si isFuture
            isFuture: false,
            isToday: false,
            tooltipText: "Lunes 14 de septiembre de 2026: 45 min",
            tabIndex: 0, // -1 si isFuture
            ariaDisabled: false // true si isFuture
          }
        ]
      }
    ]
  }
  ```
* **RF:** RF-2, RF-3, RF-4, RF-5, RF-7, CL-1..6, RNF-4.

---

## 4. Algoritmo del mapa en pseudocódigo

```text
ALGORITMO buildHeatMapViewModel(sessions, today, weeksCount):
  1. todayStr = getLocalDateString(today)
  2. minutesMap = aggregateMinutesByDate(sessions, todayStr)
  
  3. currentMonday = getMondayOfWeek(today)
  4. startMonday = restarSemanas(currentMonday, weeksCount - 1)
  
  5. weeksList = []
  6. previousMonth = -1
  
  7. PARA cada semana i DESDE 0 HASTA weeksCount - 1:
       weekStart = sumarDias(startMonday, i * 7)
       weekDays = []
       monthLabel = null
       
       // Evaluar si esta semana amerita etiqueta de mes
       // Criterio: primer día de la semana (Lunes) o contiene el día 1 del mes
       PARA cada diaIndex DESDE 0 HASTA 6:
         diaDate = sumarDias(weekStart, diaIndex)
         SI diaIndex == 0 O diaDate.getDate() == 1:
           SI diaDate.getMonth() != previousMonth:
             monthLabel = obtenerNombreCortoMes(diaDate.getMonth()) // Ej: "Sep", "Oct"
             previousMonth = diaDate.getMonth()
             
       // Construir los 7 días (Lunes a Domingo)
       PARA cada diaIndex DESDE 0 HASTA 6:
         diaDate = sumarDias(weekStart, diaIndex)
         diaStr = getLocalDateString(diaDate)
         isFuture = (diaStr > todayStr)
         isToday = (diaStr == todayStr)
         
         SI isFuture:
           level = null
           minutes = 0
           tooltipText = ""
           tabIndex = -1
           ariaDisabled = true
         SINO:
           minutes = minutesMap.obtener(diaStr) O 0
           level = getActivityLevel(minutes)
           tooltipText = formatDayTooltipText(diaStr, minutes, isFuture)
           tabIndex = 0
           ariaDisabled = false
           
         weekDays.agregar({
           dateStr: diaStr,
           dayOfWeek: diaIndex,
           level: level,
           minutes: minutes,
           isFuture: isFuture,
           isToday: isToday,
           tooltipText: tooltipText,
           tabIndex: tabIndex,
           ariaDisabled: ariaDisabled
         })
         
       weeksList.agregar({
         weekIndex: i,
         monthLabel: monthLabel,
         days: weekDays
       })
       
  8. RETORNAR { weeksCount: weeksCount, weeks: weeksList }
```

---

## 5. Cómo se pinta en la interfaz (UI / DOM / CSS)

### 5.1 Estructura en `index.html` (RF-1, RF-2, RF-6, RF-7)
Se añade la sección al pie de `history-card` en la columna secundaria:

```html
<!-- Mapa de Calor Semanal al pie del historial (RF-1) -->
<section class="card heatmap-card" id="heatmap-section" aria-labelledby="heatmap-title">
  <div class="card-header heatmap-header">
    <div class="heatmap-title-group">
      <h2 id="heatmap-title">Actividad de estudio</h2>
    </div>
  </div>

  <div class="heatmap-container" id="heatmap-container">
    <div class="heatmap-scroll-area">
      <!-- Fila superior de meses (sincronizada columna a columna) -->
      <div class="heatmap-months-row" id="heatmap-months-row" aria-hidden="true"></div>

      <div class="heatmap-body">
        <!-- Eje vertical: etiquetas de días (Lun, Mié, Vie) -->
        <div class="heatmap-days-col" aria-hidden="true">
          <span>Lun</span>
          <span></span>
          <span>Mié</span>
          <span></span>
          <span>Vie</span>
          <span></span>
          <span></span>
        </div>

        <!-- Matriz de celdas por columnas semanales -->
        <div class="heatmap-grid" id="heatmap-grid" role="grid" aria-label="Calendario de actividad de estudio"></div>
      </div>
    </div>

    <!-- Leyenda explicativa (RF-6) -->
    <div class="heatmap-footer">
      <div class="heatmap-legend" aria-label="Leyenda de intensidad">
        <span class="legend-label">Menos</span>
        <div class="legend-cells">
          <span class="legend-cell level-0" title="0 min"></span>
          <span class="legend-cell level-1" title="1-30 min"></span>
          <span class="legend-cell level-2" title="31-60 min"></span>
          <span class="legend-cell level-3" title="61-120 min"></span>
          <span class="legend-cell level-4" title=">120 min"></span>
        </div>
        <span class="legend-label">Más</span>
      </div>
    </div>
  </div>

  <!-- Tooltip flotante único accesible (RF-7) -->
  <div id="heatmap-tooltip" class="heatmap-tooltip" role="tooltip" aria-hidden="true"></div>
</section>
```

### 5.2 Estilos CSS y Tokens de Color (`styles.css`)
* **Sincronización de Columnas:** Se definen variables CSS `--cell-size: 13px; --cell-gap: 3px;`. Tanto `heatmap-months-row` como `heatmap-grid` usan `display: grid; grid-auto-columns: var(--cell-size); gap: var(--cell-gap);` para asegurar una alineación perfecta de meses y semanas.
* **Tokens de Color (5 niveles + futuro):**
  * **Modo claro:** Nivel 0 (gris neutro sutil), Nivel 1 (verde pastel suave), Nivel 2 (verde medio), Nivel 3 (verde esmeralda intenso), Nivel 4 (verde profundo de alto impacto).
  * **Modo oscuro:** Mismo gradiente ajustado para contraste óptimo sobre fondo oscuro.
  * **Día futuro:** Fondo neutro tenue con borde discontinuo (`dashed`), sin color de actividad, visualmente distinto a nivel 0.
* **Tooltip flotante y prevención de desbordes (RF-7):**
  * Clase `.heatmap-tooltip` con `position: fixed` o `position: absolute`, z-index elevado y transición suave.
  * Lógica de contención en JS: verifica coordenadas contra `window.innerWidth` y `window.innerHeight`. Si desborda a la derecha, invierte la posición a la izquierda; si desborda arriba, se coloca debajo.

### 5.3 Orquestación en `app.js` (RF-3, RF-7, RF-8)
* **Detección Reactiva:**
  * Se consulta `window.matchMedia('(max-width: 640px)')`. Si cumple, `weeksCount = 4`; de lo contrario, `weeksCount = 12`.
  * Se añade listener `mediaQuery.addEventListener('change', () => render())` para actualizar de forma inmediata sin recargar.
* **Cálculo de "Hoy":** En cada llamada a `render()`, se evalúa `new Date()` como fecha actual, garantizando que el cruce de medianoche no deje el día congelado.
* **Interacciones del Tooltip:**
  * Hover / Focus en celda válida: muestra y posiciona tooltip con el texto de `day.tooltipText`.
  * Celdas futuras (`day.isFuture`): sin foco ni eventos.
  * Cierre accesible: se oculta al salir el cursor (`mouseleave`), perder el foco (`blur`), hacer clic fuera o registrar evento de `scroll` / `touchmove` en la ventana.

---

## 6. Decisiones técnicas justificadas y alternativas descartadas

| Decisión tomada | Justificación técnica | Alternativa descartada y por qué |
| :--- | :--- | :--- |
| **Módulo dual universal `heatmap-logic.js` (`window.HeatMapLogic` / `module.exports`)** | Permite ejecutar `node --test` directamente sin instalar dependencias (Principio 4) y simultáneamente ejecutar la web abriendo `index.html` con doble clic bajo el protocolo `file://` sin servidores locales (Principio 1). | **Descartada: ES Modules nativos (`<script type="module">`).** Los navegadores bloquean módulos locales bajo protocolo `file://` por restricciones de CORS / Same-Origin, rompiendo el Principio 1. |
| **CSS Grid con variables CSS compartidas para meses y celdas** | Asegura alineación perfecta entre el nombre del mes y la columna correspondiente sin desfases geométricos. | **Descartada: Canvas o SVG.** Menor accesibilidad nativa para lectores de pantalla y mayor complejidad de posicionamiento responsivo. |
| **Inyección de `today` como parámetro en funciones puras** | Garantiza tests 100% deterministas en `node --test`, permitiendo simular cambios de año, bisiestos y semanas en curso sin manipular el reloj del sistema. Cumple Principio 3. | **Descartada: `new Date()` interno en funciones puras.** Hace imposible la reproducibilidad de casos borde temporales. |
| **Cálculo de accesibilidad (`tabIndex`, `ariaLabel`, `ariaDisabled`) dentro del ViewModel puro** | Permite validar formalmente los criterios de accesibilidad en los tests unitarios automatizados antes de pintar el DOM. | **Descartada: Lógica de accesibilidad ad-hoc en el DOM.** Dificulta la comprobabilidad determinista en Node. |
| **Cierre de tooltip ante `scroll` y `touchmove`** | Evita que el tooltip quede huérfano o desalineado al desplazarse en dispositivos táctiles. | **Descartada: Dejar el tooltip fijo hasta pulsar fuera.** Genera colisiones visuales molestas al mover la pantalla. |

---

## 7. Estrategia de tests con `node --test`

En estricto cumplimiento del **Principio 4** (*"la lógica se prueba con `node --test`, sin instalar paquetes. Prohibido avanzar con tests en rojo"*), se creará el archivo `test/heatmap.test.js`:

```javascript
const test = require('node:test');
const assert = require('node:assert/strict');
const {
  getActivityLevel,
  aggregateMinutesByDate,
  getMondayOfWeek,
  formatDayTooltipText,
  buildHeatMapViewModel
} = require('../heatmap-logic.js');
```

### Casos de prueba a implementar:

1. **Escala de intensidad de minutos (`getActivityLevel`) — RF-4, CL-3:**
   * Entradas `0`, `-15`, `null`, `undefined`, `NaN` $\rightarrow$ retornan `0`.
   * Entradas `1`, `15`, `30` $\rightarrow$ retornan `1`.
   * Entradas `31`, `45`, `60` $\rightarrow$ retornan `2`.
   * Entradas `61`, `90`, `120` $\rightarrow$ retornan `3`.
   * Entradas `121`, `240` $\rightarrow$ retornan `4`.

2. **Agregación y saneamiento de datos (`aggregateMinutesByDate`) — RF-4, CL-2, CL-3, CL-4:**
   * Múltiples sesiones en la misma fecha suman sus minutos.
   * Sesión con fecha posterior a `todayStr` se descarta (CL-2).
   * Sesión con `date` malformado (ej. `"2026-99-99"` o `null`) se descarta silenciosamente.
   * Sesión con minutos nulos, negativos o NaN se trata como 0 min (CL-3).
   * Historial vacío devuelve objeto vacío sin errores (CL-1).

3. **Cálculo de Lunes local (`getMondayOfWeek`) — RF-2, CL-6:**
   * Probado con fechas que caen en lunes, miércoles, sábado y domingo.
   * Domingo devuelve el lunes anterior (6 días antes).
   * No sufre desajustes por cambios de horario de verano/invierno.

4. **Generación del ViewModel y Accesibilidad (`buildHeatMapViewModel`) — RF-2, RF-3, RF-5, RF-7, CL-5:**
   * Generación para `weeksCount = 12` (12 semanas, 84 días) y `weeksCount = 4` (4 semanas, 28 días).
   * La última columna termina en el domingo de la semana actual.
   * Días posteriores a `today` en la semana corriente tienen `isFuture: true`, `level: null`, `tabIndex: -1` y `ariaDisabled: true` (RF-5).
   * Días pasados y hoy tienen `isFuture: false`, `tabIndex: 0`, `ariaDisabled: false` y `tooltipText` formateado con año (RF-7).
   * Cruce de año (simulando `today` en enero) genera las semanas previas de diciembre de forma continua (CL-5).

5. **Test sintético de rendimiento (< 50 ms) — RNF-2:**
   * Genera 500 sesiones aleatorias en un rango de 1 año y ejecuta `buildHeatMapViewModel` midiendo el tiempo con `performance.now()`. Valida `elapsed < 50`.

---

## 8. Matriz de trazabilidad (Requisitos vs. Plan)

| Requisito Funcional / Caso Límite | Componente responsable | Verificación en `node --test` / Navegador |
| :--- | :--- | :--- |
| **RF-1: Ubicación al pie del historial** | `index.html` (tras `history-card`), `styles.css` | Verificación en DevTools (Desktop y Móvil 375px) |
| **RF-2: Calendario Lun-Dom y etiquetas** | `heatmap-logic.js`, `index.html`, `styles.css` | `test/heatmap.test.js` (Estructura de semanas y días) |
| **RF-3: Rango adaptativo (12 / 4 semanas)** | `heatmap-logic.js` (`weeksCount`), `app.js` (`matchMedia`) | `test/heatmap.test.js` (ViewModel para 12 y 4) + DevTools |
| **RF-4: Escala de 5 niveles de intensidad** | `heatmap-logic.js` (`getActivityLevel`), `styles.css` | `test/heatmap.test.js` (Rango de minutos exacto) |
| **RF-5: Días futuros inactivos/neutrales** | `heatmap-logic.js` (`isFuture`), `styles.css`, `app.js` | `test/heatmap.test.js` (`isFuture`, `tabIndex: -1`) |
| **RF-6: Leyenda explicativa (0 a 4)** | `index.html`, `styles.css` | Verificación en DevTools |
| **RF-7: Tooltip accesible con año** | `heatmap-logic.js` (`formatDayTooltipText`), `app.js`, `styles.css` | `test/heatmap.test.js` (Texto con año) + DevTools |
| **RF-8: Actualización reactiva instantánea** | `app.js` (Integrado en `render()`) | Verificación en DevTools tras registrar/eliminar sesión |
| **RNF-1: Contraste claro/oscuro** | `styles.css` (Variables con tema dual) | Inspección visual en DevTools |
| **RNF-2: Rendimiento < 50 ms** | `heatmap-logic.js` (`buildHeatMapViewModel`) | `test/heatmap.test.js` (Medición con `performance.now()`) |
| **RNF-3 / CL-6: Fechas locales sin UTC** | `heatmap-logic.js` (`getMondayOfWeek`) | `test/heatmap.test.js` (Aritmética local de fechas) |
| **RNF-4: Accesibilidad por teclado** | `heatmap-logic.js`, `app.js`, `index.html` | `test/heatmap.test.js` (`tabIndex`, `ariaLabel`) |
| **CL-1: Historial vacío** | `heatmap-logic.js` | `test/heatmap.test.js` (Sesiones vacías) |
| **CL-2: Sesiones futuras descartadas** | `heatmap-logic.js` (`aggregateMinutesByDate`) | `test/heatmap.test.js` (Sesión con fecha > hoy) |
| **CL-3: Minutos nulos/negativos/NaN** | `heatmap-logic.js` (`aggregateMinutesByDate`) | `test/heatmap.test.js` (Minutos inválidos) |
| **CL-4: Múltiples sesiones mismo día** | `heatmap-logic.js` (`aggregateMinutesByDate`) | `test/heatmap.test.js` (Suma acumulada) |
| **CL-5: Cruce de año** | `heatmap-logic.js` (`buildHeatMapViewModel`) | `test/heatmap.test.js` (Simulación en enero con semanas en diciembre) |
