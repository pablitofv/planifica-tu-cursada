import { describe, it, expect } from 'vitest';
import { CRUDO, DATOS, estado, motor, ids, peso, violaciones } from './ayuda.js';
import { validateData } from '../../src/datos.js';
import { Motor } from '../../src/motor.js';

const anteriores = (pid, anio) => ids(pid, m => m.anio < anio && !m.pegadaA);

describe('semestres y calendario', () => {
  const M = motor(estado());
  it('convierte ids de semestre', () => {
    expect(M.sIdx('2027-1')).toBe(4054);
    expect(M.sId(4055)).toBe('2027-2');
    expect(M.sLbl('2027-2')).toBe('2° semestre 2027');
    expect(M.sLbl(null)).toBe('');
  });
  it('el próximo semestre sale del calendario (hasta el último día de cambios inclusive)', () => {
    expect(motor(estado(), '2026-10-19T12:00:00').nextId()).toBe('2027-1');
    expect(motor(estado(), '2027-03-27T12:00:00').nextId()).toBe('2027-1');
    expect(motor(estado(), '2027-03-28T12:00:00').nextId()).toBe('2027-2');
    expect(motor(estado(), '2027-08-22T12:00:00').nextId()).toBe('2028-1');
  });
  it('fuera del calendario, decide por la mitad del año', () => {
    expect(motor(estado(), '2034-05-10T12:00:00').nextId()).toBe('2034-2');
    expect(motor(estado(), '2034-09-10T12:00:00').nextId()).toBe('2035-1');
  });
  it('ubica al estudiante en su año y mitad', () => {
    expect(motor(estado({ anio: 3 }), '2026-10-19T12:00:00').semAt(0)).toEqual({ k: 0, cal: '2027-1', year: 3, yearReal: 3, half: 1 });
    expect(motor(estado({ anio: 3 }), '2027-05-01T12:00:00').semAt(0)).toEqual({ k: 0, cal: '2027-2', year: 3, yearReal: 3, half: 2 });
    expect(motor(estado({ anio: 4 }), '2026-10-19T12:00:00').semAt(3)).toEqual({ k: 3, cal: '2028-2', year: 4, yearReal: 5, half: 2 });
  });
  it('arma el texto de la fecha límite de cambios', () => {
    expect(M.fechaCambios('2027-1')).toBe('Hasta el sábado 27 de marzo podés pedir cambios a Alumnos');
    expect(M.fechaCambios('2099-1')).toBe('');
  });
});

describe('evalRule', () => {
  const M = motor(estado()), by = Object.fromEntries(DATOS.planes['2023'].materias.map(m => [m.id, m]));
  const mercado = by.k330;
  it('lista las correlativas que faltan (req y reqAny)', () => {
    const e = M.evalRule(mercado, new Set(['k030']), by);
    expect(e.ok).toBe(false);
    expect(e.ids).toEqual(['k031', 'k240', 'k230|k231']);
  });
  it('reqAny se cumple con cualquiera del grupo', () => {
    const e = M.evalRule({ reqAny: [['k230', 'k231']] }, new Set(['k231']), by);
    expect(e).toMatchObject({ ok: true, ids: [] });
  });
  it('cuenta talleres y materias aprobadas para "cant"', () => {
    const set = new Set(['k030', 'k031', 'k240', 'k230', 'c020']);
    const e = M.evalRule(mercado, set, by);
    expect(e).toMatchObject({ ok: false, ids: [], haveN: 5, needN: 12, n: 7, haveT: 3, t: 0 });
    expect(M.falta(e, by)).toBe('Te falta aprobar 7 materias más');
  });
  it('sin requisitos, siempre se puede', () => {
    expect(M.evalRule(by.c020, new Set(), by).ok).toBe(true);
  });
  it('el texto de lo que falta es breve', () => {
    expect(M.falta(M.evalRule({ req: ['k030', 'k031'] }, new Set(), by), by)).toBe('Te falta aprobar Taller de Iteración y Taller de Interacción');
    expect(M.falta(M.evalRule({ req: ['k030', 'k031', 'k240'] }, new Set(), by), by)).toBe('Te faltan 3 correlativas');
  });
});

