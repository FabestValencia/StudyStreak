# MEMORY.md — Diario de Estudio

Memoria del proyecto entre sesiones. Máximo ~50 líneas: resume o elimina lo que ya no aporte.

## Estado actual
- Base funcional completa: `index.html`, `styles.css` y `app.js`.
- Registro de sesiones persistiendo en `localStorage` (`diario_estudio_sesiones`).
- Contador de racha 🔥 en hora local con regla de racha viva.
- Panel de estadísticas en tiempo real: tiempo total, tiempo hoy, tema principal y sesiones totales.
- Sugerencias automáticas de temas previos mediante `<datalist>` sin perder libertad de texto.
- Historial ordenado cronológicamente (más reciente primero).
- Rama activa: main

## Decisiones (y por qué)
- [2026-10] Estadísticas derivadas en memoria: Se calculan dinámicamente al renderizar, manteniendo intacto el esquema de `localStorage`.
- [2026-10] Agrupación de temas insensible a mayúsculas: Normaliza en minúsculas al calcular el tema líder pero muestra el nombre legible original.
- [2026-10] Datalist para temas: Permite texto completamente libre y a la vez sugiere temas previos para evitar duplicados accidentales.
- [2026-10] Fechas en hora local: `getFullYear()`, `getMonth() + 1` y `getDate()` evitan desfases por conversiones automáticas a UTC.
- [2026-10] Arquitectura Zero-build: Sin dependencias ni librerías para ejecución directa con doble clic (`file://`).

## Aprendizajes y errores a evitar
- No usar `toISOString()` ni `new Date("AAAA-MM-DD")` en comparaciones de calendario.
- Mantener retrocompatibilidad del objeto sesión `{ id, date, topic, minutes }`.
- No restringir el campo tema a un select rígido; `<datalist>` otorga libertad y ayuda a la consistencia.

## Próximos pasos
- [ ] Implementar opción para editar y eliminar sesiones erróneas del historial.
- [ ] Posibilidad de definir una meta diaria o semanal con indicador visual.
