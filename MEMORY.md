# MEMORY.md — Diario de Estudio

Memoria del proyecto entre sesiones. Máximo ~50 líneas: resume o elimina lo que ya no aporte.

## Estado actual

- Rediseño UI/UX completo: Estética Deep Focus / Hearth Glow con dashboard 2 columnas y móvil responsivo.
- Tipografía Plus Jakarta Sans y JetBrains Mono para datos numéricos y fechas.
- Ergonomía UX: Botones rápidos (+15, +30, +45, +60 min), filtro en historial y badge de edición.
- Soporte automático para Modo Oscuro (`prefers-color-scheme: dark`) y reducción de movimiento.
- Métrica "Mejor racha" 🏆 añadida al resumen: calcula el récord histórico de días consecutivos con fechas locales (`calculateBestStreak`).
- Eliminado `novalidate` en formulario para habilitar validación HTML5 nativa y añadido `aria-valuenow` dinámico a la barra de progreso.
- Eliminados todos los estilos inline (`style=...`) en `index.html`, trasladando los estados iniciales a `styles.css`.
- Verificación funcional con Chromium DevTools: 3 sesiones consecutivas (hoy, ayer, anteayer) validadas con racha en 3, récord en 3 y 0 errores en consola.
- Constitución del proyecto formalizada en `docs/constitution.md` (6 principios innegociables).
- Plan técnico y tareas listas: `specs/001-heat-map/spec.md`, `plan.md` y `tasks.md` (9 tareas atómicas ordenadas por dependencia con TDD, trazabilidad completa de RFs).
- Lógica intacta: cálculo de racha viva en hora local, persistencia y retrocompatibilidad total.
- Rama activa: main

## Decisiones (y por qué)

- [2026-10] Mapa de calor en spec 001: Lunes a domingo, escala fija de 4 niveles y vista adaptativa (12 semanas en escritorio, 4 en móvil).
- [2026-10] Mejor racha con aritmética local: `new Date(y, m-1, d)` con `setDate(getDate() + 1)` para evitar desajustes por cambio de horario o UTC.
- [2026-10] Cuadrícula simétrica 2x3: 6 tarjetas de métricas en el resumen visualmente equilibradas.
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
