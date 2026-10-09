const test = require('node:test');
const assert = require('node:assert/strict');
const {
  getActivityLevel,
  aggregateMinutesByDate,
  getMondayOfWeek,
  formatDayTooltipText,
  buildHeatMapViewModel
} = require('../heatmap-logic.js');

// ==========================================
// Tareas 1 y 2: Escala y agregación de datos
// ==========================================

test('getActivityLevel - Escala fija de 5 niveles de intensidad (RF-4, CL-3)', async (t) => {
  await t.test('retorna 0 para minutos menores o iguales a 0 o valores no numéricos', () => {
    assert.equal(getActivityLevel(0), 0);
    assert.equal(getActivityLevel(-15), 0);
    assert.equal(getActivityLevel(null), 0);
    assert.equal(getActivityLevel(undefined), 0);
    assert.equal(getActivityLevel(NaN), 0);
    assert.equal(getActivityLevel('invalido'), 0);
  });

  await t.test('retorna 1 para actividad suave (1 a 30 minutos inclusive)', () => {
    assert.equal(getActivityLevel(1), 1);
    assert.equal(getActivityLevel(15), 1);
    assert.equal(getActivityLevel(30), 1);
  });

  await t.test('retorna 2 para actividad moderada (31 a 60 minutos inclusive)', () => {
    assert.equal(getActivityLevel(31), 2);
    assert.equal(getActivityLevel(45), 2);
    assert.equal(getActivityLevel(60), 2);
  });

  await t.test('retorna 3 para actividad alta (61 a 120 minutos inclusive)', () => {
    assert.equal(getActivityLevel(61), 3);
    assert.equal(getActivityLevel(90), 3);
    assert.equal(getActivityLevel(120), 3);
  });

  await t.test('retorna 4 para actividad intensa (> 120 minutos)', () => {
    assert.equal(getActivityLevel(121), 4);
    assert.equal(getActivityLevel(180), 4);
    assert.equal(getActivityLevel(300), 4);
  });
});

test('aggregateMinutesByDate - Agregación de minutos y casos límite (RF-4, CL-1..4)', async (t) => {
  const todayStr = '2026-10-08';

  await t.test('retorna objeto vacío cuando no hay sesiones (CL-1)', () => {
    const result = aggregateMinutesByDate([], todayStr);
    assert.deepEqual(result, {});
  });

  await t.test('suma aritméticamente múltiples sesiones en la misma fecha (CL-4)', () => {
    const sessions = [
      { id: 1, date: '2026-10-07', minutes: 30 },
      { id: 2, date: '2026-10-07', minutes: 45 },
      { id: 3, date: '2026-10-08', minutes: 60 }
    ];
    const result = aggregateMinutesByDate(sessions, todayStr);
    assert.equal(result['2026-10-07'], 75);
    assert.equal(result['2026-10-08'], 60);
  });

  await t.test('descarta sesiones con fechas futuras respecto a todayStr (CL-2)', () => {
    const sessions = [
      { id: 1, date: '2026-10-08', minutes: 40 },
      { id: 2, date: '2026-10-09', minutes: 50 }, // Mañana
      { id: 3, date: '2026-11-01', minutes: 120 } // Futuro lejano
    ];
    const result = aggregateMinutesByDate(sessions, todayStr);
    assert.equal(result['2026-10-08'], 40);
    assert.equal(result['2026-10-09'], undefined);
    assert.equal(result['2026-11-01'], undefined);
  });

  await t.test('descarta de forma segura sesiones con formato de fecha corrupto o malformado', () => {
    const sessions = [
      { id: 1, date: null, minutes: 30 },
      { id: 2, date: '', minutes: 30 },
      { id: 3, date: 'fecha-invalida', minutes: 30 },
      { id: 4, date: '2026-13-45', minutes: 30 },
      { id: 5, date: '2026-10-08', minutes: 25 }
    ];
    const result = aggregateMinutesByDate(sessions, todayStr);
    assert.equal(result['2026-10-08'], 25);
    assert.equal(Object.keys(result).length, 1);
  });

  await t.test('normaliza a 0 minutos las sesiones con valores nulos, negativos o no numéricos (CL-3)', () => {
    const sessions = [
      { id: 1, date: '2026-10-06', minutes: -20 },
      { id: 2, date: '2026-10-06', minutes: null },
      { id: 3, date: '2026-10-07', minutes: NaN },
      { id: 4, date: '2026-10-07', minutes: 15 }
    ];
    const result = aggregateMinutesByDate(sessions, todayStr);
    assert.equal(result['2026-10-06'], 0);
    assert.equal(result['2026-10-07'], 15);
  });
});

// ========================================================
// Tarea 3: Calendario semanal, Tooltip, ViewModel y Rendimiento
// ========================================================

test('getMondayOfWeek - Cálculo del Lunes local de la semana (RF-2, CL-6)', async (t) => {
  await t.test('si la fecha es lunes devuelve la misma fecha', () => {
    const monday = new Date(2026, 9, 5); // 5 de octubre de 2026 (Lunes)
    const result = getMondayOfWeek(monday);
    assert.equal(result.getFullYear(), 2026);
    assert.equal(result.getMonth(), 9);
    assert.equal(result.getDate(), 5);
  });

  await t.test('si la fecha es miércoles devuelve el lunes previo de esa semana', () => {
    const wednesday = new Date(2026, 9, 7); // 7 de octubre de 2026 (Miércoles)
    const result = getMondayOfWeek(wednesday);
    assert.equal(result.getFullYear(), 2026);
    assert.equal(result.getMonth(), 9);
    assert.equal(result.getDate(), 5);
  });

  await t.test('si la fecha es domingo devuelve el lunes de esa misma semana (6 días antes)', () => {
    const sunday = new Date(2026, 9, 11); // 11 de octubre de 2026 (Domingo)
    const result = getMondayOfWeek(sunday);
    assert.equal(result.getFullYear(), 2026);
    assert.equal(result.getMonth(), 9);
    assert.equal(result.getDate(), 5);
  });
});