describe('tpl y semNorm', () => {
  it('reparte las materias del año en dos mitades', () => {
    const M = motor(estado({ planId: '2023', anio: 3 })), c = M.build();
    const h1 = M.tpl(c, 3, 1), h2 = M.tpl(c, 3, 2);
    const total = c.mats.filter(m => m.anio === 3).length;
    expect(Object.values(h1).reduce((a, b) => a + b, 0)).toBe(Math.ceil(total / 2));
    Object.keys(h1).forEach(k => expect(h1[k] + h2[k]).toBe(c.mats.filter(m => m.anio === 3 && m.cat === k).length));
    expect(h1.taller).toBe(1);
    expect(h2.taller).toBe(1);
  });
  it('la carga esperable es la mitad de la carga del año, con tope de 5', () => {
    const M = motor(estado({ planId: '2023', anio: 3, aprob: anteriores('2023', 3) })), c = M.build();
    expect(M.semNorm(c, 0, new Set(c.ap), new Set())).toEqual({ ey: 3, cap: 4 });
    const M27 = motor(estado({ planId: '2027', anio: 2, aprob: anteriores('2027', 2) })), c27 = M27.build();
    expect(M27.semNorm(c27, 0, new Set(c27.ap), new Set())).toEqual({ ey: 2, cap: 5 });
  });
  it('si ya no quedan materias de este año, el semestre sigue el año pendiente más bajo', () => {
    const M = motor(estado({ planId: '2023', anio: 3, aprob: anteriores('2023', 4) })), c = M.build();
    expect(M.semNorm(c, 0, new Set(c.ap), new Set()).ey).toBe(4);
    const aprob = anteriores('2023', 4); delete aprob.e010;
    const M2 = motor(estado({ planId: '2023', anio: 4, aprob })), c2 = M2.build();
    expect(M2.semNorm(c2, 0, new Set(c2.ap), new Set()).ey).toBe(4);
  });
});

describe('suggestion y fill', () => {
  it('1° año 2023: un taller con su seminario y la carga del semestre', () => {
    const M = motor(estado({ planId: '2023', anio: 1 })), c = M.build(), s = M.suggestion(c);
    const ms = s.map(id => c.by[id]);
    expect(ms.filter(m => m.cat === 'taller')).toHaveLength(1);
    expect(c.att[ms.find(m => m.cat === 'taller').id]).toBeTruthy();
    expect(peso(c, s)).toBe(5);
    expect(ms.every(m => m.anio === 1)).toBe(true);
  });
  it('primero lo adeudado de años anteriores', () => {
    const aprob = anteriores('2023', 4); delete aprob.e010; delete aprob['cf-historia'];
    const M = motor(estado({ planId: '2023', anio: 4, aprob })), c = M.build(), s = M.suggestion(c);
    expect(s).toContain('e010');
  });
  it('nunca propone algo sin correlativas, más de un taller ni más de 5 materias', () => {
    for (const pid of ['2023', '2027']) for (const anio of [1, 2, 3, 4]) {
      const M = motor(estado({ planId: pid, anio, aprob: anteriores(pid, anio) })), c = M.build(), s = M.suggestion(c);
      expect(s.length).toBeGreaterThan(0);
      expect(s.map(id => c.by[id]).filter(m => m.cat === 'taller').length).toBeLessThanOrEqual(1);
      expect(peso(c, s)).toBeLessThanOrEqual(5);
      s.forEach(id => expect(M.evalRule(c.by[id], c.ap, c.by).ok).toBe(true));
    }
  });
  it('lo que se reconoce en el intercambio no entra en la sugerencia', () => {
    const M = motor(estado({ planId: '2023', anio: 3, aprob: anteriores('2023', 3), intSem: '2028-1', intRec: { 'opt-1': true } })), c = M.build();
    expect(M.recIds(c)).toEqual(['opt-1']);
    expect(M.suggestion(c)).not.toContain('opt-1');
  });
  it('fill no repite lo que ya está en el set ni lo excluido', () => {
    const M = motor(estado({ planId: '2027', anio: 1 })), c = M.build(), set = new Set(['t-interaccion']);
    const r = M.fill(c, set, 0, new Set(['o-materia']));
    expect(r).not.toContain('t-interaccion');
    expect(r).not.toContain('o-materia');
  });
});

