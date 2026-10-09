const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('Estilos CSS del Mapa de Calor (Tarea 6 - RF-2, RF-4, RF-5, RF-6, RNF-1)', async (t) => {
  const cssPath = path.join(__dirname, '..', 'styles.css');
  const cssContent = fs.readFileSync(cssPath, 'utf8');

  await t.test('define variables CSS sincronizadas para tamaño y separación de celdas (RF-2)', () => {
    assert.match(cssContent, /--hm-cell-size\s*:\s*\d+px/i);
    assert.match(cssContent, /--hm-cell-gap\s*:\s*\d+px/i);
  });

  await t.test('define tokens de color para los 5 niveles cromáticos (RF-4)', () => {
    assert.match(cssContent, /--hm-level-0\s*:/i);
    assert.match(cssContent, /--hm-level-1\s*:/i);
    assert.match(cssContent, /--hm-level-2\s*:/i);
    assert.match(cssContent, /--hm-level-3\s*:/i);
    assert.match(cssContent, /--hm-level-4\s*:/i);
  });

  await t.test('define tokens adaptados para modo oscuro (prefers-color-scheme: dark) (RNF-1)', () => {
    assert.match(cssContent, /@media\s*\(\s*prefers-color-scheme\s*:\s*dark\s*\)/i);
    assert.match(cssContent, /--hm-level-4\s*:\s*#[0-9a-fA-F]+/i);
  });

  await t.test('define cuadrícula CSS Grid para heatmap-grid con 7 filas de Lunes a Domingo (RF-2)', () => {
    assert.match(cssContent, /\.heatmap-grid\s*\{[^}]*display\s*:\s*grid/i);
    assert.match(cssContent, /\.heatmap-grid\s*\{[^}]*grid-template-rows\s*:\s*repeat\(\s*7\s*,/i);
    assert.match(cssContent, /\.heatmap-grid\s*\{[^}]*grid-auto-flow\s*:\s*column/i);
  });

  await t.test('define estilo neutral y discontinuo para días futuros sin foco ni eventos (RF-5)', () => {
    assert.match(cssContent, /\.cell-future\s*\{[^}]*border\s*:[^}]*(?:dashed|dotted)/i);
    assert.match(cssContent, /\.cell-future\s*\{[^}]*pointer-events\s*:\s*none/i);
  });

  await t.test('define estilos para la leyenda horizontal y sus 5 muestras (RF-6)', () => {
    assert.match(cssContent, /\.heatmap-legend\s*\{[^}]*display\s*:\s*flex/i);
    assert.match(cssContent, /\.legend-cell\s*\{/i);
    assert.match(cssContent, /\.level-0\s*\{/i);
    assert.match(cssContent, /\.level-4\s*\{/i);
  });

  await t.test('define estilos flotantes y contenidos para el tooltip (RF-7)', () => {
    assert.match(cssContent, /\.heatmap-tooltip\s*\{[^}]*position\s*:\s*(?:fixed|absolute)/i);
    assert.match(cssContent, /\.heatmap-tooltip\s*\{[^}]*pointer-events\s*:\s*none/i);
  });
});
