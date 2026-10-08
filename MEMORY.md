# MEMORY.md — Diario de Estudio

Memoria del proyecto entre sesiones. Máximo ~50 líneas: resume o elimina lo que ya no aporte.

## Estado actual
- Base funcional completa: `index.html`, `styles.css` y `app.js`.
- Registro, edición (✏️) y eliminación (🗑️) de sesiones en `localStorage` (`diario_estudio_sesiones`).
- Contador de racha 🔥 en hora local con regla de racha viva.
- Panel de estadísticas en tiempo real y sugerencias en `<datalist>`.
- Historial interactivo con botones de acción y confirmación preventiva de borrado.
- Rama activa: main

## Decisiones (y por qué)
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
- [ ] Posibilidad de definir una meta diaria o semanal en minutos con barra de progreso.
- [ ] Filtro o buscador de sesiones en el historial por fecha o texto.
