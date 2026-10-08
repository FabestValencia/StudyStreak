# MEMORY.md — Diario de Estudio

Memoria del proyecto entre sesiones. Máximo ~50 líneas: resume o elimina lo que ya no aporte.

## Estado actual
- Base funcional completa: `index.html`, `styles.css` y `app.js`.
- Registro, edición (✏️) y eliminación (🗑️) de sesiones en `localStorage` (`diario_estudio_sesiones`).
- Contador de racha 🔥 y métrica de días estudiados en el mes local (`stats-month-days`).
- Panel de estadísticas en tiempo real y sugerencias en `<datalist>`.
- Indicador de meta diaria integrado en el Resumen con barra de progreso dinámica.
- Historial interactivo con botones de acción y confirmación preventiva de borrado.
- Rama activa: main

## Decisiones (y por qué)
- [2026-10] Días del mes con fecha local: Prefijo `AAAA-MM` local (`getFullYear()` y `getMonth() + 1`) agrupado con `Set` para contar días únicos activos sin desfases UTC.
- [2026-10] Meta diaria desacoplada en `localStorage`: Clave `diario_estudio_meta_diaria` preserva retrocompatibilidad del esquema de sesiones.
- [2026-10] Reutilización de formulario para edición: Evita modales pesados o desalineados en móviles.
- [2026-10] Confirmación previa al borrar: Uso de `window.confirm` para evitar pérdidas accidentales.
- [2026-10] Estadísticas derivadas en memoria: Se calculan dinámicamente al renderizar, manteniendo intacto el esquema de `localStorage`.
- [2026-10] Fechas en hora local: `getFullYear()`, `getMonth() + 1` y `getDate()` evitan desfases por conversiones a UTC.

## Aprendizajes y errores a evitar
- Múltiples sesiones el mismo día deben contar como un solo día en el cómputo mensual.
- No usar `toISOString()` ni `new Date("AAAA-MM-DD")` en comparaciones de calendario.
- Mantener retrocompatibilidad del objeto sesión `{ id, date, topic, minutes }`.

## Próximos pasos
- [ ] Filtro o buscador de sesiones en el historial por fecha o texto.
