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
  await expect(page.getByRole('heading', { name: 'Inscripción fuera de regla' })).toBeVisible();
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

// 2° año del Plan 2023 con Taller de Mercado (3°) en lugar de Taller de Prospectiva (2°)
const ADELANTA = { plan: '2023', anio: 2, aprobadas: ['k030', 'k031', 'c020', 'e010', 'a016', 'cf-historia', 'cf-literatura', 'cf-filosofia', 'k231', 'k240', 'h209', 'cf-arte'], inscripcion: ['k330', 'cc100', 'cf-psicologia', 'cf-ciencias'] };
const abrirArchivo = (page, obj) => page.locator('input[type=file]').setInputFiles({ name: 'mi.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(obj)) });

test('adelantar un taller: el paso 1 y el paso 2 avisan lo mismo', async ({ page }) => {
  await abrir(page);
  await abrirArchivo(page, ADELANTA);
  await expect(page.getByRole('heading', { name: '¿Qué vas a cursar?' })).toBeVisible();
  // En escritorio el panel muestra el aviso completo; en la barra de abajo, el título (y el detalle va en aria-label)
  await expect(page.getByText(/^Adelantás Taller de Mercado./).first()).toBeVisible();
  await expect(page.getByRole('status', { name: /Te queda Taller de Prospectiva, de 2° año/ }).or(page.getByText(/Te queda Taller de Prospectiva, de 2° año/)).first()).toBeAttached();
  await expect(page.getByText('Están todos los lugares cubiertos.')).toHaveCount(0);
  await page.getByRole('button', { name: /Inscripción/ }).first().click();
  await expect(page.getByRole('heading', { name: 'Revisá una cosa' })).toBeVisible();
  await expect(page.getByText('Adelantás Taller de Mercado', { exact: true })).toBeVisible();
  await expect(page.getByText(/consultalo con la carrera/).first()).toBeVisible();
});

test('correlativas "una de dos" y textos de las tarjetas', async ({ page }) => {
  await abrir(page);
  await abrirArchivo(page, ADELANTA);
  await expect(page.getByRole('heading', { name: '¿Qué vas a cursar?' })).toBeVisible();
  if (page.viewportSize().width < 760) {
    await expect(page.getByRole('button', { name: /A cursar el próximo semestre/ }).first()).toBeAttached();
    return;
  }
  await expect(page.locator('[data-mid="k330"]')).toContainText('A cursar el próximo semestre');
  await expect(page.locator('[data-mid="k331"]')).toContainText('Podrías adelantarla');
  await page.locator('[data-mid="k330"]').hover();
  for (const id of ['k230', 'k231']) await expect(page.locator('[data-mid="' + id + '"]')).toContainText('Una de dos');
  await expect(page.locator('[data-mid="k240"]')).toContainText('Necesita');
  await expect(page.getByText('Una de dos', { exact: true }).last()).toBeVisible();
  await expect(page.locator('svg path[stroke-dasharray]').first()).toBeAttached();
});

test('talleres transversales: fila propia en 2027, se pueden cursar en cualquier año', async ({ page }) => {
  await abrir(page);
  await abrirArchivo(page, { plan: '2027', anio: 2, aprobadas: ['t-interaccion', 'o-materia', 'o-imagen', 'f-etnografia', 'f-psicologia', 'f-administracion', 'f-pensamiento', 'f-cuantitativos'] });
  await expect(page.getByRole('heading', { name: '¿Qué vas a cursar?' })).toBeVisible();
  if (page.viewportSize().width < 760) await page.getByRole('tab', { name: /^3°/ }).click();
  const fila = page.getByRole('group', { name: 'Talleres transversales' });
  await expect(fila).toBeVisible();
  await expect(fila.getByRole('button', { name: /Taller Transversal B. Podés cursarla/ })).toBeVisible();
  await expect(fila).not.toContainText('Debés');
});

test('el Plan 2023 no tiene fila de transversales', async ({ page }) => {
  await abrir(page);
  await abrirArchivo(page, ADELANTA);
  await expect(page.getByRole('heading', { name: '¿Qué vas a cursar?' })).toBeVisible();
  await expect(page.getByRole('group', { name: 'Talleres transversales' })).toHaveCount(0);
});

// 2° año del Plan 2023 con Prospectiva (y su seminario), Escritura y Psicología: 4 materias y un lugar libre
const CUATRO = { plan: '2023', anio: 2, aprobadas: ['k030', 'k031', 'c020', 'e010', 'a016', 'cf-historia', 'cf-literatura', 'cf-filosofia', 'k231', 'k240', 'cf-arte', 'cc100'], inscripcion: ['k230', 'h209', 'cf-psicologia'] };

test('inscripción: el total cuenta el seminario y el lugar libre se ve vacío', async ({ page }) => {
  await abrir(page);
  await abrirArchivo(page, CUATRO);
  await page.getByRole('button', { name: /Inscripción/ }).first().click();
  await expect(page.getByRole('status').filter({ hasText: '4 materias, contando el Seminario III · 1 lugar libre' })).toBeVisible();
  await expect(page.getByText('Cuenta como materia')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Elegir una del Ciclo de Fundamentos' })).toContainText('Lugar libre');
  await expect(page.getByText('Contando el Seminario III. Todavía podés sumar una más.')).toBeVisible();
});

test('intercambio con el plan armado a mano: corre los semestres y no pierde materias', async ({ page }) => {
  await abrir(page);
  await abrirArchivo(page, CUATRO);
  await page.getByRole('button', { name: /Próximos semestres|Semestres/ }).first().click();
  await page.getByRole('button', { name: /Agregar semestre/ }).click();
  await page.getByRole('button', { name: /Quitar el/ }).first().click();
  await expect(page.getByRole('button', { name: /Reordenar automáticamente/ })).toBeVisible();
  const ultimo = page.getByRole('radio', { name: /1° semestre 2029 · 4° año/ });
  await ultimo.click();
  await expect(ultimo).toHaveAttribute('aria-checked', 'true');
  await expect(page.getByText(/^Sin semestre/)).toHaveCount(0);
  await expect(page.getByText('Trabajo de Graduación', { exact: true }).first()).toBeVisible();
});

test('un archivo de un semestre que ya pasó avisa qué cambió', async ({ page }) => {
  await abrir(page);
  const archivo = { version: 2, plan: '2023', anio: 3, inscripcionSemestre: '2026-2', aprobadas: ['k030', 'k031'], inscripcion: ['k230'], semestres: { k231: '2027-1', c020: '2027-2' }, cantidadSemestres: 3 };
  await page.locator('input[type=file]').setInputFiles({ name: 'mi.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(archivo)) });
  const aviso = page.getByRole('status').filter({ hasText: 'Tu archivo es del 2° semestre 2026' });
  await expect(aviso).toContainText('Lo que habías planeado para el 1° semestre 2027 quedó como tu inscripción.');
  await page.getByRole('button', { name: /Inscripción/ }).first().click();
  await expect(page.getByRole('button', { name: /Taller: Taller de Sustentabilidad\. Cambiar/ })).toBeVisible();
  await page.getByRole('button', { name: 'Cerrar aviso' }).click();
  await expect(aviso).toHaveCount(0);
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
