const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('Integración y Renderizado del Mapa en app.js (Tarea 7 - RF-1, RF-3, RF-5, RF-8, RNF-3)', async (t) => {
  const appJsPath = path.join(__dirname, '..', 'app.js');
  const appJsContent = fs.readFileSync(appJsPath, 'utf8');

  await t.test('define la función renderHeatMap y la invoca dentro de render() (RF-8)', () => {
    assert.match(appJsContent, /function\s+renderHeatMap\s*\(/i);
    assert.match(appJsContent, /renderHeatMap\s*\(/i);
  });

  await t.test('conecta window.matchMedia con el umbral de 640px para 12 vs 4 semanas (RF-3)', () => {
    assert.match(appJsContent, /matchMedia\s*\(\s*['"]\(max-width:\s*640px\)['"]\s*\)/i);
    assert.match(appJsContent, /addEventListener\s*\(\s*['"]change['"]/i);
  });

  await t.test('consume HeatMapLogic.buildHeatMapViewModel para construir la vista (Principio 3)', () => {
    assert.match(appJsContent, /HeatMapLogic\.buildHeatMapViewModel\s*\(/i);
  });

  await t.test('asigna roles y clases accesibles a las celdas y días futuros (RF-5, RNF-4)', () => {
    assert.match(appJsContent, /role["'],\s*['"]gridcell['"]/i);
    assert.match(appJsContent, /cell-future/i);
    assert.match(appJsContent, /tabIndex\s*=\s*-1/i);
    assert.match(appJsContent, /cell-level-/i);
  });
});