describe('inscIds', () => {
  it('sin inscripción editada usa la sugerencia', () => {
    const M = motor(estado({ planId: '2027', anio: 1 })), c = M.build();
    expect(M.inscIds(c)).toEqual(M.suggestion(c));
  });
  it('con inscripción editada filtra lo aprobado y lo desconocido', () => {
    const M = motor(estado({ planId: '2027', anio: 1, aprob: { 'o-materia': true }, insc: ['o-materia', 'o-imagen', 'nada'] })), c = M.build();
    expect(M.inscIds(c)).toEqual(['o-imagen']);
  });
  it('en el semestre de intercambio no hay inscripción', () => {
    const M = motor(estado({ planId: '2023', anio: 4, aprob: anteriores('2023', 4), intSem: '2027-1' })), c = M.build();
    expect(M.inscIds(c)).toEqual([]);
  });
});

describe('autoProject, planTail y balance', () => {
  it('ubica todo lo pendiente sin romper invariantes, con la graduación al final', () => {
    for (const pid of ['2023', '2027']) for (const anio of [1, 2, 3, 4]) {
      const M = motor(estado({ planId: pid, anio, aprob: anteriores(pid, anio) })), c = M.build();
      const sems = M.autoProject(c, null, []);
      expect(violaciones(M, c, sems, [])).toEqual([]);
      const last = sems.filter(x => x.ids.length).pop();
      expect(last.ids.map(id => c.by[id]).some(m => m.ultimo)).toBe(true);
    }
  });
  it('desde 1° año, la carrera entra en 8 semestres', () => {
    for (const pid of ['2023', '2027']) {
      const M = motor(estado({ planId: pid, anio: 1 })), c = M.build();
      expect(M.autoProject(c, null, []).filter(x => x.ids.length)).toHaveLength(8);
    }
  });
  it('el intercambio ocupa su semestre con lo que se reconoce', () => {
    const M = motor(estado({ planId: '2023', anio: 3, aprob: anteriores('2023', 3), intSem: '2028-1', intRec: { 'opt-1': true } })), c = M.build();
    const sems = M.autoProject(c, '2028-1', ['opt-1']);
    const int = sems.find(x => x.isInt);
    expect(int).toMatchObject({ cal: '2028-1', ids: ['opt-1'] });
    expect(violaciones(M, c, sems, ['opt-1'])).toEqual([]);
  });
  it('planTail respeta el semestre de intercambio y deja el último con contenido', () => {
    const M = motor(estado({ planId: '2027', anio: 3, aprob: anteriores('2027', 3) })), c = M.build();
    const set = new Set(c.ap), rest = c.pend.slice();
    const out = M.planTail(c, set, new Set(), rest, '2028-1', []);
    expect(out.some(x => x.isInt && x.cal === '2028-1')).toBe(true);
    expect(out[out.length - 1].isInt || out[out.length - 1].ids.length > 0).toBe(true);
  });
  it('balance empareja sin perder materias ni romper correlativas', () => {
    const M = motor(estado({ planId: '2027', anio: 2, aprob: anteriores('2027', 2) })), c = M.build();
    const pend = c.pend.filter(m => !m.ultimo && m.cat !== 'taller' && M.evalRule(m, c.ap, c.by).ok).slice(0, 5).map(m => m.id);
    const out = [Object.assign({ ids: pend.slice(0, 5) }, M.semAt(1)), Object.assign({ ids: [] }, M.semAt(2))];
    const r = M.balance(c, new Set(c.ap), out);
    expect(r.flatMap(x => x.ids).sort()).toEqual(pend.slice().sort());
    expect(Math.abs(r[0].ids.length - r[1].ids.length)).toBeLessThanOrEqual(1);
    expect(violaciones(M, c, r, []).filter(v => !v.includes('sin ubicar'))).toEqual([]);
  });
});

describe('verificador de invariantes (el que usa la simulación)', () => {
  it('detecta cada tipo de problema', () => {
    const M = motor(estado({ planId: '2023', anio: 4, aprob: anteriores('2023', 4) })), c = M.build();
    const sems = M.autoProject(c, null, []).map(x => ({ ...x, ids: x.ids.slice() }));
    const tg = 'k488', i = sems.findIndex(x => x.ids.includes(tg));
    sems[i].ids = sems[i].ids.filter(x => x !== tg); sems[0].ids.push(tg, 'k430', 'k431', 'k440', 'k440');
    const v = violaciones(M, c, sems, []).join(' | ');
    ['más de 1 taller', 'más de 5 materias', 'k440 repetida', 'k488 fuera del último semestre'].forEach(t => expect(v).toContain(t));
    expect(violaciones(M, c, sems.slice(1), []).join()).toContain('sin ubicar');
    const M2 = motor(estado({ planId: '2027', anio: 1 })), c2 = M2.build(), s2 = M2.autoProject(c2, null, []).map(x => ({ ...x, ids: x.ids.filter(id => id !== 't-sustentabilidad') }));
    s2[0].ids.push('t-sustentabilidad');
    expect(violaciones(M2, c2, s2, [])).toContain('t-sustentabilidad en 2027-1 sin correlativas');
  });
});

