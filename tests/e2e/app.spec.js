import { test, expect } from '@playwright/test';

const HOY = new Date('2026-10-19T12:00:00-03:00');

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(HOY);
});

// Abre la app y junta errores de consola y pedidos a otros orígenes
async function abrir(page) {
  const problemas = [], pedidos = [];
  page.on('pageerror', e => problemas.push(e.message));
  page.on('console', m => { if (m.type() === 'error') problemas.push(m.text()); });
  page.on('request', r => pedidos.push(r.url()));
  await page.goto('./');
  await expect(page.getByRole('button', { name: 'Empezar' })).toBeVisible();
  return { problemas, pedidos };
}

const sinScrollHorizontal = page => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);

async function hastaHoy(page, plan = 'Plan 2023', anio = /^3/) {
  await page.getByRole('button', { name: 'Empezar' }).click();
  await page.getByRole('button', { name: new RegExp(plan) }).click();
  await page.getByRole('radio', { name: anio }).click();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(page.getByRole('heading', { name: '¿Qué aprobaste?' })).toBeVisible();
  await page.getByRole('button', { name: 'Listo' }).click();
  await expect(page.getByRole('heading', { name: '¿Qué vas a cursar?' })).toBeVisible();
}

test('seguridad: CSP estricta, todo desde el propio sitio y sin API de editor', async ({ page, baseURL }) => {
  const { problemas, pedidos } = await abrir(page);
  const csp = await page.locator('meta[http-equiv="Content-Security-Policy"]').getAttribute('content');
  expect(csp).toContain("script-src 'self';");
  expect(csp).toContain("style-src 'self';");
  expect(csp).toContain("font-src 'self';");
  expect(csp).not.toMatch(/unsafe-eval|unsafe-inline|unpkg|googleapis|gstatic/);
  await hastaHoy(page);
  await page.evaluate(() => document.fonts.ready);
  expect(pedidos.filter(u => !u.startsWith(baseURL) && !u.startsWith('data:'))).toEqual([]);
  expect(pedidos.filter(u => /support\.js/.test(u))).toEqual([]);
  expect(pedidos.filter(u => new URL(u).pathname.endsWith('/') || u.endsWith('index.html'))).toHaveLength(1);
  expect(pedidos.some(u => /roboto-latin-[\w-]+\.woff2$/.test(u))).toBe(true);
  expect(await page.evaluate(() => document.fonts.check('900 16px Roboto'))).toBe(true);
  const api = await page.evaluate(() => ['__dcUpdate', '__dcSetProps', '__dcBoot', '__dcRegistry', '__dcAnnotatedTemplate', 'DCLogic', 'StreamableLogic', 'getDC', 'React', 'ReactDOM'].filter(k => k in window));
  expect(api).toEqual([]);
  expect(problemas).toEqual([]);
});

