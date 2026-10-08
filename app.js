// ==========================================
// Diario de Estudio - Lógica de la aplicación
// ==========================================

// Clave para guardar en el almacenamiento del navegador (localStorage)
const STORAGE_KEY = 'diario_estudio_sesiones';

// Referencias a los elementos del DOM (HTML)
const sessionForm = document.getElementById('session-form');
const dateInput = document.getElementById('date');
const topicInput = document.getElementById('topic');
const minutesInput = document.getElementById('minutes');
const streakCount = document.getElementById('streak-count');
const streakLabel = document.getElementById('streak-label');
const sessionsList = document.getElementById('sessions-list');
const emptyState = document.getElementById('empty-state');

// ==========================================
// Utilidades de Fechas (Hora local del usuario)
// ==========================================

/**
 * Devuelve una fecha en formato local 'AAAA-MM-DD' (YYYY-MM-DD).
 * Usamos los métodos locales (getFullYear, getMonth, getDate) para evitar desfases de UTC.
 */
function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Devuelve la fecha local de hace N días en formato 'AAAA-MM-DD'.
 */
function getPastDateString(daysAgo) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return getLocalDateString(date);
}

/**
 * Formatea 'AAAA-MM-DD' a 'DD/MM/AAAA' para mostrarlo amigablemente.
 */
function formatDateDisplay(dateString) {
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
}

// ==========================================
// Almacenamiento (localStorage)
// ==========================================

/**
 * Obtiene la lista de sesiones guardadas en localStorage.
 */
function getStoredSessions() {
  const rawData = localStorage.getItem(STORAGE_KEY);
  return rawData ? JSON.parse(rawData) : [];
}

/**
 * Guarda la lista de sesiones en localStorage.
 */
function saveSessions(sessions) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

// ==========================================
// Cálculo de la Racha
// ==========================================

/**
 * Calcula los días consecutivos estudiados:
 * - Un día cuenta si tiene al menos una sesión.
 * - Si hoy aún no se ha estudiado pero ayer sí, la racha sigue viva.
 * - Si no se estudió hoy ni ayer, la racha es 0.
 */
function calculateStreak(sessions) {
  if (!sessions || sessions.length === 0) {
    return 0;
  }

  // Guardamos las fechas únicas estudiadas en un Set para búsqueda rápida
  const studiedDates = new Set(sessions.map((session) => session.date));

  const today = getPastDateString(0);
  const yesterday = getPastDateString(1);

  const studiedToday = studiedDates.has(today);
  const studiedYesterday = studiedDates.has(yesterday);

  // Si no se estudió hoy ni ayer, no hay racha activa
  if (!studiedToday && !studiedYesterday) {
    return 0;
  }

  let streak = 0;
  // Si estudiamos hoy, empezamos a contar desde hoy (día 0).
  // Si hoy no hemos estudiado pero ayer sí, empezamos a contar desde ayer (día 1).
  let dayIndex = studiedToday ? 0 : 1;

  while (studiedDates.has(getPastDateString(dayIndex))) {
    streak++;
    dayIndex++;
  }

  return streak;
}

// ==========================================
// Renderizado de la Interfaz (UI)
// ==========================================

/**
 * Actualiza la vista completa: contador de racha y lista de sesiones.
 */
function render() {
  const sessions = getStoredSessions();

  // 1. Calcular y actualizar la racha
  const streak = calculateStreak(sessions);
  streakCount.textContent = streak;
  streakLabel.textContent = streak === 1 ? 'día de racha' : 'días de racha';

  // 2. Ordenar las sesiones: de la más reciente a la más antigua
  const sortedSessions = [...sessions].sort((a, b) => {
    // Primero comparamos la fecha de la sesión (descendente)
    if (a.date !== b.date) {
      return b.date.localeCompare(a.date);
    }
    // Si la fecha es la misma, la registrada más recientemente va primero
    return b.id - a.id;
  });

  // 3. Renderizar la lista
  sessionsList.innerHTML = '';

  if (sortedSessions.length === 0) {
    emptyState.style.display = 'block';
  } else {
    emptyState.style.display = 'none';

    sortedSessions.forEach((session) => {
      const li = document.createElement('li');
      li.className = 'session-item';

      const infoDiv = document.createElement('div');
      infoDiv.className = 'session-info';

      const topicSpan = document.createElement('span');
      topicSpan.className = 'session-topic';
      topicSpan.textContent = session.topic;

      const dateSpan = document.createElement('span');
      dateSpan.className = 'session-date';
      dateSpan.textContent = formatDateDisplay(session.date);

      infoDiv.appendChild(topicSpan);
      infoDiv.appendChild(dateSpan);

      const minutesSpan = document.createElement('span');
      minutesSpan.className = 'session-minutes';
      minutesSpan.textContent = `${session.minutes} min`;

      li.appendChild(infoDiv);
      li.appendChild(minutesSpan);

      sessionsList.appendChild(li);
    });
  }
}

// ==========================================
// Eventos y Inicialización
// ==========================================

// Al enviar el formulario
sessionForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const selectedDate = dateInput.value;
  const topic = topicInput.value.trim();
  const minutes = parseInt(minutesInput.value, 10);

  // Validación básica
  if (!selectedDate || !topic || isNaN(minutes) || minutes <= 0) {
    return;
  }

  const newSession = {
    id: Date.now(),
    date: selectedDate,
    topic: topic,
    minutes: minutes,
  };

  const sessions = getStoredSessions();
  sessions.push(newSession);
  saveSessions(sessions);

  // Limpiar campos de texto y minutos
  topicInput.value = '';
  minutesInput.value = '';

  // Restablecer la fecha por defecto a hoy
  dateInput.value = getLocalDateString();

  // Actualizar la pantalla
  render();
});

// Inicialización cuando carga la página
function init() {
  // Establecer fecha por defecto a hoy (hora local)
  dateInput.value = getLocalDateString();

  // Render inicial de datos existentes
  render();
}

init();
