/**
 * HeatMap Logic - Pure domain and data transformation module for StudyStreak
 * Conforme a docs/constitution.md:
 * - Pure functions receiving explicit date/today parameters
 * - No DOM or localStorage dependencies
 * - Dual environment support (Browser global & Node.js CommonJS)
 */

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const SPANISH_DAY_NAMES = [
  'Domingo',
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado'
];

const SPANISH_MONTH_NAMES = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre'
];

const SHORT_MONTH_NAMES = [
  'Ene',
  'Feb',
  'Mar',
  'Abr',
  'May',
  'Jun',
  'Jul',
  'Ago',
  'Sep',
  'Oct',
  'Nov',
  'Dic'
];

/**
 * Returns a date string in 'YYYY-MM-DD' format using local time methods.
 * @param {Date} date
 * @returns {string}
 */
function toLocalDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Maps minutes studied in a single day to a 5-level intensity scale (0-4).
 * RF-4, CL-3
 * @param {number} minutes
 * @returns {number} Level from 0 to 4
 */
function getActivityLevel(minutes) {
  if (typeof minutes !== 'number' || isNaN(minutes) || minutes <= 0) {
    return 0;
  }
  if (minutes <= 30) {
    return 1;
  }
  if (minutes <= 60) {
    return 2;
  }
  if (minutes <= 120) {
    return 3;
  }
  return 4;
}

/**
 * Aggregates study session minutes by local date string 'YYYY-MM-DD'.
 * Discards sessions with invalid formats or dates beyond todayStr.
 * RF-4, CL-1, CL-2, CL-3, CL-4
 * @param {Array<{date: string, minutes: number}>} sessions
 * @param {string} todayStr Current local date in 'YYYY-MM-DD'
 * @returns {Record<string, number>} Aggregated minutes per date
 */
function aggregateMinutesByDate(sessions, todayStr) {
  if (!Array.isArray(sessions)) {
    return {};
  }

  const minutesMap = {};

  for (const session of sessions) {
    if (!session || typeof session !== 'object') {
      continue;
    }

    const date = session.date;
    if (typeof date !== 'string' || !DATE_REGEX.test(date)) {
      continue;
    }

    // Validación básica de calendario para evitar fechas imposibles
    const [year, month, day] = date.split('-').map(Number);
    if (month < 1 || month > 12 || day < 1 || day > 31) {
      continue;
    }

    // Descartar sesiones con fechas futuras respecto a todayStr (CL-2)
    if (todayStr && date > todayStr) {
      continue;
    }

    // Normalizar minutos a número no negativo (CL-3)
    let minutes = Number(session.minutes);
    if (isNaN(minutes) || minutes < 0) {
      minutes = 0;
    }

    // Suma acumulada de minutos para la misma fecha (CL-4)
    minutesMap[date] = (minutesMap[date] || 0) + minutes;
  }

  return minutesMap;
}

/**
 * Gets the Monday of the week containing the given date in local time.
 * Monday is day 0 of the study week, Sunday is day 6.
 * RF-2, CL-6
 * @param {Date} date
 * @returns {Date}
 */
function getMondayOfWeek(date) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const dayOfWeek = d.getDay(); // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
  const offset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  d.setDate(d.getDate() + offset);
  return d;
}

/**
 * Formats day, date with year, and minutes in Spanish for tooltip and accessible text.
 * RF-7, CL-5
 * @param {string} dateStr 'YYYY-MM-DD'
 * @param {number} minutes
 * @param {boolean} isFuture
 * @returns {string}
 */
function formatDayTooltipText(dateStr, minutes, isFuture) {
  if (isFuture) {
    return '';
  }

  const [year, month, day] = dateStr.split('-').map(Number);
  const dateObj = new Date(year, month - 1, day);
  const dayName = SPANISH_DAY_NAMES[dateObj.getDay()];
  const monthName = SPANISH_MONTH_NAMES[dateObj.getMonth()];
  const cleanMinutes = typeof minutes === 'number' && !isNaN(minutes) && minutes > 0 ? minutes : 0;

  return `${dayName} ${day} de ${monthName} de ${year}: ${cleanMinutes} min`;
}

/**
 * Builds the complete HeatMap view model orchestrating all calendar columns, days and levels.
 * RF-2, RF-3, RF-5, RF-7, CL-1, CL-5, RNF-2, RNF-4
 * @param {Array<{date: string, minutes: number}>} sessions
 * @param {Date} today
 * @param {number} weeksCount 12 for desktop, 4 for mobile
 * @returns {object}
 */
function buildHeatMapViewModel(sessions, today = new Date(), weeksCount = 12) {
  const todayStr = toLocalDateString(today);
  const minutesMap = aggregateMinutesByDate(sessions, todayStr);
  const currentMonday = getMondayOfWeek(today);

  // Retroceder (weeksCount - 1) semanas desde el lunes actual
  const startMonday = new Date(
    currentMonday.getFullYear(),
    currentMonday.getMonth(),
    currentMonday.getDate() - (weeksCount - 1) * 7
  );

  const weeks = [];
  let lastAssignedMonth = -1;

  for (let w = 0; w < weeksCount; w++) {
    const weekStartDate = new Date(
      startMonday.getFullYear(),
      startMonday.getMonth(),
      startMonday.getDate() + w * 7
    );

    const days = [];
    let weekMonthLabel = null;

    for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
      const dayDate = new Date(
        weekStartDate.getFullYear(),
        weekStartDate.getMonth(),
        weekStartDate.getDate() + dayIndex
      );

      const dateStr = toLocalDateString(dayDate);
      const isFuture = dateStr > todayStr;
      const isToday = dateStr === todayStr;

      // Asignar etiqueta de mes si es la primera semana o si en esta semana inicia un nuevo mes
      if (w === 0 && dayIndex === 0) {
        weekMonthLabel = SHORT_MONTH_NAMES[dayDate.getMonth()];
        lastAssignedMonth = dayDate.getMonth();
      } else if (dayDate.getDate() === 1 && dayDate.getMonth() !== lastAssignedMonth) {
        weekMonthLabel = SHORT_MONTH_NAMES[dayDate.getMonth()];
        lastAssignedMonth = dayDate.getMonth();
      }

      let level = null;
      let minutes = 0;
      let tooltipText = '';
      let tabIndex = -1;
      let ariaDisabled = true;

      if (!isFuture) {
        minutes = minutesMap[dateStr] || 0;
        level = getActivityLevel(minutes);
        tooltipText = formatDayTooltipText(dateStr, minutes, isFuture);
        tabIndex = 0;
        ariaDisabled = false;
      }

      days.push({
        dateStr,
        dayOfWeek: dayIndex, // 0 = Lunes, ..., 6 = Domingo
        minutes,
        level,
        isFuture,
        isToday,
        tooltipText,
        tabIndex,
        ariaDisabled
      });
    }

    weeks.push({
      weekIndex: w,
      monthLabel: weekMonthLabel,
      days
    });
  }

  return {
    weeksCount,
    weeks
  };
}

// Exportación dual para Node.js (tests) y Navegador (window.HeatMapLogic)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    getActivityLevel,
    aggregateMinutesByDate,
    getMondayOfWeek,
    formatDayTooltipText,
    buildHeatMapViewModel
  };
}

if (typeof window !== 'undefined') {
  window.HeatMapLogic = {
    getActivityLevel,
    aggregateMinutesByDate,
    getMondayOfWeek,
    formatDayTooltipText,
    buildHeatMapViewModel
  };
}