test('recorrido completo sin desbordes', async ({ page }) => {
  const { problemas } = await abrir(page);
  expect(await sinScrollHorizontal(page)).toBe(true);
  await page.getByRole('button', { name: 'Empezar' }).click();
  await expect(page.getByRole('heading', { name: '¿Qué plan cursás?' })).toBeVisible();
  await page.getByRole('button', { name: /Plan 2023/ }).click();
  await expect(page.getByRole('button', { name: 'Continuar' })).toBeDisabled();
  await page.getByRole('radio', { name: /^3/ }).click();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(page.getByText(/Marcamos 1° a 2° año/)).toBeVisible();
  expect(await sinScrollHorizontal(page)).toBe(true);
  await page.getByRole('button', { name: 'Listo' }).click();

  await expect(page.getByText('1° semestre 2027').first()).toBeVisible();
  expect(await sinScrollHorizontal(page)).toBe(true);

  await page.getByRole('button', { name: /Inscripción/ }).first().click();
  await expect(page.getByRole('heading', { name: 'Revisá tu inscripción' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Tu inscripción está en orden' })).toBeVisible();
  expect(await sinScrollHorizontal(page)).toBe(true);

  await page.getByRole('button', { name: /Próximos semestres|Semestres/ }).first().click();
  await expect(page.getByRole('heading', { name: 'Próximos semestres', level: 1 })).toBeVisible();
  await expect(page.getByLabel(/4 semestres, del 1° semestre 2027 al 2° semestre 2028/)).toBeVisible();
  expect(await sinScrollHorizontal(page)).toBe(true);

  await page.getByRole('button', { name: /^Exportar$|Exportar mi plan/ }).first().click();
  const dlg = page.getByRole('dialog', { name: 'Exportar' });
  await expect(dlg).toBeVisible();
  await dlg.getByPlaceholder('Nombre y apellido').fill('Valentina Rodríguez');
  await expect(dlg.getByText('Valentina Rodríguez', { exact: true })).toBeVisible();
  await expect(page.locator('footer')).toContainText('Esta es una proyección estimativa.');
  expect(problemas).toEqual([]);
});

test('la inscripción se puede cambiar y el chequeo avisa', async ({ page }) => {
  await abrir(page);
  await hastaHoy(page);
  await page.getByRole('button', { name: /Inscripción/ }).first().click();
  await page.getByRole('button', { name: 'Sumar materia' }).click();
  await page.getByRole('group', { name: 'Talleres' }).getByRole('button').first().click();
  // La propuesta de 3° año tiene 4 materias: con un segundo taller son 5, y eso no se permite
  await expect(page.getByRole('heading', { name: 'Así no se puede' })).toBeVisible();
  await expect(page.getByText('2 talleres y 5 materias', { exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'diseno@udesa.edu.ar' }).first()).toBeVisible();
  await page.getByRole('button', { name: 'Volver a la propuesta' }).click();
  await expect(page.getByRole('heading', { name: 'Tu inscripción está en orden' })).toBeVisible();
});

test('diálogos: foco adentro, Tab no se escapa y Escape cierra', async ({ page }) => {
  await abrir(page);
  await hastaHoy(page);
  const exportar = page.getByRole('button', { name: /^Exportar$/ });
  await exportar.click();
  const dlg = page.getByRole('dialog');
  await expect(dlg.getByRole('button', { name: 'Cerrar' })).toBeFocused();
  for (let i = 0; i < 8; i++) {
    await page.keyboard.press('Tab');
    expect(await page.evaluate(() => !!document.activeElement.closest('[role=dialog]'))).toBe(true);
  }
  await page.keyboard.press('Shift+Tab');
  expect(await page.evaluate(() => !!document.activeElement.closest('[role=dialog]'))).toBe(true);
  await page.keyboard.press('Escape');
  await expect(dlg).toHaveCount(0);
  await expect(exportar).toBeFocused();
});

test('flechas en los grupos de opciones', async ({ page }) => {
  await abrir(page);
  await page.getByRole('button', { name: 'Empezar' }).click();
  await page.getByRole('button', { name: /Plan 2027/ }).click();
  await page.getByRole('radio', { name: /^1/ }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('radio', { name: /^2/ })).toBeFocused();
  await expect(page.getByRole('radio', { name: /^2/ })).toHaveAttribute('aria-checked', 'true');
  await page.keyboard.press('ArrowLeft');
  await page.keyboard.press('ArrowLeft');
  await expect(page.getByRole('radio', { name: /^4/ })).toHaveAttribute('aria-checked', 'true');
});

test('archivo para retomar: descarga y vuelve a abrir', async ({ page }) => {
  await abrir(page);
  await hastaHoy(page, 'Plan 2027', /^1/);
  await page.getByRole('button', { name: /^Exportar$/ }).click();
  const [descarga] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Archivo para retomar' }).click()]);
  expect(descarga.suggestedFilename()).toBe('mi-cursada-plan-2027.json');
  const contenido = JSON.parse(await (await descarga.createReadStream()).toArray().then(b => Buffer.concat(b).toString('utf8')));
  expect(contenido).toMatchObject({ plan: '2027', anio: 1, aprobadas: [], inscripcion: null });

  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Volver a empezar' }).first().click();
  await page.getByRole('dialog').getByRole('button', { name: 'Volver a empezar' }).click();
  await expect(page.getByRole('button', { name: 'Empezar' })).toBeVisible();
  await page.locator('input[type=file]').setInputFiles({ name: 'mi.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify({ ...contenido, nombre: '<img src=x onerror=alert(1)>', aprobadas: ['t-interaccion'] })) });
  await expect(page.getByRole('heading', { name: '¿Qué vas a cursar?' })).toBeVisible();
  await page.getByRole('button', { name: /^Exportar$/ }).click();
  await expect(page.getByRole('dialog').getByText('<img src=x onerror=alert(1)>')).toBeVisible();
  expect(await page.locator('img[src=x]').count()).toBe(0);
});

test('un archivo que no es del planificador muestra el error', async ({ page }) => {
  await abrir(page);
  await page.locator('input[type=file]').setInputFiles({ name: 'x.json', mimeType: 'application/json', buffer: Buffer.from('{"plan":"2027","aprobadas":["k030"]}') });
  await expect(page.getByRole('alert')).toContainText('No pudimos abrir ese archivo');
  await expect(page.getByRole('alert')).toContainText('Tiene materias que no son del Plan 2027');
  await page.locator('input[type=file]').setInputFiles({ name: 'x.json', mimeType: 'application/json', buffer: Buffer.alloc(101 * 1024, 32) });
  await expect(page.getByRole('alert')).toContainText('El archivo es demasiado grande.');
});

test('si no carga el plan de estudios, lo dice', async ({ page }) => {
  await page.route('**/datos/carrera.json', r => r.fulfill({ status: 500, body: '' }));
  await abrir(page);
  await expect(page.getByRole('alert')).toContainText('No pudimos cargar el plan de estudios');
});

test('detalle de una materia y sus correlativas', async ({ page }) => {
  await abrir(page);
  await hastaHoy(page);
  const w = page.viewportSize().width;
  if (w < 760) await page.getByRole('tab', { name: /^4°/ }).click();
  await page.getByRole('button', { name: /^Taller Trabajo de Graduación\./ }).click();
  const det = w >= 1180 ? page.locator('[data-screen-label="Detalle"]') : page.getByRole('dialog');
  await expect(det).toContainText('Para cursarla necesitás');
  await expect(det).toContainText('Te faltan');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
});
