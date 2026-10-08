// ==========================================
// Diario de Estudio - Lógica de la aplicación
// ==========================================

// Clave para guardar en el almacenamiento del navegador (localStorage)
const STORAGE_KEY = 'diario_estudio_sesiones';
const GOAL_STORAGE_KEY = 'diario_estudio_meta_diaria';
const DEFAULT_DAILY_GOAL = 60;

// Referencias a los elementos del DOM (HTML)
const sessionForm = document.getElementById('session-form');
const dateInput = document.getElementById('date');
const topicInput = document.getElementById('topic');
const minutesInput = document.getElementById('minutes');
const streakCount = document.getElementById('streak-count');
const streakLabel = document.getElementById('streak-label');
const sessionsList = document.getElementById('sessions-list');
const emptyState = document.getElementById('empty-state');

// Referencias a elementos de estadísticas y sugerencias
const statsTotalTime = document.getElementById('stats-total-time');
const statsTodayTime = document.getElementById('stats-today-time');
const statsMonthDays = document.getElementById('stats-month-days');
const statsBestStreak = document.getElementById('stats-best-streak');
const statsTopTopic = document.getElementById('stats-top-topic');
const statsTotalSessions = document.getElementById('stats-total-sessions');
const topicsList = document.getElementById('topics-list');

// Referencias para la meta diaria
const goalProgressTrack = document.getElementById('goal-progress-track');
const goalProgressText = document.getElementById('goal-progress-text');
const goalProgressFill = document.getElementById('goal-progress-fill');
const goalBadge = document.getElementById('goal-badge');
const editGoalBtn = document.getElementById('edit-goal-btn');

// Referencias para edición y acciones del formulario
const formSection = document.getElementById('form-section');
const formTitle = document.getElementById('form-title');
const submitBtn = document.getElementById('submit-btn');
const cancelEditBtn = document.getElementById('cancel-edit-btn');
const editIndicator = document.getElementById('edit-indicator');

// Nuevas referencias de UI y UX
const streakStatus = document.getElementById('streak-status');
const streakHeaderText = document.getElementById('streak-header-text');
const historySearch = document.getElementById('history-search');
const historyCount = document.getElementById('history-count');
const quickMinButtons = document.querySelectorAll('.quick-min-btn');

// Estado de la sesión actualmente en edición (null si es nueva)
let editingSessionId = null;
// Estado del filtro de búsqueda en el historial
let searchQuery = '';

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

/**
 * Obtiene la meta diaria en minutos guardada en localStorage.
 * Si no existe o no es válida, devuelve el valor por defecto.
 */
function getStoredDailyGoal() {
  const rawGoal = localStorage.getItem(GOAL_STORAGE_KEY);
  if (!rawGoal) {
    return DEFAULT_DAILY_GOAL;
  }
  const parsed = parseInt(rawGoal, 10);
  return isNaN(parsed) || parsed <= 0 ? DEFAULT_DAILY_GOAL : parsed;
}

/**
 * Guarda la meta diaria en minutos en localStorage.
 */
