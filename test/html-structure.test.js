const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('Estructura HTML del Mapa de Calor (Tarea 5 - RF-1, RF-2, RF-6, RF-7)', async (t) => {
  const htmlPath = path.join(__dirname, '..', 'index.html');
  const htmlContent = fs.readFileSync(htmlPath, 'utf8');

  await t.test('contiene la sección semántica #heatmap-section al pie del historial (RF-1)', () => {
    assert.match(htmlContent, /<section[^>]+id=["']heatmap-section["']/i);
    // Verificar que aparece después de history-card
    const historyIndex = htmlContent.indexOf('history-card');
    const heatmapIndex = htmlContent.indexOf('heatmap-section');
    assert.ok(historyIndex !== -1, 'history-card debe existir');
    assert.ok(heatmapIndex !== -1, 'heatmap-section debe existir');
    assert.ok(heatmapIndex > historyIndex, 'heatmap-section debe ubicarse después de history-card');
  });

  await t.test('contiene el encabezado semántico del mapa de calor', () => {
    assert.match(htmlContent, /<h2[^>]+id=["']heatmap-title["'][^>]*>Actividad de estudio<\/h2>/i);
  });

  await t.test('contiene los contenedores de cuadrícula, meses y etiquetas de días (RF-2)', () => {
    assert.match(htmlContent, /id=["']heatmap-months-row["']/i);
    assert.match(htmlContent, /class=["'][^"']*heatmap-days-col[^"']*["']/i);
    assert.match(htmlContent, /id=["']heatmap-grid["'][^>]+role=["']grid["']/i);
  });

  await t.test('contiene la leyenda explicativa con muestras de nivel 0 a 4 (RF-6)', () => {
    assert.match(htmlContent, /class=["'][^"']*heatmap-legend[^"']*["']/i);
    assert.match(htmlContent, /Menos/);
    assert.match(htmlContent, /Más/);
    assert.match(htmlContent, /level-0/);
    assert.match(htmlContent, /level-1/);
    assert.match(htmlContent, /level-2/);
    assert.match(htmlContent, /level-3/);
    assert.match(htmlContent, /level-4/);
  });

  await t.test('contiene el elemento flotante #heatmap-tooltip (RF-7)', () => {
    assert.match(htmlContent, /id=["']heatmap-tooltip["'][^>]+role=["']tooltip["']/i);
  });

  await t.test('enlaza heatmap-logic.js antes de app.js (Principio 1)', () => {
    const scriptHeatmapIndex = htmlContent.indexOf('src="heatmap-logic.js"');
    const scriptAppIndex = htmlContent.indexOf('src="app.js"');
    assert.ok(scriptHeatmapIndex !== -1, 'heatmap-logic.js debe estar enlazado');
    assert.ok(scriptAppIndex !== -1, 'app.js debe estar enlazado');
    assert.ok(scriptHeatmapIndex < scriptAppIndex, 'heatmap-logic.js debe cargarse antes que app.js');
  });
});
