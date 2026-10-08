# AGENTS.md — Diario de Estudio

> Aplicación web estática y pedagógica para registrar sesiones de estudio diarias, diseñada para estudiantes y autodidactas con el fin de fomentar la constancia mediante el seguimiento visual de su racha de días consecutivos.

## 1. Stack y entorno

* **Tecnologías y versiones clave:** HTML5 semántico, CSS3 moderno (Variables CSS, Flexbox, diseño responsive), JavaScript (ES6+ Vanilla sin dependencias ni compilador). Persistencia local en navegador con Web Storage API (`localStorage`).
* **Estructura relevante:**
  * `index.html`: Estructura semántica, vista destacada de racha, formulario de registro e historial.
  * `styles.css`: Sistema de diseño, paleta de colores, diseño responsive y estados visuales.
  * `app.js`: Manejo de fechas en hora local, lógica de cálculo de racha, persistencia y renderizado del DOM.
  * `MEMORY.md`: Registro de memoria viva y decisiones de desarrollo del proyecto.
  * `docs/constitution.md`: Principios innegociables del proyecto.
* **Configuración local:** Sin instalación ni dependencias previas. Abrir directamente `index.html` en el navegador (doble clic o mediante protocolo `file://`).

## 2. Comandos

Comandos exactos y reproducibles:

-Tests: `node --test`

* **Dev:** Abrir en el navegador predeterminado (PowerShell en Windows):

  ```powershell
  Start-Process "index.html"
  ```

  *(Opcional con servidor local si se dispone de Python: `python -m http.server 8000`)*
* **Test:** Verificación manual en navegador (inspeccionar consola en DevTools y validar flujo de formulario, persistencia tras recargar y cálculo de racha).
* **Lint & Fix:** No aplica herramienta de linting externa. Mantener consistencia manual de formato y sintaxis JavaScript estándar.
* **Build / Typecheck:** No aplica (proyecto sin paso de build; JavaScript interpretado directamente por el navegador).

## Reglas

-Lee `docs/constitution.md` y la spec activa (`specs/NNN-*/`) antes de tocar código.

## 3. Convenciones y patrones

* **Estilo de código:** Naming en camelCase para variables y funciones (`getLocalDateString`, `calculateStreak`), kebab-case para clases CSS e IDs del DOM (`streak-card`, `session-form`), MAYÚSCULAS_CON_GUION para constantes (`STORAGE_KEY`). Idioma obligatorio: español para interfaz, comentarios y nombres de funciones del dominio.
* **Patrón de referencia:** `app.js` (arquitectura modular dividida en utilidades de fecha local, acceso a `localStorage`, lógica pura de cálculo de racha, renderizado del DOM y listeners de eventos).
* **Commits y PRs:** Formato Conventional Commits (`feat:`, `fix:`, `refactor:`, `docs:`, `chore:`).

## 4. Reglas de dominio / trampas conocidas

* **Gestión de fechas (Crítico):** Usar siempre la fecha local del usuario (`getFullYear()`, `getMonth() + 1`, `getDate()`). Prohibido usar `toISOString()` o `new Date("AAAA-MM-DD")` para comparaciones de días, ya que interpretan en UTC y provocan desfases de día.
* **Regla de racha viva:** La racha son días consecutivos con sesiones que terminan hoy. Si hoy aún no se ha registrado ninguna sesión pero ayer sí, la racha sigue viva (no se rompe hasta que culmine el día sin estudiar). Si no se estudió ni hoy ni ayer, la racha es `0`.
* **Múltiples sesiones el mismo día:** Varias sesiones en la misma fecha cuentan como un único día para la racha. En el historial se listan todas, ordenadas de más reciente a más antigua desempatando por momento de registro (`id` timestamp descendente).
* **Compatibilidad de datos:** Clave `localStorage`: `diario_estudio_sesiones`. Si se modifica la estructura de los objetos de sesión (`{ id, date, topic, minutes }`), debe mantenerse retrocompatibilidad para no perder sesiones previas.

## 5. Forma de trabajar

* **Planificación previa:** Explicar el enfoque paso a paso antes de editar si el cambio afecta más de 2 archivos o lógica central.
* **Cambios quirúrgicos:** Modificar únicamente las líneas necesarias; no reescribir archivos enteros ni formatear código ajeno a la tarea.
* **Resumen final:** Explicar concisamente qué se modificó y por qué al terminar cada tarea.

## 6. Memoria

* Al empezar, lee `MEMORY.md` para conocer el estado del proyecto y las decisiones tomadas.
* Al terminar una tarea, actualízalo: estado actual, decisiones importantes (con su porqué) y errores a evitar.
* Mantenlo breve (máximo ~50 líneas): resume o elimina lo que ya no aporte.
* Si algo se convierte en una regla permanente, propón moverlo a `AGENTS.md` en lugar de dejarlo en la memoria.
* No guardes nunca datos sensibles (claves, tokens, datos personales).

## 7. Límites

* :white_check_mark: **Siempre (sin preguntar):**
  * Actualizar `MEMORY.md` al finalizar cada tarea.
  * Verificar en navegador que la funcionalidad y la consola permanezcan limpias antes de cerrar el cambio.
  * Refactorizar funciones internas sin romper contratos públicos existentes ni el formato de datos en `localStorage`.
  * Mantener todos los textos de la interfaz en español.
* :warning: **Pregunta antes:**
  * Instalar dependencias, empaquetadores (npm, Vite) o librerías externas.
  * Modificar el esquema de datos guardado en `localStorage`.
  * Crear estructuras de directorios nuevas o archivos adicionales.
* :no_entry_sign: **Nunca:**
  * Añadir frameworks (React, Vue, Angular) o pasos de build obligatorios.
  * Modificar variables de entorno, secretos o tokens.
  * Usar conversiones a UTC para cálculo de fechas o rachas.
  * Guardar información confidencial dentro de `MEMORY.md`.
  * Hacer push directo o modificaciones en ramas protegidas (`main`, `production`).

## 8. Verificación (Definition of Done)

Antes de dar cualquier tarea por completada:

1. El proyecto funciona abriendo `index.html` con doble clic (`file://`) sin errores en la consola del navegador.
2. Los flujos de usuario (registro de sesión, visualización de historial y cálculo de racha) funcionan correctamente.
3. El diseño se mantiene limpio, accesible y responsivo en pantallas móviles y de escritorio.
4. `MEMORY.md` quedó actualizado con el nuevo estado.