test('formatDayTooltipText - Formato accesible en español con año (RF-7, CL-5)', async (t) => {
  await t.test('formatea correctamente día de la semana, día, mes en español, año y minutos', () => {
    const text = formatDayTooltipText('2026-10-07', 45, false);
    assert.match(text, /Miércoles/i);
    assert.match(text, /7/);
    assert.match(text, /octubre/i);
    assert.match(text, /2026/);
    assert.match(text, /45 min/);
  });

  await t.test('muestra 0 min para días sin tiempo registrado', () => {
    const text = formatDayTooltipText('2026-10-07', 0, false);
    assert.match(text, /0 min/);
    assert.match(text, /2026/);
  });

  await t.test('devuelve cadena vacía para días futuros', () => {
    const text = formatDayTooltipText('2026-10-15', 0, true);
    assert.equal(text, '');
  });
});

test('buildHeatMapViewModel - Matriz de semanas, días futuros y accesibilidad (RF-2, RF-3, RF-5, RF-7, CL-5, RNF-4)', async (t) => {
  const today = new Date(2026, 9, 8); // Jueves 8 de octubre de 2026
  const sessions = [
    { id: 1, date: '2026-10-07', minutes: 45 },
    { id: 2, date: '2026-10-08', minutes: 130 }
  ];

  await t.test('genera exactamente 12 semanas (84 días) para escritorio (RF-3)', () => {
    const vm = buildHeatMapViewModel(sessions, today, 12);
    assert.equal(vm.weeksCount, 12);
    assert.equal(vm.weeks.length, 12);
    const totalDays = vm.weeks.reduce((acc, w) => acc + w.days.length, 0);
    assert.equal(totalDays, 84);
  });

  await t.test('genera exactamente 4 semanas (28 días) para móvil estrecho (RF-3)', () => {
    const vm = buildHeatMapViewModel(sessions, today, 4);
    assert.equal(vm.weeksCount, 4);
    assert.equal(vm.weeks.length, 4);
    const totalDays = vm.weeks.reduce((acc, w) => acc + w.days.length, 0);
    assert.equal(totalDays, 28);
  });

  await t.test('ordena los días de lunes (0) a domingo (6) y semana actual al final (RF-2)', () => {
    const vm = buildHeatMapViewModel(sessions, today, 12);
    const lastWeek = vm.weeks[vm.weeks.length - 1];
    assert.equal(lastWeek.days[0].dayOfWeek, 0); // Lunes
    assert.equal(lastWeek.days[6].dayOfWeek, 6); // Domingo
    assert.equal(lastWeek.days[0].dateStr, '2026-10-05'); // Lunes de la semana actual
    assert.equal(lastWeek.days[6].dateStr, '2026-10-11'); // Domingo de la semana actual
  });

  await t.test('marca días futuros en la semana actual como inactivos/neutrales sin foco (RF-5, RNF-4)', () => {
    const vm = buildHeatMapViewModel(sessions, today, 12);
    const lastWeek = vm.weeks[vm.weeks.length - 1];
    
    // Hoy es Jueves 8 de octubre (índice 3 en la semana)
    const todayCell = lastWeek.days[3];
    assert.equal(todayCell.dateStr, '2026-10-08');
    assert.equal(todayCell.isToday, true);
    assert.equal(todayCell.isFuture, false);
    assert.equal(todayCell.level, 4); // 130 min -> Nivel 4
    assert.equal(todayCell.tabIndex, 0);
    assert.equal(todayCell.ariaDisabled, false);

    // Viernes 9, Sábado 10 y Domingo 11 son días futuros
    const fridayCell = lastWeek.days[4];
    assert.equal(fridayCell.dateStr, '2026-10-09');
    assert.equal(fridayCell.isFuture, true);
    assert.equal(fridayCell.level, null);
    assert.equal(fridayCell.tabIndex, -1);
    assert.equal(fridayCell.ariaDisabled, true);
    assert.equal(fridayCell.tooltipText, '');
  });

  await t.test('soporta cruce continuo de año (ej. semanas de diciembre a enero) (CL-5)', () => {
    const newYearDate = new Date(2027, 0, 6); // Miércoles 6 de enero de 2027
    const vm = buildHeatMapViewModel([], newYearDate, 4);
    assert.equal(vm.weeks.length, 4);
    // La primera de las 4 semanas debe comenzar en diciembre de 2026
    const firstWeekFirstDay = vm.weeks[0].days[0].dateStr;
    assert.match(firstWeekFirstDay, /^2026-12-/);
  });
});

test('Rendimiento sintético - Generación del ViewModel en menos de 50 ms (RNF-2)', () => {
  const today = new Date(2026, 9, 8);
  // Generar 500 sesiones aleatorias en los últimos 365 días
  const mockSessions = [];
  for (let i = 0; i < 500; i++) {
    const daysAgo = Math.floor(Math.random() * 365);
    const d = new Date(2026, 9, 8);
    d.setDate(d.getDate() - daysAgo);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    mockSessions.push({
      id: i + 1,
      date: `${y}-${m}-${day}`,
      topic: 'Estudio de prueba',
      minutes: Math.floor(Math.random() * 150) + 1
    });
  }

  const start = performance.now();
  const vm = buildHeatMapViewModel(mockSessions, today, 12);
  const elapsed = performance.now() - start;

  assert.ok(elapsed < 50, `El cálculo tardó ${elapsed.toFixed(2)} ms, superando el límite de 50 ms`);
  assert.equal(vm.weeksCount, 12);
});
