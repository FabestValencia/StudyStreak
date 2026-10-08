const test = require('node:test');
const assert = require('node:assert/strict');
const {
  getActivityLevel,
  aggregateMinutesByDate
} = require('../heatmap-logic.js');

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
