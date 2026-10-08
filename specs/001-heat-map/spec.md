# Especificación 001: Mapa de Calor de Actividad de Estudio (Heat Map)

## 1. Contexto y objetivo

El Diario de Estudio busca reforzar la constancia y el hábito diario mediante refuerzos visuales claros. Actualmente, el estudiante cuenta con un contador numérico de racha activa y estadísticas acumuladas, pero carece de una perspectiva panorámica y temporal de su regularidad a lo largo de las semanas.

El objetivo de esta funcionalidad es proporcionar una representación gráfica de la constancia de estudio en forma de cuadrícula de calendario semanal (estilo mapa de calor), donde cada día se represente mediante una celda cuyo nivel de intensidad cromática refleje el tiempo invertido en esa fecha. Esta cuadrícula se posicionará al pie del historial de sesiones, ofreciendo un cierre visual motivador del progreso acumulado.

---

## 2. Usuarios y personas

* **Estudiante o autodidacta principiante:** Necesita una confirmación visual gratificante de que su esfuerzo diario está acumulando valor a lo largo de las semanas, animándolo a no dejar celdas vacías.
* **Estudiante avanzado o constante:** Desea evaluar visualmente la distribución de su carga de estudio semanal y detectar días con baja dedicación para equilibrar su rutina.

---

## 3. Historias de usuario

* **HU-1:** Como estudiante, quiero visualizar al pie de mi historial una cuadrícula con los días estudiados en las últimas semanas para comprender mi constancia y ritmo semanal de un vistazo.
* **HU-2:** Como estudiante, quiero que cada celda refleje mediante su intensidad de color el tiempo estudiado para distinguir días ligeros frente a sesiones profundas.
* **HU-3:** Como estudiante, quiero ver etiquetas de los días de la semana y de los meses junto a la cuadrícula para orientarme temporalmente sin esfuerzo.
* **HU-4:** Como estudiante, quiero consultar la fecha completa (con año) y los minutos exactos al interactuar con una celda para conocer el detalle de cualquier día.
* **HU-5:** Como estudiante en dispositivo móvil, quiero que el mapa adapte sus semanas visibles al ancho de mi pantalla y reaccione a rotaciones sin necesidad de recargar la página.

---

## 4. Requisitos funcionales (RF)

### RF-1: Ubicación en la interfaz

El mapa de calor debe integrarse como una sección visible situada al pie del historial de sesiones de estudio.

* **Criterios de aceptación (EARS):**
  * **Ubícuo:** El sistema DEBE posicionar el mapa de calor inmediatamente debajo de la lista del historial de sesiones.

### RF-2: Generación, alineación y etiquetas del calendario semanal

La cuadrícula debe organizar los días en columnas semanales consecutivas que inician en lunes y terminan en domingo, mostrando etiquetas identificativas en sus ejes.

* **Criterios de aceptación (EARS):**
  * **Ubícuo:** El sistema DEBE ordenar las filas semanales de lunes (primera fila) a domingo (séptima fila).
  * **Ubícuo:** El sistema DEBE situar la semana corriente que contiene el día de hoy al final de la secuencia temporal.
  * **Ubícuo:** El sistema DEBE mostrar etiquetas visuales para identificar los días de la semana en el eje vertical (ej. Lun, Mié, Vie).
  * **Ubícuo:** El sistema DEBE mostrar etiquetas con los nombres de los meses en el eje horizontal sobre las columnas correspondientes.
  * **Basado en eventos:** CUANDO se genera la cuadrícula, el sistema DEBE incluir todos los días de las semanas del rango, tengan o no sesiones registradas.

### RF-3: Rango temporal visible y adaptación reactiva

La cantidad de semanas visibles en la cuadrícula debe adaptarse dinámicamente al tamaño del dispositivo sin recargar la página.

* **Criterios de aceptación (EARS):**
  * **Estado:** MIENTRAS la aplicación se visualice en pantallas amplias (escritorio y tabletas), el sistema DEBE mostrar las últimas 12 semanas consecutivas.
  * **Estado:** MIENTRAS la aplicación se visualice en pantallas móviles estrechas, el sistema DEBE mostrar las últimas 4 semanas consecutivas.
  * **Basado en eventos:** CUANDO el usuario cambie el tamaño de la ventana o rote la orientación del dispositivo, el sistema DEBE ajustar reactivamente el número de semanas mostradas sin recargar la página.

### RF-4: Niveles de intensidad cromática por minutos estudiados

Cada celda diaria debe reflejar el total acumulado de minutos válidos estudiados en esa fecha mediante una escala de cinco niveles de actividad más un estado especial para fechas futuras.

* **Criterios de aceptación (EARS):**
  * **Condicional:** SI un día no registra tiempo de estudio (0 minutos), el sistema DEBE asignar el nivel de intensidad 0 (sin actividad / celda vacía).
  * **Condicional:** SI la suma de minutos de un día está entre 1 y 30 minutos inclusive, el sistema DEBE asignar el nivel de intensidad 1 (actividad suave).
  * **Condicional:** SI la suma de minutos de un día está entre 31 y 60 minutos inclusive, el sistema DEBE asignar el nivel de intensidad 2 (actividad moderada).
  * **Condicional:** SI la suma de minutos de un día está entre 61 y 120 minutos inclusive, el sistema DEBE asignar el nivel de intensidad 3 (actividad alta).
  * **Condicional:** SI la suma de minutos de un día supera los 120 minutos, el sistema DEBE asignar el nivel de intensidad 4 (actividad intensa).
  * **Basado en eventos:** CUANDO existan múltiples sesiones en la misma fecha, el sistema DEBE sumar todos sus minutos antes de calcular el nivel.

