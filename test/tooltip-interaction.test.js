const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { calculateTooltipPosition } = require('../heatmap-logic.js');

test('Cálculo determinista de posicionamiento del Tooltip (RF-7, RNF-4)', async (t) => {
  await t.test('posiciona el tooltip centrado arriba de la celda en condiciones nominales', () => {
    const targetRect = { left: 200, top: 150, width: 14, height: 14, bottom: 164 };
    const pos = calculateTooltipPosition(targetRect, 100, 30, 800, 600);
    // left: 200 + 7 - 50 = 157
    assert.equal(pos.left, 157);
    // top: 150 - 30 - 6 = 114
    assert.equal(pos.top, 114);
  });

  await t.test('ajusta la posición horizontal para evitar desbordes en el borde derecho de la pantalla (RF-7)', () => {
    const targetRect = { left: 780, top: 150, width: 14, height: 14, bottom: 164 };
    const pos = calculateTooltipPosition(targetRect, 120, 30, 800, 600);
    // Borde derecho: viewport 800 - tooltip 120 - margin 8 = 672
    assert.ok(pos.left <= 800 - 120 - 8);
    assert.equal(pos.left, 672);
  });

  await t.test('ajusta la posición horizontal para evitar desbordes en el borde izquierdo de la pantalla (RF-7)', () => {
    const targetRect = { left: 4, top: 150, width: 14, height: 14, bottom: 164 };
    const pos = calculateTooltipPosition(targetRect, 120, 30, 800, 600);
    assert.ok(pos.left >= 8);
    assert.equal(pos.left, 8);
  });

  await t.test('invierte la posición vertical hacia abajo si la celda está en el borde superior (RF-7)', () => {
    const targetRect = { left: 200, top: 10, width: 14, height: 14, bottom: 24 };
    const pos = calculateTooltipPosition(targetRect, 100, 30, 800, 600);
    // No cabe arriba (10 - 30 - 6 = -26 < 8), debe colocarse debajo (bottom 24 + 6 = 30)
    assert.equal(pos.top, 30);
  });
});

test('Integración de eventos del Tooltip en app.js (Tarea 8 - RF-5, RF-7, RNF-4)', async (t) => {
  const appJsPath = path.join(__dirname, '..', 'app.js');
  const appJsContent = fs.readFileSync(appJsPath, 'utf8');

  await t.test('define funciones para mostrar y ocultar el tooltip en el DOM', () => {
    assert.match(appJsContent, /function\s+showHeatMapTooltip\s*\(/i);
    assert.match(appJsContent, /function\s+hideHeatMapTooltip\s*\(/i);
  });

  await t.test('vincula eventos mouseenter, focus, mouseleave, blur y click a las celdas válidas (RF-7, RNF-4)', () => {
    assert.match(appJsContent, /addEventListener\s*\(\s*['"]mouseenter['"]/i);
    assert.match(appJsContent, /addEventListener\s*\(\s*['"]focus['"]/i);
    assert.match(appJsContent, /addEventListener\s*\(\s*['"]mouseleave['"]/i);
    assert.match(appJsContent, /addEventListener\s*\(\s*['"]blur['"]/i);
    assert.match(appJsContent, /addEventListener\s*\(\s*['"]click['"]/i);
  });

  await t.test('omite eventos y navegación por teclado en celdas futuras (RF-5)', () => {
    // Las celdas futuras tienen tabIndex = -1 y se deshabilitan
    assert.match(appJsContent, /day\.isFuture[\s\S]*?tabIndex\s*=\s*-1/i);
    assert.match(appJsContent, /day\.isFuture[\s\S]*?cell-future/i);
  });

  await t.test('cierra el tooltip ante clics fuera de las celdas, scroll y touchmove (RF-7)', () => {
    assert.match(appJsContent, /addEventListener\s*\(\s*['"]scroll['"]/i);
    assert.match(appJsContent, /addEventListener\s*\(\s*['"]touchmove['"]/i);
    assert.match(appJsContent, /document\.addEventListener\s*\(\s*['"]click['"]/i);
  });
});

