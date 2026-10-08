# Tareas de Implementación 001: Mapa de Calor de Actividad de Estudio (Heat Map)

> **Desglose de Tareas Atómicas (20-30 min)**  
> Basado en: [specs/001-heat-map/spec.md](file:///c:/Users/fabes/OneDrive/Documentos/StudyStreak/specs/001-heat-map/spec.md) y [specs/001-heat-map/plan.md](file:///c:/Users/fabes/OneDrive/Documentos/StudyStreak/specs/001-heat-map/plan.md)  
> Conforme a: [docs/constitution.md](file:///c:/Users/fabes/OneDrive/Documentos/StudyStreak/docs/constitution.md)

---

## Tareas

### Tarea 1: Suite de tests unitarios para escala y agregación de sesiones
* **Descripción:** Crear el directorio `test/` y el archivo `test/heatmap.test.js` utilizando el ejecutor nativo `node:test` y `node:assert/strict`. Definir las pruebas unitarias para `getActivityLevel` (rangos de minutos) y `aggregateMinutesByDate` (suma acumulada, descarte de fechas futuras, fechas malformadas y minutos negativos/nulos).
* **RF cubiertos:** [RF-4](file:///c:/Users/fabes/OneDrive/Documentos/StudyStreak/specs/001-heat-map/spec.md#L54-L64), [CL-1](file:///c:/Users/fabes/OneDrive/Documentos/StudyStreak/specs/001-heat-map/spec.md#L106), [CL-2](file:///c:/Users/fabes/OneDrive/Documentos/StudyStreak/specs/001-heat-map/spec.md#L107), [CL-3](file:///c:/Users/fabes/OneDrive/Documentos/StudyStreak/specs/001-heat-map/spec.md#L108), [CL-4](file:///c:/Users/fabes/OneDrive/Documentos/StudyStreak/specs/001-heat-map/spec.md#L109).
* [ ] **Hecho cuando:** El archivo `test/heatmap.test.js` existe y describe todos los casos de prueba de escala y agregación listos para ejecutarse con `node --test`.

---

### Tarea 2: Implementación de la escala de actividad y agregación de minutos
* **Descripción:** Crear `heatmap-logic.js` con exportación dual (`window.HeatMapLogic` en navegador y `module.exports` en Node). Implementar las funciones puras `getActivityLevel(minutes)` y `aggregateMinutesByDate(sessions, todayStr)` con validación de fechas estrictas (`/^\d{4}-\d{2}-\d{2}$/`) y normalización de minutos inválidos a 0.
* **RF cubiertos:** [RF-4](file:///c:/Users/fabes/OneDrive/Documentos/StudyStreak/specs/001-heat-map/spec.md#L54-L64), [CL-1](file:///c:/Users/fabes/OneDrive/Documentos/StudyStreak/specs/001-heat-map/spec.md#L106), [CL-2](file:///c:/Users/fabes/OneDrive/Documentos/StudyStreak/specs/001-heat-map/spec.md#L107), [CL-3](file:///c:/Users/fabes/OneDrive/Documentos/StudyStreak/specs/001-heat-map/spec.md#L108), [CL-4](file:///c:/Users/fabes/OneDrive/Documentos/StudyStreak/specs/001-heat-map/spec.md#L109).
* [ ] **Hecho cuando:** Al ejecutar `node --test` en la consola, todas las pruebas de escala cromática y agregación de sesiones pasan al 100% en verde.

---

### Tarea 3: Tests unitarios para calendario semanal, ViewModel y rendimiento
* **Descripción:** Ampliar `test/heatmap.test.js` con pruebas para `getMondayOfWeek`, `formatDayTooltipText` y `buildHeatMapViewModel`. Cubrir generación de 12 y 4 semanas, etiquetas de meses, marcado de días futuros con `isFuture: true`, metadatos de accesibilidad (`tabIndex: -1` para futuros y `tabIndex: 0` para válidos), cruce de año y prueba sintética de rendimiento con 500 sesiones (< 50 ms).
* **RF cubiertos:** [RF-2](file:///c:/Users/fabes/OneDrive/Documentos/StudyStreak/specs/001-heat-map/spec.md#L36-L45), [RF-3](file:///c:/Users/fabes/OneDrive/Documentos/StudyStreak/specs/001-heat-map/spec.md#L46-L53), [RF-5](file:///c:/Users/fabes/OneDrive/Documentos/StudyStreak/specs/001-heat-map/spec.md#L65-L71), [RF-7](file:///c:/Users/fabes/OneDrive/Documentos/StudyStreak/specs/001-heat-map/spec.md#L78-L86), [CL-5](file:///c:/Users/fabes/OneDrive/Documentos/StudyStreak/specs/001-heat-map/spec.md#L110), [CL-6](file:///c:/Users/fabes/OneDrive/Documentos/StudyStreak/specs/001-heat-map/spec.md#L111), [RNF-2](file:///c:/Users/fabes/OneDrive/Documentos/StudyStreak/specs/001-heat-map/spec.md#L98), [RNF-4](file:///c:/Users/fabes/OneDrive/Documentos/StudyStreak/specs/001-heat-map/spec.md#L100).
* [ ] **Hecho cuando:** Los casos de prueba para el calendario, cruce de año, accesibilidad y rendimiento quedan definidos en `test/heatmap.test.js`.

---

### Tarea 4: Implementación de la generación de calendario y ViewModel del mapa
* **Descripción:** Implementar en `heatmap-logic.js` las funciones puras `getMondayOfWeek(date)`, `formatDayTooltipText(dateStr, minutes, isFuture)` y `buildHeatMapViewModel(sessions, today, weeksCount)` ensamblando semanas de lunes a domingo, etiquetas de meses, días futuros neutrales y metadatos accesibles.
* **RF cubiertos:** [RF-2](file:///c:/Users/fabes/OneDrive/Documentos/StudyStreak/specs/001-heat-map/spec.md#L36-L45), [RF-3](file:///c:/Users/fabes/OneDrive/Documentos/StudyStreak/specs/001-heat-map/spec.md#L46-L53), [RF-5](file:///c:/Users/fabes/OneDrive/Documentos/StudyStreak/specs/001-heat-map/spec.md#L65-L71), [RF-7](file:///c:/Users/fabes/OneDrive/Documentos/StudyStreak/specs/001-heat-map/spec.md#L78-L86), [CL-5](file:///c:/Users/fabes/OneDrive/Documentos/StudyStreak/specs/001-heat-map/spec.md#L110), [CL-6](file:///c:/Users/fabes/OneDrive/Documentos/StudyStreak/specs/001-heat-map/spec.md#L111), [RNF-2](file:///c:/Users/fabes/OneDrive/Documentos/StudyStreak/specs/001-heat-map/spec.md#L98), [RNF-4](file:///c:/Users/fabes/OneDrive/Documentos/StudyStreak/specs/001-heat-map/spec.md#L100).
* [ ] **Hecho cuando:** El comando `node --test` ejecuta y aprueba el 100% de la suite de pruebas unitarias en verde, verificando que el benchmark de rendimiento se completa en menos de 50 ms.

---

### Tarea 5: Estructura HTML y enlace de scripts
* **Descripción:** Modificar `index.html` para insertar la tarjeta semántica `#heatmap-section` inmediatamente al pie de `history-card` (dentro de `col-secondary`), incluyendo el encabezado `h2`, contenedor de meses, contenedor de días, contenedor de celdas, leyenda de intensidad (0 a 4) y el elemento flotante `#heatmap-tooltip`. Añadir la etiqueta `<script src="heatmap-logic.js"></script>` antes de `app.js`.
* **RF cubiertos:** [RF-1](file:///c:/Users/fabes/OneDrive/Documentos/StudyStreak/specs/001-heat-map/spec.md#L30-L35), [RF-2](file:///c:/Users/fabes/OneDrive/Documentos/StudyStreak/specs/001-heat-map/spec.md#L36-L45), [RF-6](file:///c:/Users/fabes/OneDrive/Documentos/StudyStreak/specs/001-heat-map/spec.md#L72-L77), [RF-7](file:///c:/Users/fabes/OneDrive/Documentos/StudyStreak/specs/001-heat-map/spec.md#L78-L86).
* [ ] **Hecho cuando:** Al abrir `index.html` en el navegador, la tarjeta del mapa de calor y la leyenda se muestran en el pie del historial y `window.HeatMapLogic` está disponible en la consola sin errores.

---

### Tarea 6: Estilos CSS de la cuadrícula, temas y leyenda
* **Descripción:** Añadir en `styles.css` la disposición con CSS Grid sincronizada mediante variables CSS (`--cell-size: 13px; --cell-gap: 3px;`), la gradación cromática de 5 niveles para modo claro y oscuro, el estilo neutral/inactivo para días futuros (`dashed border`), la leyenda horizontal inferior y el estilo base del tooltip flotante.
* **RF cubiertos:** [RF-2](file:///c:/Users/fabes/OneDrive/Documentos/StudyStreak/specs/001-heat-map/spec.md#L36-L45), [RF-4](file:///c:/Users/fabes/OneDrive/Documentos/StudyStreak/specs/001-heat-map/spec.md#L54-L64), [RF-5](file:///c:/Users/fabes/OneDrive/Documentos/StudyStreak/specs/001-heat-map/spec.md#L65-L71), [RF-6](file:///c:/Users/fabes/OneDrive/Documentos/StudyStreak/specs/001-heat-map/spec.md#L72-L77), [RNF-1](file:///c:/Users/fabes/OneDrive/Documentos/StudyStreak/specs/001-heat-map/spec.md#L97).
* [ ] **Hecho cuando:** Los días de la cuadrícula y las muestras de la leyenda reflejan los colores de contraste apropiados en modo claro y oscuro sin romper la alineación entre columnas de meses y semanas.

---

### Tarea 7: Renderizado del mapa y adaptación reactiva 12/4 semanas
* **Descripción:** Actualizar `app.js` para crear la función `renderHeatMap()`, invocándola en `render()`. Conectar `window.matchMedia('(max-width: 640px)')` para seleccionar 4 semanas en móvil y 12 en pantallas amplias, agregando un listener de evento `change` para re-renderizar reactivamente ante cambios de tamaño de pantalla o rotación sin recargar la página.
* **RF cubiertos:** [RF-1](file:///c:/Users/fabes/OneDrive/Documentos/StudyStreak/specs/001-heat-map/spec.md#L30-L35), [RF-3](file:///c:/Users/fabes/OneDrive/Documentos/StudyStreak/specs/001-heat-map/spec.md#L46-L53), [RF-5](file:///c:/Users/fabes/OneDrive/Documentos/StudyStreak/specs/001-heat-map/spec.md#L65-L71), [RF-8](file:///c:/Users/fabes/OneDrive/Documentos/StudyStreak/specs/001-heat-map/spec.md#L87-L93), [RNF-3](file:///c:/Users/fabes/OneDrive/Documentos/StudyStreak/specs/001-heat-map/spec.md#L99).
* [ ] **Hecho cuando:** La cuadrícula se dibuja con datos reales de `localStorage`, se actualiza instantáneamente al agregar/eliminar una sesión, y conmuta entre 12 y 4 semanas al redimensionar la ventana por debajo o por encima de 640 px sin recargar la página.

---

### Tarea 8: Interacciones, accesibilidad y contención del Tooltip
* **Descripción:** Conectar en `app.js` los controladores de eventos para el tooltip: activación en `mouseenter` y `focus` de teclado para celdas válidas; omisión total de foco y eventos en celdas futuras (`day.isFuture`); cálculo de posición contenida respecto al viewport (invirtiendo posición si desborda a la derecha o arriba); y cierre automático en móvil ante `click` fuera o eventos de desplazamiento (`scroll` / `touchmove`).
* **RF cubiertos:** [RF-5](file:///c:/Users/fabes/OneDrive/Documentos/StudyStreak/specs/001-heat-map/spec.md#L65-L71), [RF-7](file:///c:/Users/fabes/OneDrive/Documentos/StudyStreak/specs/001-heat-map/spec.md#L78-L86), [RNF-4](file:///c:/Users/fabes/OneDrive/Documentos/StudyStreak/specs/001-heat-map/spec.md#L100).
* [ ] **Hecho cuando:** Al pasar el cursor o navegar con Tab por las celdas se despliega el tooltip con día, fecha con año y minutos sin salirse de la pantalla, y en pantallas táctiles se cierra al tocar fuera o desplazarse.

---

### Tarea 9: Verificación integral con DevTools y cierre de Definition of Done
* **Descripción:** Realizar la verificación de extremo a extremo abriendo `index.html` directamente (protocolo `file://`), comprobando mediante Chrome/Chromium DevTools tanto en escritorio como en vista móvil (375 px de ancho): registro de sesiones, cálculo de niveles, navegación táctil y ausencia absoluta de errores o advertencias en la consola. Actualizar `MEMORY.md`.
* **RF cubiertos:** Todos ([RF-1 a RF-8](file:///c:/Users/fabes/OneDrive/Documentos/StudyStreak/specs/001-heat-map/spec.md#L30-L93), [RNF-1 a RNF-4](file:///c:/Users/fabes/OneDrive/Documentos/StudyStreak/specs/001-heat-map/spec.md#L95-L101), [CL-1 a CL-6](file:///c:/Users/fabes/OneDrive/Documentos/StudyStreak/specs/001-heat-map/spec.md#L104-L113)).
* [ ] **Hecho cuando:** La consola de DevTools permanece con 0 errores, la vista a 375 px se muestra sin desbordes horizontales, `node --test` reporta 100% de éxito y `MEMORY.md` refleja el estado final de la funcionalidad.