describe('project y materialize', () => {
  it('con plan manual, respeta lo que movió el estudiante y deja el resto sin semestre', () => {
    const M = motor(estado({ planId: '2027', anio: 1, plan: { 'o-imagen': '2027-2' }, semCount: 3 })), c = M.build();
    const pr = M.project(c);
    expect(pr.sems).toHaveLength(3);
    expect(pr.sems[1]).toMatchObject({ cal: '2027-2', ids: ['o-imagen'] });
    expect(pr.unplaced.length).toBeGreaterThan(0);
  });
  it('con plan manual, lo que quedó en un semestre pasado o lejano no se pierde: va a "Sin semestre"', () => {
    const M = motor(estado({ planId: '2027', anio: 1, plan: { 'o-imagen': '2026-2', 'f-economia': '2099-1', 'f-escritura': '2027-2' }, semCount: 2 })), c = M.build();
    const pr = M.project(c);
    expect(pr.sems.map(x => x.cal)).toEqual(['2027-1', '2027-2']);
    expect(pr.unplaced).toEqual(expect.arrayContaining(['o-imagen', 'f-economia']));
    expect(pr.sems[1].ids).toEqual(['f-escritura']);
  });
  it('un intercambio que ya pasó no reconoce nada', () => {
    const M = motor(estado({ planId: '2023', anio: 4, intSem: '2026-2', intRec: { 'opt-3': true } })), c = M.build();
    expect(M.recIds(c)).toEqual([]);
  });
  it('materialize congela la proyección automática', () => {
    const M = motor(estado({ planId: '2027', anio: 1 })), c = M.build(), mat = M.materialize(c);
    expect(mat.semCount).toBe(8);
    expect(mat.insc).toEqual(M.suggestion(c));
    expect(Object.keys(mat.plan)).toHaveLength(c.pend.length - mat.insc.length);
  });
});