function saveDailyGoal(minutes) {
  localStorage.setItem(GOAL_STORAGE_KEY, String(minutes));
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

/**
 * Calcula la mejor racha histórica de días consecutivos estudiados:
 * - Encuentra la secuencia consecutiva más larga en todo el historial.
 * - Respeta las fechas locales y aritmética mediante setDate() sin conversiones UTC.
 */
function calculateBestStreak(sessions) {
  if (!sessions || sessions.length === 0) {
    return 0;
  }

  // Fechas únicas ordenadas cronológicamente ('AAAA-MM-DD' se ordena lexicográficamente)
  const uniqueDates = Array.from(new Set(sessions.map((session) => session.date))).sort();
  if (uniqueDates.length === 0) {
    return 0;
  }

  let maxStreak = 1;
  let currentStreak = 1;

  for (let i = 1; i < uniqueDates.length; i++) {
    const prevParts = uniqueDates[i - 1].split('-').map(Number);
    // Parseo local de fecha: new Date(year, month - 1, day)
    const prevDate = new Date(prevParts[0], prevParts[1] - 1, prevParts[2]);
    prevDate.setDate(prevDate.getDate() + 1);
    const expectedDateStr = getLocalDateString(prevDate);

    if (uniqueDates[i] === expectedDateStr) {
      currentStreak++;
    } else {
      currentStreak = 1;
    }

    if (currentStreak > maxStreak) {
      maxStreak = currentStreak;
    }
  }

  // La mejor racha debe ser al menos igual a la racha activa actual
  const activeStreak = calculateStreak(sessions);
  return Math.max(maxStreak, activeStreak);
}

// ==========================================
// Cálculo de Estadísticas y Utilidades
// ==========================================

/**
 * Convierte una cantidad de minutos a una cadena legible (ej: 45 min, 1 h, 2 h 15 min).
 */
function formatMinutes(totalMinutes) {
  if (!totalMinutes || totalMinutes <= 0) {
    return '0 min';
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) {
    return `${minutes} min`;
  }
  if (minutes === 0) {
    return `${hours} h`;
  }
  return `${hours} h ${minutes} min`;
}

/**
 * Calcula métricas acumuladas de estudio:
 * - Tiempo total
 * - Tiempo invertido hoy
 * - Tema con más minutos dedicados
 * - Cantidad total de sesiones
 * - Mejor racha histórica
 */
function calculateStats(sessions) {
  if (!sessions || sessions.length === 0) {
    return {
      totalTimeFormatted: '0 min',
      todayTimeFormatted: '0 min',
      todayMinutes: 0,
      monthDaysFormatted: '0 días',
      bestStreakFormatted: '0 días',
      topTopic: '—',
      totalSessions: 0,
    };
  }

  const todayStr = getPastDateString(0);
  const now = new Date();
  const currentYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  let totalMinutes = 0;
  let todayMinutes = 0;
  const monthDates = new Set();

  // Agrupador de minutos por tema (insensible a mayúsculas/minúsculas)
  const topicMinutesMap = {};
  const topicOriginalNames = {};

  sessions.forEach((session) => {
    const mins = Number(session.minutes) || 0;
    totalMinutes += mins;

    if (session.date === todayStr) {
      todayMinutes += mins;
    }

    // Registrar días únicos estudiados en el mes local actual
    if (session.date && session.date.startsWith(currentYearMonth)) {
      monthDates.add(session.date);
    }

    const trimmedTopic = session.topic.trim();
    const normalizedKey = trimmedTopic.toLowerCase();

    topicMinutesMap[normalizedKey] = (topicMinutesMap[normalizedKey] || 0) + mins;
    if (!topicOriginalNames[normalizedKey]) {
      topicOriginalNames[normalizedKey] = trimmedTopic;
    }
  });

  // Determinar el tema principal
  let topTopicName = '—';
  let maxMinutes = 0;

  for (const [key, minutes] of Object.entries(topicMinutesMap)) {
    if (minutes > maxMinutes) {
      maxMinutes = minutes;
      topTopicName = topicOriginalNames[key];
    }
  }

  const monthDaysCount = monthDates.size;
  const monthDaysFormatted = monthDaysCount === 1 ? '1 día' : `${monthDaysCount} días`;

  const bestStreak = calculateBestStreak(sessions);
  const bestStreakFormatted = bestStreak === 1 ? '1 día' : `${bestStreak} días`;

  return {
    totalTimeFormatted: formatMinutes(totalMinutes),
    todayTimeFormatted: formatMinutes(todayMinutes),
    todayMinutes: todayMinutes,
    monthDaysFormatted: monthDaysFormatted,
    bestStreakFormatted: bestStreakFormatted,
    topTopic: topTopicName,
    totalSessions: sessions.length,
  };
}

/**
 * Actualiza la lista de sugerencias del datalist con los temas ya registrados.
 */
function updateTopicsDatalist(sessions) {
  const uniqueTopics = Array.from(new Set(sessions.map((s) => s.topic.trim()))).filter(Boolean);
  topicsList.innerHTML = '';
  uniqueTopics.forEach((topic) => {
    const option = document.createElement('option');
    option.value = topic;
    topicsList.appendChild(option);
  });
}

// ==========================================
// Renderizado de la Interfaz (UI)
// ==========================================

/**
 * Actualiza la vista completa: racha, estadísticas, sugerencias e historial.
 */
function render() {
  const sessions = getStoredSessions();

  // 1. Calcular y actualizar la racha
  const streak = calculateStreak(sessions);
  streakCount.textContent = streak;
  streakLabel.textContent = streak === 1 ? 'día de racha' : 'días de racha';

  // Mensaje motivacional contextual y estado en cabecera
  const todayStr = getPastDateString(0);
  const studiedToday = sessions.some((s) => s.date === todayStr);

  if (streakStatus) {
    if (studiedToday) {
      streakStatus.textContent = '¡Racha asegurada hoy! Gran trabajo de constancia.';
    } else if (streak > 0) {
      streakStatus.textContent = '¡Aún no has registrado hoy! Estudia para mantener la racha viva.';
    } else {
      streakStatus.textContent = 'Comienza hoy registrando tu primera sesión de estudio.';
    }
  }

  if (streakHeaderText) {
    if (studiedToday) {
      streakHeaderText.textContent = `${streak} ${streak === 1 ? 'día' : 'días'} al día`;
    } else if (streak > 0) {
      streakHeaderText.textContent = 'Racha en riesgo hoy';
    } else {
      streakHeaderText.textContent = 'Sin racha activa';
    }
  }

  // 2. Calcular y actualizar estadísticas y meta diaria
  const stats = calculateStats(sessions);
  statsTotalTime.textContent = stats.totalTimeFormatted;
  statsTodayTime.textContent = stats.todayTimeFormatted;
  statsMonthDays.textContent = stats.monthDaysFormatted;
  if (statsBestStreak) {
    statsBestStreak.textContent = stats.bestStreakFormatted;
  }
  statsTopTopic.textContent = stats.topTopic;
  statsTotalSessions.textContent = stats.totalSessions;

  // Actualizar indicador de meta diaria
  const dailyGoal = getStoredDailyGoal();
  const todayMinutes = stats.todayMinutes || 0;
  const percentage = Math.round((todayMinutes / dailyGoal) * 100);
  const visualPercentage = Math.min(100, percentage);

  goalProgressText.textContent = `${todayMinutes} / ${dailyGoal} min (${percentage}%)`;
  goalProgressFill.style.width = `${visualPercentage}%`;
  if (goalProgressTrack) {
    goalProgressTrack.setAttribute('aria-valuenow', String(percentage));
  }

  if (todayMinutes >= dailyGoal) {
    goalProgressFill.classList.add('completed');
    goalBadge.style.display = 'inline-block';
  } else {
    goalProgressFill.classList.remove('completed');
    goalBadge.style.display = 'none';
  }

  // 3. Actualizar sugerencias de temas en el formulario
  updateTopicsDatalist(sessions);

  // 4. Ordenar las sesiones: de la más reciente a la más antigua
  const sortedSessions = [...sessions].sort((a, b) => {
    // Primero comparamos la fecha de la sesión (descendente)
    if (a.date !== b.date) {
      return b.date.localeCompare(a.date);
    }
    // Si la fecha es la misma, la registrada más recientemente va primero
    return b.id - a.id;
  });

  // Filtrado reactivo por tema o fecha si el usuario ingresó un término de búsqueda
  let displayedSessions = sortedSessions;
  const cleanQuery = searchQuery.trim().toLowerCase();
  if (cleanQuery) {
    displayedSessions = sortedSessions.filter((s) => {
      const matchTopic = s.topic.toLowerCase().includes(cleanQuery);
      const matchDate = formatDateDisplay(s.date).includes(cleanQuery);
      return matchTopic || matchDate;
    });
  }

  if (historyCount) {
    historyCount.textContent = String(displayedSessions.length);
  }

  // 5. Renderizar la lista
  sessionsList.innerHTML = '';

  if (displayedSessions.length === 0) {
    emptyState.style.display = 'flex';
    const titleEl = emptyState.querySelector('.empty-state-title');
    const descEl = emptyState.querySelector('.empty-state-desc');
    if (cleanQuery) {
      if (titleEl) titleEl.textContent = 'No se encontraron sesiones';
      if (descEl) descEl.textContent = `No hay registros que coincidan con "${searchQuery}".`;
    } else {
      if (titleEl) titleEl.textContent = 'Aún no hay sesiones registradas';
      if (descEl) descEl.textContent = 'Registra tu primer bloque de estudio arriba para encender tu racha.';
    }
  } else {
    emptyState.style.display = 'none';

    displayedSessions.forEach((session) => {
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

      // Contenedor derecho: minutos y botones de acción
      const rightDiv = document.createElement('div');
      rightDiv.className = 'session-right';

      const minutesSpan = document.createElement('span');
      minutesSpan.className = 'session-minutes';
      minutesSpan.textContent = `${session.minutes} min`;

      const actionsDiv = document.createElement('div');
      actionsDiv.className = 'session-actions';

      // Botón editar
      const editBtn = document.createElement('button');
      editBtn.type = 'button';
      editBtn.className = 'icon-btn';
      editBtn.title = 'Editar sesión';
      editBtn.setAttribute('aria-label', `Editar sesión: ${session.topic}`);
      editBtn.textContent = '✏️';
      editBtn.addEventListener('click', () => startEditSession(session.id));

      // Botón eliminar
      const deleteBtn = document.createElement('button');
      deleteBtn.type = 'button';
      deleteBtn.className = 'icon-btn icon-btn-delete';
      deleteBtn.title = 'Eliminar sesión';
      deleteBtn.setAttribute('aria-label', `Eliminar sesión: ${session.topic}`);
      deleteBtn.textContent = '🗑️';
      deleteBtn.addEventListener('click', () => deleteSession(session.id));

      actionsDiv.appendChild(editBtn);
      actionsDiv.appendChild(deleteBtn);

      rightDiv.appendChild(minutesSpan);
      rightDiv.appendChild(actionsDiv);

      li.appendChild(infoDiv);
      li.appendChild(rightDiv);

      sessionsList.appendChild(li);
    });
  }
}

// ==========================================
// Acciones de Edición y Eliminación
// ==========================================

/**
 * Carga los datos de una sesión en el formulario para editarla.
 */
function startEditSession(id) {
  const sessions = getStoredSessions();
  const sessionToEdit = sessions.find((s) => s.id === id);

  if (!sessionToEdit) {
    return;
  }

  editingSessionId = id;

  // Llenar los campos con los datos actuales
  dateInput.value = sessionToEdit.date;
  topicInput.value = sessionToEdit.topic;
  minutesInput.value = sessionToEdit.minutes;

  // Actualizar títulos, botones e indicador visual
  formTitle.textContent = 'Editar sesión';
  submitBtn.textContent = 'Actualizar sesión';
  cancelEditBtn.style.display = 'inline-block';
  if (editIndicator) {
    editIndicator.style.display = 'inline-block';
  }

  // Desplazar la vista al formulario y enfocar el campo de tema
  formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  topicInput.focus();
}

/**
 * Cancela el modo de edición y regresa el formulario al modo habitual.
 */
function cancelEdit() {
  editingSessionId = null;

  topicInput.value = '';
  minutesInput.value = '';
  dateInput.value = getLocalDateString();

  formTitle.textContent = 'Registrar sesión';
  submitBtn.textContent = 'Guardar sesión';
  cancelEditBtn.style.display = 'none';
  if (editIndicator) {
    editIndicator.style.display = 'none';
  }
}

/**
 * Elimina una sesión del almacenamiento con confirmación previa.
 */
function deleteSession(id) {
  const confirmed = window.confirm('¿Seguro que deseas eliminar esta sesión?');
  if (!confirmed) {
    return;
  }

  // Si se está editando la sesión que se va a eliminar, cancelar la edición
  if (editingSessionId === id) {
    cancelEdit();
  }

  const sessions = getStoredSessions();
  const updatedSessions = sessions.filter((s) => s.id !== id);
  saveSessions(updatedSessions);

  render();
}

// ==========================================
// Eventos y Inicialización
// ==========================================

// Al enviar el formulario (Crear o Actualizar)
sessionForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const selectedDate = dateInput.value;
  const topic = topicInput.value.trim();
  const minutes = parseInt(minutesInput.value, 10);

  // Validación básica
  if (!selectedDate || !topic || isNaN(minutes) || minutes <= 0) {
    return;
  }

  const sessions = getStoredSessions();

  if (editingSessionId !== null) {
    // Modo Actualización: buscar y modificar la sesión existente
    const sessionIndex = sessions.findIndex((s) => s.id === editingSessionId);
    if (sessionIndex !== -1) {
      sessions[sessionIndex] = {
        ...sessions[sessionIndex],
        date: selectedDate,
        topic: topic,
        minutes: minutes,
      };
      saveSessions(sessions);
    }
    cancelEdit();
  } else {
    // Modo Creación: agregar una nueva sesión
    const newSession = {
      id: Date.now(),
      date: selectedDate,
      topic: topic,
      minutes: minutes,
    };
    sessions.push(newSession);
    saveSessions(sessions);

    topicInput.value = '';
    minutesInput.value = '';
    dateInput.value = getLocalDateString();
  }

  // Actualizar la pantalla (racha, estadísticas, sugerencias y lista)
  render();
});

