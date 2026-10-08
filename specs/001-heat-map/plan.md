# Plan de Implementación 001: Mapa de Calor de Actividad de Estudio (Heat Map)

> **Documento de Planificación Técnica**  
> Basado en: [specs/001-heat-map/spec.md](file:///c:/Users/fabes/OneDrive/Documentos/StudyStreak/specs/001-heat-map/spec.md)  
> Conforme a: [docs/constitution.md](file:///c:/Users/fabes/OneDrive/Documentos/StudyStreak/docs/constitution.md)

---

## 1. Archivos involucrados y responsabilidades

Para respetar el **Principio 1** (simplicidad, ejecución local con doble clic mediante `file://`) y el **Principio 3** (separación estricta de lógica e interfaz), se establece la siguiente estructura de archivos:

| Archivo | Acción | Responsabilidad técnica y de dominio | RF cubiertos |
| :--- | :---: | :--- | :--- |
| `heatmap-logic.js` | **Crear** | **Capa de lógica pura (Modelo y Dominio):** Módulo de cálculo puro sin dependencias del DOM ni de `localStorage`. Contiene funciones puras para agregación de minutos por fecha, cálculo de rangos de semanas de lunes a domingo, determinación de niveles de intensidad y formateo de etiquetas temporales. Compatible tanto con el navegador (`window.HeatMapLogic`) como con Node.js (`module.exports`) para tests automáticos. | RF-2, RF-3, RF-4, RF-5, RF-7, CL-1..6 |
| `test/heatmap.test.js` | **Crear** | **Suite de pruebas unitarias (`node --test`):** Batería de tests que valida todas las funciones puras contra casos nominales y casos límite (cruce de años, fechas futuras, valores negativos/nulos, semanas incompletas) con fechas inyectadas. Cumple el Principio 4. | RF-4, RF-5, CL-1..6 |
| `index.html` | **Modificar** | **Estructura semántica:** Añade el contenedor semántico del mapa de calor al pie de la sección del historial de sesiones (dentro de `col-secondary`), incluyendo el encabezado, área de cuadrícula accesible (con roles ARIA y scroll horizontal seguro si aplica), leyenda explicativa y contenedor de tooltip contextual. Añade la importación de `<script src="heatmap-logic.js"></script>`. | RF-1, RF-2, RF-6, RF-7 |
| `styles.css` | **Modificar** | **Diseño y estilos:** Define variables de diseño, paleta de colores cromática de 5 niveles + estado futuro neutral en temas claro y oscuro, disposición en CSS Grid para columnas de semanas y filas de días (Lunes a Domingo), etiquetas de ejes, diseño de la leyenda y posicionamiento/animación del tooltip contextual. | RF-2, RF-3, RF-4, RF-5, RF-6, RF-7, RNF-1 |
| `app.js` | **Modificar** | **Capa de presentación y orquestación (Controlador UI):** Conecta la lógica pura con el ciclo de vida de la aplicación. Escucha cambios de viewport/media queries para determinar 12 o 4 semanas reactivamente, renderiza las celdas en el DOM a partir del ViewModel generado por `heatmap-logic.js`, gestiona la interacción accesible de tooltip (hover, focus de teclado, click/tap y cierre al pulsar fuera) y actualiza el mapa en `render()`. | RF-1, RF-3, RF-5, RF-7, RF-8, RNF-2..4 |

---

## 2. Funciones puras de lógica (`heatmap-logic.js`)

Siguiendo el **Principio 3** (Lógica separada de interfaz) y el **Principio 6** (Código en inglés, documentación en español), todas las funciones son deterministas, no tocan variables globales ni APIs del navegador, y reciben explícitamente `today` (como objeto `Date` o cadena `'YYYY-MM-DD'`) como parámetro:

### 2.1 `getActivityLevel(minutes)`

* **Propósito:** Mapear los minutos acumulados de un día a uno de los 5 niveles cromáticos fijos.
* **Entradas:** `minutes` (número).
* **Salida:** Entero del `0` al `4`.
* **Reglas:**
  * `<= 0` o valor no numérico: `0`
  * `1` a `30`: `1`
  * `31` a `60`: `2`
  * `61` a `120`: `3`
  * `> 120`: `4`
* **RF:** RF-4, CL-3.

### 2.2 `aggregateMinutesByDate(sessions, todayStr)`

* **Propósito:** Agrupar y sumar los minutos válidos por fecha en un diccionario clave-valor `{ 'YYYY-MM-DD': minutosTotales }`.
* **Entradas:** `sessions` (array de objetos sesión `{ date, minutes }`), `todayStr` (cadena `'YYYY-MM-DD'`).
* **Salida:** Objeto `Map` o diccionario con totales agregados.
* **Reglas:**
  * Si `session.date > todayStr`, la sesión se descarta (CL-2).
  * Si `session.minutes` es nulo, negativo o NaN, se normaliza a `0` (CL-3).
  * Múltiples sesiones en la misma fecha se suman aritméticamente (CL-4).
* **RF:** RF-4, CL-2, CL-3, CL-4.

### 2.3 `getMondayOfWeek(date)`

* **Propósito:** Calcular la fecha del lunes correspondiente a la semana de una fecha dada en hora local.
* **Entradas:** `date` (objeto `Date`).
* **Salida:** Nuevo objeto `Date` representando el lunes a las 00:00:00 local.
* **Reglas:**
  * En JavaScript, domingo es `0` y lunes es `1`. Si `dayOfWeek === 0`, el desfase es `-6` días; para el resto es `1 - dayOfWeek`.
  * Se utiliza aritmética local con `new Date(y, m, d)` y `setDate()` para evitar desajustes horarios (CL-6).
* **RF:** RF-2.

### 2.4 `generateCalendarGrid(today, weeksCount)`

* **Propósito:** Generar la matriz temporal de semanas y días para la cuadrícula visual.
* **Entradas:** `today` (objeto `Date`), `weeksCount` (número entero: 12 para escritorio, 4 para móvil).
* **Salida:** Estructura que describe las semanas consecutivas:
  * Array de semanas (columnas). Cada semana contiene:
    * `monthLabel`: Nombre del mes si la semana marca el inicio o cambio de mes, o `null`.
    * `days`: Array de 7 objetos día (índices 0 = Lunes a 6 = Domingo).
      * `dateStr`: `'YYYY-MM-DD'`
      * `dayOfWeek`: 0..6 (Lunes..Domingo)
      * `isFuture`: Booleano (`dateStr > todayStr`)
      * `isToday`: Booleano (`dateStr === todayStr`)
* **Reglas:**
  * La semana actual (que contiene a `today`) siempre se posiciona como la última columna (derecha).
  * La primera columna arranca exactamente `weeksCount - 1` semanas antes de la semana actual.
* **RF:** RF-2, RF-3, RF-5, CL-5.

### 2.5 `formatDayTooltipText(dateStr, minutes, isFuture)`

* **Propósito:** Construir la cadena de texto en español accesible para el tooltip o aria-label.
* **Entradas:** `dateStr` (`'YYYY-MM-DD'`), `minutes` (número), `isFuture` (booleano).
* **Salida:** Cadena con formato: `"Lunes 7 de octubre de 2026: 45 min"` o `"Lunes 7 de octubre de 2026: 0 min"`.
* **RF:** RF-7, CL-5.

### 2.6 `buildHeatMapViewModel(sessions, today, weeksCount)`

* **Propósito:** Orquestar los cálculos para devolver un ViewModel estructurado listo para ser consumido por la UI sin lógica adicional.
* **Entradas:** `sessions` (array), `today` (Date), `weeksCount` (número).
* **Salida:**

  ```javascript
  {
    weeksCount,
    weeks: [
      {
        monthLabel: 'Sep',
        days: [
          { dateStr: '2026-09-14', level: 2, minutes: 45, isFuture: false, isToday: false, tooltipText: '...' },
          // ... 7 días de Lunes a Domingo
        ]
      }
    ]
  }
  ```

* **RF:** RF-2, RF-3, RF-4, RF-5, RF-7, CL-1.

---

## 3. Algoritmo del mapa en pseudocódigo

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
       
       PARA cada diaIndex DESDE 0 HASTA 6 (Lunes a Domingo):
         diaDate = sumarDias(weekStart, diaIndex)
         diaStr = getLocalDateString(diaDate)
         isFuture = (diaStr > todayStr)
         isToday = (diaStr == todayStr)
         
         // Si es el primer día de la semana o cambia de mes, evaluar etiqueta de mes
         SI diaIndex == 0 O diaDate.getDate() == 1:
           SI diaDate.getMonth() != previousMonth:
             monthLabel = obtenerNombreCortoMes(diaDate.getMonth()) // Ej: "Sep", "Oct"
             previousMonth = diaDate.getMonth()
             
         SI isFuture:
           level = null  // Estado futuro inactivo
           minutes = 0
           tooltipText = ""
         SINO:
           minutes = minutesMap.obtener(diaStr) O 0
           level = getActivityLevel(minutes)
           tooltipText = formatDayTooltipText(diaStr, minutes, isFuture)
           
         weekDays.agregar({
           dateStr: diaStr,
           dayOfWeek: diaIndex,
           level: level,
           minutes: minutes,
           isFuture: isFuture,
           isToday: isToday,
           tooltipText: tooltipText
         })
         
       weeksList.agregar({
         weekIndex: i,
         monthLabel: monthLabel,
         days: weekDays
       })
       
  8. RETORNAR { weeksCount: weeksCount, weeks: weeksList }
```

---

## 4. Cómo se pinta en la interfaz (UI / DOM / CSS)

### 4.1 Ubicación en el DOM (`index.html`)

Se inserta una nueva tarjeta `<section class="card heatmap-card" id="heatmap-section">` en `col-secondary`, situada inmediatamente debajo de `<section class="card history-card">`:

```html
<!-- Mapa de Calor Semanal al pie del historial (RF-1) -->
<section class="card heatmap-card" id="heatmap-section" aria-labelledby="heatmap-title">
  <div class="card-header heatmap-header">
    <div class="heatmap-title-group">
      <h2 id="heatmap-title">Actividad de estudio</h2>
      <span class="heatmap-subtitle" id="heatmap-weeks-label">Últimas 12 semanas</span>
    </div>
  </div>

  <!-- Contenedor accesible de la cuadrícula -->
  <div class="heatmap-container" id="heatmap-container">
    <div class="heatmap-scroll-area">
      <!-- Eje superior: etiquetas de meses (RF-2) -->
      <div class="heatmap-months-row" id="heatmap-months-row" aria-hidden="true"></div>

      <div class="heatmap-body">
        <!-- Eje lateral: etiquetas de días (Lun, Mié, Vie) (RF-2) -->
        <div class="heatmap-days-col" aria-hidden="true">
          <span>Lun</span>
          <span></span>
          <span>Mié</span>
          <span></span>
          <span>Vie</span>
          <span></span>
          <span></span>
        </div>

        <!-- Matriz de celdas (CSS Grid dinámico) -->
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

  <!-- Tooltip flotante accesible único (RF-7) -->
  <div id="heatmap-tooltip" class="heatmap-tooltip" role="tooltip" aria-hidden="true"></div>
</section>
```

### 4.2 Disposición en CSS Grid (`styles.css`)

* **Estructura Grid:**
  * `heatmap-grid` utiliza `display: grid; grid-template-rows: repeat(7, 12px); grid-auto-flow: column; grid-auto-columns: 12px; gap: 4px;`.
  * Filas fijas de 7 celdas (Lunes a Domingo), generando columnas semanales automáticas de izquierda a derecha.
* **Tokens de Color Semánticos (5 niveles + futuro):**
  * Modo claro:
    * Nivel 0: `var(--bg-card-subtle)` / tono gris suave neutral.
    * Nivel 1: Verde esmeralda pastel (actividad ligera).
    * Nivel 2: Verde medio vivo.
    * Nivel 3: Verde intenso profundo.
    * Nivel 4: Esmeralda oscuro de alta saturación.
    * Futuro: Fondo casi transparente con borde punteado/tenue (claramente distinto de nivel 0).
  * Modo oscuro: Misma gradación calibrada con tonos luminosos de alto contraste sobre fondo oscuro.
* **Tooltip flotante y prevención de desborde (RF-7):**
  * `position: absolute`, `pointer-events: none` (para evitar parpadeos), fondo oscuro con elevación (`box-shadow`), tipografía compacta (`JetBrains Mono` para la hora/fecha).
  * Cálculo dinámico de coordenadas en `app.js` verificando los márgenes del contenedor (`Math.max(margin, Math.min(x, maxRight))` para garantizar contención en viewport).

### 4.3 Orquestación en JavaScript (`app.js`)

* **Determinación reactiva del rango (RF-3):**
  * Uso de `window.matchMedia('(max-width: 640px)')` para detectar si corresponde `4` semanas (móvil) o `12` semanas (escritorio/tablet).
  * Listener en `mediaQuery.addEventListener('change', ...)` que actualiza la cuadrícula de forma inmediata sin recargar página.
* **Renderizado:**
  * Función `renderHeatMap()` invocada dentro de la función global `render()`.
  * Construye las celdas mediante manipulación eficiente del DOM (utilizando `DocumentFragment`).
  * Asigna atributos accesibles: `tabindex="0"`, `role="gridcell"`, `aria-label="Lunes 7 de octubre de 2026: 45 min"` para días pasados/presentes.
  * Para días futuros: `tabindex="-1"`, `aria-disabled="true"`, `class="heatmap-cell cell-future"`, sin eventos de interacción.
* **Interacciones del Tooltip (RF-7):**
  * `mouseenter` y `focus` en celdas válidas: posiciona y muestra el tooltip.
  * `mouseleave` y `blur`: oculta el tooltip.
  * En dispositivos móviles (pantallas táctiles): evento `click` fija el tooltip en la celda pulsada; pulsar fuera del mapa de calor (`document.addEventListener('click')`) lo oculta de inmediato.

---

## 5. Decisiones técnicas justificadas y alternativas descartadas

| Decisión tomada | Justificación técnica | Alternativa descartada y por qué |
| :--- | :--- | :--- |
| **Separar lógica pura en `heatmap-logic.js` compatible con Node y Browser (formato dual UMD/global)** | Permite testear el 100% de la lógica de fechas, acumulación y semanas directamente con `node --test` (Principio 4) y simultáneamente correr la web haciendo doble clic en `index.html` bajo el protocolo `file://` sin servidor ni herramientas de build (Principio 1). | **Descartada: Módulos ES puros (`import/export`) en el navegador.** Los navegadores bloquean `type="module"` en archivos locales `file://` debido a la política de Same-Origin/CORS, rompiendo el Principio 1 de apertura sin servidor. |
| **CSS Grid nativo (`grid-auto-flow: column; grid-template-rows: repeat(7, ...);`)** | Permite una cuadrícula rígida y exacta donde cada columna es una semana de 7 días naturales (Lunes a Domingo), adaptándose automáticamente al número de semanas con solo inyectar las celdas en orden cronológico. | **Descartada: SVG o Canvas interactivo.** Requiere mucho más código imperativo para accesibilidad (lectores de pantalla, focus de teclado), gestión de redibujado y responsive. |
| **Detección reactiva con `window.matchMedia`** | Es ligero, sin dependencias, compatible con todos los navegadores y reacciona de forma instantánea al redimensionar la ventana o rotar el dispositivo móvil entre horizontal y vertical sin necesidad de recargar. | **Descartada: Forzar recarga de página (`window.location.reload`) en resize.** Viola directamente el RF-3 y degrada la experiencia de usuario. |
| **Inyección de `today` como parámetro en toda función pura** | Hace que los tests con `node --test` sean 100% deterministas, reproducibles y capaces de simular cualquier día del año (fin de año, años bisiestos, cambios de hora) sin necesidad de modificar el reloj del sistema. Cumple el Principio 3. | **Descartada: Llamar internamente a `new Date()` en las funciones de cálculo.** Hace imposible probar bordes de año y rachas pasadas de forma aislada. |
| **Tooltip HTML posicionado con márgenes acotados** | Permite texto enriquecido en español, tipografía coherente y control absoluto de prevención de desbordes con respecto al viewport móvil. | **Descartada: Atributo nativo `title="..."`.** En dispositivos móviles táctiles el atributo `title` no se despliega de manera consistente, tiene un retraso perceptible de 1 a 2 segundos en escritorio y no permite aplicar estilos ni posicionamiento controlado. |

---

## 6. Estrategia de tests con `node --test`

En estricto cumplimiento del **Principio 4** (*"la lógica se prueba con `node --test`, sin instalar paquetes. Prohibido avanzar con tests en rojo"*), se creará el archivo de test nativo `test/heatmap.test.js`.

### 6.1 Estructura del test (`node --test`)

Se utiliza el test runner nativo de Node.js (disponible a partir de Node 18+):

```javascript
const test = require('node:test');
const assert = require('node:assert/strict');
const {
  getActivityLevel,
  aggregateMinutesByDate,
  getMondayOfWeek,
  generateCalendarGrid,
  buildHeatMapViewModel
} = require('../heatmap-logic.js');
```

### 6.2 Casos de prueba a implementar

1. **Escala de intensidad de minutos (`getActivityLevel`) — RF-4, CL-3:**
   * Entrada `0` o negativa (`-10`) $\rightarrow$ retorna `0`.
   * Entrada `null`, `undefined` o `NaN` $\rightarrow$ retorna `0`.
   * Entrada `15` (rango 1..30) $\rightarrow$ retorna `1`.
   * Entrada `30` (límite superior rango 1) $\rightarrow$ retorna `1`.
   * Entrada `31` y `60` (rango 31..60) $\rightarrow$ retorna `2`.
   * Entrada `61` y `120` (rango 61..120) $\rightarrow$ retorna `3`.
   * Entrada `121` y `300` (>120) $\rightarrow$ retorna `4`.

2. **Agregación de minutos (`aggregateMinutesByDate`) — RF-4, CL-2, CL-3, CL-4:**
   * Múltiples sesiones en el mismo día se suman correctamente (ej. 30 min + 45 min = 75 min).
   * Sesión con fecha posterior a `todayStr` se descarta y no se suma al mapa (CL-2).
   * Sesiones con minutos nulos o negativos se tratan como 0 min (CL-3).
   * Historial vacío retorna diccionario vacío sin errores (CL-1).

3. **Cálculo del lunes de la semana (`getMondayOfWeek`) — RF-2, CL-6:**
   * Si la fecha es miércoles, devuelve el lunes de esa misma semana.
   * Si la fecha es domingo, devuelve el lunes anterior (6 días antes).
   * Si la fecha es lunes, devuelve la misma fecha.

4. **Generación de cuadrícula (`generateCalendarGrid` / `buildHeatMapViewModel`) — RF-2, RF-3, RF-5, CL-5:**
   * Para `weeksCount = 12`, genera exactamente 12 semanas (columnas) y 84 días en total.
   * Para `weeksCount = 4`, genera exactamente 4 semanas y 28 días en total.
   * La última columna culmina en el domingo de la semana corriente.
   * Días posteriores a `today` dentro de la semana actual se marcan con `isFuture: true` y nivel `null` (RF-5).
   * Días de la semana pasada y anteriores tienen `isFuture: false`.
   * Cruce de año: Al simular `today = new Date(2027, 0, 5)` (enero), calcula adecuadamente las semanas que iniciaron en 2026 sin desfasar días (CL-5).

5. **Comando de ejecución y validación:**

   ```powershell
   node --test
   ```

   *Criterio de pase:* 100% de los tests pasan con salida en verde antes de proceder con el código de interfaz.

---

## 7. Matriz de trazabilidad (Requisitos vs. Plan)

| Requisito Funcional / Casos Límite | Componente responsable | Test automatizado (`node --test`) |
| :--- | :--- | :--- |
| **RF-1: Ubicación al pie del historial** | `index.html` (colocación tras `history-card`), `styles.css` | Verificación en DevTools / Navegador |
| **RF-2: Calendario Lun-Dom y etiquetas** | `heatmap-logic.js` (`generateCalendarGrid`), `index.html`, `styles.css` | `test/heatmap.test.js` (Estructura de semanas y días) |
| **RF-3: Rango adaptativo (12 / 4 semanas)** | `heatmap-logic.js` (`weeksCount`), `app.js` (`matchMedia`) | `test/heatmap.test.js` (Generación de 12 y 4 semanas) |
| **RF-4: Escala de 5 niveles de intensidad** | `heatmap-logic.js` (`getActivityLevel`), `styles.css` | `test/heatmap.test.js` (Rango de minutos exacto) |
| **RF-5: Días futuros inactivos/neutrales** | `heatmap-logic.js` (`isFuture`), `styles.css` (`.cell-future`), `app.js` | `test/heatmap.test.js` (Flag `isFuture` para días > today) |
| **RF-6: Leyenda explicativa (0 a 4)** | `index.html` (`.heatmap-legend`), `styles.css` | Verificación visual en DevTools / Navegador |
| **RF-7: Tooltip accesible con año** | `heatmap-logic.js` (`formatDayTooltipText`), `app.js`, `styles.css` | `test/heatmap.test.js` (Formato de texto con año) |
| **RF-8: Actualización reactiva instantánea** | `app.js` (Integrado en `render()`) | Verificación en DevTools tras registrar/eliminar sesión |
| **CL-1: Historial vacío** | `heatmap-logic.js` (`buildHeatMapViewModel`) | `test/heatmap.test.js` (Array de sesiones vacío) |
| **CL-2: Sesiones futuras descartadas** | `heatmap-logic.js` (`aggregateMinutesByDate`) | `test/heatmap.test.js` (Sesiones con fecha > hoy) |
| **CL-3: Minutos nulos/negativos/NaN** | `heatmap-logic.js` (`aggregateMinutesByDate`) | `test/heatmap.test.js` (Minutos inválidos) |
| **CL-4: Múltiples sesiones mismo día** | `heatmap-logic.js` (`aggregateMinutesByDate`) | `test/heatmap.test.js` (Suma de minutos misma fecha) |
| **CL-5: Cruce de año** | `heatmap-logic.js` (`generateCalendarGrid`) | `test/heatmap.test.js` (Simulación en enero con semanas en diciembre) |
| **CL-6: Horario local sin desfases** | `heatmap-logic.js` (`getMondayOfWeek`) | `test/heatmap.test.js` (Aritmética local de fechas) |
