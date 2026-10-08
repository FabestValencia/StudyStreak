# MEMORY.md — Diario de Estudio

Memoria del proyecto entre sesiones. Máximo ~50 líneas: resume o elimina lo que ya no aporte.

## Estado actual
- Base funcional completa: `index.html`, `styles.css` y `app.js`.
- Registro, edición (✏️) y eliminación (🗑️) de sesiones en `localStorage` (`diario_estudio_sesiones`).
- Contador de racha 🔥 en hora local con regla de racha viva.
- Panel de estadísticas en tiempo real y sugerencias en `<datalist>`.
- Indicador de meta diaria integrado en el Resumen con barra de progreso dinámica y badge de logro.
- Historial interactivo con botones de acción y confirmación preventiva de borrado.
- Rama activa: main

## Decisiones (y por qué)
- [2026-10] Meta diaria desacoplada en `localStorage`: Clave `diario_estudio_meta_diaria` (default 60 min) preserva intacto el esquema de sesiones y retrocompatibilidad.
- [2026-10] Edición ágil de meta: Diálogo directo (`window.prompt`) sin modales pesados, validando minutos enteros mayores a 0.
- [2026-10] Reutilización de formulario para edición: Evita modales pesados o desalineados en móviles; desplaza la vista al formulario y ofrece botón cancelar.
- [2026-10] Confirmación previa al borrar: Uso de `window.confirm` para evitar pérdidas accidentales de sesiones registradas.
- [2026-10] Estadísticas derivadas en memoria: Se calculan dinámicamente al renderizar, manteniendo intacto el esquema de `localStorage`.
- [2026-10] Datalist para temas: Mantiene texto libre y previene erratas comunes sugiriendo temas previos.
- [2026-10] Fechas en hora local: `getFullYear()`, `getMonth() + 1` y `getDate()` evitan desfases por conversiones a UTC.

## Aprendizajes y errores a evitar
- Si se elimina una sesión que actualmente se está editando, cancelar el modo de edición de inmediato.
- No alterar la estructura `{ id, date, topic, minutes }` para no romper registros anteriores.
- Evitar `toISOString()` o `new Date("AAAA-MM-DD")` en comparaciones de calendario.

## Próximos pasos
- [ ] Filtro o buscador de sesiones en el historial por fecha o texto.