// Botón para cancelar la edición
cancelEditBtn.addEventListener('click', cancelEdit);

/**
 * Permite al usuario modificar su meta diaria de estudio.
 */
function handleEditGoal() {
  const currentGoal = getStoredDailyGoal();
  const input = window.prompt('Define tu meta diaria de estudio en minutos (ej. 30, 60, 90):', String(currentGoal));

  if (input === null) {
    return; // Cancelado por el usuario
  }

  const newGoal = parseInt(input.trim(), 10);
  if (isNaN(newGoal) || newGoal <= 0) {
    window.alert('Por favor, introduce un número entero de minutos mayor a 0.');
    return;
  }

  saveDailyGoal(newGoal);
  render();
}

// Botón para editar la meta diaria
if (editGoalBtn) {
  editGoalBtn.addEventListener('click', handleEditGoal);
}

// Botones de minutos rápidos para agilizar el registro
quickMinButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    const mins = btn.getAttribute('data-minutes');
    if (mins) {
      minutesInput.value = mins;
      minutesInput.focus();
    }
  });
});

// Filtro de búsqueda en tiempo real para el historial
if (historySearch) {
  historySearch.addEventListener('input', (event) => {
    searchQuery = event.target.value;
    render();
  });
}

// Inicialización cuando carga la página
function init() {
  // Establecer fecha por defecto a hoy (hora local)
  dateInput.value = getLocalDateString();

  // Render inicial de datos existentes
  render();
}

init();
