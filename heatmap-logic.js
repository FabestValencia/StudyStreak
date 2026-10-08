/**
 * HeatMap Logic - Pure domain and data transformation module for StudyStreak
 * Conforme a docs/constitution.md:
 * - Pure functions receiving explicit date/today parameters
 * - No DOM or localStorage dependencies
 * - Dual environment support (Browser global & Node.js CommonJS)
 */

/**
 * Maps minutes studied in a single day to a 5-level intensity scale (0-4).
 * @param {number} minutes
 * @returns {number} Level from 0 to 4
 */
function getActivityLevel(minutes) {
  // Por implementar en Tarea 2
  return 0;
}

/**
 * Aggregates study session minutes by local date string 'YYYY-MM-DD'.
 * Discards sessions with invalid formats or dates beyond todayStr.
 * @param {Array<{date: string, minutes: number}>} sessions
 * @param {string} todayStr Current local date in 'YYYY-MM-DD'
 * @returns {Record<string, number>} Aggregated minutes per date
 */
function aggregateMinutesByDate(sessions, todayStr) {
  // Por implementar en Tarea 2
  return {};
}

// Exportación dual para Node.js (tests) y Navegador (window.HeatMapLogic)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    getActivityLevel,
    aggregateMinutesByDate
  };
}

if (typeof window !== 'undefined') {
  window.HeatMapLogic = {
    getActivityLevel,
    aggregateMinutesByDate
  };
}
