# MEMORY.md — Diario de Estudio

Memoria del proyecto entre sesiones. Máximo ~50 líneas: resume o elimina lo que ya no aporte.

## Estado actual
- Rediseño UI/UX completo: Estética Deep Focus / Hearth Glow con dashboard 2 columnas y móvil responsivo.
- Tipografía Plus Jakarta Sans y JetBrains Mono para datos numéricos y fechas.
- Ergonomía UX: Botones rápidos (+15, +30, +45, +60 min), filtro en historial y badge de edición.
- Soporte automático para Modo Oscuro (`prefers-color-scheme: dark`) y reducción de movimiento.
- Lógica intacta: cálculo de racha viva en hora local, persistencia y retrocompatibilidad total.
- Rama activa: main

## Decisiones (y por qué)
- [2026-10] Tokens CSS con tema dual: Cuida la vista en sesiones de estudio nocturnas sin dependencias externas.
- [2026-10] Presets de minutos rápidos: Reducen fricción al registrar sesiones con 1 clic.
- [2026-10] Filtro reactivo en el historial: Búsqueda instantánea en el DOM preservando `localStorage`.
- [2026-10] Fechas en hora local: `getFullYear()`, `getMonth() + 1` y `getDate()` evitan desfases por conversiones a UTC.
- [2026-10] Meta diaria desacoplada en `localStorage`: Clave `diario_estudio_meta_diaria` preserva retrocompatibilidad.

## Aprendizajes y errores a evitar
- Múltiples sesiones el mismo día deben contar como un solo día en el cómputo mensual.
- No usar `toISOString()` ni `new Date("AAAA-MM-DD")` en comparaciones de calendario.
- Mantener retrocompatibilidad del objeto sesión `{ id, date, topic, minutes }`.

## Próximos pasos
- [ ] Exportar / importar datos de sesiones en formato JSON para copias de seguridad.