describe('chequeo de inscripción', () => {
  const base = { planId: '2023', anio: 3, aprob: anteriores('2023', 3) };
  const titulos = r => r.items.map(i => i.t + ': ' + i.title);
  it('la propuesta está en orden', () => {
    const M = motor(estado(base)), r = M.chequeo(M.build());
    expect(r.extra).toBe(false);
    expect(r.items.filter(i => i.t !== 'ok')).toEqual([]);
    expect(titulos(r)).toEqual(expect.arrayContaining(['ok: Un taller', 'ok: Correlativas en regla']));
  });
  it('dos talleres piden excepción', () => {
    const M = motor(estado({ ...base, insc: ['k330', 'k331'] })), r = M.chequeo(M.build());
    expect(r.items).toContainEqual({ t: 'warn', title: '2 talleres', sub: 'Necesitás una excepción de la carrera.' });
  });
  it('dos talleres con 5 materias no se permite', () => {
    const M = motor(estado({ ...base, insc: ['k330', 'k331', 'k341', 'k441', 'opt-1'] })), r = M.chequeo(M.build());
    expect(r.items[0]).toEqual({ t: 'bad', title: '2 talleres y 5 materias', sub: 'No se permite: 5 materias es solo para quien cursa un taller.' });
  });
  it('dos excepciones juntas se marcan en rojo', () => {
    // Con la carga actual la recomendada nunca baja de 4: se prueba con una carga de 6 en 3° año (recomendada 3)
    const crudo = JSON.parse(JSON.stringify(CRUDO)); crudo.planes['2023'].carga = [10, 10, 6, 8];
    const D = validateData(crudo), est = estado({ ...base, insc: ['k330', 'k331', 'k341', 'k441'] });
    const M = new Motor({ datos: () => D, estado: () => est, hoy: () => new Date('2026-10-19T12:00:00') }), r = M.chequeo(M.build());
    expect(r.items[0]).toEqual({ t: 'bad', title: 'Dos excepciones juntas', sub: 'No se permite. Quitá una materia.' });
  });
  it('por encima de lo recomendado: consultalo con la carrera, sin prohibir', () => {
    const M = motor(estado({ ...base, insc: ['k330', 'k340', 'k341', 'k441', 'opt-1'] })), r = M.chequeo(M.build());
    expect(r.items.filter(i => i.t === 'bad')).toEqual([]);
    expect(r.items).toContainEqual({ t: 'warn', title: '5 materias', sub: 'La carga recomendada para este semestre es de 4. Si querés sumar una más, consultalo con la carrera.' });
  });
  it('más de 5 materias, nunca', () => {
    const M = motor(estado({ ...base, insc: ['k330', 'k340', 'k341', 'k441', 'opt-1', 'opt-2'] })), r = M.chequeo(M.build());
    expect(r.items[0]).toEqual({ t: 'bad', title: '6 materias', sub: 'El máximo es 5.' });
  });
  it('con menos carga, sin ansiedad: todavía podés sumar', () => {
    const M = motor(estado({ ...base, insc: ['k330', 'k341'] })), r = M.chequeo(M.build());
    expect(r.items).toContainEqual({ t: 'ok', title: '2 materias', sub: 'Todavía podés sumar 2 más.' });
  });
  it('una materia sin correlativas', () => {
    const aprob = { ...base.aprob }; delete aprob.k240;
    const M = motor(estado({ ...base, aprob, insc: ['k330', 'k341'] })), r = M.chequeo(M.build());
    expect(r.items[0]).toEqual({ t: 'bad', title: 'Taller de Mercado, todavía no', sub: 'Te falta aprobar Pensamiento Proyectual.' });
  });
  it('reclama lo adeudado que entraría', () => {
    const aprob = { ...base.aprob }; delete aprob.e010;
    const M = motor(estado({ ...base, aprob, insc: ['k330', 'k341', 'k441', 'k343'] })), r = M.chequeo(M.build());
    expect(r.items).toContainEqual({ t: 'warn', title: 'Falta Economía I', sub: 'Es de 1° año. Priorizala para no trabarte después.' });
  });
  // Los dos casos que mandó Pablo: 2° año del Plan 2023 con 1° año, Sustentabilidad, Pensamiento Proyectual, Escritura y Electiva de Arte aprobados
  const caso = insc => estado({ planId: '2023', anio: 2, aprob: { ...anteriores('2023', 2), k231: true, k240: true, h209: true, 'cf-arte': true }, insc });
  it('la propuesta de ese caso no avisa nada', () => {
    const M = motor(caso(null)), r = M.chequeo(M.build());
    expect(r.items.filter(i => i.t !== 'ok')).toEqual([]);
  });
  it('adelantar un taller de 3° con uno de 2° pendiente avisa y sugiere consultarlo', () => {
    const M = motor(caso(['k330', 'cc100', 'cf-psicologia', 'cf-ciencias'])), r = M.chequeo(M.build());
    expect(r.items).toContainEqual({ t: 'warn', title: 'Adelantás Taller de Mercado', sub: 'Te queda Taller de Prospectiva, de 2° año. Conviene priorizarla. Si igual querés adelantarla, consultalo con la carrera.' });
  });
  it('dejar una de 2° por una obligatoria de 3° avisa lo mismo', () => {
    const M = motor(caso(['k230', 'k341', 'cf-psicologia', 'cf-ciencias'])), r = M.chequeo(M.build());
    expect(r.items).toContainEqual({ t: 'warn', title: 'Adelantás Etnografía y Diseño', sub: 'Te queda Teoría Sociológica, de 2° año. Conviene priorizarla. Si igual querés adelantarla, consultalo con la carrera.' });
    expect(r.items.some(i => (i.sub || '').startsWith('Todavía podés sumar'))).toBe(false);
  });
  it('avisa si la inscripción suma un semestre', () => {
    const M = motor(estado({ planId: '2027', anio: 1, insc: ['o-materia'] })), r = M.chequeo(M.build());
    expect(r.extra).toBe(true);
    expect(r.items).toContainEqual({ t: 'warn', title: 'Suma un semestre', sub: 'Volviendo a la propuesta, no pasa.' });
  });
  it('en el semestre de intercambio solo confirma', () => {
    const M = motor(estado({ planId: '2023', anio: 4, aprob: anteriores('2023', 4), intSem: '2027-1', intRec: { 'opt-3': true } })), r = M.chequeo(M.build());
    expect(r.items).toEqual([{ t: 'ok', title: 'Este semestre te vas de intercambio', sub: '1 materia a reconocer.' }]);
  });
});
