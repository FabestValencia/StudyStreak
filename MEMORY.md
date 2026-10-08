# MEMORY.md — Diario de Estudio

Memoria del proyecto entre sesiones. Máximo ~50 líneas: resume o elimina lo que ya no aporte.

## Estado actual
- Base funcional completa con tres archivos: `index.html`, `styles.css` y `app.js`.
- Registro de sesiones con persistencia en `localStorage` (`diario_estudio_sesiones`).
- Contador de racha con 🔥 funcionando en hora local y regla de racha viva.
- Historial ordenado cronológicamente (más reciente primero).
- Rama activa: main

## Decisiones (y por qué)
- [2026-10] Fechas en hora local (`app.js`): Uso de `getFullYear()`, `getMonth() + 1` y `getDate()` para evitar desfases de día causados por conversiones a UTC.
- [2026-10] Regla de racha viva: Si ayer se estudió y hoy todavía no, la racha no se corta para permitir estudiar y registrar durante el día en curso.
- [2026-10] Formato de fecha visual `DD/MM/AAAA`: Conversión por división de cadenas para no reinterpretar zonas horarias en la vista.
- [2026-10] Arquitectura Zero-build: Sin dependencias ni compiladores para que la aplicación funcione abriendo directamente `index.html` (`file://`).

## Aprendizajes y errores a evitar
- No usar `toISOString()` ni `new Date("AAAA-MM-DD")` en comparaciones de calendario.
- Mantener retrocompatibilidad del objeto sesión (`{ id, date, topic, minutes }`) en `localStorage`.
- No introducir dependencias o módulos ES que impidan abrir la web con doble clic.

## Próximos pasos
- [ ] Validar experiencia de usuario y visualización en navegadores móviles.
- [ ] Planificar futuras mejoras (ej. opción para eliminar o editar sesiones, metas semanales o estadísticas adicionales).