### RF-5: Estado visual de días futuros en la semana actual

Los días de la semana corriente que sean posteriores a la fecha local actual deben tener un tratamiento visual y de interacción diferenciado.

* **Criterios de aceptación (EARS):**
  * **Condicional:** SI un día del calendario es posterior a la fecha local de hoy, el sistema DEBE representarlo con un estado visual neutral/inactivo diferente del nivel 0.
  * **Condicional:** SI un día es posterior a hoy, el sistema NO DEBE permitir foco por teclado, pulsación ni mostrar información emergente sobre él.

### RF-6: Leyenda explicativa de niveles

La interfaz debe incorporar una leyenda visual que muestre la progresión de la escala.

* **Criterios de aceptación (EARS):**
  * **Ubícuo:** El sistema DEBE mostrar una leyenda al pie de la cuadrícula con 5 muestras de color, comenzando en el nivel 0 identificado como "Menos" y culminando en el nivel 4 identificado como "Más".

### RF-7: Información contextual accesible (Tooltip / Detalles del día)

Al interactuar con una celda válida del mapa, el estudiante debe consultar la fecha y los minutos exactos sin desbordamientos de pantalla.

* **Criterios de aceptación (EARS):**
  * **Basado en eventos:** CUANDO el usuario sitúa el cursor o pulsa sobre una celda válida (pasada o presente), el sistema DEBE mostrar un mensaje emergente que indique el día de la semana, la fecha completa incluyendo el año y la cantidad de minutos (ejemplo: "Lunes 7 de octubre de 2026: 45 min").
  * **Condicional:** SI la celda no tiene minutos de estudio, el mensaje DEBE reflejar "0 min" (ejemplo: "Lunes 7 de octubre de 2026: 0 min").
  * **Basado en eventos:** CUANDO el usuario pulse fuera de la celda o pulse otra celda en dispositivos táctiles, el sistema DEBE cerrar el mensaje emergente previo.
  * **Ubícuo:** El sistema DEBE aplicar márgenes de contención para que el mensaje emergente no se desborde fuera de los límites visibles de la pantalla.

### RF-8: Actualización reactiva inmediata

Cualquier alteración en el historial de sesiones debe sincronizarse de inmediato en el mapa de calor sin recargar la página.

* **Criterios de aceptación (EARS):**
  * **Basado en eventos:** CUANDO el usuario guarde, modifique o elimine una sesión, el sistema DEBE recalcular los totales diarios y actualizar la apariencia de la cuadrícula de forma inmediata.

---

## 5. Requisitos no funcionales

* **RNF-1 (Usabilidad y legibilidad):** El contraste visual entre los niveles de intensidad y el estado de días futuros debe ser nítido tanto en modo claro como en modo oscuro.
* **RNF-2 (Rendimiento perceptible):** El cálculo y renderizado de la cuadrícula debe completarse en menos de 50 ms.
* **RNF-3 (Respeto de fechas locales):** Todos los cálculos de semanas y calendario deben realizarse estrictamente en la hora local del usuario ("hoy" como fecha de referencia).
* **RNF-4 (Accesibilidad):** Toda celda válida debe ser navegable mediante teclado (Tab) y exponer texto accesible para lectores de pantalla.

---

## 6. Casos límite

* **CL-1 (Historial completamente vacío):** La cuadrícula se genera completa con todas sus celdas válidas en nivel 0, sin errores visuales.
* **CL-2 (Sesiones con fechas futuras erróneas):** Si existen sesiones guardadas con fecha posterior a hoy, se descartan del cómputo del mapa de calor y no pintan los días futuros.
* **CL-3 (Datos atípicos o corruptos en sesiones):** Sesiones con minutos nulos, no numéricos o negativos se contabilizan como 0 minutos (nivel 0).
* **CL-4 (Múltiples sesiones el mismo día):** Se acumulan todas las duraciones en una única suma diaria antes de clasificar el nivel de intensidad.
* **CL-5 (Semanas con cambio de año):** El cálculo de semanas consecutivas y el tooltip con año explícito resuelven de forma transparente el cruce de años (ej. diciembre a enero).
* **CL-6 (Cambios de horario de verano/invierno):** Las semanas se componen siempre de 7 días naturales exactos sin desfasar filas ni columnas.

---

## 7. Fuera de alcance

* Filtrado del historial al hacer clic en una celda de la cuadrícula.
* Selección personalizada de rangos anuales o mensuales.
* Exportación de la cuadrícula como archivo de imagen (PNG/SVG).
* Desglose por temas específicos dentro del tooltip.
* Paletas de colores personalizables por el usuario.

---

## 8. Criterios de finalización (Definition of Done de la especificación)

1. El mapa de calor se sitúa al pie del historial de sesiones.
2. La cuadrícula inicia cada semana en lunes y culmina en domingo, con etiquetas para días (eje vertical) y meses (eje horizontal).
3. Muestra 12 semanas en escritorio y se adapta reactivamente a 4 semanas en móvil ante cambios de pantalla o rotación sin recargar la página.
4. Los 5 niveles de color reflejan fielmente los rangos (0 min, 1-30 min, 31-60 min, 61-120 min, >120 min) y la leyenda inicia en nivel 0 ("Menos") hasta nivel 4 ("Más").
5. Los días futuros de la semana actual se muestran en un estado visual neutral, sin foco ni tooltip.
6. El tooltip incluye el año, no se desborda de la pantalla y se cierra al pulsar fuera en móvil.
7. Sesiones futuras o datos corruptos se gestionan según las reglas de descarte y nivel 0.
8. La actualización ante cambios en el formulario o historial es instantánea.

---

## 9. Dudas abiertas

* *(Ninguna. Todas las decisiones han sido formalizadas en esta versión).*
